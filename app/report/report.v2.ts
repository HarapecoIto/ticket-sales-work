import prisma from '@/lib/prisma.js';
import {
  Project,
  Concert,
  Ticket,
  EventPage,
  Reception,
  Campaign,
  Assignment,
  DealtTicket,
} from '@/app/types.v2.js';

interface DailyTicketSales {
  project_code: string;
  event_page_code: string;
  reception: string;
  internal_ticket_name: string;
  aggregated_at: Date;
  applied_number: number | null;
  reserved_number: number | null;
  confirmed_number: number | null;
}

interface ExtendedDailyTicketSales extends DailyTicketSales {
  project_name: string;
  concert_code: string;
  campaign_code: string;
  event_page_name: string;
  ticket_code: string;
  ticket_name: string;
  concert_name: string;
  campaign_name: string;
  aggregated_at_jp: string;
}

interface ExtendedDealtTicket {
  concert_code: string | undefined;
  campaign_code: string | undefined;
  event_page_code: string;
  ticket_code: string;
}

const getProjectInformation = async (projectCode: string): Promise<Project | undefined> => {
  const data = await prisma.scraping_triggered.findMany({
    where: {
      project_code: projectCode,
    },
    orderBy: {
      triggered_at: 'desc',
    },
    take: 1,
  });
  try {
    return JSON.parse(data && data.length > 0 ? data[0].meta_info : '{}') as Project;
  } catch (error) {
    console.error('Error parsing meta_info:', error);
    return undefined;
  }
};

const getLatestTriggeredRecord = async (): Promise<Project | undefined> => {
  const data = await prisma.scraping_triggered.findMany({
    orderBy: {
      triggered_at: 'desc',
    },
    take: 1,
  });
  try {
    return JSON.parse(data && data.length > 0 ? data[0].meta_info : '{}') as Project;
  } catch (error) {
    console.error('Error parsing meta_info:', error);
    return undefined;
  }
};

