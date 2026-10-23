import prisma from '@/lib/prisma';
import { messagingApi, webhook } from '@line/bot-sdk';
import { createReports } from '@/app/report/report.v2';
import { Project, parseProject } from '@/app/types.v2';

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
      const projects: Project[] = (
        await prisma.projects.findMany({
          where: { project_code: { in: projectCodes } },
          select: { meta_info: true },
        })
      )
        .map((p) => parseProject(p.meta_info))
        .filter((p): p is Project => !!p);
      const reports: string[] = await createReports(projects, true);
      return reports.length > 0
        ? [{ type: 'text', text: reports.join('\n') }]
        : [{ type: 'text', text: 'お知らせはないぴょ' }];
    }
  }
  return null;
};
