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
    const key = `${record.concert_short_name}::${record.campaign_name}::${record.play_guide}`;
    if (!temp.has(key)) {
      temp.set(key, record);
    }
  });
  const latest = Array.from(temp.values());

  return c.distribution
    .map((d) => {
      const record = latest.find(
        (r) => r.campaign_name === d.campaign_alias && r.play_guide === d.play_guide
      );
      if (!record) {
        return null;
      }
      const campaign = tour.campaigns.find((ca: Campaign) => ca.campaign_name === d.campaign);
      if (!campaign) {
        return null;
      }
      const exists: boolean =
        d.ticket_alias === record.ticket_1 ||
        d.ticket_alias === record.ticket_2 ||
        d.ticket_alias === record.ticket_3 ||
        d.ticket_alias === record.ticket_4 ||
        d.ticket_alias === record.ticket_5;
      if (!exists) {
        return null;
      }
      const reserved =
        d.ticket_alias === record.ticket_1
          ? record.reservation_1
          : d.ticket_alias === record.ticket_2
            ? record.reservation_2
            : d.ticket_alias === record.ticket_3
              ? record.reservation_3
              : d.ticket_alias === record.ticket_4
                ? record.reservation_4
                : d.ticket_alias === record.ticket_5
                  ? record.reservation_5
                  : null;
      const sold =
        d.ticket_alias === record.ticket_1
          ? record.sales_1
          : d.ticket_alias === record.ticket_2
            ? record.sales_2
            : d.ticket_alias === record.ticket_3
              ? record.sales_3
              : d.ticket_alias === record.ticket_4
                ? record.sales_4
                : d.ticket_alias === record.ticket_5
                  ? record.sales_5
                  : null;
      return {
        event_code: tour.event_code,
        concert_short_name: c.short_name,
        aggregated_at: record.aggregated_at,
        campaign: campaign.campaign_name,
        play_guide: d.play_guide,
        ticket: d.ticket,
        applied_number:
          campaign.campaign_type === 'ByLottery'
            ? reserved === null && sold === null && Number(reserved)
            : null,
        reserved_number: reserved ? Number(reserved) : null,
        confirmed_number: sold ? Number(sold) : null,
      };
    })
    .filter((s): s is TicketSales => s !== null);
};
