import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Project } from '@/app/types.v2.js';

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
    const project: Project = json as Project;
    const dataString = JSON.stringify(project);
    const created = await prisma.scraping_triggered.create({
      data: {
        project_code: project.project_code,
        triggered_at: new Date(),
        meta_info: dataString,
      },
    });
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
    console.log('Scraping trigger created:', created);
    return NextResponse.json({ ok: true, data: json }, { status: 200 });
  } catch (error) {
    console.error('Error in trigger route:', error);
    return NextResponse.json({ ok: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
