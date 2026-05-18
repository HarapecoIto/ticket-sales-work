import prisma from '@/lib/prisma';
import { messagingApi } from '@line/bot-sdk';
import { notificationMessage } from '@/app/line/messages/notificationMessage';

export const salesNotification = async (
  sourceId: string,
  text?: string
): Promise<messagingApi.Message[] | null> => {
  if (text === '教えてシエル' || text === '知らせてシエル') {
    const eventCodes = (
      await prisma.line_group_event_relations.findMany({
        where: { source_id: sourceId },
      })
    ).map((r) => r.event_code);
    const messages: messagingApi.Message[] = await Promise.all(
      eventCodes.map((eventCode) => notificationMessage(eventCode))
    );
    return messages.length > 0 ? messages : [{ type: 'text', text: 'お知らせはないぴょ' }];
  }
  return null;
};
