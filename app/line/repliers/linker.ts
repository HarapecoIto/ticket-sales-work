import prisma from '@/lib/prisma';
import { messagingApi, webhook } from '@line/bot-sdk';
import { type Project } from '@/app/types.v2';

const WAITING_STATUS = 'waiting_for_project_code_for_linking';

export const linker = async (
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
        update: { state: WAITING_STATUS, updated_at: new Date() },
        create: {
          ciel_id: process.env.CIEL_ID,
          source_id: sourceId,
          state: WAITING_STATUS,
          updated_at: new Date(),
        },
      });
      return [{ type: 'text', text: 'チケッティングデスクから発行された合言葉を教えてぴょ' }];
    } else if (state?.state === WAITING_STATUS) {
      // ここで会話を終了する
      await prisma.conversation_states.delete({
        where: { ciel_id_source_id: { ciel_id: process.env.CIEL_ID, source_id: sourceId } },
      });
      const projects = await prisma.projects.findMany({
        where: { line_keyword: text },
      });
      if (projects.length === 0) {
        return [{ type: 'text', text: '該当する案件が見つからないぴょ' }];
      } else if (projects.length > 1) {
        return [
          { type: 'text', text: '該当する案件が複数見つかったぴょ。キーワードの再発行が必要ぴょ' },
        ];
      }
      // リンクする（未リンクの場合）
      await prisma.line_project_relations_v2.createMany({
        data: [
          {
            ciel_id: process.env.CIEL_ID,
            source_id: sourceId,
            project_code: projects[0].project_code,
          },
        ],
        skipDuplicates: true,
      });
      const project: Project = JSON.parse(projects[0].meta_info) as Project;
      return [
        {
          type: 'text',
          text: `毎日18時過ぎに「${project.project_name}」のチケット販売状況を知らせるぴょ`,
        },
      ];
    }
  }
  return null;
};
