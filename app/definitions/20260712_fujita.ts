import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: '藤田麻衣子 20th Anniversary Live Tour 2026 新潟公演',
    display_name: '新潟公演',
    short_name: '新潟公演',
    date_at: new Date('2026-07-12T15:30:00+09:00'),
    hall: 'ジョイア・ミーア',
    tickets: [
      {
        name: '一般席',
      },
    ],
    distribution: [
      {
        campaign: 'FC先行',
        play_guide: 'eplus',
        ticket: '一般席',
        campaign_alias: 'ＦＣ限定抽選先行受付',
        ticket_alias: '全席自由席',
      },
      {
        campaign: '一般先行',
        play_guide: 'eplus',
        ticket: '一般席',
        campaign_alias: 'プレオーダー受付',
        ticket_alias: '全席自由席',
      },
      {
        campaign: '一般発売',
        play_guide: 'eplus',
        ticket: '一般席',
        campaign_alias: '一般発売',
        ticket_alias: '全席自由席',
      },
      {
        campaign: '一般発売',
        play_guide: 'lawson',
        ticket: '一般席',
        campaign_alias: '一般販売',
        ticket_alias: '全席自由席',
      },
      {
        campaign: '一般発売',
        play_guide: 'pia',
        ticket: '一般席',
        campaign_alias: '一般販売',
        ticket_alias: '全席自由席',
      },
    ],
  },
  {
    name: '藤田麻衣子 20th Anniversary Live Tour 2026 山梨公演',
    display_name: '山梨公演',
    short_name: '山梨公演',
    date_at: new Date('2026-07-24T15:00:00+09:00'),
    hall: '桜座',
    tickets: [
      {
        name: '一般席',
      },
    ],
    distribution: [
      {
        campaign: 'FC先行',
        play_guide: 'eplus',
        ticket: '一般席',
        campaign_alias: 'ＦＣ限定抽選先行受付',
        ticket_alias: '全席自由席',
      },
      {
        campaign: '一般先行',
        play_guide: 'eplus',
        ticket: '一般席',
        campaign_alias: 'プレオーダー受付',
        ticket_alias: '全席自由席',
      },
      {
        campaign: '一般発売',
        play_guide: 'eplus',
        ticket: '一般席',
        campaign_alias: '一般発売',
        ticket_alias: '全席自由席',
      },
      {
        campaign: '一般発売',
        play_guide: 'lawson',
        ticket: '一般席',
        campaign_alias: '一般販売',
        ticket_alias: '全席自由席',
      },
      {
        campaign: '一般発売',
        play_guide: 'pia',
        ticket: '一般席',
        campaign_alias: '一般販売',
        ticket_alias: '全席自由席',
      },
    ],
  },
];

const CAMPAIGNS: Campaign[] = [
  {
    campaign_name: 'FC先行',
    campaign_type: 'ByLottery', // 抽選販売
    reservation_start_at: new Date('2026-03-07T00:00:00+09:00'), // 予約受付開始日
    reservation_end_at: new Date('2026-03-15T23:59:00+09:00'), // 予約受付終了日
    lottery_at: new Date('2026-03-16T12:00:00+09:00'), // 抽選実施日
    settlement_at: new Date('2026-03-21T23:59:00+09:00'), // 入金期間が満了して販売数が確定する日
    sales_start_at: null,
  },
  {
    campaign_name: '一般先行',
    campaign_type: 'ByLottery', // 抽選販売
    reservation_start_at: new Date('2026-03-20T00:00:00+09:00'), // 予約受付開始日
    reservation_end_at: new Date('2026-03-29T23:59:00+09:00'), // 予約受付終了日
    lottery_at: new Date('2026-03-30T00:00:00+09:00'), // 抽選実施日
    settlement_at: new Date('2026-04-03T23:59:00+09:00'), // 入金期間が満了して販売数が確定する日
    sales_start_at: null,
  },
  {
    campaign_name: '一般発売',
    campaign_type: 'FirstCome', // 先着販売
    reservation_start_at: null,
    reservation_end_at: null,
    lottery_at: null,
    settlement_at: null,
    sales_start_at: new Date('2026-04-04T00:00:00+09:00'), // 発売日
  },
];

const TOUR: Tour = {
  event_code: '20260712_fujita',
  name: '藤田麻衣子 20th Anniversary Live Tour 2026',
  display_name: '藤田麻衣子',
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
  line_link_key: 'レモントマト',
};

export default TOUR;
