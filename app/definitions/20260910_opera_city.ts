import type { Concert, Performance, Campaign } from '../types/types';

const PERFORMANCES: Performance[] = [
  {
    name: '千野哲太 Sax in the Opera City',
    short_name: 'オペラシティ',
    date_at: new Date('2026-09-10T19:00:00'),
    hall: '東京オペラシティ コンサートホール',
    tickets: [
      {
        name: 'VIP席',
        price: 13200,
        number: 50,
      },
      {
        name: '一般席',
        price: 6600,
        number: 110,
      },
    ],
  },
];

const CAMPAIGNS: Campaign[] = [
  {
    campaign_name: '一般先行',
    campaign_type: 'ByLottery',
    reservation_start_at: new Date('2026-05-01T10:00:00'), // dummy
    reservation_end_at: new Date('2026-05-10T23:59:00'), // dummy
    lottery_at: new Date('2026-05-15T12:00:00'), // dummy
    sales_start_at: new Date('2026-05-20T10:00:00'), // dummy
    distribution: [
      { play_guide: 'イープラス', ticket_names: ['VIP席'] },
      { play_guide: 'イープラス', ticket_names: ['一般席'] },
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
      { play_guide: 'teket', ticket_names: ['一般席'] },
    ],
  },
];

const DEFINITIONS: Concert = {
  event_code: '20260910_opera_city',
  name: '千野哲太 Sax in the Opera City',
  short_name: 'オペラシティ',
  campaigns: CAMPAIGNS,
  performances: PERFORMANCES,
};

export default DEFINITIONS;
