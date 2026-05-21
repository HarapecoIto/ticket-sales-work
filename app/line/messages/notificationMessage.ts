import prisma from '@/lib/prisma';
import { messagingApi } from '@line/bot-sdk';
import { type Tour, type Concert, Distribution } from '@/app/types';
import DEFINITIONS from '@/app/definitions/definitions';
import { get } from 'http';

type SalesData = {
  concert_short_name: string;
  aggregated_at: Date;
  campaign_name: string;
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
  const latestRecords = Array.from(temp.values());

  const getSales = (distribution: Distribution): SalesData | null => {
    const record = latestRecords.find(
      (r) =>
        r.concert_short_name === c.short_name &&
        r.campaign_name === distribution.campaign_alias &&
        r.play_guide === distribution.play_guide
    );
    if (!record) {
      return null;
    }
    if (record.ticket_1 === distribution.ticket_alias) {
      return {
        concert_short_name: c.short_name,
        aggregated_at: record.aggregated_at,
        campaign_name: distribution.campaign,
        play_guide: distribution.play_guide,
        ticket: distribution.ticket,
        reserved: Number(record.reservation_1 || 0),
        sold: Number(record.sales_1 || 0),
      };
    }
    if (record.ticket_2 === distribution.ticket_alias) {
      return {
        concert_short_name: c.short_name,
        aggregated_at: record.aggregated_at,
        campaign_name: distribution.campaign,
        play_guide: distribution.play_guide,
        ticket: distribution.ticket,
        reserved: Number(record.reservation_2 || 0),
        sold: Number(record.sales_2 || 0),
      };
    }
    if (record.ticket_3 === distribution.ticket_alias) {
      return {
        concert_short_name: c.short_name,
        aggregated_at: record.aggregated_at,
        campaign_name: distribution.campaign,
        play_guide: distribution.play_guide,
        ticket: distribution.ticket,
        reserved: Number(record.reservation_3 || 0),
        sold: Number(record.sales_3 || 0),
      };
    }
    if (record.ticket_4 === distribution.ticket_alias) {
      return {
        concert_short_name: c.short_name,
        aggregated_at: record.aggregated_at,
        campaign_name: distribution.campaign,
        play_guide: distribution.play_guide,
        ticket: distribution.ticket,
        reserved: Number(record.reservation_4 || 0),
        sold: Number(record.sales_4 || 0),
      };
    }
    if (record.ticket_5 === distribution.ticket_alias) {
      return {
        concert_short_name: c.short_name,
        aggregated_at: record.aggregated_at,
        campaign_name: distribution.campaign,
        play_guide: distribution.play_guide,
        ticket: distribution.ticket,
        reserved: Number(record.reservation_5 || 0),
        sold: Number(record.sales_5 || 0),
      };
    }
    return null;
  };

  return c.distribution.map((d) => getSales(d)).filter((s): s is SalesData => s !== null);
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
  if (tour.concerts.length === 1) {
    // 単発公演の場合
    lines.push('本日の販売状況をお知らせするぴょ');
    lines.push('');
    lines.push(`【${tour.name}】`);
    const data = await getDetails(tour, tour.concerts[0]);
    if (data.length === 0 || data[0].aggregated_at === null) {
      lines.push('  まだ集計されてないぴょ');
    } else {
      const reserved: Record<string, number> = {};
      const soled: Record<string, number> = {};
      data.forEach((d) => {
        if (d.reserved && d.reserved > 0) {
          reserved[d.ticket] = (reserved[d.ticket] || 0) + Number(d.reserved);
        }
        if (d.sold && d.sold > 0) {
          soled[d.ticket] = (soled[d.ticket] || 0) + Number(d.sold);
        }
      });
      lines.push(`【${tour.name}】${formatDate(data[0].aggregated_at)}現在`);
      tour.concerts[0].tickets.forEach((t) => {
        lines.push(`  ${t.name}: 予約 ${reserved[t.name] || 0}枚, 販売 ${soled[t.name] || 0}枚`);
      });
    }
  } else {
    tour.concerts.forEach(async (c) => {
      const data = await getDetails(tour, c);
      lines.push(`【${c.short_name}】${formatDate(data[0].aggregated_at)}現在`);
      const reserved: Record<string, number> = {};
      const soled: Record<string, number> = {};
      data.forEach((d) => {
        if (d.reserved && d.reserved > 0) {
          reserved[d.ticket] = (reserved[d.ticket] || 0) + Number(d.reserved);
        }
        if (d.sold && d.sold > 0) {
          soled[d.ticket] = (soled[d.ticket] || 0) + Number(d.sold);
        }
      });
      c.tickets.forEach((t) => {
        lines.push(`  ${t.name}: 予約 ${reserved[t.name] || 0}枚, 販売 ${soled[t.name] || 0}枚`);
      });
    });
  }
  return lines;
};

const buildDetailMessage = async (tour: Tour): Promise<string[]> => {
  const lines = [];
  if (tour.concerts.length === 1) {
    // 単発公演の場合
    lines.push('本日の販売状況をお知らせするぴょ');
    lines.push('');
    const data = await getDetails(tour, tour.concerts[0]);
    if (data.length === 0 || data[0].aggregated_at === null) {
      lines.push(`【${tour.name}】`);
      lines.push('  まだ集計されてないぴょ');
    } else {
      lines.push(`【${tour.name}】${formatDate(data[0].aggregated_at)}現在`);
      data.forEach((d) => {
        lines.push(`${d.campaign_name} (${d.play_guide})`);
        lines.push(`  ${d.ticket}: 予約 ${d.reserved || 0}枚, 販売 ${d.sold || 0}枚`);
      });
    }
  } else {
    // ツアー公演の場合
    lines.push('本日の販売状況をお知らせするぴょ');
    lines.push('');
    tour.concerts.forEach(async (c) => {
      const data = await getDetails(tour, c);
      lines.push(`【${c.short_name}】${formatDate(data[0].aggregated_at || new Date())}現在`);
      data.forEach((d) => {
        lines.push(`${d.campaign_name} (${d.play_guide})`);
        lines.push(`  ${d.ticket}: 予約 ${d.reserved || 0}枚, 販売 ${d.sold || 0}枚`);
      });
    });
  }
  return lines;
};

export const summaryMessage = async (eventCode: string): Promise<messagingApi.Message> => {
  const tour = DEFINITIONS.find((t) => t.event_code === eventCode);
  if (!tour) return { type: 'text', text: 'イベントが見つからないぴょ' };
  const lines = await buildSummaryMessage(tour);
  return { type: 'text', text: lines.join('\n') };
};

export const detailMessage = async (eventCode: string): Promise<messagingApi.Message> => {
  const tour = DEFINITIONS.find((t) => t.event_code === eventCode);
  if (!tour) return { type: 'text', text: 'イベントが見つからないぴょ' };
  const lines = await buildDetailMessage(tour);
  return { type: 'text', text: lines.join('\n') };
};
