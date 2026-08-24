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

const execute = async (project: Project): Promise<string> => {
  const targetConcerts = project.concerts.filter((concert) => isTarget(concert.start_datetime));
  if (targetConcerts.length === 0) {
    return 'No target concerts';
  }

  // 売上データの取得
  const salesData = await getSalesData(project);
  console.log('Sales Data:', JSON.stringify(salesData, null, 2));

  // レポートの作成
  const lines: string[] = await createReport(project);
  console.log('Sales Report:\n' + lines.join('\n'));

  return lines.join('\n');
};

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    //    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  console.log('[asana] post-asana started');
  try {
    const project: Project = request.json() as unknown as Project;
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
