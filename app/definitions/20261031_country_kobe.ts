import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: 'オータムカントリーツアー2026 神戸公演',
    display_name: 'オータムカントリーツアー2026 神戸公演',
    short_name: 'オータムカントリーツアー2026 神戸公演',
    date_at: new Date('2026-10-31T19:00:00+09:00'),
    hall: '神戸朝日ホール',
    tickets: [
      {
        name: 'VIP',
      },
      {
        name: 'S',
      },
      {
        name: 'A',
      },
      {
        name: '補助金通常',
      },
      {
        name: '補助金保護者',
      },
    ],
    distribution: [
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: 'VIP',
        campaign_alias: '一般販売',
        ticket_alias: '10/31(土) 16:00::VIP::指定席::通常料金',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: 'S',
        campaign_alias: '一般販売',
        ticket_alias: '10/31(土) 16:00::S::指定席::通常料金',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: 'A',
        campaign_alias: '一般販売',
        ticket_alias: '10/31(土) 16:00::A::指定席::通常料金',
      },
      {
        campaign: '補助金対象販売',
        play_guide: 'teket',
        ticket: '補助金通常',
        campaign_alias: '補助金対象販売',
        ticket_alias:
          '10/31(土) 16:00::【18歳以下】劇場・音楽堂等における子供芸術鑑賞体験支援事業::指定席::通常料金',
      },
      {
        campaign: '補助金対象販売',
        play_guide: 'teket',
        ticket: '補助金保護者',
        campaign_alias: '補助金対象販売',
        ticket_alias:
          '10/31(土) 16:00::【18歳以下】劇場・音楽堂等における子供芸術鑑賞体験支援事業::指定席::【保護者】劇場・音楽堂等における子供芸術鑑賞体験支援事業',
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
  {
    campaign_name: '補助金対象販売',
    campaign_type: 'FirstCome', // 先着販売
    reservation_start_at: null,
    reservation_end_at: null,
    lottery_at: null,
    settlement_at: null,
    sales_start_at: null,
  },
];

const TOUR: Tour = {
  event_code: '20261031_country_kobe',
  name: 'オータムカントリーツアー2026 神戸公演',
  display_name: 'オータムカントリーツアー2026 神戸公演', // 最大20文字まで
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
  line_link_key: 'バナナはくさい',
};

export default TOUR;
