import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { messagingApi } from '@line/bot-sdk';
import TOURS from '@/app/definitions/definitions';
import { summaryMessage } from '@/app/messages/notificationMessage';

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
    return false;
  }
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
};

const execute = async (): Promise<string> => {
  let messagesSent = 0;
  for (const tour of TOURS) {
    const sourceIds = await prisma.line_group_event_relations
      .findMany({ where: { event_code: tour.event_code } })
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
