// 興行
export type Event = {
  event_code: string;
  name: string;
  short_name: string;
  performances: Performance[];
};

// 公演
export type Performance = {
  name: string;
  short_name: string;
  date_at: Date;
  hall: string;
  campaigns: Campaign[];
};

// FC先行、独占先行、一般発売など
export type Campaign = {
  campaign_name: string;
  tickets: Ticket[];
  campaign_type: 'ByLottery' | 'FirstCome';
  reservation_start_at: Date | null;
  reservation_end_at: Date | null;
  lottery_at: Date | null;
  sales_start_at: Date | null;
  distribution: Distribution[];
  line_info: LineInfo;
  spread_sheet_info: SpreadSheetInfo;
};

export type Ticket = {
  name: string;
  price: number;
  number: number;
};

// 配券
export type Distribution = {
  play_guide: PiaInfo | EPlusInfo | TicketInfo | TeketInfo;
  tickets: Ticket[];
};

// 各プレイガイド用メタデータ
export type PiaInfo = {
  name: string;
  event_code: string;
};

export type EPlusInfo = {
  name: string;
  event_code: string;
};

export type TicketInfo = {
  name: string;
  event_code: string;
};

export type TeketInfo = {
  name: string;
  event_code: string;
};

// 配信先LINEグループ
export type LineInfo = {
  line_group_id: number;
};

// 転記先スプレッドシート
export type SpreadSheetInfo = {
  url: string;
  refference_cell: string;
};
