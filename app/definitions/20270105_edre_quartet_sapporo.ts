import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: 'Erde Quartet Concert Vol.5 札幌',
    display_name: 'Erde Quartet Concert Vol.5 札幌',
    short_name: 'Erde Quartet Concert Vol.5 札幌',
    date_at: new Date('2027-01-05T19:00:00+09:00'),
    hall: '豊平館',
    tickets: [
      {
        name: '一般席',
      },
      {
        name: '学生席',
      },
    ],
    distribution: [
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '一般席',
        campaign_alias: '一般販売',
        ticket_alias: '1/5(木) 19:00::一般席::自由席::通常料金',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '学生席',
        campaign_alias: '一般販売',
        ticket_alias: '1/5(木) 19:00::一般席::自由席::学生席',
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
  event_code: '20270105_edre_quartet_sapporo',
  name: 'Erde Quartet Concert Vol.5 札幌',
  display_name: 'Erde Quartet Concert Vol.5 札幌', // 最大20文字まで
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
  line_link_key: 'ブルーベリーミント',
};

export default TOUR;
