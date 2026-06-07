import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { type Tour } from '@/app/types';
import TOURS from '@/app/definitions/definitions';
import { getTicketSales } from '@/app/report/loadSales';

const isAuthorized = (request: NextRequest): boolean => {
  const isGuarded = process.env.VERCEL_ENV === 'production';
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

const isTarget = (dateAt: Date): boolean => {
  // 日付を比較するのためにUTCの0:00:00に変換して比較する
  const nextDay = new Date(dateAt);
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setUTCHours(0, 0, 0, 0);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today <= nextDay;
};

const execute = async (eventCode: string): Promise<{ sent: number; failed: number }> => {
  const tour: Tour | undefined = TOURS.find((t) => t.event_code === eventCode);
  if (!tour) {
    console.warn(`Tour with ID ${eventCode} not found`);
    return Promise.resolve({ sent: 0, failed: 0 });
  }
  if (tour.concerts.every((concert) => !isTarget(new Date(concert.date_at)))) {
    console.log(`Tour ${tour.event_code} is a past event, skipping`);
    return Promise.resolve({ sent: 0, failed: 0 });
  }
  const spreadsheets = await prisma.spreadsheets.findMany({
    where: {
      event_code: eventCode,
      ciel_id: process.env.CIEL_ID,
    },
  });
  if (spreadsheets.length === 0) {
    console.warn(`No spreadsheets found for tour ${eventCode}`);
    return Promise.resolve({ sent: 0, failed: 0 });
  }
  const data = await Promise.all(
    tour.concerts.map(async (concert) => ({
      concert_name: concert.short_name,
      sales: await getTicketSales(tour, concert),
    }))
  );
  const contents = {
    api_key: process.env.SPREADSHEETS_API_KEY,
    date: new Date().toISOString(),
    data: { tour_name: tour.short_name, concerts: data },
  };
  let sent = 0;
  let failed = 0;
  spreadsheets.forEach(async (sheet): Promise<void> => {
    console.log(`Sending data to sheet ${sheet.url} for tour ${tour.event_code}`);
    let isSuccess = true;
    fetch(sheet.url, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contents),
    }).catch((error) => {
      console.error(`Error sending data to sheet ${sheet.url}:`, error);
      isSuccess = false;
    });
    if (isSuccess) {
      sent++;
    } else {
      failed++;
    }
  });
  return { sent, failed };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventCode: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  console.log('[cron] copy-to-spreadsheet started');
  try {
    const { eventCode: eventCodeFromPath } = await params;
    const eventCode = eventCodeFromPath ?? request.nextUrl.searchParams.get('eventCode') ?? '';
    if (!TOURS.some((t) => t.event_code === eventCode)) {
      console.warn(`Invalid eventCode provided: ${eventCode}`);
      return NextResponse.json(
        { ok: false, message: 'Invalid eventCode parameter' },
        { status: 400 }
      );
    }
    const { sent, failed } = await execute(eventCode);
    console.log('[cron] copy-to-spreadsheet finished');
    return NextResponse.json(
      { ok: true, job: 'copy-to-spreadsheet', sent, failed },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in copy-to-spreadsheet:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to copy to spreadsheet' },
      { status: 500 }
    );
  }
}
