import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
    const data = await request.json();
    await prisma.scraping_triggered.create({
      data: {
        project_code: data.project_code,
        triggered_at: new Date(),
        meta_info: JSON.stringify(data),
      },
    });
    return NextResponse.json({ ok: true, data: data }, { status: 200 });
  } catch (error) {
    console.error('Error in trigger route:', error);
    return NextResponse.json({ ok: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
