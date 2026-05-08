import type { Concert, Performance, Campaign } from '../types/types';

const PERFORMANCES: Performance[] = [
  {
    name: '新潟公演',
    short_name: '新潟公演',
    date_at: new Date('2026-07-12T15:30:00'),
    hall: 'ジョイア・ミーア',
    tickets: [
      {
        name: '一般席',
        price: 6600,
        number: 110,
      },
    ],
  },
  {
    name: '山梨公演',
    short_name: '山梨公演',
    date_at: new Date('2026-07-24T15:00:00'),
    hall: '桜座',
    tickets: [
      {
        name: '一般席',
        price: 6600,
        number: 150,
      },
    ],
  },
];

const CAMPAIGNS: Campaign[] = [
  {
    campaign_name: 'FC先行',
    campaign_type: 'ByLottery',
    reservation_start_at: new Date('2026-05-01T10:00:00'), // dummy
    reservation_end_at: new Date('2026-05-10T23:59:00'), // dummy
    lottery_at: new Date('2026-05-15T12:00:00'), // dummy
    sales_start_at: new Date('2026-05-20T10:00:00'), // dummy
    distribution: [{ play_guide: 'イープラス', ticket_names: ['一般席'] }],
  },
  {
    campaign_name: '一般先行',
    campaign_type: 'ByLottery',
    reservation_start_at: new Date('2026-05-01T10:00:00'), // dummy
    reservation_end_at: new Date('2026-05-10T23:59:00'), // dummy
    lottery_at: new Date('2026-05-15T12:00:00'), // dummy
    sales_start_at: new Date('2026-05-20T10:00:00'), // dummy
    distribution: [
      { play_guide: 'イープラス', ticket_names: ['一般席'] },
      { play_guide: 'チケットぴあ', ticket_names: ['一般席'] },
      { play_guide: 'ローソンチケット', ticket_names: ['一般席'] },
    ],
  },
  {
    campaign_name: '一般発売',
    campaign_type: 'FirstCome',
    reservation_start_at: new Date('2026-05-01T10:00:00'), // dummy
    reservation_end_at: new Date('2026-05-10T23:59:00'), // dummy
    lottery_at: new Date('2026-05-15T12:00:00'), // dummy
    sales_start_at: new Date('2026-05-20T10:00:00'), // dummy
    distribution: [
      { play_guide: 'イープラス', ticket_names: ['一般席'] },
      { play_guide: 'チケットぴあ', ticket_names: ['一般席'] },
      { play_guide: 'ローソンチケット', ticket_names: ['一般席'] },
    ],
  },
];

const DEFINITIONS: Concert = {
  event_code: '20260712_fujita_niigata',
  name: '藤田麻衣子 20th Anniversary Live Tour 2026',
  short_name: '藤田麻衣子',
  campaigns: CAMPAIGNS,
  performances: PERFORMANCES,
};

export default DEFINITIONS;
