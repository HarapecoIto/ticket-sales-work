import { Concert } from '@/app/types';
import { messagingApi } from '@line/bot-sdk';

export const unlinkButtonMessage = (concerts: Concert[]): messagingApi.TemplateMessage => {
  const actions: messagingApi.PostbackAction[] = concerts.map((concert) => {
    const label = concert ? concert.short_name : '';
    return {
      type: 'postback',
      label,
      data: `action=unlink&event=${encodeURIComponent(concert?.event_code || '')}`,
    };
  });
  const columns: messagingApi.CarouselColumn[] = [];
  if (actions.length <= 3) {
    columns.push({
      text: 'どれかな？',
      defaultAction: actions[0],
      actions: actions,
    });
  } else {
    while (actions.length % 3 !== 0) {
      actions.push({ type: 'postback', label: ' ', data: 'action=none' });
    }
    for (let i = 0; i < actions.length; i += 3) {
      columns.push({
        text: 'どれかな？',
        defaultAction: actions[i],
        actions: actions.slice(i, i + 3),
      });
    }
  }
  return {
    type: 'template',
    altText: 'どれかな？',
    template: {
      type: 'carousel',
      columns: columns,
      imageAspectRatio: 'rectangle',
      imageSize: 'cover',
    },
  };
};
