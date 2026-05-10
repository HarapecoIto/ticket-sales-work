import { messagingApi, MiddlewareConfig, middleware, webhook } from '@line/bot-sdk';
import express from 'express';

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
});

const config: MiddlewareConfig = {
  channelSecret: process.env.CHANNEL_SECRET || '',
};

// create Express app
// about Express itself: https://expressjs.com/
const app = express();
app.get('/api/webhook', (request: express.Request, response: express.Response) =>
  response.end(`I'm listening. Please access with POST.`)
);
app.post('/api/webhook', middleware(config), (request, response) => {
  if (request.body.destination) {
    console.log('Destination User ID: ' + request.body.destination);
  }
  // req.body.events should be an array of events
  if (!Array.isArray(request.body.events)) {
    return response.status(500).end();
  }
  const events: Array<webhook.MessageEvent | webhook.PostbackEvent> = request.body.events;
  // handle events separately
  Promise.all(events.map(handleEvent))
    .then(() => response.end())
    .catch((err) => {
      console.error(err);
      response.status(500).end();
    });
});

const handleEvent = async (
  event: webhook.MessageEvent | webhook.AccountLinkEvent | webhook.PostbackEvent
) => {
  try {
    if (!event.replyToken) {
      return;
    }
    // Sample
    if (
      event.type == 'message' &&
      event.message.type == 'text' &&
      event.message.text == 'Graport'
    ) {
      return client.replyMessage({
        replyToken: event.replyToken,
        messages: [], // TODO
      });
    }
    // Sample
    if (event.type === 'postback') {
      if (
        (event.postback.data as string).startsWith('type=membersCard') ||
        (event.postback.data as string).startsWith('type=specialContents')
      ) {
        return client.replyMessage({
          replyToken: event.replyToken,
          messages: [], // TODO
        });
      }
    }
  } catch (err) {
    console.error(err);
    if (!event.replyToken) {
      return;
    }
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'text',
          text: 'メンテナンス中です。',
        },
      ],
    });
  }
};

// listen on port
const port = Number(process.env.PORT || '3000');
app.listen(port);
