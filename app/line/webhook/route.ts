import { NextRequest, NextResponse } from 'next/server';
import { messagingApi, validateSignature, webhook } from '@line/bot-sdk';
import crypto from 'crypto';

export const runtime = 'nodejs';

const checkLineSignature = async (body: string, signature: string) => {
  try {
    const hmac = crypto.createHmac('sha256', process.env.CHANNEL_SECRET);
    hmac.update(body);
    return hmac.digest('base64') === signature;
  } catch (err) {
    return false;
  }
};

const getMessagingClient = (): messagingApi.MessagingApiClient | null => {
  const channelAccessToken = process.env.CHANNEL_ACCESS_TOKEN;
  if (!channelAccessToken) {
    return null;
  }

  return new messagingApi.MessagingApiClient({ channelAccessToken });
};

const getReplyToken = (event: webhook.Event): string | null => {
  if (
    'replyToken' in event &&
    typeof event.replyToken === 'string' &&
    event.replyToken.length > 0
  ) {
    return event.replyToken;
  }

  return null;
};

const handleEvent = async (
  event: webhook.Event,
  client: messagingApi.MessagingApiClient
): Promise<void> => {
  const replyToken = getReplyToken(event);
  if (!replyToken) {
    return;
  }

  if (event.type === 'message' && event.message.type === 'text') {
    if (event.message.text === 'Graport') {
      await client.replyMessage({
        replyToken,
        messages: [{ type: 'text', text: '受け付けました。' }],
      });
    }
    return;
  }

  if (event.type === 'postback') {
    const data = event.postback.data ?? '';
    if (data.startsWith('type=membersCard') || data.startsWith('type=specialContents')) {
      await client.replyMessage({
        replyToken,
        messages: [{ type: 'text', text: '処理を開始しました。' }],
      });
    }
  }
};

export async function GET() {
  return NextResponse.json({ ok: true, message: "I'm listening. Please access with POST." });
}

export async function POST(request: NextRequest) {
  console.log('[line] webhook POST received');

  const rawBody = await request.text();
  const signature = request.headers.get('x-line-signature') || '';

  console.log('[line] checking signature...');
  const isSignatureOk: boolean = await checkLineSignature(rawBody, signature);
  if (!isSignatureOk) {
    console.warn('[line] webhook rejected: Invalid signature');
    return NextResponse.json({ ok: false, message: 'Invalid signature' }, { status: 401 });
  }
  console.log('[line] signature verified');

  const client = getMessagingClient();
  if (!client) {
    console.error('[line] webhook rejected: CHANNEL_ACCESS_TOKEN is not set');
    return NextResponse.json({ ok: false, message: 'Server is not configured' }, { status: 500 });
  }

  let payload: webhook.CallbackRequest;
  try {
    console.log('[line] parsing payload...');
    payload = JSON.parse(rawBody) as webhook.CallbackRequest;
    console.log('[line] payload parsed successfully');
  } catch (err) {
    console.error('[line] webhook rejected: Failed to parse JSON', err);
    return NextResponse.json({ ok: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  if (!Array.isArray(payload.events)) {
    console.error('[line] webhook rejected: events is not an array');
    return NextResponse.json({ ok: false, message: 'Invalid events payload' }, { status: 400 });
  }

  console.log(`[line] webhook received: events=${payload.events.length}`);

  try {
    await Promise.all(payload.events.map((event) => handleEvent(event, client)));
    return NextResponse.json({ ok: true, received: payload.events.length });
  } catch (error) {
    console.error('[line] webhook handling failed', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to handle webhook events' },
      { status: 500 }
    );
  }
}
