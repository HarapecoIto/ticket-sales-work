import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: '千野哲太夏の大冒険ツアー2026 feat.尾崎一宏東京公演',
    short_name: '千野哲太夏の大冒険ツアー東京',
    date_at: new Date('2026-07-24T19:00:00+09:00'),
    hall: 'ラドンナ 原宿',
    tickets: [
      {
        name: 'リハーサル観覧付き席',
      },
      {
        name: '一般席（通常料金）',
      },
      {
        name: '一般席（U-25）',
      },
    ],
    distribution: [
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: 'リハーサル観覧付き席',
        campaign_alias: '一般販売',
        ticket_alias: '7/24(金) 19:30::リハーサル観覧付き(17:30～18:00)::指定席::通常料金',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '一般席（通常料金）',
        campaign_alias: '一般販売',
        ticket_alias: '7/24(金) 19:30::一般席::指定席::通常料金',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '一般席（U-25）',
        campaign_alias: '一般販売',
        ticket_alias: '7/24(金) 19:30::一般席::指定席::U-25',
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
  event_code: '20260724_chino_tokyo',
  name: '千野哲太夏の大冒険ツアー2026 feat.尾崎一宏東京公演',
  display_name: '千野哲太夏の大冒険ツアー東京',
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
  line_link_key: 'はくさいライチ',
};

export default TOUR;
