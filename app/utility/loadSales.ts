import prisma from '@/lib/prisma';
import { type Tour, type Concert, type Campaign, type TicketSales } from '@/app/types';

export const getTicketSales = async (tour: Tour, c: Concert): Promise<TicketSales[]> => {
  // 24時間以内に集計されたレコードを取得する
  const records = await prisma.daily_sales_details.findMany({
    where: {
      event_code: tour.event_code,
      concert_short_name: c.short_name,
      aggregated_at: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    },
    orderBy: { aggregated_at: 'desc' },
  });

  // 重複がある場合は最新のもののみを採用する
  const temp = new Map<string, (typeof records)[number]>();
  records.forEach((record) => {
    const key = `${record.campaign_name}::${record.play_guide}`;
    if (!temp.has(key)) {
      temp.set(key, record);
    }
  });

  return Array.from(temp.values())
    .map((record): TicketSales[] => {
      return [1, 2, 3, 4, 5]
        .map((i) => {
          const d = c.distribution.find(
            (d) =>
              d.campaign_alias === record.campaign_name &&
              d.play_guide === record.play_guide &&
              d.ticket_alias === record[`ticket_${i}` as keyof typeof record]
          );
          if (!d) {
            return null;
          }
          return {
            event_code: tour.event_code,
            concert_short_name: c.short_name,
            campaign: d.campaign,
            play_guide: d.play_guide,
            ticket: d.ticket,
            aggregated_at: record.aggregated_at,
            applied_number: null,
            reserved_number: record[`reservation_${i}` as keyof typeof record],
            confirmed_number: record[`sales_${i}` as keyof typeof record],
          };
        })
        .filter((sales) => sales !== null) as TicketSales[];
    })
    .flat();
};

export const getTicketSalesCandidate = async (tour: Tour, c: Concert): Promise<TicketSales[]> => {
  // 24時間以内に集計されたレコードを取得する
  const records = await prisma.daily_ticket_sales.findMany({
    where: {
      event_code: tour.event_code,
      concert_short_name: c.short_name,
      aggregated_at: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    },
    orderBy: { aggregated_at: 'desc' },
  });

  // 重複がある場合は最新のもののみを採用する
  const temp = new Map<string, (typeof records)[number]>();
  records.forEach((record) => {
    const key = `${record.campaign_name}::${record.play_guide}::${record.ticket}`;
    if (!temp.has(key)) {
      temp.set(key, record);
    }
  });
  return Array.from(temp.values())
    .map((record): TicketSales | null => {
      const d = c.distribution.find(
        (d) =>
          d.campaign_alias === record.campaign_name &&
          d.play_guide === record.play_guide &&
          d.ticket_alias === record.ticket
      );
      if (!d) {
        return null;
      }
      return {
        event_code: tour.event_code,
        concert_short_name: c.short_name,
        campaign: d.campaign,
        play_guide: d.play_guide,
        ticket: d.ticket,
        aggregated_at: record.aggregated_at,
        applied_number: record.applied_number,
        reserved_number: record.reserved_number,
        confirmed_number: record.confirmed_number,
      };
    })
    .filter((sales) => sales !== null) as TicketSales[];
};
