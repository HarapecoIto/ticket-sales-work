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
  const json = await request.json();
  const projectCode = json['案件コード'];
  prisma.scraping_triggered.create({
    data: {
      project_code: projectCode,
      triggered_at: new Date(),
      meta_info: JSON.stringify(json),      
    },
  });
  return NextResponse.json({ ok: true }, { status: 200 });
}
