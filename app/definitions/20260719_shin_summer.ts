import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: 'シン・サマー・オーケストラコンサート Opera 編',
    short_name: 'シン・サマー',
    date_at: new Date('2026-07-19T18:30:00+09:00'),
    hall: '浜離宮朝日ホール',
    tickets: [
      {
        name: 'めちゃくちゃ応援席',
      },
      {
        name: 'めっちゃ応援席',
      },
      {
        name: '応援席',
      },
      {
        name: 'はじめてのオペラ招待席（後払い投げ銭）',
      },
    ],
    distribution: [
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: 'めちゃくちゃ応援席',
        campaign_alias: '一般販売',
        ticket_alias: 'めちゃくちゃ応援席',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: 'めっちゃ応援席',
        campaign_alias: '一般販売',
        ticket_alias: 'めっちゃ応援席',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '応援席',
        campaign_alias: '一般販売',
        ticket_alias: '応援席',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: 'はじめてのオペラ招待席',
        campaign_alias: '一般販売',
        ticket_alias: 'はじめてのオペラ招待席（後払い投げ銭）',
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

const DEFINITIONS: Tour = {
  event_code: '20260719_shin_summer',
  name: 'シン・サマー・オーケストラコンサート Opera 編',
  short_name: 'シン・サマー',
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
};

export default DEFINITIONS;
