import prisma from '@/lib/prisma';
import { messagingApi, webhook } from '@line/bot-sdk';
import { type Tour, ConversationState } from '@/app/types';
import TOURS from '@/app/definitions/definitions';
import { unlinkSelectorMessage } from '@/app/line/messages/unlinkSelectorMessage';

export const unlinker = async (
  sourceId: string,
  event: webhook.Event
): Promise<messagingApi.Message[] | null> => {
  // 1時間以上前の状態は削除してクリーンアップする
  await prisma.conversation_states.deleteMany({
    where: {
      ciel_id: process.env.CIEL_ID,
      updated_at: { lt: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });

  if (event.type === 'message' && event.message.type === 'text') {
    const text = event.message.text.trim();
    if (text === 'シエルもういい' || text === 'もういいシエル') {
      const eventCodes = (
        await prisma.line_group_event_relations.findMany({
          where: { ciel_id: process.env.CIEL_ID, source_id: sourceId },
        })
      )
        .map((r) => r.event_code)
        .filter((code) => TOURS.some((d) => d.event_code === code));
      // リンクされていない場合は終了
      if (eventCodes.length === 0) {
        return [{ type: 'text', text: '今はお知らせしているイベントがないぴょ' }];
      }
      // 会話ステートを更新する
      await prisma.conversation_states.upsert({
        where: { ciel_id_source_id: { ciel_id: process.env.CIEL_ID, source_id: sourceId } },
        update: {
          state: ConversationState.WaitingForEventCodeForUnlinking,
          updated_at: new Date(),
        },
        create: {
          ciel_id: process.env.CIEL_ID,
          source_id: sourceId,
          state: ConversationState.WaitingForEventCodeForUnlinking,
          updated_at: new Date(),
        },
      });
      return [
        { type: 'text', text: 'お知らせを終了するのは、' },
        unlinkSelectorMessage(eventCodes),
      ];
    }
  }

  if (event.type === 'postback') {
    // 会話ステータスを取得する
    const state = await prisma.conversation_states.findUnique({
      where: { ciel_id_source_id: { ciel_id: process.env.CIEL_ID, source_id: sourceId } },
    });
    // アンリンク待ちでない場合はスルーする
    if (state?.state !== ConversationState.WaitingForEventCodeForUnlinking) {
      return null;
    }
    // 会話ステータスをクリアする
    await prisma.conversation_states.delete({
      where: { ciel_id_source_id: { ciel_id: process.env.CIEL_ID, source_id: sourceId } },
    });
    // 対象のイベントコードを取得する
    const data = (event as webhook.PostbackEvent).postback.data;
    const eventCodeMatch = data.match(/event_code=([^&]+)/);
    if (!eventCodeMatch) {
      return null;
    }
    const eventCode = decodeURIComponent(eventCodeMatch[1]);
    // アンリンク
    await prisma.line_group_event_relations.delete({
      where: {
        ciel_id_source_id_event_code: {
          ciel_id: process.env.CIEL_ID,
          source_id: sourceId,
          event_code: eventCode,
        },
      },
    });
    const tour: Tour | undefined = TOURS.find((d) => d.event_code === eventCode);
    const eventName = tour ? tour.display_name : eventCode;
    return [{ type: 'text', text: `「${eventName}」のお知らせを終了するぴょ` }];
  }

  return null;
};
