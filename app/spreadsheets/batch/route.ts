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

const executeAll = async (): Promise<{ sent: number; failed: number }> => {
  let totalSent = 0;
  let totalFailed = 0;
  for (const tour of TOURS) {
    const { sent, failed } = await postSalesData(tour.event_code);
    totalSent += sent;
    totalFailed += failed;
    console.log(`Tour ${tour.event_code}: ${sent} messages sent, ${failed} messages failed`);
  }
  console.log(`Total: ${totalSent} messages sent, ${totalFailed} messages failed`);
  return { sent: totalSent, failed: totalFailed };
};

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  console.log('[cron] copy-to-spreadsheet started');
  try {
    const { sent, failed } = await executeAll();
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
