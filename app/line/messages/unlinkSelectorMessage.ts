import { messagingApi } from '@line/bot-sdk';
import { type Tour } from '@/app/types';
import TOURS from '@/app/definitions/definitions';

export const unlinkSelectorMessage = (eventCodes: string[]): messagingApi.Message => {
  const actions: messagingApi.PostbackAction[] = eventCodes.map((eventCode) => {
    const tour: Tour | undefined = TOURS.find((d) => d.event_code === eventCode);
    const label = tour ? tour.short_name : '';
    return {
      type: 'postback',
      label,
      displayText: label,
      data: `action=unlink&event_code=${encodeURIComponent(eventCode || '')}`,
    };
  });
  const columns: messagingApi.CarouselColumn[] = [];
  if (actions.length <= 3) {
    columns.push({
      text: 'どれぴょ？',
      defaultAction: actions[0],
      actions: actions,
    });
  } else {
    while (actions.length % 3 !== 0) {
      actions.push({ type: 'postback', label: ' ', data: 'action=none' });
    }
    for (let i = 0; i < actions.length; i += 3) {
      columns.push({
        text: 'どれぴょ？',
        defaultAction: actions[i],
        actions: actions.slice(i, i + 3),
      });
    }
  }
  return {
    type: 'template',
    altText: 'どれぴょ？',
    template: {
      type: 'carousel',
      columns: columns,
      imageAspectRatio: 'rectangle',
      imageSize: 'cover',
    },
  };
};
