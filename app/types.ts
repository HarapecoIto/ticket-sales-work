// 興行
export type Tour = {
  event_code: string; // 社内用
  name: string;
  short_name: string;
  concerts: Concert[];
  campaigns: Campaign[];
};

// 公演
export type Concert = {
  name: string;
  short_name: string;
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
  event_code: string;
  concert_short_name: string;
  campaign: string;
  play_guide: 'eplus' | 'pia' | 'lawson' | 'teket';
  aggregated_at: Date;
  ticket: string;
  applied_number: number | null;
  reserved_number: number | null;
  confirmed_number: number | null;
};

export enum ConversationState {
  WaitingForEventCodeForLinking = 'waiting_for_event_code_for_linking',
  WaitingForEventCodeForUnlinking = 'waiting_for_event_code_for_unlinking',
}
