import prisma from '@/lib/prisma';
import { messagingApi } from '@line/bot-sdk';
import { type Tour, type Concert } from '@/app/types';
import DEFINITIONS from '@/app/definitions/definitions';

type SalesData = {
  concert_short_name: string;
  date_at: Date;
  aggregated_at: Date | null;
  tickets: string[];
  reserved: { [key: string]: number };
  sold: { [key: string]: number };
};

const getSalesData = async (tour: Tour, c: Concert): Promise<SalesData> => {
  const datails = await prisma.daily_sales_details.findMany({
    where: {
      event_code: tour.event_code,
      concert_short_name: c.short_name,
      aggregated_at: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    },
    orderBy: { aggregated_at: 'desc' },
  });

  // キャンペーン名とプレイガイドの組が一致するレコードは最新を残して削除する
  const latestDetailsMap = new Map<string, (typeof datails)[number]>();
  datails.forEach((detail) => {
    const key = `${detail.campaign_name}::${detail.play_guide}`;
    if (!latestDetailsMap.has(key)) {
      latestDetailsMap.set(key, detail);
    }
  });
  const latestDetails = [...latestDetailsMap.values()];

  if (latestDetails.length === 0) {
    return {
      concert_short_name: c.short_name,
      date_at: c.date_at,
      aggregated_at: null,
      tickets: c.tickets.map((t) => t.name),
      reserved: {} as { [key: string]: number },
      sold: {} as { [key: string]: number },
    };
  }

  const reserved: { [key: string]: number } = {};
  const sold: { [key: string]: number } = {};

  // プレイガイドごとのエイリアスを正規のチケット名に変換する
  const getTicketName = (
    concert_short_name: string,
    campaign: string,
    playGuide: string,
    ticket: string
  ): string => {
    const concert = tour.concerts.find((c) => c.short_name === concert_short_name);
    if (!concert) return ticket;
    const dist = concert.distribution.find(
      (d) =>
        d.play_guide === playGuide && d.campaign_alias === campaign && d.ticket_alias === ticket
    );
    return dist ? dist.ticket : ticket;
  };

  const countUpSales = (
    concert_short_name: string,
    campaign: string,
    playGuide: string,
    ticket: string | null,
    reservation: number | null,
    sales: number | null
  ) => {
    if (ticket === null) return;
    const ticketName = getTicketName(concert_short_name, campaign, playGuide, ticket);
    if (reservation !== null) {
      reserved[ticketName] = (reserved[ticketName] || 0) + Number(reservation);
    }
    if (sales !== null) {
      sold[ticketName] = (sold[ticketName] || 0) + Number(sales);
    }
  };

  latestDetails.forEach((d) => {
    countUpSales(
      d.concert_short_name,
      d.campaign_name,
      d.play_guide,
      d.ticket_1,
      d.reservation_1 !== null ? Number(d.reservation_1) : null,
      d.sales_1 !== null ? Number(d.sales_1) : null
    );
    countUpSales(
      d.concert_short_name,
      d.campaign_name,
      d.play_guide,
      d.ticket_2,
      d.reservation_2 !== null ? Number(d.reservation_2) : null,
      d.sales_2 !== null ? Number(d.sales_2) : null
    );
    countUpSales(
      d.concert_short_name,
      d.campaign_name,
      d.play_guide,
      d.ticket_3,
      d.reservation_3 !== null ? Number(d.reservation_3) : null,
      d.sales_3 !== null ? Number(d.sales_3) : null
    );
    countUpSales(
      d.concert_short_name,
      d.campaign_name,
      d.play_guide,
      d.ticket_4,
      d.reservation_4 !== null ? Number(d.reservation_4) : null,
      d.sales_4 !== null ? Number(d.sales_4) : null
    );
    countUpSales(
      d.concert_short_name,
      d.campaign_name,
      d.play_guide,
      d.ticket_5,
      d.reservation_5 !== null ? Number(d.reservation_5) : null,
      d.sales_5 !== null ? Number(d.sales_5) : null
    );
  });

  const tickets = new Set<string>();
  c.tickets.forEach((t) => tickets.add(t.name));
  Object.keys(reserved).forEach((t) => {
    tickets.add(t);
  });
  Object.keys(sold).forEach((t) => {
    tickets.add(t);
  });

  return {
    concert_short_name: c.short_name,
    date_at: c.date_at,
    aggregated_at: latestDetails[0].aggregated_at,
    tickets: tickets.size > 0 ? Array.from(tickets) : [],
    reserved,
    sold,
  };
};

export const notificationMessage = async (eventCode: string): Promise<messagingApi.Message> => {
  const tour = DEFINITIONS.find((t) => t.event_code === eventCode);
  if (!tour) return { type: 'text', text: 'イベントが見つからないぴょ' };
  const data: SalesData[] = await Promise.all(tour.concerts.map((c) => getSalesData(tour, c)));

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const lines = [];
  if (tour.concerts.length === 1) {
    // 単発公演の場合
    lines.push('本日の販売状況をお知らせするぴょ');
    lines.push('');
    if (data[0].aggregated_at === null) {
      lines.push(`【${tour.name}】`);
      lines.push('  まだ集計されてないぴょ');
    } else {
      lines.push(`【${tour.name}】${formatDate(data[0].aggregated_at)}現在`);
      data[0].tickets.forEach((t) => {
        lines.push(`  ${t}: 予約 ${data[0].reserved[t]}枚, 販売 ${data[0].sold[t]}枚`);
      });
    }
  } else {
    // ツアー公演の場合
    lines.push('本日の販売状況をお知らせするぴょ');
    data.forEach((d) => {
      lines.push('');
      if (d.aggregated_at === null) {
        lines.push(`【${d.concert_short_name}】`);
        lines.push('  まだ集計されてないぴょ');
      } else {
        lines.push(`【${d.concert_short_name}】${formatDate(d.aggregated_at)}現在`);
        d.tickets.forEach((t) => {
          lines.push(`  ${t}: 予約 ${d.reserved[t]}枚, 販売 ${d.sold[t]}枚`);
        });
      }
    });
  }
  return { type: 'text', text: lines.join('\n') };
};
