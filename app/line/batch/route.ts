import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseProject } from '@/app/types.v2';
import { createReports } from '@/app/report/report.v2';
import { messagingApi } from '@line/bot-sdk';

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
});

const isAuthorized = (request: NextRequest): boolean => {
  const isGuarded = process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview';
  if (!isGuarded) {
    return true;
  }
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return false;
  }
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
};

const sendMessage = async (sourceId: string, message: string) => {
  try {
    client.pushMessage({ to: sourceId, messages: [{ type: 'text', text: message }] });
  } catch (error) {
    console.error(`Error pushing message for source ID ${sourceId}:`, error);
  }
};

const execute = async (): Promise<string> => {
  const sourceIds = (
    await prisma.line_project_relations_v2.findMany({
      where: { ciel_id: process.env.CIEL_ID },
      select: { source_id: true },
      distinct: ['source_id'],
    })
  ).map((r) => r.source_id);
  for (const sourceId of sourceIds) {
    console.log(`[cron] Fetched LINE source ID: ${sourceId}`);
    const projectCodes = (
      await prisma.line_project_relations_v2.findMany({
        where: { ciel_id: process.env.CIEL_ID, source_id: sourceId },
        select: { project_code: true },
        distinct: ['project_code'],
      })
    ).map((p) => p.project_code);
    const projects = (
      await prisma.projects.findMany({
        where: { project_code: { in: projectCodes } },
      })
    ).map((p) => parseProject(p.meta_info));
    console.log(`[cron] Fetched project codes for task ${sourceId}: ${projectCodes.join(', ')}`);
    const reports: string[] = await createReports(projects, true);
    console.log(reports.join('\n'));

    await sendMessage(sourceId, reports.join('\n'));
    console.log(`[cron] Created reports for task ${sourceId}`);
  }
  console.log(`[cron] Fetched LINE source IDs: ${sourceIds.join(', ')}`);
  return `Fetched ${sourceIds.length} LINE source IDs`;
};

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  console.log('[cron] deliver-line started');
  try {
    const result = await execute();
    console.log('[cron] deliver-line finished');
    return NextResponse.json({ ok: true, job: 'deliver-line', result }, { status: 200 });
  } catch (error) {
    console.error('Error in deliver-line:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to deliver LINE messages' },
      { status: 500 }
    );
  }
}
