import { NextRequest, NextResponse } from 'next/server';
import { messagingApi, validateSignature, webhook } from '@line/bot-sdk';
import crypto from 'crypto';
import prisma from '../../../lib/prisma';
import DEFINITIONS from '../../definitions/definitions';

export const runtime = 'nodejs';

const checkLineSignature = async (body: string, signature: string) => {
  try {
    const hmac = crypto.createHmac('sha256', process.env.CHANNEL_SECRET);
    hmac.update(body);
    return hmac.digest('base64') === signature;
  } catch (err) {
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
  const replyToken = getReplyToken(event);
  if (!replyToken) return;

  const sourceId = getSourceId(event);
  if (!sourceId) {
    await client.replyMessage({
      replyToken,
      messages: [{ type: 'text', text: 'ソースIDが取得できませんでした。もう一度試してぴょ。' }],
    });
    return;
  }

  // 1時間以上前の状態は削除してクリーンアップする
  await prisma.conversation_state.deleteMany({
    where: {
      updated_at: { lt: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });

  if (event.type === 'message' && event.message.type === 'text') {
    const text = event.message.text.trim();

    if (text === '知らせてシエル') {
      // ここはupsertでupdated_atを明示的に更新したい
      await prisma.conversation_state.upsert({
        where: { source_id: sourceId },
        update: { state: 'waiting_for_event_code', updated_at: new Date() },
        create: { source_id: sourceId, state: 'waiting_for_event_code', updated_at: new Date() },
      });
      await client.replyMessage({
        replyToken,
        messages: [
          { type: 'text', text: 'チケッティングデスクから発行されたイベントコードを教えてぴょ' },
        ],
      });
      return;
    }

    const state = await prisma.conversation_state.findUnique({
      where: { source_id: sourceId },
    });
    if (state?.state === 'waiting_for_event_code') {
      await prisma.conversation_state.delete({ where: { source_id: sourceId } });
      const definition = DEFINITIONS.find((d) => d.event_code === text);
      if (!definition) {
        await client.replyMessage({
          replyToken,
          messages: [
            {
              type: 'text',
              text: `イベントコード「${text}」は見つからないぴょ。もう一度確認してぴょ。`,
            },
          ],
        });
        return;
      }
      await prisma.line_group_event_relations.createMany({
        data: [{ line_group_id: sourceId, event_code: definition.event_code }],
        skipDuplicates: true,
      });
      await client.replyMessage({
        replyToken,
        messages: [
          {
            type: 'text',
            text: `毎日18時過ぎに${definition.name}のチケット販売状況を知らせるよ。`,
          },
        ],
      });
      await prisma.conversation_state.deleteMany({
        where: { source_id: sourceId },
      });
      await client.replyMessage({
        replyToken,
        messages: [{ type: 'text', text: 'ぴよぴよ' }],
      });
      return;
    }
    return;
  }
};

export async function GET() {
  return NextResponse.json({ ok: true, message: "I'm listening. Please access with POST." });
}

export async function POST(request: NextRequest) {
  console.log('[line] webhook POST received');

  const rawBody = await request.text();
  const signature = request.headers.get('x-line-signature') || '';

  console.log('[line] checking signature...');
  const isSignatureOk: boolean = await checkLineSignature(rawBody, signature);
  if (!isSignatureOk) {
    console.warn('[line] webhook rejected: Invalid signature');
    return NextResponse.json({ ok: false, message: 'Invalid signature' }, { status: 401 });
  }
  console.log('[line] signature verified');

  const client = getMessagingClient();
  if (!client) {
    console.error('[line] webhook rejected: CHANNEL_ACCESS_TOKEN is not set');
    return NextResponse.json({ ok: false, message: 'Server is not configured' }, { status: 500 });
  }

  let payload: webhook.CallbackRequest;
  try {
    console.log('[line] parsing payload...');
    payload = JSON.parse(rawBody) as webhook.CallbackRequest;
    console.log('[line] payload parsed successfully');
  } catch (err) {
    console.error('[line] webhook rejected: Failed to parse JSON', err);
    return NextResponse.json({ ok: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  if (!Array.isArray(payload.events)) {
    console.error('[line] webhook rejected: events is not an array');
    return NextResponse.json({ ok: false, message: 'Invalid events payload' }, { status: 400 });
  }

  console.log(`[line] webhook received: events=${payload.events.length}`);

  try {
    await Promise.all(payload.events.map((event) => handleEvent(event, client)));
    return NextResponse.json({ ok: true, received: payload.events.length });
  } catch (error) {
    console.error('[line] webhook handling failed', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to handle webhook events' },
      { status: 500 }
    );
  }
}
