import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: 'ピアノとチェロのオーケストラコンサート 山本貴志を迎えて',
    display_name: 'ピアノとチェロ 山本貴志を迎えて',
    short_name: 'デフォルト',
    date_at: new Date('2026-10-26T19:00:00+09:00'),
    hall: '浜離宮朝日ホール',
    tickets: [
      {
        name: '通常チケット',
      },
      {
        name: '補助金子ども',
      },
      {
        name: '補助金同伴者',
      },
    ],
    distribution: [
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '通常チケット',
        campaign_alias: '一般販売',
        ticket_alias: '10/10(土) 14:00::通常チケット::指定席::通常料金',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '補助金子ども',
        campaign_alias: '一般販売',
        ticket_alias:
          '10/10(土) 14:00::支援チケット「劇場・音楽堂等における子供芸術鑑賞体験支援事業」::指定席::通常料金',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '補助金同伴者',
        campaign_alias: '一般販売',
        ticket_alias:
          '10/10(土) 14:00::支援チケット「劇場・音楽堂等における子供芸術鑑賞体験支援事業」::指定席::同伴者',
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

const TOUR: Tour = {
  event_code: '20261010_piano_and_cello',
  name: 'ピアノとチェロのオーケストラコンサート 山本貴志を迎えて',
  display_name: 'ピアノとチェロ 山本貴志を迎えて', // 最大20文字まで
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
  line_link_key: 'アボカドキャラメル',
};

export default TOUR;
