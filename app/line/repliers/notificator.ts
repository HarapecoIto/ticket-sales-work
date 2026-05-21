import prisma from '@/lib/prisma';
import { messagingApi, webhook } from '@line/bot-sdk';
import { summaryMessage, detailMessage } from '@/app/line/messages/notificationMessage';

export const notificator = async (
  sourceId: string,
  event: webhook.Event
): Promise<messagingApi.Message[] | null> => {
  if (event.type === 'message' && event.message.type === 'text') {
    const text = event.message.text.trim();
    // サマリー
    if (text === '教えてシエル' || text === '知らせてシエル') {
      const eventCodes = (
        await prisma.line_group_event_relations.findMany({
          where: { source_id: sourceId },
        })
      ).map((r) => r.event_code);
      const messages: messagingApi.Message[] = await Promise.all(
        eventCodes.map((eventCode) => summaryMessage(eventCode))
      );
      return messages.length > 0 ? messages : [{ type: 'text', text: 'お知らせはないぴょ' }];
    }
    // 明細
    if (text === '詳しくシエル') {
      const eventCodes = (
        await prisma.line_group_event_relations.findMany({
          where: { source_id: sourceId },
        })
      ).map((r) => r.event_code);
      const messages: messagingApi.Message[] = await Promise.all(
        eventCodes.map((eventCode) => detailMessage(eventCode))
      );
      return messages.length > 0 ? messages : [{ type: 'text', text: 'お知らせはないぴょ' }];
    }
  }
  return null;
};
