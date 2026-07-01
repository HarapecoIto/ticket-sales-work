import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: '夏休み 親子で楽しむクラシック音楽会',
    short_name: '夏休み 親子で楽しむクラシック音楽会',
    date_at: new Date('2026-07-27T15:00:00+09:00'),
    hall: '浜離宮朝日ホール',
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
  event_code: '20260727_oyako_classic',
  name: '夏休み 親子で楽しむクラシック音楽会',
  short_name: '夏休み 親子で楽しむクラシック音楽会',
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
  line_link_key: 'メロンココナッツ',
};

export default TOUR;
