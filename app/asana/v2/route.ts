import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Project } from '@/app/types.v2.js';
import { getSalesData, createReport } from '@/app/report/report.v2';

const isAuthorized = (request: NextRequest): boolean => {
  const apiSecret = process.env.CIEL_API_SECRET;
  const authHeader = request.headers.get('authorization');
  return apiSecret != null && authHeader === 'Bearer ' + apiSecret;
};

const isTarget = (dateAt: Date): boolean => {
  const nextDay = new Date(dateAt);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayString = nextDay.toISOString().split('T')[0];
  const todayString = new Date().toISOString().split('T')[0];
  return todayString <= nextDayString;
};

const upsertProject = async (project: Project): Promise<void> => {
  await prisma.projects.upsert({
    where: { project_code: project.project_code },
    update: {
      line_keyword: project.line_keyword,
    },
    create: {
      project_code: project.project_code,
      line_keyword: project.line_keyword,
    },
  });
};

const sendReport = async (report: string, projectCode: string): Promise<any> => {
  const taskIds = await prisma.asana_tasks
    .findMany({ where: { ciel_id: process.env.CIEL_ID, event_code: projectCode } })
    .then((relations) => relations.map((r) => r.task_id));
  let messagesSent = 0;
  let messagesFailed = 0;
  for (const taskId of taskIds) {
    try {
      const url = `https://app.asana.com/api/1.0/tasks/${taskId}/stories`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.ASANA_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          data: { text: report },
        }),
      });
      if (!response.ok) {
        console.error(`Failed to post comment to Asana task ${taskId}:`, await response.text());
        messagesFailed++;
      } else {
        messagesSent++;
      }
    } catch (error) {
      console.error(`Error pushing report for task ID ${taskId}:`, error);
    }
  }
  return { messagesSent, messagesFailed };
};

const execute = async (project: Project): Promise<any> => {
  const targetConcerts = project.concerts.filter((concert) => isTarget(concert.start_datetime));
  if (targetConcerts.length === 0) {
    return 'No target concerts';
  }

  // 売上データの取得
  const salesData = await getSalesData(project);
  console.log('Sales Data:', JSON.stringify(salesData, null, 2));

  // レポートの作成
  const lines: string[] = await createReport(project);
  const report = lines.join('\n');
  console.log('Sales Report:\n' + report);

  const result = await sendReport(report, project.project_code);
  return { report, result };
};

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  console.log('[asana] post-asana started');
  try {
    const project: Project = (await request.json()) as unknown as Project;
    await upsertProject(project);
    const result = await execute(project);
    console.log('[asana] post-asana finished');
    return NextResponse.json({ ok: true, job: 'post-asana', result }, { status: 200 });
  } catch (error) {
    console.error('Error in post-asana:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to post Asana comments' },
      { status: 500 }
    );
  }
}
