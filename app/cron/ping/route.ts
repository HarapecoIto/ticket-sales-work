import { NextRequest, NextResponse } from 'next/server';

const isAuthorized = (request: NextRequest): boolean => {
  const isGuarded = process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === undefined;
  if (!isGuarded) {
    return true;
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[cron] ping unauthorized: CRON_SECRET is missing');
    return false;
  }

  const authHeader = request.headers.get('authorization');
  const authorized = authHeader === `Bearer ${cronSecret}`;
  if (!authorized) {
    console.warn('[cron] ping unauthorized: Authorization header mismatch', {
      hasAuthorizationHeader: Boolean(authHeader),
      vercelEnv: process.env.VERCEL_ENV ?? 'undefined',
    });
  }

  return authorized;
};

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date().toISOString();
  console.log(`[cron] ping fired at ${now}`);
  return NextResponse.json({ ok: true, job: 'cron-ping', firedAt: now }, { status: 200 });
}
