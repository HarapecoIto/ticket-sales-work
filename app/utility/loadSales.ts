import prisma from '@/lib/prisma';
import {
  type Tour,
  type Concert,
  type Campaign,
  type Distribution,
  type TicketSales,
} from '@/app/types';
import TOURS from '@/app/definitions/definitions';

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
  const latest = Array.from(temp.values()); // プレイガイドごとキャンペーンの売上データ

  return latest
    .map((r): TicketSales[] => {
      return c.distribution
        .filter((d) => d.campaign_alias === r.campaign_name && d.play_guide === r.play_guide)
        .map((d): TicketSales | null => {
          const campaign = tour.campaigns.find((ca: Campaign) => ca.campaign_name === d.campaign);
          if (!campaign) {
            return null;
          }
          const exists: boolean =
            d.ticket_alias === r.ticket_1 ||
            d.ticket_alias === r.ticket_2 ||
            d.ticket_alias === r.ticket_3 ||
            d.ticket_alias === r.ticket_4 ||
            d.ticket_alias === r.ticket_5;
          if (!exists) {
            return null;
          }
          const reserved =
            d.ticket_alias === r.ticket_1
              ? r.reservation_1
              : d.ticket_alias === r.ticket_2
                ? r.reservation_2
                : d.ticket_alias === r.ticket_3
                  ? r.reservation_3
                  : d.ticket_alias === r.ticket_4
                    ? r.reservation_4
                    : d.ticket_alias === r.ticket_5
                      ? r.reservation_5
                      : null;
          const sold =
            d.ticket_alias === r.ticket_1
              ? r.sales_1
              : d.ticket_alias === r.ticket_2
                ? r.sales_2
                : d.ticket_alias === r.ticket_3
                  ? r.sales_3
                  : d.ticket_alias === r.ticket_4
                    ? r.sales_4
                    : d.ticket_alias === r.ticket_5
                      ? r.sales_5
                      : null;
          return {
            event_code: tour.event_code,
            concert_short_name: c.short_name,
            aggregated_at: r.aggregated_at,
            campaign: campaign.campaign_name,
            play_guide: d.play_guide,
            ticket: d.ticket,
            applied_number: campaign.campaign_type === 'ByLottery' ? Number(reserved) : null,
            unconfirmed_winning_number: campaign.campaign_type === 'ByLottery' ? 0 : null, // TODO: 抽選の当落がわかるようになったら修正する
            confirmed_winning_number: campaign.campaign_type === 'ByLottery' ? Number(sold) : null,
            unconfirmed_sales_number:
              campaign.campaign_type === 'FirstCome' ? Number(reserved) : null,
            confirmed_sales_number: campaign.campaign_type === 'FirstCome' ? Number(sold) : null,
          } as TicketSales;
        })
        .filter((s): s is TicketSales => s !== null);
    })
    .flat();
};

const normalize = (record: TicketSales): TicketSales | null => {
  const tour = TOURS.find((t: Tour) => t.event_code === record.event_code);
  if (!tour) {
    return null;
  }
  const concert = tour.concerts.find((c: Concert) => c.short_name === record.concert_short_name);
  if (!concert) {
    return null;
  }
  const distribution = concert.distribution.find(
    (d: Distribution) =>
      d.campaign_alias === record.campaign &&
      d.play_guide === record.play_guide &&
      d.ticket_alias === record.ticket
  );
  if (!distribution) {
    return null;
  }
  return {
    event_code: record.event_code,
    concert_short_name: record.concert_short_name,
    campaign: distribution.campaign,
    play_guide: record.play_guide,
    aggregated_at: record.aggregated_at,
    ticket: distribution.ticket,
    applied_number: record.applied_number,
    unconfirmed_winning_number: record.unconfirmed_winning_number,
    confirmed_winning_number: record.confirmed_winning_number,
    unconfirmed_sales_number: record.unconfirmed_sales_number,
    confirmed_sales_number: record.confirmed_sales_number,
  };
};
