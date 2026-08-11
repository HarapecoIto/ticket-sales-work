import prisma from '../lib/prisma.js';

const loadSalesData = async (projectCode) => {
  const dailyTicketSales = await prisma.daily_ticket_sales_v2.findMany({
    where: {
      project_code: projectCode,
      aggregated_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    orderBy: {
      aggregated_at: 'desc',
    },
  });

  const keys = [];
  const uniqueSales = [];
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

const arrangeSalesData = (uniqueSales, metaInfo) => {
  const getProjectName = () => metaInfo.project_name || 'Unknown Project';
  const getConcertCode = (ticketCode) =>
    metaInfo.tickets?.find((t) => t.ticket_code === ticketCode)?.concert_code ||
    'Unknown Concert Code';
  const getTicketCode = (eventPageCode, internalTicketName) => {
    const eventPage = metaInfo.event_pages?.find((ep) => ep.event_page_code === eventPageCode);
    const assignment = eventPage?.assignments?.find(
      (a) => a.internal_ticket_name === internalTicketName
    );
    return assignment?.ticket_code || 'Unknown Ticket Code';
  };
  const getConcertName = (ticketCode) => {
    const concertCode = getConcertCode(ticketCode);
    return (
      metaInfo.concerts?.find((c) => c.concert_code === concertCode)?.concert_name ||
      'Unknown Concert'
    );
  };
  const getCampaignCode = (eventPageCode, reception) => {
    const eventPage = metaInfo.event_pages?.find((ep) => ep.event_page_code === eventPageCode);
    if (!eventPage) return 'Unknown Campaign Code';
    const campaignCode = eventPage.receptions?.find(
      (r) => r.reception === reception
    )?.campaign_code;
    if (!campaignCode) return 'Unknown Campaign Code';
    return campaignCode;
  };
  const getCampaignName = (eventPageCode, reception) => {
    const campaignCode = getCampaignCode(eventPageCode, reception);
    return (
      metaInfo.campaigns?.find((c) => c.campaign_code === campaignCode)?.campaign_name ||
      'Unknown Campaign'
    );
  };
  const getEventPageName = (eventPageCode) =>
    metaInfo.event_pages?.find((ep) => ep.event_page_code === eventPageCode)?.event_page_name ||
    'Unknown Event Page';
  const getTicketName = (ticketCode) =>
    metaInfo.tickets?.find((t) => t.ticket_code === ticketCode)?.ticket_name || 'Unknown Ticket';
  const getAggregatedAt = (aggregatedAt) =>
    new Date(aggregatedAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  const records = uniqueSales.map((data) => {
    const ticketCode = getTicketCode(data.event_page_code, data.internal_ticket_name);
    return {
      project_code: data.project_code,
      concert_code: metaInfo.tickets.find((t) => t.ticket_code === ticketCode)?.concert_code,
      campaign_code: getCampaignCode(data.event_page_code, data.reception),
      event_page_code: data.event_page_code,
      reception: data.reception,
      internal_ticket_name: data.internal_ticket_name,
      aggregated_at: data.aggregated_at,
      project_name: getProjectName(),
      concert_name: getConcertName(ticketCode),
      campaign_name: getCampaignName(data.event_page_code, data.reception),
      event_page_name: getEventPageName(data.event_page_code),
      ticket_code: ticketCode,
      ticket_name: getTicketName(ticketCode),
      aggregated_at_jp: getAggregatedAt(data.aggregated_at),
      applied_number: data.applied_number,
      reserved_number: data.reserved_number,
      confirmed_number: data.confirmed_number,
    };
  });
  return records;
};

const getDealtTickets = (metaInfo) => {
  const dealtTickets =
    metaInfo.event_pages
      ?.map((ep) => {
        return (
          ep.dealt_tickets?.map((dt) => ({
            concert_code: metaInfo.tickets.find((t) => t.ticket_code === dt.ticket_code)
              ?.concert_code,
            campaign_code: ep.receptions?.find((r) => r.reception === dt.reception)?.campaign_code,
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
  dealtTickets.sort((a, b) => {
    const concertCodeA = metaInfo.tickets.find(
      (t) => t.ticket_code === a.ticket_code
    )?.concert_code;
    const concertCodeB = metaInfo.tickets.find(
      (t) => t.ticket_code === b.ticket_code
    )?.concert_code;
    const concertA = metaInfo.concerts.findIndex((c) => c.concert_code === concertCodeA);
    const concertB = metaInfo.concerts.findIndex((c) => c.concert_code === concertCodeB);
    if (concertA !== concertB) return concertA - concertB;
    const campaignA = metaInfo.campaigns.findIndex((c) => c.campaign_code === a.campaign_code);
    const campaignB = metaInfo.campaigns.findIndex((c) => c.campaign_code === b.campaign_code);
    if (campaignA !== campaignB) return campaignA - campaignB;
    const pageA = metaInfo.event_pages.findIndex((ep) => ep.event_page_code === a.event_page_code);
    const pageB = metaInfo.event_pages.findIndex((ep) => ep.event_page_code === b.event_page_code);
    if (pageA !== pageB) return pageA - pageB;
    const ticketA = metaInfo.tickets.findIndex((t) => t.ticket_code === a.ticket_code);
    const ticketB = metaInfo.tickets.findIndex((t) => t.ticket_code === b.ticket_code);
    if (ticketA !== ticketB) return ticketA - ticketB;
    return 0;
  });
  return dealtTickets;
};

const createReport = (dealtTickets, dailySales, metaInfo) => {
  const buildLine = (icon, ticket, applied, reserved, confirmed) => {
    const numbers = [];
    if (applied !== null) numbers.push(`申込${applied}`);
    if (reserved !== null) numbers.push(`予約${reserved}`);
    if (confirmed !== null) numbers.push(`確定${confirmed}`);
    return numbers.length > 0 ? icon + ' ' + ticket + ': ' + numbers.join(', ') : undefined;
  };
  const unique = (data) => Array.from(new Set(data));

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
                (ep) => ep.event_page_code === eventPageCode
              )?.event_page_name;
              if (eventPageName !== 'デフォルト') {
                return ['🛍️ ' + eventPageName].concat(lines.map((line) => '  ' + line));
              }
              return lines;
            })
            .flat();
          const campaignName = metaInfo.campaigns.find(
            (c) => c.campaign_code === campaignCode
          )?.campaign_name;
          if (campaignName !== 'デフォルト') {
            return ['📣 ' + campaignName].concat(lines.map((line) => '  ' + line));
          }
          return lines;
        })
        .flat();
      const concertName = metaInfo.concerts.find(
        (c) => c.concert_code === concertCode
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

  const concertCodes = Array.from(new Set(dealtTickets.map((dt) => dt.concert_code)));

  const lines = createReport(dealtTickets, dailySales, metaInfo);

  console.log('Dealt Tickets Report:\n' + lines.join('\n'));
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
