import { messagingApi } from '@line/bot-sdk';

export const unlinkButtonMessage = (labels: string[]): messagingApi.TemplateMessage => {
  const actions: messagingApi.PostbackAction[] = labels.map((label) => ({
    type: 'postback',
    label,
    data: `action=unlink&event=${encodeURIComponent(label)}`,
  }));
  while (actions.length % 3 !== 0) {
    actions.push({ type: 'postback', label: ' ', data: 'action=none' });
  }
  const columns: messagingApi.CarouselColumn[] = [];
  for (let i = 0; i < actions.length; i += 3) {
    columns.push({
      text: '',
      defaultAction: actions[i],
      actions: actions.slice(i, i + 3),
    });
  }
  return {
    type: 'template',
    altText: '',
    template: {
      type: 'carousel',
      columns: columns,
      imageAspectRatio: 'rectangle',
      imageSize: 'cover',
    },
  };
};
