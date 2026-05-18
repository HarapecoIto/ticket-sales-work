import { NextRequest, NextResponse } from 'next/server';
import { messagingApi, webhook } from '@line/bot-sdk';
import crypto from 'crypto';
import prisma from '../../../lib/prisma';
import DEFINITIONS from '../../definitions/definitions';
import { unlinkButtonMessage } from './unlinkButton';
import { Tour } from '@/app/types';
import { notificationMessage } from '../notificationMessage';

export const runtime = 'nodejs';

enum ConversationState {
  WaitingForEventCode = 'waiting_for_event_code',
  WaitingForUnlink = 'waiting_for_unlink',
}

const checkLineSignature = async (body: string, signature: string) => {
  try {
    const hmac = crypto.createHmac('sha256', process.env.CHANNEL_SECRET);
    hmac.update(body);
    return hmac.digest('base64') === signature;
  } catch (err) {
    console.error('[line] error checking signature', err);
    return false;
  }
};

const getMessagingClient = (): messagingApi.MessagingApiClient | null => {
  const channelAccessToken = process.env.CHANNEL_ACCESS_TOKEN;
  if (!channelAccessToken) {
    return null;
  }
  return new messagingApi.MessagingApiClient({ channelAccessToken });
};

const getReplyToken = (event: webhook.Event): string | null => {
  if (
    'replyToken' in event &&
    typeof event.replyToken === 'string' &&
    event.replyToken.length > 0
  ) {
    return event.replyToken;
  }
  return null;
};

const getSourceId = (event: webhook.Event): string | null => {
  const source = event.source;
  if (!source) return null;
  if (source.type === 'group') return (source as webhook.GroupSource).groupId;
  if (source.type === 'user') return (source as webhook.UserSource).userId ?? null;
  return null;
};

