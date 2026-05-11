import { messagingApi } from '@line/bot-sdk';
import DEFINITIONS from '../../definitions/definitions';

export const unlinkButtonMessage = (eventCodes: string[]): messagingApi.TemplateMessage => {
  const actions: messagingApi.PostbackAction[] = eventCodes.map((code) => {
    const definition = DEFINITIONS.find((d) => d.event_code === code);
    const label = definition ? definition.short_name : code;
    return {
      type: 'postback',
      label,
      data: `action=unlink&event=${encodeURIComponent(code)}`,
    };
  });
  while (actions.length % 3 !== 0) {
    actions.push({ type: 'postback', label: ' ', data: 'action=none' });
  }
  const columns: messagingApi.CarouselColumn[] = [];
  for (let i = 0; i < actions.length; i += 3) {
    columns.push({
      text: 'どれかな？',
      defaultAction: actions[i],
      actions: actions.slice(i, i + 3),
    });
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
