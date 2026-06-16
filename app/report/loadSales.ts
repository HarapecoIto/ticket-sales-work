import prisma from '@/lib/prisma';
import { type Tour, type Concert, type TicketSales } from '@/app/types';

type TicketSalesRecord = {
  event_code: string;
  concert_short_name: string;
  campaign: string;
  play_guide: string;
  ticket: string;
  aggregated_at: Date;
  applied_number: number | null;
  reserved_number: number | null;
  confirmed_number: number | null;
};

const loadRecords = async (tour: Tour, c: Concert): Promise<TicketSalesRecord[]> => {
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
    .map((record): TicketSalesRecord | null => {
      // プレイガイドごとの表記の揺れを吸収する
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
    .filter((sales) => sales !== null) as TicketSalesRecord[];
};

export const getTicketSales = async (tour: Tour, concert: Concert): Promise<TicketSales> => {
  const data = await loadRecords(tour, concert);
  return tour.campaigns.map((campaign) => {
    {
      const records = data.filter((d) => d.campaign === campaign.campaign_name);
      const playGuides = Array.from(new Set(records.map((d) => d.play_guide)));
      return {
        campaign_name: campaign.campaign_name,
        aggregated_at: data.length > 0 ? data[0].aggregated_at : null,
        play_guides: playGuides.map((pg) => {
          const tickets = records
            .filter((d) => d.play_guide === pg)
            .map((d) => ({
              ticket: d.ticket,
              applied_number: d.applied_number,
              reserved_number: d.reserved_number,
              confirmed_number: d.confirmed_number,
            }));
          return {
            play_guide: pg,
            tickets,
          };
        }),
      };
    }
  });
};
