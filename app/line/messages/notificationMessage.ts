import { messagingApi } from '@line/bot-sdk';
import { type Tour, type TicketSales } from '@/app/types';
import TOURS from '@/app/definitions/definitions';
import { getTicketSales } from '@/app/utility/loadSales';

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const getReservationAndSales = async (
  data: TicketSales[]
): Promise<{ reserved: Record<string, number>; confirmed: Record<string, number> }> => {
  const reserved: Record<string, number> = {};
  const confirmed: Record<string, number> = {};
  data.forEach((d) => {
    if (d.applied_number && d.applied_number > 0) {
      reserved[d.ticket] = (reserved[d.ticket] || 0) + Number(d.applied_number);
    }
    if (d.unconfirmed_winning_number && d.unconfirmed_winning_number > 0) {
      reserved[d.ticket] = (reserved[d.ticket] || 0) + Number(d.unconfirmed_winning_number);
    }
    if (d.confirmed_winning_number && d.confirmed_winning_number > 0) {
      confirmed[d.ticket] = (confirmed[d.ticket] || 0) + Number(d.confirmed_winning_number);
    }
    if (d.unconfirmed_sales_number && d.unconfirmed_sales_number > 0) {
      reserved[d.ticket] = (reserved[d.ticket] || 0) + Number(d.unconfirmed_sales_number);
    }
    if (d.confirmed_sales_number && d.confirmed_sales_number > 0) {
      confirmed[d.ticket] = (confirmed[d.ticket] || 0) + Number(d.confirmed_sales_number);
    }
  });
  return { reserved, confirmed };
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
      const { reserved, confirmed } = await getReservationAndSales(salesData);
      lines.push(`${formatDate(salesData[0].aggregated_at)}現在`);
      tour.concerts[0].tickets.forEach((t) => {
        lines.push(
          `  ${t.name}: 予約 ${reserved[t.name] || 0}枚, 確定 ${confirmed[t.name] || 0}枚`
        );
      });
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
        const { reserved, confirmed } = await getReservationAndSales(data);
        c.tickets.forEach((t) => {
          lines.push(
            `  ${t.name}: 予約 ${reserved[t.name] || 0}枚, 確定 ${confirmed[t.name] || 0}枚`
          );
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
    const data = await getTicketSales(tour, tour.concerts[0]);
    if (data.length === 0 || data[0].aggregated_at === null) {
      lines.push(`【${tour.name}】`);
      lines.push('  まだ集計されてないぴょ');
    } else {
      lines.push(`【${tour.name}】${formatDate(data[0].aggregated_at)}現在`);
      data.forEach((d: TicketSales) => {
        lines.push(`${d.campaign} (${d.play_guide})`);
        const reserved =
          (d.applied_number ?? 0) +
          (d.unconfirmed_winning_number ?? 0) +
          (d.unconfirmed_sales_number ?? 0);
        const confirmed = (d.confirmed_winning_number ?? 0) + (d.confirmed_sales_number ?? 0);
        lines.push(`  ${d.ticket}: 予約 ${reserved}枚, 確定 ${confirmed}枚`);
      });
    }
  } else {
    // ツアー公演の場合
    lines.push('本日の販売状況を詳しくお知らせするぴょ');
    for (const c of tour.concerts) {
      const data = await getTicketSales(tour, c);
      if (data.length === 0 || data[0].aggregated_at === null) {
        lines.push('');
        lines.push(`【${c.short_name}】`);
        lines.push('  まだ集計されてないぴょ');
      } else {
        lines.push('');
        lines.push(`【${c.short_name}】${formatDate(data[0].aggregated_at || new Date())}現在`);
        data.forEach((d) => {
          lines.push(`${d.campaign} (${d.play_guide})`);
          const reserved =
            (d.applied_number ?? 0) +
            (d.unconfirmed_winning_number ?? 0) +
            (d.unconfirmed_sales_number ?? 0);
          const confirmed = (d.confirmed_winning_number ?? 0) + (d.confirmed_sales_number ?? 0);
          lines.push(`  ${d.ticket}: 予約 ${reserved}枚, 確定 ${confirmed}枚`);
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
