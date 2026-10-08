import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: 'Erde Quartet Concert Vol.4 東京',
    display_name: 'Erde Quartet Concert Vol.4 東京',
    short_name: 'Erde Quartet Concert Vol.4 東京',
    date_at: new Date('2026-12-22T19:00:00+09:00'),
    hall: 'マリーコンツェルト',
    tickets: [
      {
        name: '一般席',
      },
    ],
    distribution: [
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '一般席',
        campaign_alias: '一般販売',
        ticket_alias: '12/22(火) 19:00::一般席::自由席::通常料金',
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
  event_code: '20261222_edre_quartet_tokyo',
  name: 'Erde Quartet Concert Vol.4 東京',
  display_name: 'Erde Quartet Concert Vol.4 東京', // 最大20文字まで
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
  line_link_key: 'コーヒー角砂糖',
};

export default TOUR;
