import { type Tour, type TicketSales, Concert } from '@/app/types';
import TOURS from '@/app/definitions/definitions';
import { getTicketSales } from '@/app/utility/loadSales';

type StructuredSalesData = {
  campaign_name: string;
  play_guides: {
    play_guide: string;
    tickets: {
      ticket: string;
      applied_number: number | null;
      reserved_number: number | null;
      confirmed_number: number | null;
    }[];
  }[];
}[];

const format = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: false,
});

const buildStructuredSales = async (
  concert: Concert,
  data: TicketSales[]
): Promise<StructuredSalesData> => {
  const campaigns: StructuredSalesData = [];
  concert.distribution.forEach((d) => {
    if (!campaigns.find((c) => c.campaign_name === d.campaign)) {
      campaigns.push({ campaign_name: d.campaign, play_guides: [] });
    }
    if (
      !campaigns
        .find((c) => c.campaign_name === d.campaign)
        ?.play_guides.find((p) => p.play_guide === d.play_guide)
    ) {
      campaigns
        .find((c) => c.campaign_name === d.campaign)
        ?.play_guides.push({
          play_guide: d.play_guide,
          tickets: [],
        });
    }
    const ticketSales = data.find(
      (ds) => ds.campaign === d.campaign && ds.play_guide === d.play_guide && ds.ticket === d.ticket
    );
    if (ticketSales) {
      campaigns
        .find((c) => c.campaign_name === d.campaign)
        ?.play_guides.find((p) => p.play_guide === d.play_guide)
        ?.tickets.push({
          ticket: d.ticket,
          applied_number: ticketSales.applied_number,
          reserved_number: ticketSales.reserved_number,
          confirmed_number: ticketSales.confirmed_number,
        });
    }
  });
  return campaigns;
};

const buildMarkdown = async (campaigns: StructuredSalesData): Promise<string[]> => {
  const lines: string[] = [];
  campaigns.forEach((campaign) => {
    lines.push(`\u{1F4E3} ${campaign.campaign_name}`);
    campaign.play_guides.forEach((pg) => {
      const names = {
        eplus: 'イープラス',
        pia: 'チケットぴあ',
        lawson: 'ローソンチケット',
        teket: 'teket',
      };
      const playGuide = names.hasOwnProperty(pg.play_guide)
        ? names[pg.play_guide as keyof typeof names]
        : pg.play_guide;
      lines.push('　\u{1F6CD} ' + playGuide);
      pg.tickets.forEach((t) => {
        const disp: string[] = [];
        if (t.applied_number !== null) {
          disp.push(`申込 ${t.applied_number}枚`);
        }
        if (t.reserved_number !== null) {
          disp.push(`予約 ${t.reserved_number}枚`);
        }
        if (t.confirmed_number !== null) {
          disp.push(`確定 ${t.confirmed_number}枚`);
        }
        if (disp.length > 0) {
          lines.push(`　　\u{1F3AB} ${t.ticket}: ${disp.join(', ')}`);
        }
      });
    });
  });
  const appliedTotal = campaigns
    .flatMap((c) => c.play_guides)
    .flatMap((pg) => pg.tickets)
    .reduce((sum, t) => sum + (t.applied_number ?? 0), 0);
  const reservedTotal = campaigns
    .flatMap((c) => c.play_guides)
    .flatMap((pg) => pg.tickets)
    .reduce((sum, t) => sum + (t.reserved_number ?? 0), 0);
  const confirmedTotal = campaigns
    .flatMap((c) => c.play_guides)
    .flatMap((pg) => pg.tickets)
    .reduce((sum, t) => sum + (t.confirmed_number ?? 0), 0);
  if (appliedTotal > 0 || reservedTotal > 0 || confirmedTotal > 0) {
    const totalDisp: string[] = [];
    if (appliedTotal > 0) {
      totalDisp.push(`申込 ${appliedTotal}枚`);
    }
    if (reservedTotal > 0) {
      totalDisp.push(`予約 ${reservedTotal}枚`);
    }
    if (confirmedTotal > 0) {
      totalDisp.push(`確定 ${confirmedTotal}枚`);
    }
    lines.push(`\u{1F4B5} 合計: ${totalDisp.join(', ')}`);
  }
  return lines;
};

const buildMessage = async (tour: Tour): Promise<string[]> => {
  const lines: string[] = [];
  if (tour.concerts.length === 1) {
    // 単発公演の場合
    lines.push('本日の販売状況をお知らせするぴょ');
    lines.push(tour.name);
    const data: TicketSales[] = await getTicketSales(tour, tour.concerts[0]);
    if (data.length === 0 || data[0].aggregated_at === null) {
      lines.push('  まだ集計されてないぴょ');
    } else {
      lines.push(format.format(data[0].aggregated_at));
      const structuredData = await buildStructuredSales(tour.concerts[0], data);
      const markdownLines = await buildMarkdown(structuredData);
      lines.push(...markdownLines);
    }
  } else {
    // ツアー公演の場合
    lines.push('本日の販売状況をお知らせするぴょ');
    lines.push(tour.name);
    for (const c of tour.concerts) {
      const data: TicketSales[] = await getTicketSales(tour, c);
      if (data.length === 0 || data[0].aggregated_at === null) {
        lines.push('');
        lines.push(`【${c.short_name}】`);
        lines.push('  まだ集計されてないぴょ');
      } else {
        lines.push('');
        lines.push(`【${c.short_name}】${format.format(data[0].aggregated_at || new Date())}`);
        const structuredData = await buildStructuredSales(c, data);
        const markdownLines = await buildMarkdown(structuredData);
        lines.push(...markdownLines);
      }
    }
  }
  return lines;
};

export const createReport = async (eventCode: string): Promise<string> => {
  const tour = TOURS.find((t) => t.event_code === eventCode);
  if (!tour) return 'イベントが見つからないぴょ';
  const lines = await buildMessage(tour);
  return lines.join('\n');
};
