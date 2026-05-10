import { NextRequest, NextResponse } from 'next/server';
import { messagingApi, validateSignature, webhook } from '@line/bot-sdk';

export const runtime = 'nodejs';

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
  const channelSecret = process.env.CHANNEL_SECRET;
  if (!channelSecret) {
    console.error('[line] webhook rejected: CHANNEL_SECRET is not set');
    return NextResponse.json({ ok: false, message: 'Server is not configured' }, { status: 500 });
  }

  const signature = request.headers.get('x-line-signature');
  if (!signature) {
    return NextResponse.json(
      { ok: false, message: 'Missing x-line-signature header' },
      { status: 401 }
    );
  }

  const rawBody = await request.text();
  if (!validateSignature(rawBody, channelSecret, signature)) {
    return NextResponse.json({ ok: false, message: 'Invalid signature' }, { status: 401 });
  }

  const client = getMessagingClient();
  if (!client) {
    console.error('[line] webhook rejected: CHANNEL_ACCESS_TOKEN is not set');
    return NextResponse.json({ ok: false, message: 'Server is not configured' }, { status: 500 });
  }

  let payload: webhook.CallbackRequest;
  try {
    payload = JSON.parse(rawBody) as webhook.CallbackRequest;
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  if (!Array.isArray(payload.events)) {
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
