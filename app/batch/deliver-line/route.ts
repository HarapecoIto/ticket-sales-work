import { NextRequest, NextResponse } from 'next/server';
import { messagingApi } from '@line/bot-sdk';

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

const getRecipients = (): string[] => {
  const rawRecipients = process.env.LINE_PUSH_TO || '';

  return rawRecipients
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
};

type DeliverLineResult = {
  sent: number;
  failed: number;
  recipients: string[];
};

const execute = async (): Promise<DeliverLineResult> => {
  const recipients = getRecipients();

  if (recipients.length === 0) {
    console.warn('[cron] deliver-line skipped: LINE_PUSH_TO is empty');
    return { sent: 0, failed: 0, recipients: [] };
  }

  const messageText = process.env.LINE_PUSH_MESSAGE || '日次販売レポートを配信しました。';
  const messages: messagingApi.Message[] = [{ type: 'text', text: messageText }];

  const results = await Promise.allSettled(
    recipients.map((to) => client.pushMessage({ to, messages }))
  );

  const failed = results.filter((result) => result.status === 'rejected').length;

  if (failed > 0) {
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`[cron] deliver-line failed: recipient=${recipients[index]}`, result.reason);
      }
    });
  }

  return { sent: recipients.length - failed, failed, recipients };
};

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  console.log('[cron] deliver-line started');

  try {
    const result = await execute();
    console.log('[cron] deliver-line finished', result);

    return NextResponse.json({ ok: true, job: 'deliver-line', ...result });
  } catch (error) {
    console.error('Error in deliver-line:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to deliver LINE push messages' },
      { status: 500 }
    );
  }
}
