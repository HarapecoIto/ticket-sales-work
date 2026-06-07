import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { messagingApi } from '@line/bot-sdk';
import TOURS from '@/app/definitions/definitions';
import { summaryMessage } from '@/app/line/messages/notificationMessage';

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
});

const isAuthorized = (request: NextRequest): boolean => {
  const isGuarded = process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === undefined;
  if (!isGuarded) {
    return true;
  }
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[cron] deliver-line unauthorized: CRON_SECRET is missing');
    return false;
  }
  const authHeader = request.headers.get('authorization');
  const authorized = authHeader === `Bearer ${cronSecret}`;
  if (!authorized) {
    console.warn('[cron] deliver-line unauthorized: Authorization header mismatch', {
      hasAuthorizationHeader: Boolean(authHeader),
      vercelEnv: process.env.VERCEL_ENV ?? 'undefined',
    });
  }
  return authorized;
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

const execute = async (): Promise<string> => {
  let messagesSent = 0;
  for (const tour of TOURS) {
    // イベント翌日までを通知対象とする
    if (
      !tour.concerts.some((concert): boolean => {
        return isTarget(new Date(concert.date_at));
      })
    ) {
      continue;
    }
    const sourceIds = await prisma.line_group_event_relations
      .findMany({ where: { ciel_id: process.env.CIEL_ID, event_code: tour.event_code } })
      .then((relations) => relations.map((r) => r.source_id))
      .catch((error) => {
        console.error(`Error fetching source IDs for event code ${tour.event_code}:`, error);
        return [];
      });
    if (sourceIds.length > 0) {
      const message: string = await summaryMessage(tour.event_code);
      await Promise.allSettled(
        sourceIds.map((to) =>
          client.pushMessage({ to, messages: [{ type: 'text', text: message }] })
        )
      ).catch((error) => {
        console.error(`Error pushing message for event code ${tour.event_code}:`, error);
      });
      messagesSent += sourceIds.length;
    }
  }
  console.log(`[cron] deliver-line: ${messagesSent} messages sent`);
  return `[cron] deliver-line: ${messagesSent} messages sent`;
};

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  console.log('[cron] deliver-line started');
  try {
    const result = await execute();
    console.log('[cron] deliver-line finished');
    return NextResponse.json({ ok: true, job: 'deliver-line', result }, { status: 200 });
  } catch (error) {
    console.error('Error in deliver-line:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to deliver LINE push messages' },
      { status: 500 }
    );
  }
}
