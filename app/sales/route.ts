import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { type Project, parseProject } from '@/app/types.v2';
import { getSalesData } from '@/app/report/report.v2';

const isAuthorized = (request: NextRequest): boolean => {
  const isGuarded = process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview';
  if (!isGuarded) {
    return true;
  }
  const cielApiSecret = process.env.CIEL_API_SECRET;
  if (!cielApiSecret) {
    return false;
  }
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cielApiSecret}`;
};

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const json = await request.json();
    const dataString = JSON.stringify(json);
    const project: Project | undefined = parseProject(json);
    if (!project) {
      return NextResponse.json({ ok: false, message: 'Invalid project data' }, { status: 400 });
    }

    await prisma.projects.upsert({
      where: { project_code: project.project_code },
      update: {
        line_keyword: project.line_keyword,
        meta_info: dataString,
      },
      create: {
        project_code: project.project_code,
        line_keyword: project.line_keyword,
        meta_info: dataString,
      },
    });

    const sales = await getSalesData(project);
    return NextResponse.json({ ok: true, data: { project: json, sales } }, { status: 200 });
  } catch (error) {
    console.error('Error in trigger route:', error);
    return NextResponse.json({ ok: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
