import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: '第4回タクティカートオーケストラ定期演奏会 マーラー5.0',
    display_name: 'タクティオケ マーラー5.0',
    short_name: 'タクティオケ マーラー5.0',
    date_at: new Date('2026-11-08T18:00:00+09:00'),
    hall: 'みなとみらいホール 大ホール',
    tickets: [
      {
        name: '応援席',
      },
      {
        name: 'Ｓ席',
      },
      {
        name: 'Ａ席',
      },
      {
        name: '学生席',
      },
      {
        name: '投げ銭席',
      },
    ],
    distribution: [
      {
        campaign: '先行販売',
        play_guide: 'eplus',
        ticket: '応援席',
        campaign_alias: '座席選択先行受付',
        ticket_alias: '応援席',
      },
      {
        campaign: '先行販売',
        play_guide: 'eplus',
        ticket: 'Ｓ席',
        campaign_alias: '座席選択先行受付',
        ticket_alias: 'Ｓ席',
      },
      {
        campaign: '一般販売',
        play_guide: 'eplus',
        ticket: '応援席',
        campaign_alias: '一般発売', // イープラスの用語は「一般販売」ではなく「一般発売」
        ticket_alias: '応援席',
      },
      {
        campaign: '一般販売',
        play_guide: 'eplus',
        ticket: 'Ｓ席',
        campaign_alias: '一般発売', // イープラスの用語は「一般販売」ではなく「一般発売」
        ticket_alias: 'Ｓ席',
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
        ticket: '学生席',
        campaign_alias: '一般発売', // イープラスの用語は「一般販売」ではなく「一般発売」
        ticket_alias: '学生席',
      },
      {
        campaign: '一般販売',
        play_guide: 'eplus',
        ticket: '投げ銭席',
        campaign_alias: '一般発売', // イープラスの用語は「一般販売」ではなく「一般発売」
        ticket_alias: '投げ銭席',
      },
      {
        campaign: '一般販売',
        play_guide: 'pia',
        ticket: 'Ａ席',
        campaign_alias: '一般販売', // ぴあは「一般販売」
        ticket_alias: 'Ａ席',
      },
      {
        campaign: '一般販売',
        play_guide: 'pia',
        ticket: '学生席',
        campaign_alias: '一般販売', // ぴあは「一般販売」
        ticket_alias: '学生席',
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
    sales_start_at: new Date('2026-06-24T18:00:00+09:00'), // 発売日
  },
  {
    campaign_name: '一般販売',
    campaign_type: 'FirstCome',
    reservation_start_at: null,
    reservation_end_at: null,
    lottery_at: null,
    settlement_at: null,
    sales_start_at: new Date('2026-07-11T10:00:00+09:00'), // 発売日
  },
];

const TOUR: Tour = {
  event_code: '20261108_tacticart_orchestra',
  name: '第4回タクティカートオーケストラ定期演奏会 マーラー5.0',
  display_name: 'タクティオケ マーラー5.0',
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
  line_link_key: 'いちごとうもころし',
};

export default TOUR;
