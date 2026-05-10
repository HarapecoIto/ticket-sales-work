import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  console.log('[cron] copy-to-sheet started');

  // TODO: Copy aggregated data to spreadsheet.

  console.log('[cron] copy-to-sheet finished');

  return NextResponse.json({ ok: true, job: 'copy-to-sheet' });
}
