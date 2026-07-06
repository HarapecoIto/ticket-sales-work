import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: '糸と音を紡ぐ 刺繍アート展【展示会】',
    short_name: '展示会',
    date_at: new Date('2026-07-31T10:00:00+09:00'),
    hall: '浜離宮朝日ホール 小ホール',
    tickets: [
      {
        name: '2026/7/31(金)',
      },
      {
        name: '2026/8/1(土)',
      },
      {
        name: '2026/8/2(日)',
      },
    ],
    distribution: [
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '2026/7/31(金)',
        campaign_alias: '一般販売',
        ticket_alias: '7/31(金) 10:00::一般::自由席::通常料金',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '2026/8/1(土)',
        campaign_alias: '一般販売',
        ticket_alias: '8/1(土) 10:00::一般::自由席::通常料金',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '2026/8/2(日)',
        campaign_alias: '一般販売',
        ticket_alias: '8/2(日) 10:00::一般::自由席::通常料金',
      },
    ],
  },
  {
    name: '糸と音を紡ぐ 刺繍アート展【演奏会】',
    short_name: '演奏会',
    date_at: new Date('2026-07-31T19:00:00+09:00'),
    hall: '浜離宮朝日ホール 小ホール',
    tickets: [
      {
        name: '菊間倫也 2026/7/31(金)',
      },
      {
        name: '大谷舞 2026/8/1(土)',
      },
    ],
    distribution: [
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '菊間倫也 2026/7/31(金)',
        campaign_alias: '一般販売',
        ticket_alias: '7/31(金) 19:00::一般::自由席::通常料金',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '大谷舞 2026/8/1(土)',
        campaign_alias: '一般販売',
        ticket_alias: '8/1(土) 19:00::一般::自由席::通常料金',
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
  name: '糸と音を紡ぐ 刺繍アート展',
  short_name: '糸と音を紡ぐ 刺繍アート展',
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
  line_link_key: 'いちごトマト',
};

export default TOUR;
