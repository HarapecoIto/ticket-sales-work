import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseProject, Project } from '@/app/types.v2';
import { createReports } from '@/app/report/report.v2';

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

const sendMessage = async (taskId: string, message: string) => {
  try {
    const url = `https://app.asana.com/api/1.0/tasks/${taskId}/stories`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ASANA_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        data: { text: message },
      }),
    });
    if (!response.ok) {
      console.error(`Failed to post comment to Asana task ${taskId}:`, await response.text());
    }
  } catch (error) {
    console.error(`Error pushing message for task ID ${taskId}:`, error);
  }
};

const execute = async (): Promise<string> => {
  const asanaTasks = await prisma.asana_tasks_v2.findMany({
    where: { ciel_id: process.env.CIEL_ID },
    select: { task_id: true },
    distinct: ['task_id'],
  });
  for (const task of asanaTasks) {
    console.log(`[cron] Fetched Asana task: ${task.task_id}`);
    const projectCodes = (
      await prisma.asana_tasks_v2.findMany({
        where: { ciel_id: process.env.CIEL_ID, task_id: task.task_id },
        select: { project_code: true },
        distinct: ['project_code'],
      })
    ).map((p) => p.project_code);
    const projects: Project[] = (
      await prisma.projects.findMany({
        where: { project_code: { in: projectCodes } },
      })
    )
      .map((p) => parseProject(p.meta_info))
      .filter((p): p is Project => !!p);
    console.log(
      `[cron] Fetched project codes for task ${task.task_id}: ${projectCodes.join(', ')}`
    );
    const reports: string[] = await createReports(projects, true);
    console.log(reports.join('\n'));

    if (reports.length > 0) {
      await sendMessage(task.task_id, reports.join('\n'));
    }
    console.log(`[cron] Created reports for task ${task.task_id}`);
  }
  console.log(`[cron] Fetched Asana tasks: ${asanaTasks.map((t) => t.task_id).join(', ')}`);
  return `Fetched ${asanaTasks.length} Asana tasks`;
};

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  console.log('[cron] post-asana started');
  try {
    const result = await execute();
    console.log('[cron] post-asana finished');
    return NextResponse.json({ ok: true, job: 'post-asana', result }, { status: 200 });
  } catch (error) {
    console.error('Error in post-asana:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to post Asana comments' },
      { status: 500 }
    );
  }
}
