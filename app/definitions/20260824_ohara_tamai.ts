import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: '大原櫻子×玉井詩織 Orchestra Concert Summer Memories',
    short_name: 'Day 1',
    date_at: new Date('2026-08-24T19:00:00+09:00'),
    hall: 'すみだトリフォニーホール 大ホール',
    tickets: [
      {
        name: '一般席',
      },
    ],
    distribution: [
      {
        campaign: 'さくらぶ抽選先行',
        play_guide: 'eplus',
        ticket: '一般席',
        campaign_alias: 'さくらぶ抽選先行',
        ticket_alias: '一般席',
      },
      {
        campaign: 'さくもば抽選先行',
        play_guide: 'eplus',
        ticket: '一般席',
        campaign_alias: 'さくもば抽選先行',
        ticket_alias: '一般席',
      },
      {
        campaign: '玉井詩織抽選先行',
        play_guide: 'eplus',
        ticket: '一般席',
        campaign_alias: '玉井詩織抽選先行',
        ticket_alias: '一般席',
      },
      {
        campaign: '一般先行',
        play_guide: 'eplus',
        ticket: '一般席',
        campaign_alias: '一般先行',
        ticket_alias: '一般席',
      },
      {
        campaign: '一般発売',
        play_guide: 'eplus',
        ticket: '一般席',
        campaign_alias: '一般発売',
        ticket_alias: '一般席',
      },
    ],
  },
];

const CAMPAIGNS: Campaign[] = [
  {
    campaign_name: 'さくらぶ抽選先行',
    campaign_type: 'ByLottery', // 抽選販売
    reservation_start_at: null,
    reservation_end_at: null,
    lottery_at: null,
    settlement_at: null,
    sales_start_at: null,
  },
  {
    campaign_name: 'さくもば抽選先行',
    campaign_type: 'ByLottery',
    reservation_start_at: null,
    reservation_end_at: null,
    lottery_at: null,
    settlement_at: null,
    sales_start_at: null,
  },

  {
    campaign_name: '玉井詩織抽選先行',
    campaign_type: 'ByLottery',
    reservation_start_at: null,
    reservation_end_at: null,
    lottery_at: null,
    settlement_at: null,
    sales_start_at: null,
  },
  {
    campaign_name: '一般先行',
    campaign_type: 'ByLottery', // 抽選販売
    reservation_start_at: null,
    reservation_end_at: null,
    lottery_at: null,
    settlement_at: null,
    sales_start_at: null,
  },
  {
    campaign_name: '一般発売',
    campaign_type: 'FirstCome',
    reservation_start_at: null,
    reservation_end_at: null,
    lottery_at: null,
    settlement_at: null,
    sales_start_at: null,
  },
];

const TOUR: Tour = {
  event_code: '20260824_ohara_tamai',
  name: '大原櫻子×玉井詩織 Orchestra Concert Summer Memories',
  short_name: '大原櫻子×玉井詩織',
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
};

export default TOUR;
