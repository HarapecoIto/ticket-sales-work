import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { type Tour, type Concert, type TicketSales } from '@/app/types';
import TOURS from '@/app/definitions/definitions';
import { getTicketSales } from '@/app/utility/loadSales';

const isAuthorized = (request: NextRequest): boolean => {
  const isGuarded = process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === undefined;
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

const execute = async (): Promise<string> => {
  const spreadsheets = await prisma.spreadsheets.findMany();
  for (const sheet of spreadsheets) {
    const tour: Tour | undefined = TOURS.find((t) => t.event_code === sheet.event_code);
    if (!tour) {
      console.warn(`Tour with ID ${sheet.event_code} not found for spreadsheet ${sheet.url}`);
      continue;
    }
    const data = [];
    for (const concert of tour.concerts) {
      const records: TicketSales[] = await getTicketSales(tour, concert);
      const sales = records.map((d) => {
        const reservedNumber =
          (d.applied_number ?? 0) +
          (d.unconfirmed_winning_number ?? 0) +
          (d.confirmed_winning_number ?? 0);
        const soldNumber = (d.unconfirmed_sales_number ?? 0) + (d.confirmed_sales_number ?? 0);
        return {
          campaign: d.campaign,
          play_guide: d.play_guide,
          ticket: d.ticket,
          reserved: reservedNumber,
          sold: soldNumber,
        };
      });
      data.push({ concert_name: concert.short_name, sales });
    }
    const contents = {
      api_key: process.env.SPREADSHEETS_API_KEY,
      date: new Date().toISOString(),
      data: data,
    };
    console.log(`Sending data to sheet ${sheet.url} for tour ${tour.event_code}`);
    fetch(sheet.url, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contents),
    }).catch((error) => {
      console.error(`Error sending data to sheet ${sheet.url}:`, error);
    });
  }
  console.log(`[cron] copy-to-sheet: ${spreadsheets.length} spreadsheets processed`);
  return `[cron] copy-to-sheet: ${spreadsheets.length} spreadsheets processed`;
};

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  console.log('[cron] copy-to-sheet started');
  try {
    const result = await execute();
    console.log('[cron] copy-to-sheet finished');
    return NextResponse.json({ ok: true, job: 'copy-to-sheet', result }, { status: 200 });
  } catch (error) {
    console.error('Error in copy-to-sheet:', error);
    return NextResponse.json({ ok: false, message: 'Failed to copy to sheet' }, { status: 500 });
  }
}
