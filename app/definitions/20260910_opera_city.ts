import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: '千野哲太 Sax in the Opera City',
    short_name: 'オペラシティ',
    date_at: new Date('2026-09-10T19:00:00+09:00'),
    hall: '東京オペラシティ コンサートホール',
    tickets: [
      {
        name: 'ＶＩＰ席',
      },
      {
        name: '一般席',
      },
    ],
    distribution: [
      {
        campaign: '先行受付',
        play_guide: 'eplus',
        ticket: 'ＶＩＰ席',
        campaign_alias: 'プレオーダー受付',
        ticket_alias: 'ＶＩＰ席',
      },
      {
        campaign: '先行受付',
        play_guide: 'eplus',
        ticket: '一般席',
        campaign_alias: 'プレオーダー受付',
        ticket_alias: '一般席',
      },
      {
        campaign: '一般販売',
        play_guide: 'eplus',
        ticket: 'ＶＩＰ席',
        campaign_alias: '一般発売',
        ticket_alias: 'ＶＩＰ席',
      },
      {
        campaign: '一般販売',
        play_guide: 'eplus',
        ticket: '一般席',
        campaign_alias: '一般発売',
        ticket_alias: '一般席',
      },
      {
        campaign: '一般販売',
        play_guide: 'pia',
        ticket: '一般席',
        campaign_alias: '一般販売',
        ticket_alias: '一般席',
      },
    ],
  },
];

const CAMPAIGNS: Campaign[] = [
  {
    campaign_name: '先行受付',
    campaign_type: 'ByLottery', // 抽選販売
    reservation_start_at: new Date('2026-03-14T00:00:00+09:00'), // 予約受付開始日
    reservation_end_at: new Date('2026-03-26T23:59:00+09:00'), // 予約受付終了日
    lottery_at: new Date('2026-03-27T12:00:00+09:00'), // 抽選実施日
    settlement_at: new Date('2026-04-03T23:59:00+09:00'), // 入金期間が満了して販売数が確定する日
    sales_start_at: null,
  },
  {
    campaign_name: '一般販売',
    campaign_type: 'FirstCome',
    reservation_start_at: null,
    reservation_end_at: null,
    lottery_at: null,
    settlement_at: null,
    sales_start_at: new Date('2026-04-01T10:00:00+09:00'), // 発売日
  },
];

const DEFINITIONS: Tour = {
  event_code: '20260910_opera_city',
  name: '千野哲太 Sax in the Opera City',
  short_name: 'オペラシティ',
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
};

export default DEFINITIONS;
