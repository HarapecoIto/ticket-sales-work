import prisma from '@/lib/prisma';
import { messagingApi } from '@line/bot-sdk';
import { type Tour, type Concert } from '@/app/types';
import TOURS from '@/app/definitions/definitions';

type SalesData = {
  concert_short_name: string;
  aggregated_at: Date;
  campaign: string;
  play_guide: string;
  ticket: string;
  reserved: number | null;
  sold: number | null;
};

const getDetails = async (tour: Tour, c: Concert): Promise<SalesData[]> => {
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
    .map((r): SalesData[] => {
      return c.distribution
        .filter((d) => d.campaign_alias === r.campaign_name && d.play_guide === r.play_guide)
        .map((d): SalesData | null => {
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
            concert_short_name: c.short_name,
            aggregated_at: r.aggregated_at,
            campaign: d.campaign,
            play_guide: d.play_guide,
            ticket: d.ticket,
            reserved: reserved !== null ? Number(reserved) : null,
            sold: sold !== null ? Number(sold) : null,
          } as SalesData;
        })
        .filter((s): s is SalesData => s !== null);
    })
    .flat();
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const buildSummaryMessage = async (tour: Tour): Promise<string[]> => {
  const lines: string[] = [];
  lines.push('本日の販売状況をお知らせするぴょ');
  if (tour.concerts.length === 1) {
    // 単発公演の場合
    lines.push('');
    lines.push(`【${tour.name}】`);
    const data = await getDetails(tour, tour.concerts[0]);
    if (data.length === 0 || data[0].aggregated_at === null) {
      lines.push('  まだ集計されてないぴょ');
    } else {
      const reserved: Record<string, number> = {};
      const sold: Record<string, number> = {};
      data.forEach((d) => {
        if (d.reserved && d.reserved > 0) {
          reserved[d.ticket] = (reserved[d.ticket] || 0) + Number(d.reserved);
        }
        if (d.sold && d.sold > 0) {
          sold[d.ticket] = (sold[d.ticket] || 0) + Number(d.sold);
        }
      });
      lines.push(`${formatDate(data[0].aggregated_at)}現在`);
      tour.concerts[0].tickets.forEach((t) => {
        lines.push(`  ${t.name}: 予約 ${reserved[t.name] || 0}枚, 販売 ${sold[t.name] || 0}枚`);
      });
    }
  } else {
    for (const c of tour.concerts) {
      const data = await getDetails(tour, c);
      if (data.length === 0 || data[0].aggregated_at === null) {
        lines.push('');
        lines.push(`【${c.short_name}】`);
        lines.push('  まだ集計されてないぴょ');
      } else {
        lines.push('');
        lines.push(`【${c.short_name}】${formatDate(data[0].aggregated_at)}現在`);
        const reserved: Record<string, number> = {};
        const sold: Record<string, number> = {};
        data.forEach((d) => {
          if (d.reserved && d.reserved > 0) {
            reserved[d.ticket] = (reserved[d.ticket] || 0) + Number(d.reserved);
          }
          if (d.sold && d.sold > 0) {
            sold[d.ticket] = (sold[d.ticket] || 0) + Number(d.sold);
          }
        });
        c.tickets.forEach((t) => {
          lines.push(`  ${t.name}: 予約 ${reserved[t.name] || 0}枚, 販売 ${sold[t.name] || 0}枚`);
        });
      }
    }
  }
  return lines;
};

const buildDetailMessage = async (tour: Tour): Promise<string[]> => {
  const lines = [];
  if (tour.concerts.length === 1) {
    // 単発公演の場合
    lines.push('本日の販売状況を詳しくお知らせするぴょ');
    lines.push('');
    const data = await getDetails(tour, tour.concerts[0]);
    if (data.length === 0 || data[0].aggregated_at === null) {
      lines.push(`【${tour.name}】`);
      lines.push('  まだ集計されてないぴょ');
    } else {
      lines.push(`【${tour.name}】${formatDate(data[0].aggregated_at)}現在`);
      data.forEach((d) => {
        lines.push(`${d.campaign} (${d.play_guide})`);
        lines.push(`  ${d.ticket}: 予約 ${d.reserved || 0}枚, 販売 ${d.sold || 0}枚`);
      });
    }
  } else {
    // ツアー公演の場合
    lines.push('本日の販売状況を詳しくお知らせするぴょ');
    for (const c of tour.concerts) {
      const data = await getDetails(tour, c);
      if (data.length === 0 || data[0].aggregated_at === null) {
        lines.push('');
        lines.push(`【${c.short_name}】`);
        lines.push('  まだ集計されてないぴょ');
      } else {
        lines.push('');
        lines.push(`【${c.short_name}】${formatDate(data[0].aggregated_at || new Date())}現在`);
        data.forEach((d) => {
          lines.push(`${d.campaign} (${d.play_guide})`);
          lines.push(`  ${d.ticket}: 予約 ${d.reserved || 0}枚, 販売 ${d.sold || 0}枚`);
        });
      }
    }
  }
  return lines;
};

export const summaryMessage = async (eventCode: string): Promise<messagingApi.Message> => {
  const tour = TOURS.find((t) => t.event_code === eventCode);
  if (!tour) return { type: 'text', text: 'イベントが見つからないぴょ' };
  const lines = await buildSummaryMessage(tour);
  return { type: 'text', text: lines.join('\n') };
};

export const detailMessage = async (eventCode: string): Promise<messagingApi.Message> => {
  const tour = TOURS.find((t) => t.event_code === eventCode);
  if (!tour) return { type: 'text', text: 'イベントが見つからないぴょ' };
  const lines = await buildDetailMessage(tour);
  return { type: 'text', text: lines.join('\n') };
};
