// 興行
export type Tour = {
  event_code: string; // 内部用
  name: string; // 正式名称
  display_name: string; // 表示最適化名（LINEの制約により20文字以内）
  concerts: Concert[];
  campaigns: Campaign[];
  line_link_key: string; // LINE連携用のキー
};

// 公演
export type Concert = {
  name: string; // 正式名称
  display_name: string; // 表示最適化名（20文字以内推奨）
  short_name: string; // データベース上で使用するコード
  date_at: Date;
  hall: string;
  tickets: Ticket[];
  distribution: Distribution[];
};

// FC先行、独占先行、一般発売など
export type Campaign = {
  campaign_name: string;
  campaign_type: 'ByLottery' | 'FirstCome';
  // 抽選の場合
  reservation_start_at: Date | null; // 抽選申込み開始日
  reservation_end_at: Date | null; // 抽選申込み終了日
  lottery_at: Date | null; // 抽選実施日
  settlement_at: Date | null; // 入金期間が満了して販売数が確定する日
  // 先着の場合
  sales_start_at: Date | null; // 発売日
};

// チケット種別
// ※サブチケット等は管理しない
export type Ticket = {
  name: string;
};

// 配券
export type Distribution = {
  campaign: string;
  play_guide: 'eplus' | 'pia' | 'lawson' | 'teket';
  ticket: string;
  campaign_alias: string;
  ticket_alias: string;
};

export type TicketSales = {
  campaign_name: string;
  aggregated_at: Date | null;
  play_guides: {
    play_guide: string;
    tickets: {
      ticket: string;
      applied_number: number | null;
      reserved_number: number | null;
      confirmed_number: number | null;
    }[];
  }[];
}[];

export enum ConversationState {
  WaitingForEventCodeForLinking = 'waiting_for_event_code_for_linking',
  WaitingForEventCodeForUnlinking = 'waiting_for_event_code_for_unlinking',
}
