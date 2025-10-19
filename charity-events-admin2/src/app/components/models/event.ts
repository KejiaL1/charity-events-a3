export interface Event {
  id: number;
  title: string;
  category_id: number;
  org_id: number;
  description: string;
  purpose: string;
  venue: string;
  city: string;
  state: string;
  start_datetime: string;
  end_datetime: string;
  ticket_price_cents: number;
  is_free: boolean;
  target_amount_cents: number;
  raised_amount_cents: number;
  status: 'upcoming' | 'past' | 'paused';
  hero_image_url: string;
  category_name?: string;
  org_name?: string;
  total_registrations?: number;
}
