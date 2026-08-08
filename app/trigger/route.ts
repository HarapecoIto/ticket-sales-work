import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import TOURS from '@/app/definitions/definitions';
import { createReport } from '@/app/report/report';

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
    prisma.scraping_triggered.create({
      data: {
        project_code: json.project_code,
        triggered_at: new Date(),
        meta_info: JSON.stringify(json),
      },
    });
    return NextResponse.json({ ok: true, data: json }, { status: 200 });
  } catch (error) {
    console.error('Error in trigger route:', error);
    return NextResponse.json({ ok: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
