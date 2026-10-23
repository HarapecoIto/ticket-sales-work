import { messagingApi } from '@line/bot-sdk';
import { type Project } from '@/app/types.v2';

export const unlinkSelectorMessage = (projects: Project[]): messagingApi.Message => {
  const actions: messagingApi.PostbackAction[] = projects.map((project) => {
    const displayName = project.project_name;
    const label = displayName.length > 20 ? displayName.slice(0, 17) + '...' : displayName;
    return {
      type: 'postback',
      label,
      displayText: label,
      data: `action=unlink&event_code=${encodeURIComponent(project.project_code)}`,
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
