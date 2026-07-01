import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: '糸と音を紡ぐ 刺繍アート展【演奏会】2026/7/31 菊間倫也',
    short_name: '【演奏会】2026/7/31 菊間倫也',
    date_at: new Date('2026-07-31T10:00:00+09:00'),
    hall: '浜離宮朝日ホール 小ホール',
    tickets: [
      {
        name: '一般',
      },
    ],
    distribution: [
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '一般',
        campaign_alias: '一般販売',
        ticket_alias: '一般',
      },
    ],
  },
  {
    name: '糸と音を紡ぐ 刺繍アート展【演奏会】2026/8/1 大谷舞',
    short_name: '【演奏会】2026/8/1 大谷舞',
    date_at: new Date('2026-08-01T10:00:00+09:00'),
    hall: '浜離宮朝日ホール 小ホール',
    tickets: [
      {
        name: '一般',
      },
    ],
    distribution: [
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '一般',
        campaign_alias: '一般販売',
        ticket_alias: '一般',
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
  event_code: '20260731_shishuu_art',
  name: '糸と音を紡ぐ 刺繍アート展【演奏会】',
  short_name: '糸と音を紡ぐ 刺繍アート展【演奏会】',
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
  line_link_key: 'あまなつチョコ',
};

export default TOUR;
