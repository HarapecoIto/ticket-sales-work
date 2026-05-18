import prisma from '../../lib/prisma';
import { messagingApi } from '@line/bot-sdk';
import { Concert } from '@/app/types';
import DEFINITIONS from '../definitions/definitions';

type SalesData = {
  concert_short_name: string;
  date_at: Date;
  aggregated_at: Date | null;
  tickets: string[];
  reserved: { [key: string]: number };
  sold: { [key: string]: number };
};

const getSalesData = async (event_code: string, c: Concert): Promise<SalesData> => {
  const data = await prisma.daily_sales.findFirst({
    where: {
      event_code: event_code,
      concert_short_name: c.short_name,
      aggregated_at: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    },
    orderBy: { aggregated_at: 'desc' },
  });
  if (!data) {
    return {
      concert_short_name: c.short_name,
      date_at: c.date_at,
      aggregated_at: null,
      tickets: c.tickets.map((t) => t.name),
      reserved: {} as { [key: string]: number },
      sold: {} as { [key: string]: number },
    };
  }
  const details = await prisma.daily_sales_details.findMany({
    where: {
      event_code: event_code,
      concert_short_name: c.short_name,
      aggregated_at: data?.aggregated_at,
    },
  });
  const reserved: { [key: string]: number } = {};
  const sold: { [key: string]: number } = {};
  for (const ticket of c.tickets) {
    reserved[ticket.name] = 0;
    sold[ticket.name] = 0;
  }
  details.forEach((d) => {
    if (d.reservation_1 && d.reservation_1 > 0) {
      reserved[d.ticket_1 + ''] += Number(d.reservation_1);
    }
    if (d.reservation_2 && d.reservation_2 > 0) {
      reserved[d.ticket_2 + ''] += Number(d.reservation_2);
    }
    if (d.reservation_3 && d.reservation_3 > 0) {
      reserved[d.ticket_3 + ''] += Number(d.reservation_3);
    }
    if (d.reservation_4 && d.reservation_4 > 0) {
      reserved[d.ticket_4 + ''] += Number(d.reservation_4);
    }
    if (d.reservation_5 && d.reservation_5 > 0) {
      reserved[d.ticket_5 + ''] += Number(d.reservation_5);
    }
    if (d.sales_1 && d.sales_1 > 0) {
      sold[d.ticket_1 + ''] += Number(d.sales_1);
    }
    if (d.sales_2 && d.sales_2 > 0) {
      sold[d.ticket_2 + ''] += Number(d.sales_2);
    }
    if (d.sales_3 && d.sales_3 > 0) {
      sold[d.ticket_3 + ''] += Number(d.sales_3);
    }
    if (d.sales_4 && d.sales_4 > 0) {
      sold[d.ticket_4 + ''] += Number(d.sales_4);
    }
    if (d.sales_5 && d.sales_5 > 0) {
      sold[d.ticket_5 + ''] += Number(d.sales_5);
    }
  });
  return {
    concert_short_name: c.short_name,
    date_at: c.date_at,
    aggregated_at: data?.aggregated_at,
    tickets: c.tickets.map((t) => t.name),
    reserved,
    sold,
  };
};

export const notificationMessage = async (eventCode: string): Promise<messagingApi.Message> => {
  const tour = DEFINITIONS.find((t) => t.event_code === eventCode);
  if (!tour) return { type: 'text', text: 'イベントが見つからないぴょ' };
  const data: SalesData[] = await Promise.all(
    tour.concerts.map((c) => getSalesData(tour.event_code, c))
  );
  const informDate = (): string | null => {
    const aggregatedDate: Date[] = data
      .map((d) => d.aggregated_at)
      .filter((d): d is Date => d !== null);
    if (aggregatedDate.length === 0) return null;
    const date = aggregatedDate[0];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };
  const information = (d: SalesData): string[] => {
    const info: string[] = [];
    if (tour.concerts.length > 1) {
      info.push(`${d.concert_short_name}`);
    }
    if (d.aggregated_at === null) {
      info.push(`販売状況はまだ集計されていないぴょ`);
      return info;
    } else {
      d.tickets.forEach((t) => {
        info.push(`  ${t}: 予約 ${d.reserved[t]}枚, 販売 ${d.sold[t]}枚`);
      });
    }
    return info;
  };
  const lines = [];
  lines.push('本日の販売状況をお知らせするぴょ');
  lines.push(`【${tour.short_name}】(${informDate()} 現在)`);
  data.forEach((d) => {
    lines.push('');
    lines.push(...information(d));
  });
  return { type: 'text', text: lines.join('\n') };
};
