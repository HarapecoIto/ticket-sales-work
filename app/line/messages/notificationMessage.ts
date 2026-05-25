import { messagingApi } from '@line/bot-sdk';
import { type Tour, type TicketSales, Ticket, Concert } from '@/app/types';
import TOURS from '@/app/definitions/definitions';
import { getTicketSales } from '@/app/utility/loadSales';

const formatDate = (date: Date): string => {
  const parts = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value ?? '0000';
  const month = parts.find((part) => part.type === 'month')?.value ?? '00';
  const day = parts.find((part) => part.type === 'day')?.value ?? '00';
  const hours = parts.find((part) => part.type === 'hour')?.value ?? '00';
  const minutes = parts.find((part) => part.type === 'minute')?.value ?? '00';
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const summarize = (data: TicketSales[]) => {
  const applied: Record<string, number> = {};
  const reserved: Record<string, number> = {};
  const confirmed: Record<string, number> = {};
  data.forEach((d) => {
    if (d.applied_number && d.applied_number > 0) {
      applied[d.ticket] = (applied[d.ticket] || 0) + Number(d.applied_number);
    }
    if (d.reserved_number && d.reserved_number > 0) {
      reserved[d.ticket] = (reserved[d.ticket] || 0) + Number(d.reserved_number);
    }
    if (d.confirmed_number && d.confirmed_number > 0) {
      confirmed[d.ticket] = (confirmed[d.ticket] || 0) + Number(d.confirmed_number);
    }
  });
  return { applied, reserved, confirmed };
};

const expressSummary = (concert: Concert, data: TicketSales[]): string[] => {
  const lines: string[] = [];
  const { applied, reserved, confirmed } = summarize(data);
  concert.tickets.forEach((t: Ticket) => {
    const dsip = [];
    if (Object.keys(applied).includes(t.name)) {
      dsip.push(`申込 ${applied[t.name] || 0}枚`);
    }
    if (Object.keys(reserved).includes(t.name)) {
      dsip.push(`予約 ${reserved[t.name] || 0}枚`);
    }
    if (Object.keys(confirmed).includes(t.name)) {
      dsip.push(`確定 ${confirmed[t.name] || 0}枚`);
    }
    if (dsip.length > 0) {
      lines.push(`  ${t.name}: ${dsip.join(', ')}`);
    }
  });
  return lines;
};

const buildSummaryMessage = async (tour: Tour): Promise<string[]> => {
  const lines: string[] = [];
  lines.push('本日の販売状況をお知らせするぴょ');
  if (tour.concerts.length === 1) {
    // 単発公演の場合
    lines.push('');
    lines.push(`【${tour.name}】`);
    const salesData: TicketSales[] = await getTicketSales(tour, tour.concerts[0]);
    if (salesData.length === 0 || salesData[0].aggregated_at === null) {
      lines.push('  まだ集計されてないぴょ');
    } else {
      lines.push(`${formatDate(salesData[0].aggregated_at)}現在`);
      lines.push(...expressSummary(tour.concerts[0], salesData));
    }
  } else {
    for (const c of tour.concerts) {
      const data = await getTicketSales(tour, c);
      if (data.length === 0 || data[0].aggregated_at === null) {
        lines.push('');
        lines.push(`【${c.short_name}】`);
        lines.push('  まだ集計されてないぴょ');
      } else {
        lines.push('');
        lines.push(`【${c.short_name}】${formatDate(data[0].aggregated_at)}現在`);
        lines.push(...expressSummary(c, data));
      }
    }
  }
  return lines;
};

const buildDetailMessage = async (tour: Tour): Promise<string[]> => {
  const lines: string[] = [];
  if (tour.concerts.length === 1) {
    // 単発公演の場合
    lines.push('本日の販売状況を詳しくお知らせするぴょ');
    lines.push('');
    const data: TicketSales[] = await getTicketSales(tour, tour.concerts[0]);
    if (data.length === 0 || data[0].aggregated_at === null) {
      lines.push(`【${tour.name}】`);
      lines.push('  まだ集計されてないぴょ');
    } else {
      lines.push(`【${tour.name}】${formatDate(data[0].aggregated_at)}現在`);
      data.forEach((d: TicketSales) => {
        lines.push(`${d.campaign} (${d.play_guide})`);
        const disp: string[] = [];
        if (d.applied_number !== null) {
          disp.push(`申込 ${d.applied_number}枚`);
        }
        if (d.reserved_number !== null) {
          disp.push(`予約 ${d.reserved_number}枚`);
        }
        if (d.confirmed_number !== null) {
          disp.push(`確定 ${d.confirmed_number}枚`);
        }
        if (disp.length > 0) {
          lines.push(`  ${d.ticket}: ${disp.join(', ')}`);
        }
      });
    }
  } else {
    // ツアー公演の場合
    lines.push('本日の販売状況を詳しくお知らせするぴょ');
    for (const c of tour.concerts) {
      const data: TicketSales[] = await getTicketSales(tour, c);
      if (data.length === 0 || data[0].aggregated_at === null) {
        lines.push('');
        lines.push(`【${c.short_name}】`);
        lines.push('  まだ集計されてないぴょ');
      } else {
        lines.push('');
        lines.push(`【${c.short_name}】${formatDate(data[0].aggregated_at || new Date())}現在`);
        data.forEach((d: TicketSales) => {
          lines.push(`${d.campaign} (${d.play_guide})`);
          const disp: string[] = [];
          if (d.applied_number !== null) {
            disp.push(`申込 ${d.applied_number}枚`);
          }
          if (d.reserved_number !== null) {
            disp.push(`予約 ${d.reserved_number}枚`);
          }
          if (d.confirmed_number !== null) {
            disp.push(`確定 ${d.confirmed_number}枚`);
          }
          if (disp.length > 0) {
            lines.push(`  ${d.ticket}: ${disp.join(', ')}`);
          }
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
