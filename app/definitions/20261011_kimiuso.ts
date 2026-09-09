import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: '四月は君の嘘 原画と共に奏でるコンサート',
    display_name: '四月は君の嘘 原画と共に奏でるコンサート',
    short_name: '四月は君の嘘 コンサート',
    date_at: new Date('2026-10-11T14:00:00+09:00'),
    hall: '第一生命ホール',
    tickets: [
      {
        name: 'Ｓ席',
      },
      {
        name: 'Ａ席',
      },
      {
        name: '見切れ席',
      },
    ],
    distribution: [
      {
        campaign: '先行販売',
        play_guide: 'eplus',
        ticket: '',
        campaign_alias: '座席選択先行受付',
        ticket_alias: 'Ｓ席（特典付き）',
      },
      {
        campaign: '先行販売',
        play_guide: 'eplus',
        ticket: 'Ａ席',
        campaign_alias: '座席選択先行受付',
        ticket_alias: 'Ａ席',
      },
      {
        campaign: '先行販売',
        play_guide: 'eplus',
        ticket: '見切れ席',
        campaign_alias: '先行販売',
        ticket_alias: '見切れ席',
      },
      {
        campaign: '一般販売',
        play_guide: 'eplus',
        ticket: 'Ｓ席',
        campaign_alias: '一般発売', // イープラスの用語は「一般販売」ではなく「一般発売」
        ticket_alias: 'Ｓ席（特典付き）',
      },
      {
        campaign: '一般販売',
        play_guide: 'eplus',
        ticket: 'Ａ席',
        campaign_alias: '一般発売', // イープラスの用語は「一般販売」ではなく「一般発売」
        ticket_alias: 'Ａ席',
      },
      {
        campaign: '一般販売',
        play_guide: 'eplus',
        ticket: '見切れ席',
        campaign_alias: '一般発売', // イープラスの用語は「一般販売」ではなく「一般発売」
        ticket_alias: '見切れ席',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: 'Ａ席',
        campaign_alias: '一般販売',
        ticket_alias: '10/11(日) 14:00::A席::指定席::通常料金',
      },
    ],
  },
];

const CAMPAIGNS: Campaign[] = [
  {
    campaign_name: '先行販売',
    campaign_type: 'FirstCome', // 先着販売
    reservation_start_at: null,
    reservation_end_at: null,
    lottery_at: null,
    settlement_at: null,
    sales_start_at: new Date('2026-09-06T12:00:00+09:00'), // 発売日
  },
  {
    campaign_name: '一般販売',
    campaign_type: 'FirstCome',
    reservation_start_at: null,
    reservation_end_at: null,
    lottery_at: null,
    settlement_at: null,
    sales_start_at: new Date('2026-09-15T20:00:00+09:00'), // 発売日
  },
];

const TOUR: Tour = {
  event_code: '20261011_kimiuso',
  name: '四月は君の嘘 原画と共に奏でるコンサート',
  display_name: '四月は君の嘘 コンサート',
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
  line_link_key: 'はちみつセサミ',
};

export default TOUR;
