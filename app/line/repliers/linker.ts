import prisma from '@/lib/prisma';
import { messagingApi, webhook } from '@line/bot-sdk';
import { type Tour, ConversationState } from '@/app/types';
import TOURS from '@/app/definitions/definitions';

export const linker = async (
  sourceId: string,
  event: webhook.Event
): Promise<messagingApi.Message[] | null> => {
  // 1時間以上前の状態は削除してクリーンアップする
  await prisma.conversation_states.deleteMany({
    where: {
      updated_at: { lt: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  // 会話ステータスを取得する
  const state = await prisma.conversation_states.findUnique({
    where: { ciel_id_source_id: { ciel_id: process.env.CIEL_ID, source_id: sourceId } },
  });

  if (event.type === 'message' && event.message.type === 'text') {
    const text = event.message.text.trim();
    if (text === 'お願いシエル') {
      // 会話ステートを更新する
      await prisma.conversation_states.upsert({
        where: { ciel_id_source_id: { ciel_id: process.env.CIEL_ID, source_id: sourceId } },
        update: { state: ConversationState.WaitingForEventCodeForLinking, updated_at: new Date() },
        create: {
          ciel_id: process.env.CIEL_ID,
          source_id: sourceId,
          state: ConversationState.WaitingForEventCodeForLinking,
          updated_at: new Date(),
        },
      });
      return [
        { type: 'text', text: 'チケッティングデスクから発行されたイベントコードを教えてぴょ' },
      ];
    } else if (state?.state === ConversationState.WaitingForEventCodeForLinking) {
      // ここで会話を終了する
      await prisma.conversation_states.delete({
        where: { ciel_id_source_id: { ciel_id: process.env.CIEL_ID, source_id: sourceId } },
      });
      // リンク対象のイベント
      const tour: Tour | undefined = TOURS.find((d) => d.event_code === text);
      if (!tour) {
        return [
          {
            type: 'text',
            text: `イベントコード「${text}」は見つからないぴょ。もう一度確認してぴょ`,
          },
        ];
      }
      // リンクする（未リンクの場合）
      await prisma.line_group_event_relations.createMany({
        data: [{ ciel_id: process.env.CIEL_ID, source_id: sourceId, event_code: tour.event_code }],
        skipDuplicates: true,
      });
      return [
        {
          type: 'text',
          text: `毎日18時過ぎに「${tour.name}」のチケット販売状況を知らせるぴょ`,
        },
      ];
    }
  }

  return null;
};
