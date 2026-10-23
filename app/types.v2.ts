import { z } from 'zod';

const Concert = z.object({
  concert_code: z.string(),
  concert_name: z.string(),
  start_datetime: z.date(),
});
export type Concert = z.infer<typeof Concert>;

const Campaign = z.object({
  campaign_code: z.string(),
  campaign_name: z.string(),
});
export type Campaign = z.infer<typeof Campaign>;

const Ticket = z.object({
  ticket_code: z.string(),
  concert_code: z.string(),
  ticket_name: z.string(),
});
export type Ticket = z.infer<typeof Ticket>;

const Assignment = z.object({
  ticket_code: z.string(),
  assigned_number: z.number(),
  internal_ticket_name: z.string(),
});
export type Assignment = z.infer<typeof Assignment>;

const Reception = z.object({
  reception: z.string(),
  campaign_code: z.string(),
  reception_type: z.enum(['抽選販売', '先着販売']),
  application_deadline: z.date().nullable(),
  lottery_date: z.date().nullable(),
  payment_deadline: z.date().nullable(),
  confirmed_date: z.date().nullable(),
});
export type Reception = z.infer<typeof Reception>;

const DealtTicket = z.object({
  reception: z.string(),
  ticket_code: z.string(),
});
export type DealtTicket = z.infer<typeof DealtTicket>;

const EventPage = z.object({
  event_page_code: z.string(),
  event_page_name: z.string(),
  playguide: z.enum(['イープラス', 'ぴあ', 'ローソンチケット', 'teket']),
  playguide_meta_info: z.string(),
  assignments: z.array(Assignment),
  receptions: z.array(Reception),
  dealt_tickets: z.array(DealtTicket),
});
export type EventPage = z.infer<typeof EventPage>;

const ManualSales = z.record(
  z.string(),
  z.record(z.string(), z.record(z.string(), z.number().nullable()))
);
export type ManualSales = z.infer<typeof ManualSales>;

const Project = z.object({
  project_code: z.string(),
  project_name: z.string(),
  concerts: z.array(Concert),
  campaigns: z.array(Campaign),
  tickets: z.array(Ticket),
  event_pages: z.array(EventPage),
  manual_sales: ManualSales,
  line_keyword: z.string(),
});
export type Project = z.infer<typeof Project>;

export const parseProject = (data: string): Project | undefined => {
  try {
    return Project.parse(
      JSON.parse(data, (key, value) => {
        const dateKeys = [
          'start_datetime',
          'application_deadline',
          'lottery_date',
          'payment_deadline',
          'confirmed_date',
        ];
        if (dateKeys.includes(key)) {
          return new Date(value);
        }
        return value;
      })
    );
  } catch (e) {
    console.error('Failed to parse project data:', data, e);
    return undefined;
  }
};
