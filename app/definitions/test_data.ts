import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: 'テストイベント in テスト会場',
    short_name: 'テストイベント',
    date_at: new Date('2026-06-06T19:00:00+09:00'),
    hall: 'テスト会場',
    tickets: [
      {
        name: '自由席',
      },
    ],
    distribution: [
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '自由席',
        campaign_alias: '一般販売',
        ticket_alias: '自由席',
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
  event_code: '20260606_test',
  name: 'テストイベント in テスト会場',
  display_name: 'テストイベント',
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
  line_link_key: 'トマトびわ',
};

export default TOUR;
