import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: 'Festival Django Reinhardt JAPAN in TAKANAWA GATEWAY CITY',
    short_name: '高輪ゲートウェイ',
    date_at: new Date('2026-06-20T12:00:00+09:00'),
    hall: '高輪ゲートウェイシティ Gateway Park',
    tickets: [
      {
        name: '応援席（前方観覧席）',
      },
    ],
    distribution: [
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '応援席（前方観覧席）',
        campaign_alias: '一般販売',
        ticket_alias: '応援席（前方観覧席）',
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
  event_code: '20260620_gateway',
  name: 'Festival Django Reinhardt JAPAN in TAKANAWA GATEWAY CITY',
  short_name: 'Festival Django Reinhardt JAPAN',
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
};

export default TOUR;
