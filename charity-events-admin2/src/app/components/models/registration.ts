export interface Registration {
  id: number;
  event_id: number;
  user_name: string;
  contact_email: string;
  num_tickets: number;
  registration_date: string;
  event_title?: string;
}