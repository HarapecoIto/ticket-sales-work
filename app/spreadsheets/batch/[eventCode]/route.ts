import { NextRequest, NextResponse } from 'next/server';
import TOURS from '@/app/definitions/definitions';
import { postSalesData } from '@/app/spreadsheets/postSalesData';

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
    const { sent, failed } = await postSalesData(eventCode);
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
