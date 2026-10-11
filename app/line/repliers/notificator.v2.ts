import prisma from '@/lib/prisma';
import { messagingApi, webhook } from '@line/bot-sdk';
import { createReport } from '@/app/report/report.v2';
import { Project } from '@/app/types.v2';

export const notificator = async (
  sourceId: string,
  event: webhook.Event
): Promise<messagingApi.Message[] | null> => {
  if (event.type === 'message' && event.message.type === 'text') {
    const text = event.message.text.trim();
    // サマリー
    if (text === '教えてシエル' || text === '知らせてシエル') {
      const projectCodes = (
        await prisma.line_project_relations_v2.findMany({
          where: { ciel_id: process.env.CIEL_ID, source_id: sourceId },
        })
      ).map((r) => r.project_code);
      const projects = (
        await prisma.projects.findMany({
          where: { project_code: { in: projectCodes } },
          select: { meta_info: true },
        })
      ).map((project) => JSON.parse(project.meta_info) as Project);
      const messages: messagingApi.Message[] = [];
      for (const project of projects) {
        const lines: string[] = await createReport(project);
        const message = lines.join('\n');
        messages.push({ type: 'text', text: message });
      }
      return messages.length > 0 ? messages : [{ type: 'text', text: 'お知らせはないぴょ' }];
    }
  }
  return null;
};