const handleEvent = async (
  event: webhook.Event,
  client: messagingApi.MessagingApiClient
): Promise<void> => {
  console.log(`[line] handling event: type=${event.type}`);

  // 返信に必要なreplyTokenを取得する
  const replyToken = getReplyToken(event);
  if (!replyToken) return;
  console.log(`[line] got replyToken: ${replyToken}`);

  // ソースIDを取得する（グループIDまたはユーザーID）
  const sourceId = getSourceId(event);
  if (!sourceId) {
    await client.replyMessage({
      replyToken,
      messages: [{ type: 'text', text: 'ソースIDが取得できないぴょ。もう一度試してぴょ' }],
    });
    return;
  }
  console.log(`[line] got sourceId: ${sourceId}`);

  // 1時間以上前の状態は削除してクリーンアップする
  await prisma.conversation_state.deleteMany({
    where: {
      updated_at: { lt: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  // 会話ステートを取得する（ない場合はnull）
  const state = await prisma.conversation_state.findUnique({
    where: { source_id: sourceId },
  });

  // デバッグプリント
  if (process.env.VERCEL_ENV !== 'production') {
    if (event.type === 'message' && event.message.type === 'text') {
      const text = event.message.text.trim();
      if (text === 'さんぷるシエル') {
        await client.replyMessage({
          replyToken,
          messages: await Promise.all(DEFINITIONS.map((d) => notificationMessage(d.event_code))),
        });
        return;
      }
    }
  }

  // リンクの会話へ入る
  if (event.type === 'message' && event.message.type === 'text') {
    const text = event.message.text.trim();
    if (text === '知らせてシエル' || text === '教えてシエル') {
      // 会話ステートを更新する
      await prisma.conversation_state.upsert({
        where: { source_id: sourceId },
        update: { state: ConversationState.WaitingForEventCode, updated_at: new Date() },
        create: {
          source_id: sourceId,
          state: ConversationState.WaitingForEventCode,
          updated_at: new Date(),
        },
      });
      await client.replyMessage({
        replyToken,
        messages: [
          { type: 'text', text: 'チケッティングデスクから発行されたイベントコードを教えてぴょ' },
        ],
      });
      return;
    }
  }

  // リンク対象のイベントコードを受け取る
  if (event.type === 'message' && event.message.type === 'text') {
    if (state?.state === ConversationState.WaitingForEventCode) {
      const text = event.message.text.trim();
      // リンク対象のイベント
      const definition: Tour | undefined = DEFINITIONS.find((d) => d.event_code === text);
      if (!definition) {
        await client.replyMessage({
          replyToken,
          messages: [
            {
              type: 'text',
              text: `イベントコード「${text}」は見つからないぴょ。もう一度確認してぴょ`,
            },
          ],
        });
        // 会話を終了する
        await prisma.conversation_state.delete({ where: { source_id: sourceId } });
        return;
      }
      // リンクする
      await prisma.line_group_event_relations.createMany({
        data: [{ source_id: sourceId, event_code: definition.event_code }],
        skipDuplicates: true,
      });
      // 返信する
      await client.replyMessage({
        replyToken,
        messages: [
          {
            type: 'text',
            text: `毎日18時過ぎに「${definition.name}」のチケット販売状況を知らせるぴょ`,
          },
        ],
      });
      // 会話を終了する
      await prisma.conversation_state.delete({ where: { source_id: sourceId } });
      return;
    }
  }

  // アンリンクの会話へ入る
  if (event.type === 'message' && event.message.type === 'text') {
    const text = event.message.text.trim();
    if (text === 'シエルもういい') {
      await prisma.line_group_event_relations
        .findMany({
          where: { source_id: sourceId },
        })
        .then(async (relations) => {
          if (relations.length === 0) {
            await client.replyMessage({
              replyToken,
              messages: [{ type: 'text', text: '今はお知らせしているイベントがないぴょ' }],
            });
            return;
          }
          // 会話ステートを更新する
          await prisma.conversation_state.upsert({
            where: { source_id: sourceId },
            update: { state: ConversationState.WaitingForUnlink, updated_at: new Date() },
            create: {
              source_id: sourceId,
              state: ConversationState.WaitingForUnlink,
              updated_at: new Date(),
            },
          });
          const tours: Tour[] = relations
            .map((r) => DEFINITIONS.find((d) => d.event_code === r.event_code)!)
            .filter((c): c is Tour => !!c);
          const message = unlinkButtonMessage(tours);
          if (!message) {
            await client.replyMessage({
              replyToken,
              messages: [{ type: 'text', text: 'お知らせを終了するイベントがないぴょ' }],
            });
            return;
          }
          await client.replyMessage({
            replyToken,
            messages: [{ type: 'text', text: 'お知らせを終了するイベントは...' }, message],
          });
        });
      return;
    }

    // アンリンク対象興行が指定された際の処理
    if (state?.state === ConversationState.WaitingForUnlink) {
      const tour: Tour | null = DEFINITIONS.find((d) => text.includes(d.short_name)) || null;
      if (!tour) {
        return;
      }
      await prisma.conversation_state.delete({ where: { source_id: sourceId } });
      const eventCodeMatch = text.match(/event=([^&]+)/);
      if (!eventCodeMatch) {
        await client.replyMessage({
          replyToken,
          messages: [
            { type: 'text', text: 'どのイベントを終了するかがわからないぴょ。もう一度試してぴょ' },
          ],
        });
        // 会話を終了する
        await prisma.conversation_state.delete({ where: { source_id: sourceId } });
        return;
      }
      const eventCode = decodeURIComponent(eventCodeMatch[1]);
      await prisma.line_group_event_relations.deleteMany({
        where: { source_id: sourceId, event_code: eventCode },
      });
      const definition = DEFINITIONS.find((d) => d.event_code === eventCode);
      const eventName = definition ? definition.short_name : eventCode;
      await client.replyMessage({
        replyToken,
        messages: [{ type: 'text', text: `「${eventName}」のお知らせを終了するぴょ` }],
      });
      // 会話を終了する
      await prisma.conversation_state.delete({ where: { source_id: sourceId } });
    }
    return;
  }
};

export async function GET() {
  return NextResponse.json({ ok: true, message: "I'm listening. Please access with POST." });
}

export async function POST(request: NextRequest) {
  const traceId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  console.log(`[line][${traceId}] webhook POST received (route=v2026-05-11-1)`);

  const rawBody = await request.text();
  const signature = request.headers.get('x-line-signature') || '';

  console.log(`[line][${traceId}] checking signature...`);
  const isSignatureOk: boolean = await checkLineSignature(rawBody, signature);
  if (!isSignatureOk) {
    console.warn(`[line][${traceId}] webhook rejected: Invalid signature`);
    return NextResponse.json({ ok: false, message: 'Invalid signature' }, { status: 401 });
  }
  console.log(`[line][${traceId}] signature verified`);

  const client = getMessagingClient();
  if (!client) {
    console.error(`[line][${traceId}] webhook rejected: CHANNEL_ACCESS_TOKEN is not set`);
    return NextResponse.json({ ok: false, message: 'Server is not configured' }, { status: 500 });
  }

  let payload: webhook.CallbackRequest;
  try {
    console.log(`[line][${traceId}] parsing payload...`);
    payload = JSON.parse(rawBody) as webhook.CallbackRequest;
    console.log(`[line][${traceId}] payload parsed successfully`);
  } catch (err) {
    console.error(`[line][${traceId}] webhook rejected: Failed to parse JSON`, err);
    return NextResponse.json({ ok: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  if (!Array.isArray(payload.events)) {
    console.error(`[line][${traceId}] webhook rejected: events is not an array`);
    return NextResponse.json({ ok: false, message: 'Invalid events payload' }, { status: 400 });
  }

  console.log(`[line][${traceId}] webhook received: events=${payload.events.length}`);
  if (payload.events.length === 0) {
    console.warn(`[line][${traceId}] no events to handle`);
  }

  try {
    console.log(`[line][${traceId}] entering event loop`);
    for (const [index, event] of payload.events.entries()) {
      console.log(`[line][${traceId}] dispatching event[${index}]: type=${event.type}`);
      await handleEvent(event, client);
      console.log(`[line][${traceId}] completed event[${index}]: type=${event.type}`);
    }
    console.log(`[line][${traceId}] event loop completed`);
    return NextResponse.json({ ok: true, received: payload.events.length });
  } catch (error) {
    console.error(`[line][${traceId}] webhook handling failed`, error);
    return NextResponse.json(
      { ok: false, message: 'Failed to handle webhook events' },
      { status: 500 }
    );
  }
}
