// 興行
export type Concert = {
  event_code: string; // 社内用
  name: string;
  short_name: string;
  performances: Performance[];
  campaigns: Campaign[];
};

// 公演
export type Performance = {
  name: string;
  short_name: string;
  date_at: Date;
  hall: string;
  tickets: Ticket[];
};

// FC先行、独占先行、一般発売など
export type Campaign = {
  campaign_name: string;
  campaign_type: 'ByLottery' | 'FirstCome';
  reservation_start_at: Date | null;
  reservation_end_at: Date | null;
  lottery_at: Date | null;
  sales_start_at: Date | null;
  distribution: Distribution[];
};

export type Ticket = {
  name: string;
  price: number;
  number: number;
};

// 配券
export type Distribution = {
  play_guide: 'イープラス' | 'チケットぴあ' | 'ローソンチケット' | 'teket';
  ticket_names: string[];
};

// 各プレイガイド用メタデータ
export type PiaInfo = {
  name: string;
  event_code: string; // ぴあコード
};

export type EPlusInfo = {
  name: string;
  event_code: string; // イープラスコード
};

export type LawsonInfo = {
  name: string;
  event_code: string; // ローソンコード
};

export type TeketInfo = {
  name: string;
  event_code: string; // teketコード
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
