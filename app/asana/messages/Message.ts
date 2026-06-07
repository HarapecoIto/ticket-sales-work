import { type Tour, type TicketSales, Ticket, Concert } from '@/app/types';
import TOURS from '@/app/definitions/definitions';
import { getTicketSales } from '@/app/utility/loadSales';

const format = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: false,
});

const buildMessage = async (tour: Tour): Promise<string[]> => {
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
      lines.push(`【${tour.name}】${format.format(data[0].aggregated_at)}`);
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
        lines.push(`【${c.short_name}】${format.format(data[0].aggregated_at || new Date())}`);
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

export const createMessage = async (eventCode: string): Promise<string> => {
  const tour = TOURS.find((t) => t.event_code === eventCode);
  if (!tour) return 'イベントが見つからないぴょ';
  const lines = await buildMessage(tour);
  return lines.join('\n');
};
