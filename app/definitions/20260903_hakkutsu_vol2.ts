import type { Tour, Concert, Campaign } from '../types';

const CONCERTS: Concert[] = [
  {
    name: '未来の音楽家発掘コンサートvol.2',
    display_name: '未来の音楽家発掘コンサートvol.2',
    short_name: '未来の音楽家発掘コンサートvol.2',
    date_at: new Date('2026-09-03T18:00:00+09:00'),
    hall: '浜離宮朝日ホール 小ホール',
    tickets: [
      {
        name: '一般',
      },
      {
        name: '学生',
      },
    ],
    distribution: [
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '一般',
        campaign_alias: '一般販売',
        ticket_alias: '9/3(木) 18:00::一般::自由席::通常料金',
      },
      {
        campaign: '一般販売',
        play_guide: 'teket',
        ticket: '学生',
        campaign_alias: '一般販売',
        ticket_alias: '9/3(木) 18:00::学生::自由席::通常料金',
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
  event_code: '20260903_hakkutsu_vol2',
  name: '未来の音楽家発掘コンサートvol.2',
  display_name: '未来の音楽家発掘コンサートvol.2',
  campaigns: CAMPAIGNS,
  concerts: CONCERTS,
  line_link_key: 'チョコピスタチオ',
};

export default TOUR;
