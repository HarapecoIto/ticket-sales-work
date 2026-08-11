import prisma from '../lib/prisma.js';
import {
  Project,
  Concert,
  Ticket,
  EventPage,
  Reception,
  Campaign,
  Assignment,
} from '../app/types.v2.js';

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

const arrangeSalesData = (dailyTicketSales: DailyTicketSales[], project: Project) => {
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

  const records = dailyTicketSales.map(
    (record: DailyTicketSales): ExtendedDailyTicketSales | undefined => {
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
    }
  );
  return records;
};

const getDealtTickets = (metaInfo: any) => {
  const dealtTickets =
    metaInfo.event_pages
      ?.map((ep: any) => {
        return (
          ep.dealt_tickets?.map((dt: any) => ({
            concert_code: metaInfo.tickets.find((t: any) => t.ticket_code === dt.ticket_code)
              ?.concert_code,
            campaign_code: ep.receptions?.find((r: any) => r.reception === dt.reception)
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
  dealtTickets.sort((a: any, b: any) => {
    const concertCodeA = metaInfo.tickets.find(
      (t: any) => t.ticket_code === a.ticket_code
    )?.concert_code;
    const concertCodeB = metaInfo.tickets.find(
      (t: any) => t.ticket_code === b.ticket_code
    )?.concert_code;
    const concertA = metaInfo.concerts.findIndex((c: any) => c.concert_code === concertCodeA);
    const concertB = metaInfo.concerts.findIndex((c: any) => c.concert_code === concertCodeB);
    if (concertA !== concertB) return concertA - concertB;
    const campaignA = metaInfo.campaigns.findIndex((c: any) => c.campaign_code === a.campaign_code);
    const campaignB = metaInfo.campaigns.findIndex((c: any) => c.campaign_code === b.campaign_code);
    if (campaignA !== campaignB) return campaignA - campaignB;
    const pageA = metaInfo.event_pages.findIndex(
      (ep: any) => ep.event_page_code === a.event_page_code
    );
    const pageB = metaInfo.event_pages.findIndex(
      (ep: any) => ep.event_page_code === b.event_page_code
    );
    if (pageA !== pageB) return pageA - pageB;
    const ticketA = metaInfo.tickets.findIndex((t: any) => t.ticket_code === a.ticket_code);
    const ticketB = metaInfo.tickets.findIndex((t: any) => t.ticket_code === b.ticket_code);
    if (ticketA !== ticketB) return ticketA - ticketB;
    return 0;
  });
  return dealtTickets;
};

const createReport = (dealtTickets: any[], dailySales: any[], metaInfo: any) => {
  const buildLine = (
    icon: string,
    ticket: string,
    applied: number | null,
    reserved: number | null,
    confirmed: number | null
  ) => {
    const numbers = [];
    if (applied !== null) numbers.push(`申込${applied}`);
    if (reserved !== null) numbers.push(`予約${reserved}`);
    if (confirmed !== null) numbers.push(`確定${confirmed}`);
    return numbers.length > 0 ? icon + ' ' + ticket + ': ' + numbers.join(', ') : undefined;
  };
  const unique = (data: any[]) => Array.from(new Set(data));

  const concertCodes = Array.from(new Set(dealtTickets.map((dt) => dt.concert_code)));
  const lines = concertCodes
    .map((concertCode) => {
      const campaignCodes = Array.from(
        new Set(
          dealtTickets.filter((dt) => dt.concert_code === concertCode).map((dt) => dt.campaign_code)
        )
      );
      const lines = campaignCodes
        .map((campaignCode) => {
          const eventPageCodes = Array.from(
            new Set(
              dealtTickets
                .filter(
                  (dt) => dt.concert_code === concertCode && dt.campaign_code === campaignCode
                )
                .map((dt) => dt.event_page_code)
            )
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
                  const record = dailySales.find(
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
              const eventPageName = metaInfo.event_pages.find(
                (ep: any) => ep.event_page_code === eventPageCode
              )?.event_page_name;
              if (eventPageName !== 'デフォルト') {
                return ['🛍️ ' + eventPageName].concat(lines.map((line) => '  ' + line));
              }
              return lines;
            })
            .flat();
          const campaignName = metaInfo.campaigns.find(
            (c: any) => c.campaign_code === campaignCode
          )?.campaign_name;
          if (campaignName !== 'デフォルト') {
            return ['📣 ' + campaignName].concat(lines.map((line) => '  ' + line));
          }
          return lines;
        })
        .flat();
      const concertName = metaInfo.concerts.find(
        (c: any) => c.concert_code === concertCode
      )?.concert_name;
      if (concertName !== 'デフォルト') {
        return ['🎻 ' + concertName].concat(lines.map((line) => '  ' + line));
      }
      return lines;
    })
    .flat();
  const totalAppliedNumber = dailySales.reduce((acc, record) => {
    if (record.confirmed_number !== null) {
      return (acc || 0) + record.applied_number;
    }
    return acc;
  }, null);
  const totalReservedNumber = dailySales.reduce((acc, record) => {
    if (record.confirmed_number !== null) {
      return (acc || 0) + record.reserved_number;
    }
    return acc;
  }, null);
  const totalConfirmedNumber = dailySales.reduce((acc, record) => {
    if (record.confirmed_number !== null) {
      return (acc || 0) + record.confirmed_number;
    }
    return acc;
  }, null);
  const totalLine = buildLine(
    '💵',
    '合計',
    totalAppliedNumber,
    totalReservedNumber,
    totalConfirmedNumber
  );
  if (totalLine !== undefined) {
    lines.push(totalLine);
  }
  const triggeredAt = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  lines.unshift(triggeredAt.substring(0, triggeredAt.length - 3) + '時点');
  lines.unshift(metaInfo.project_name);
  return lines;
};

const main = async () => {
  // 案件情報の取得
  const triggered = await prisma.scraping_triggered.findMany({
    orderBy: {
      triggered_at: 'desc',
    },
    take: 1,
  });
  if (triggered.length === 0) {
    console.log('No triggered records found.');
    return;
  }
  const projectCode = triggered[0].project_code;
  const triggeredAt = triggered[0].triggered_at;
  const metaInfo = JSON.parse(triggered[0].meta_info);

  console.log('Latest triggered record:');
  console.log('Project Code:', projectCode);
  console.log('Triggered At:', triggeredAt);
  console.log('Meta Info:', metaInfo);
  console.log('Latest triggered project code:', projectCode);

  // 各イベントページにおける取扱いチケットの情報を取得
  const dealtTickets = getDealtTickets(metaInfo);
  console.log('Dealt Tickets:', dealtTickets);

  // 直近24時間のユニークな日別チケット販売数を取得
  const dailySales = arrangeSalesData(await loadSalesData(projectCode), metaInfo);
  console.log('Unique Daily Ticket Sales:', dailySales);

  const concertCodes = Array.from(new Set(dealtTickets.map((dt: any) => dt.concert_code)));

  const lines = createReport(dealtTickets, dailySales, metaInfo);

  console.log('Dealt Tickets Report:\n' + lines.join('\n'));
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
