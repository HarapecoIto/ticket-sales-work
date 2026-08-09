import prisma from '../lib/prisma.js';

const main = async () => {
  console.log('Hello, World!');

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

  const getProjectName = () => metaInfo.project_name || 'Unknown Project';
  const getTicketCode = (eventPageCode, internalTicketName) => {
    const eventPage = metaInfo.event_pages?.find((ep) => ep.event_page_code === eventPageCode);
    const assignment = eventPage?.assignments?.find(
      (a) => a.internal_ticket_name === internalTicketName
    );
    return assignment?.ticket_code || 'Unknown Ticket Code';
  };
  const getConcertName = (ticketCode) => {
    const concertCode = metaInfo.tickets?.find((t) => t.ticket_code === ticketCode)?.concert_code;
    return (
      metaInfo.concerts?.find((c) => c.concert_code === concertCode)?.concert_name ||
      'Unknown Concert'
    );
  };
  const getCampaignName = (eventPageCode, reception) => {
    const eventPage = metaInfo.event_pages?.find((ep) => ep.event_page_code === eventPageCode);
    if (!eventPage) return 'Unknown Campaign';
    const campaignCode = eventPage.receptions?.find(
      (r) => r.reception === reception
    )?.campaign_code;
    if (!campaignCode) return 'Unknown Campaign';
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
      event_page_code: data.event_page_code,
      reception: data.reception,
      internal_ticket_name: data.internal_ticket_name,
      aggregated_at: data.aggregated_at,
      project_name: getProjectName(),
      concert_name: getConcertName(ticketCode),
      campaign_name: getCampaignName(data.event_page_code, data.reception),
      event_page_name: getEventPageName(data.event_page_code),
      ticket_name: getTicketName(ticketCode),
      aggregated_at_jp: getAggregatedAt(data.aggregated_at),
      applied_number: data.applied_number,
      reserved_number: data.reserved_number,
      confirmed_number: data.confirmed_number,
    };
  });

  console.log('Unique Daily Ticket Sales:', records);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
