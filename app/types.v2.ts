export type Concert = {
  concert_code: string;
  concert_name: string;
  start_datetime: Date;
};

export type Campaign = {
  campaign_code: string;
  campaign_name: string;
};

export type Ticket = {
  ticket_code: string;
  concert_code: string;
  ticket_name: string;
};

export type Assignment = {
  ticket_code: string;
  assigned_number: number;
  internal_ticket_name: string;
};

export type Reception = {
  reception: string;
  campaign_code: string;
  reception_type: '抽選販売' | '先着販売';
  application_deadline: Date | null;
  lottery_date: Date | null;
  payment_deadline: Date | null;
  confirmed_date: Date | null;
};

export type DealtTicket = {
  reception: string;
  ticket_code: string;
};

export type EventPage = {
  event_page_code: string;
  event_page_name: string;
  playguide: 'イープラス' | 'ぴあ' | 'ローソンチケット' | 'teket';
  playguide_meta_info: string;
  assignments: Assignment[];
  receptions: Reception[];
  dealt_tickets: DealtTicket[];
};

export type Project = {
  project_code: string;
  project_name: string;
  concerts: Concert[];
  campaigns: Campaign[];
  tickets: Ticket[];
  event_pages: EventPage[];
  line_keyword: string;
};
