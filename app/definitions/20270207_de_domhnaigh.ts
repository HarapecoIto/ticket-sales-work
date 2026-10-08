import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: 'ジェドゥーナ ～Solas～',
    display_name: 'ジェドゥーナ ～Solas～',
    short_name: 'ジェドゥーナ ～Solas～',
    date_at: new Date('2027-02-07T12:00:00+09:00'),
    hall: 'TOKYO NODE HALL',
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
        campaign: '一次先行販売',
        play_guide: 'eplus',
        ticket: 'VIP席',
        campaign_alias: '先着先行受付',
        ticket_alias: 'VIP席',
      },
      {
        campaign: '一次先行販売',
        play_guide: 'eplus',
        ticket: '一般席',
        campaign_alias: '先着先行受付',
        ticket_alias: '一般席',
      },
      {
        campaign: '二次先行販売',
        play_guide: 'eplus',
        ticket: 'VIP席',
        campaign_alias: '２次先着先行受付',
        ticket_alias: 'VIP席',
      },
      {
        campaign: '二次先行販売',
        play_guide: 'eplus',
        ticket: '一般席',
        campaign_alias: '２次先着先行受付',
        ticket_alias: '一般席',
      },
      {
        campaign: '一般販売',
        play_guide: 'eplus',
        ticket: 'VIP席',
        campaign_alias: '一般発売',
        ticket_alias: 'VIP席',
      },
      {
        campaign: '一般販売',
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
    campaign_name: '一次先行販売',
    campaign_type: 'FirstCome', // 先着販売
    reservation_start_at: null,
    reservation_end_at: null,
    lottery_at: null,
    settlement_at: null,
    sales_start_at: new Date('2026-10-10T12:00:00+09:00'), // 発売日
  },
  {
    campaign_name: '二次先行販売',
    campaign_type: 'FirstCome',
    reservation_start_at: null,
    reservation_end_at: null,
    lottery_at: null,
    settlement_at: null,
    sales_start_at: new Date('2026-11-21T12:00:00+09:00'), // 発売日
  },
  {
    campaign_name: '一般販売',
    campaign_type: 'FirstCome',
    reservation_start_at: null,
    reservation_end_at: null,
    lottery_at: null,
    settlement_at: null,
    sales_start_at: new Date('2027-01-01T12:00:00+09:00'), // 発売日
  },
];

const TOUR: Tour = {
  event_code: '20270207_de_domhnaigh',
  name: 'ジェドゥーナ ～Solas～',
  display_name: 'ジェドゥーナ ～Solas～',
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
  line_link_key: 'パクチーセロリ',
};

export default TOUR;
