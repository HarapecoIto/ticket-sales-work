import prisma from '@/lib/prisma';
import { messagingApi } from '@line/bot-sdk';
import { type Tour, type Concert } from '@/app/types';
import DEFINITIONS from '@/app/definitions/definitions';

type SalesDetail = {
  concert_short_name: string;
  campaign_name: string;
  play_guide: string;
  aggregated_at: Date | null;
  ticket_1: string | null;
  reservation_1: number | null;
  sales_1: number | null;
  ticket_2: string | null;
  reservation_2: number | null;
  sales_2: number | null;
  ticket_3: string | null;
  reservation_3: number | null;
  sales_3: number | null;
  ticket_4: string | null;
  reservation_4: number | null;
  sales_4: number | null;
  ticket_5: string | null;
  reservation_5: number | null;
  sales_5: number | null;
};

const getDetails = async (tour: Tour, c: Concert): Promise<SalesDetail[]> => {
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
  const uniqueRecords = new Map<string, (typeof records)[number]>();
  records.forEach((record) => {
    const key = `${record.concert_short_name}::${record.campaign_name}::${record.play_guide}`;
    if (!uniqueRecords.has(key)) {
      uniqueRecords.set(key, record);
    }
  });

  // 定義に存在しているレコードだけを集計する
  // 「合計」のようなレコードは除外する
  const records2 = Array.from(uniqueRecords.values()).filter((d) => {
    return c.distribution.some(
      (dist) =>
        c.short_name === d.concert_short_name &&
        dist.campaign_alias === d.campaign_name &&
        dist.play_guide === d.play_guide
    );
  });

  // プレイガイドごとのエイリアスを正規のチケット名に変換する
  const getTicketName = (
    concert_short_name: string,
    campaign: string,
    playGuide: string,
    ticket: string | null
  ): string | null => {
    if (ticket === null) return null;
    const concert = tour.concerts.find((c) => c.short_name === concert_short_name);
    if (!concert) return null;
    const dist = concert.distribution.find(
      (d) =>
        d.play_guide === playGuide && d.campaign_alias === campaign && d.ticket_alias === ticket
    );
    return dist ? dist.ticket : ticket;
  };

  return records2.map((d) => {
    return {
      concert_short_name: d.concert_short_name,
      campaign_name: d.campaign_name,
      play_guide: d.play_guide,
      aggregated_at: d.aggregated_at,
      ticket_1:
        d.ticket_1 !== null
          ? getTicketName(d.concert_short_name, d.campaign_name, d.play_guide, d.ticket_1)
          : null,
      reservation_1: d.reservation_1 !== null ? Number(d.reservation_1) : null,
      sales_1: d.sales_1 !== null ? Number(d.sales_1) : null,
      ticket_2:
        d.ticket_2 !== null
          ? getTicketName(d.concert_short_name, d.campaign_name, d.play_guide, d.ticket_2)
          : null,
      reservation_2: d.reservation_2 !== null ? Number(d.reservation_2) : null,
      sales_2: d.sales_2 !== null ? Number(d.sales_2) : null,
      ticket_3:
        d.ticket_3 !== null
          ? getTicketName(d.concert_short_name, d.campaign_name, d.play_guide, d.ticket_3)
          : null,
      reservation_3: d.reservation_3 !== null ? Number(d.reservation_3) : null,
      sales_3: d.sales_3 !== null ? Number(d.sales_3) : null,
      ticket_4:
        d.ticket_4 !== null
          ? getTicketName(d.concert_short_name, d.campaign_name, d.play_guide, d.ticket_4)
          : null,
      reservation_4: d.reservation_4 !== null ? Number(d.reservation_4) : null,
      sales_4: d.sales_4 !== null ? Number(d.sales_4) : null,
      ticket_5:
        d.ticket_5 !== null
          ? getTicketName(d.concert_short_name, d.campaign_name, d.play_guide, d.ticket_5)
          : null,
      reservation_5: d.reservation_5 !== null ? Number(d.reservation_5) : null,
      sales_5: d.sales_5 !== null ? Number(d.sales_5) : null,
    };
  });
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const notificationMessage = async (eventCode: string): Promise<messagingApi.Message> => {
  const tour = DEFINITIONS.find((t) => t.event_code === eventCode);
  if (!tour) return { type: 'text', text: 'イベントが見つからないぴょ' };
  const data = await getDetails(tour, tour.concerts[0]);
  if (data.length === 0) {
    return { type: 'text', text: '販売状況のデータが見つからないぴょ' };
  }

  const reserved: { [key: string]: number } = {};
  const soled: { [key: string]: number } = {};
  data.forEach((d) => {
    if (d.reservation_1 && d.reservation_1 > 0) {
      reserved[d.ticket_1 + ''] = (reserved[d.ticket_1 + ''] || 0) + Number(d.reservation_1);
    }
    if (d.sales_1 && d.sales_1 > 0) {
      soled[d.ticket_1 + ''] = (soled[d.ticket_1 + ''] || 0) + Number(d.sales_1);
    }
    if (d.reservation_2 && d.reservation_2 > 0) {
      reserved[d.ticket_2 + ''] = (reserved[d.ticket_2 + ''] || 0) + Number(d.reservation_2);
    }
    if (d.sales_2 && d.sales_2 > 0) {
      soled[d.ticket_2 + ''] = (soled[d.ticket_2 + ''] || 0) + Number(d.sales_2);
    }
    if (d.reservation_3 && d.reservation_3 > 0) {
      reserved[d.ticket_3 + ''] = (reserved[d.ticket_3 + ''] || 0) + Number(d.reservation_3);
    }
    if (d.sales_3 && d.sales_3 > 0) {
      soled[d.ticket_3 + ''] = (soled[d.ticket_3 + ''] || 0) + Number(d.sales_3);
    }
    if (d.reservation_4 && d.reservation_4 > 0) {
      reserved[d.ticket_4 + ''] = (reserved[d.ticket_4 + ''] || 0) + Number(d.reservation_4);
    }
    if (d.sales_4 && d.sales_4 > 0) {
      soled[d.ticket_4 + ''] = (soled[d.ticket_4 + ''] || 0) + Number(d.sales_4);
    }
    if (d.reservation_5 && d.reservation_5 > 0) {
      reserved[d.ticket_5 + ''] = (reserved[d.ticket_5 + ''] || 0) + Number(d.reservation_5);
    }
    if (d.sales_5 && d.sales_5 > 0) {
      soled[d.ticket_5 + ''] = (soled[d.ticket_5 + ''] || 0) + Number(d.sales_5);
    }
  });

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
      tour.concerts[0].tickets.forEach((t) => {
        lines.push(`  ${t.name}: 予約 ${reserved[t.name] || 0}枚, 販売 ${soled[t.name] || 0}枚`);
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
        tour.concerts.forEach((c) => {
          c.tickets.forEach((t) => {
            lines.push(
              `  ${t.name}: 予約 ${reserved[t.name] || 0}枚, 販売 ${soled[t.name] || 0}枚`
            );
          });
        });
      }
    });
  }
  return { type: 'text', text: lines.join('\n') };
};
