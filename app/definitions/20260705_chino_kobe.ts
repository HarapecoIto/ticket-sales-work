import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: '千野哲太夏の大冒険ツアー2026 feat.尾崎一宏神戸公演',
    short_name: '神戸公演',
    date_at: new Date('2026-07-05T19:00:00+09:00'),
    hall: '神戸煉瓦倉庫K-wave',
    tickets: [
      {
        name: 'A席',
      },
      {
        name: 'B席',
      },
    ],
    distribution: [
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: 'A席',
        campaign_alias: '一般販売',
        ticket_alias: 'A席',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: 'B席',
        campaign_alias: '一般販売',
        ticket_alias: 'B席',
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
  event_code: '20260705_chino_kobe',
  name: '千野哲太夏の大冒険ツアー2026 feat.尾崎一宏神戸公演',
  short_name: '夏の大冒険ツアー2026 神戸公演',
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
};

export default TOUR;
