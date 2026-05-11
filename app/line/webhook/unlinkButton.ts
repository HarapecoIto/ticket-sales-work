import { messagingApi } from '@line/bot-sdk';

export const unlinkButtonMessage = (labels: string[]): messagingApi.TemplateMessage => ({
  type: 'template',
  altText: 'this is a carousel template',
  template: {
    type: 'carousel',
    columns: [
      {
        thumbnailImageUrl: 'https://example.com/bot/images/item1.jpg',
        imageBackgroundColor: '#FFFFFF',
        title: 'this is menu',
        text: 'description',
        defaultAction: {
          type: 'uri',
          label: 'View detail',
          uri: 'http://example.com/page/123',
        },
        actions: [
          {
            type: 'postback',
            label: 'Buy',
            data: 'action=buy&itemid=111',
          },
          {
            type: 'postback',
            label: 'Add to cart',
            data: 'action=add&itemid=111',
          },
          {
            type: 'uri',
            label: 'View detail',
            uri: 'http://example.com/page/111',
          },
        ],
      },
      {
        thumbnailImageUrl: 'https://example.com/bot/images/item2.jpg',
        imageBackgroundColor: '#000000',
        title: 'this is menu',
        text: 'description',
        defaultAction: {
          type: 'uri',
          label: 'View detail',
          uri: 'http://example.com/page/222',
        },
        actions: [
          {
            type: 'postback',
            label: 'Buy',
            data: 'action=buy&itemid=222',
          },
          {
            type: 'postback',
            label: 'Add to cart',
            data: 'action=add&itemid=222',
          },
          {
            type: 'uri',
            label: 'View detail',
            uri: 'http://example.com/page/222',
          },
        ],
      },
    ],
    imageAspectRatio: 'rectangle',
    imageSize: 'cover',
  },
});
