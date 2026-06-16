import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: '旅するクラシック プレミアム・ステージ 2026',
    short_name: '旅するクラシック',
    date_at: new Date('2026-08-25T18:19:00+09:00'),
    hall: 'すみだトリフォニーホール 大ホール',
    tickets: [
      {
        name: 'ファーストクラス（S席）',
      },
      {
        name: 'ビジネスクラス（A席）',
      },
      {
        name: 'エコノミークラス（B席）',
      },
    ],
    distribution: [
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: 'ファーストクラス（S席）',
        campaign_alias: '一般販売',
        ticket_alias: 'ファーストクラス（S席）',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: 'ビジネスクラス（A席）',
        campaign_alias: '一般販売',
        ticket_alias: 'ビジネスクラス（A席）',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: 'エコノミークラス（B席）',
        campaign_alias: '一般販売',
        ticket_alias: 'エコノミークラス（B席）',
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
  event_code: '20260825_tabicla',
  name: '旅するクラシック プレミアム・ステージ 2026',
  short_name: '旅するクラシック',
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
  line_link_key: 'オレンジごぼう',
};

export default TOUR;
