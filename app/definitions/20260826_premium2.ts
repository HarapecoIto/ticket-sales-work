import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: '名曲プレミアムクラシックVol.2',
    display_name: '名曲プレミアムクラシックVol.2',
    short_name: '名曲プレミアムクラシックVol.2',
    date_at: new Date('2026-08-26T12:30:00+09:00'),
    hall: '浜離宮朝日ホール',
    tickets: [
      {
        name: '一般',
      },
      {
        name: '18歳以下',
      },
      {
        name: '保護者',
      },
    ],
    distribution: [
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '一般',
        campaign_alias: '一般販売',
        ticket_alias: '8/26(水) 12:30::一般::指定席::通常料金',
      },
      {
        campaign: '補助金対象販売',
        play_guide: 'teket',
        ticket: '18歳以下',
        campaign_alias: '補助金対象販売',
        ticket_alias:
          '8/26(水) 12:30::【18歳以下】劇場・音楽堂等における子供芸術鑑賞体験支援事業::指定席::通常料金',
      },
      {
        campaign: '補助金対象販売',
        play_guide: 'teket',
        ticket: '保護者',
        campaign_alias: '補助金対象販売',
        ticket_alias:
          '8/26(水) 12:30::【18歳以下】劇場・音楽堂等における子供芸術鑑賞体験支援事業::指定席::【保護者】劇場・音楽堂等における子供芸術鑑賞体験支援事業',
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
  event_code: '20260826_premium2',
  name: '名曲プレミアムクラシックVol.2',
  display_name: '名曲プレミアムクラシックVol.2',
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
  line_link_key: 'だいだいモロヘイヤ',
};

export default TOUR;
