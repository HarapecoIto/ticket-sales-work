import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: '島谷美賀子ヴァイオリンリサイタル',
    display_name: '島谷美賀子ヴァイオリンリサイタル',
    short_name: '島谷美賀子',
    date_at: new Date('2026-07-18T18:30:00+09:00'),
    hall: '浜離宮朝日ホール',
    tickets: [
      {
        name: 'VIP席',
      },
      {
        name: '一般席',
      },
      {
        name: 'U25席',
      },
    ],
    distribution: [
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: 'VIP席',
        campaign_alias: '一般販売',
        ticket_alias: '7/18(土) 18:30::VIP::指定席::通常料金',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '一般席',
        campaign_alias: '一般販売',
        ticket_alias: '7/18(土) 18:30::一般::指定席::通常料金',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: 'U25席',
        campaign_alias: '一般販売',
        ticket_alias: '7/18(土) 18:30::U25::指定席::通常料金',
      },
      {
        campaign: '一般販売',
        play_guide: 'eplus',
        ticket: '一般席',
        campaign_alias: '一般発売',
        ticket_alias: '一般',
      },
      {
        campaign: '一般販売',
        play_guide: 'eplus',
        ticket: 'U25席',
        campaign_alias: '一般発売',
        ticket_alias: 'Ｕ２５',
      },
    ],
  },
];

const CAMPAIGNS: Campaign[] = [
  {
    campaign_name: '一般販売',
    campaign_type: 'FirstCome', // 先着販売
    reservation_start_at: null,
    reservation_end_at: null,
    lottery_at: null,
    settlement_at: null,
    sales_start_at: null,
  },
];

const TOUR: Tour = {
  event_code: '20260718_shimatani',
  name: '島谷美賀子ヴァイオリンリサイタル',
  display_name: '島谷美賀子',
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
  line_link_key: 'はちみつセロリ',
};

export default TOUR;
