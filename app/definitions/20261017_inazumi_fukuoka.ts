import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: '稲積陽菜 プレミアムアフタヌーン 福岡',
    display_name: '稲積陽菜 プレミアムアフタヌーン 福岡',
    short_name: '稲積陽菜 プレミアムアフタヌーン 福岡',
    date_at: new Date('2026-10-17T15:00:00+09:00'),
    hall: '豊平館',
    tickets: [
      {
        name: 'VIP席',
      },
      {
        name: '一般席',
      },
    ],
    distribution: [
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: 'VIP席',
        campaign_alias: '一般販売',
        ticket_alias: '10/17(日) 15:00::VIP席::自由席::通常料金',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '一般席',
        campaign_alias: '一般販売',
        ticket_alias: '10/17(日) 15:00::一般席::自由席::通常料金',
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
  event_code: '20261017_inazumi_fukuoka',
  name: '稲積陽菜 プレミアムアフタヌーン 福岡',
  display_name: '稲積陽菜 プレミアムアフタヌーン 福岡', // 最大20文字まで
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
  line_link_key: '柚子柘榴',
};

export default TOUR;