const loadSalesData = async (projectCode: string): Promise<DailyTicketSales[]> => {
  const dailyTicketSales: DailyTicketSales[] = await prisma.daily_ticket_sales_v2.findMany({
    where: {
      project_code: projectCode,
      aggregated_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    orderBy: {
      aggregated_at: 'desc',
    },
  });

  const keys: string[] = [];
  const uniqueSales: DailyTicketSales[] = [];
  for (const data of dailyTicketSales) {
    const key = [data.event_page_code, data.reception, data.internal_ticket_name].join('::');
    if (!keys.includes(key)) {
      console.log('Unique Key:', key);
      keys.push(key);
      uniqueSales.push(data);
    }
  }
  return uniqueSales;
};

const arrangeSalesData = (
  dailyTicketSales: DailyTicketSales[],
  project: Project
): ExtendedDailyTicketSales[] => {
  const getEventPage = (
    project: Project,
    eventPageCode: string | undefined
  ): EventPage | undefined =>
    project.event_pages.find((eventPage: EventPage) => eventPage.event_page_code === eventPageCode);
  const getTicket = (
    eventPage: EventPage | undefined,
    internalTicketName: string
  ): Ticket | undefined => {
    const assignment: Assignment | undefined = eventPage?.assignments?.find(
      (a: Assignment) => a.internal_ticket_name === internalTicketName
    );
    return project.tickets.find((t: Ticket) => t.ticket_code === assignment?.ticket_code);
  };
  const getConcert = (ticketCode: string | undefined): Concert | undefined => {
    const ticket: Ticket | undefined = project.tickets.find(
      (t: Ticket) => t.ticket_code === ticketCode
    );
    return project.concerts.find((c: Concert) => c.concert_code === ticket?.concert_code);
  };
  const getCampaign = (
    eventPage: EventPage | undefined,
    reception: string
  ): Campaign | undefined => {
    const campaignCode = eventPage?.receptions?.find(
      (r: Reception) => r.reception === reception
    )?.campaign_code;
    if (!campaignCode) return undefined;
    return project.campaigns.find((c: Campaign) => c.campaign_code === campaignCode);
  };
  const formatDate = (date: Date) => date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  return dailyTicketSales
    .map((record: DailyTicketSales): ExtendedDailyTicketSales | undefined => {
      const eventPage: EventPage | undefined = getEventPage(project, record.event_page_code);
      const ticket: Ticket | undefined = getTicket(eventPage, record.internal_ticket_name);
      const concert: Concert | undefined = getConcert(ticket?.ticket_code);
      const campaign: Campaign | undefined = getCampaign(eventPage, record.reception);
      if (
        eventPage === undefined ||
        ticket === undefined ||
        concert === undefined ||
        campaign === undefined
      ) {
        return undefined; // Skip this record if any of the required data is missing
      }
      return {
        project_code: project.project_code,
        concert_code: concert.concert_code,
        campaign_code: campaign.campaign_code,
        event_page_code: eventPage.event_page_code,
        reception: record.reception,
        internal_ticket_name: record.internal_ticket_name,
        aggregated_at: record.aggregated_at,
        project_name: project.project_name,
        concert_name: concert.concert_name,
        campaign_name: campaign.campaign_name,
        event_page_name: eventPage.event_page_name,
        ticket_code: ticket.ticket_code,
        ticket_name: ticket.ticket_name,
        aggregated_at_jp: formatDate(record.aggregated_at),
        applied_number: record.applied_number,
        reserved_number: record.reserved_number,
        confirmed_number: record.confirmed_number,
      };
    })
    .filter((record): record is ExtendedDailyTicketSales => record !== undefined); // Filter out undefined records
};

const getDealtTickets = (project: Project): ExtendedDealtTicket[] => {
  const dealtTickets =
    project.event_pages
      ?.map((ep: EventPage) => {
        return (
          ep.dealt_tickets?.map((dt: DealtTicket) => ({
            concert_code: project.tickets.find((t: Ticket) => t.ticket_code === dt.ticket_code)
              ?.concert_code,
            campaign_code: ep.receptions?.find((r: Reception) => r.reception === dt.reception)
              ?.campaign_code,
            event_page_code: ep.event_page_code,
            ticket_code: dt.ticket_code,
          })) || []
        );
      })
      .flat() || [];
  // 表示用に並び替える
  // 1. 公演
  // 2. キャンペーン
  // 3. プレイガイド（イベントページ）
  // 4. チケット
  dealtTickets.sort((a: ExtendedDealtTicket, b: ExtendedDealtTicket) => {
    const concertCodeA = project.tickets.find(
      (t: Ticket) => t.ticket_code === a.ticket_code
    )?.concert_code;
    const concertCodeB = project.tickets.find(
      (t: Ticket) => t.ticket_code === b.ticket_code
    )?.concert_code;
    const concertA = project.concerts.findIndex((c: Concert) => c.concert_code === concertCodeA);
    const concertB = project.concerts.findIndex((c: Concert) => c.concert_code === concertCodeB);
    if (concertA !== concertB) return concertA - concertB;
    const campaignA = project.campaigns.findIndex(
      (c: Campaign) => c.campaign_code === a.campaign_code
    );
    const campaignB = project.campaigns.findIndex(
      (c: Campaign) => c.campaign_code === b.campaign_code
    );
    if (campaignA !== campaignB) return campaignA - campaignB;
    const pageA = project.event_pages.findIndex(
      (ep: EventPage) => ep.event_page_code === a.event_page_code
    );
    const pageB = project.event_pages.findIndex(
      (ep: EventPage) => ep.event_page_code === b.event_page_code
    );
    if (pageA !== pageB) return pageA - pageB;
    const ticketA = project.tickets.findIndex((t: Ticket) => t.ticket_code === a.ticket_code);
    const ticketB = project.tickets.findIndex((t: Ticket) => t.ticket_code === b.ticket_code);
    if (ticketA !== ticketB) return ticketA - ticketB;
    return 0;
  });
  return dealtTickets;
};

const createReportMain = (
  project: Project,
  dealtTickets: ExtendedDealtTicket[],
  records: ExtendedDailyTicketSales[]
): string[] => {
  const buildLine = (
    icon: string,
    ticket: string,
    applied: number | null,
    reserved: number | null,
    confirmed: number | null
  ): string | undefined => {
    const numbers = [];
    if (applied !== null) numbers.push(`申込${applied}`);
    if (reserved !== null) numbers.push(`予約${reserved}`);
    if (confirmed !== null) numbers.push(`確定${confirmed}`);
    return numbers.length > 0 ? icon + ' ' + ticket + ': ' + numbers.join(', ') : undefined;
  };
  const buildTotalLine = (records: ExtendedDailyTicketSales[]): string | undefined => {
    const totalAppliedNumber = records.reduce(
      (acc: number | null, record: ExtendedDailyTicketSales) => {
        if (record.applied_number !== null) {
          return (acc || 0) + record.applied_number;
        }
        return acc;
      },
      null
    );
    const totalReservedNumber = records.reduce(
      (acc: number | null, record: ExtendedDailyTicketSales) => {
        if (record.reserved_number !== null) {
          return (acc || 0) + record.reserved_number;
        }
        return acc;
      },
      null
    );
    const totalConfirmedNumber = records.reduce(
      (acc: number | null, record: ExtendedDailyTicketSales) => {
        if (record.confirmed_number !== null) {
          return (acc || 0) + record.confirmed_number;
        }
        return acc;
      },
      null
    );
    return buildLine('💵', '合計', totalAppliedNumber, totalReservedNumber, totalConfirmedNumber);
  };
  const unique = (data: (string | undefined)[]): string[] =>
    Array.from(new Set(data.filter((d): d is string => d !== undefined)));

  const concertCodes = unique(dealtTickets.map((dt) => dt.concert_code));
  const lines = concertCodes
    .map((concertCode) => {
      const campaignCodes = unique(
        dealtTickets.filter((dt) => dt.concert_code === concertCode).map((dt) => dt.campaign_code)
      );
      const lines = campaignCodes
        .map((campaignCode) => {
          const eventPageCodes = unique(
            dealtTickets
              .filter((dt) => dt.concert_code === concertCode && dt.campaign_code === campaignCode)
              .map((dt) => dt.event_page_code)
          );
          const lines = eventPageCodes
            .map((eventPageCode) => {
              const lines = dealtTickets
                .filter(
                  (dt) =>
                    dt.concert_code === concertCode &&
                    dt.campaign_code === campaignCode &&
                    dt.event_page_code === eventPageCode
                )
                .map((dt) => {
                  const record = records.find(
                    (r) =>
                      r.concert_code === concertCode &&
                      r.campaign_code === campaignCode &&
                      r.event_page_code === eventPageCode &&
                      r.ticket_code === dt.ticket_code
                  );
                  return record !== undefined
                    ? buildLine(
                        '🎫',
                        record.ticket_name,
                        record.applied_number,
                        record.reserved_number,
                        record.confirmed_number
                      )
                    : undefined;
                })
                .filter((line) => line !== undefined);
              const eventPageName = project.event_pages.find(
                (ep: any) => ep.event_page_code === eventPageCode
              )?.event_page_name;
              if (eventPageName !== 'デフォルト') {
                return ['🛍️ ' + eventPageName].concat(lines.map((line) => '  ' + line));
              }
              return lines;
            })
            .flat();
          const campaignName = project.campaigns.find(
            (c: any) => c.campaign_code === campaignCode
          )?.campaign_name;
          if (campaignName !== 'デフォルト') {
            return ['📣 ' + campaignName].concat(lines.map((line) => '  ' + line));
          }
          return lines;
        })
        .flat();
      const concertName = project.concerts.find(
        (c: any) => c.concert_code === concertCode
      )?.concert_name;
      if (concertName !== 'デフォルト') {
        return ['🎻 ' + concertName].concat(lines.map((line) => '  ' + line));
      }
      return lines;
    })
    .flat();

  // 合計販売数
  const totalLine = buildTotalLine(records);
  if (totalLine !== undefined) {
    lines.push(totalLine);
  }
  // 集計日時の表示（2行目）
  const formatDate = (date: Date) => {
    const dateString = date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    return dateString.substring(0, dateString.length - 3); // 秒を削除
  };
  if (records.length > 0) {
    records.sort((a, b) => b.aggregated_at.getTime() - a.aggregated_at.getTime());
    lines.unshift(formatDate(records[0].aggregated_at) + '時点');
  } else {
    while (lines.length > 0) lines.shift();
    lines.unshift('🥲 今日はまだ集計されてないぴょ');
  }
  // 案件名（先頭行）
  lines.unshift(project.project_name);
  return lines;
};

export const createReport = async (projectCode: string): Promise<string[]> => {
  // 案件情報の取得
  const project = await getProjectInformation(projectCode);
  if (!project) {
    console.error('Project not found for projectCode:', projectCode);
    return ['案件情報が見つからないぴょ'];
  }

  // 各イベントページにおける取扱いチケットの情報を取得
  const dealtTickets: ExtendedDealtTicket[] = getDealtTickets(project);
  console.log('Dealt Tickets:', dealtTickets);

  // 直近24時間のユニークな日別チケット販売数を取得
  const dailySales: ExtendedDailyTicketSales[] = arrangeSalesData(
    await loadSalesData(projectCode),
    project
  );
  console.log('Unique Daily Ticket Sales:', dailySales);

  // レポートの作成
  return createReportMain(project, dealtTickets, dailySales);
};
