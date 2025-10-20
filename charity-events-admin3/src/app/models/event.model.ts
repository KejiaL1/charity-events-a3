export interface Event {
  id?: number;
  title: string;
  description: string;
  city: string;
  state: string;
  start_datetime: string;
  end_datetime: string;
  category_id: number;
  org_id: number;
  hero_image_url?: string;
  ticket_price_cents?: number;
  is_free: boolean;
  
  // 以下是从关联表中获取的字段
  category?: string;
  category_name?: string;  
  org_name?: string;
  org_about?: string;      
  contact_email?: string; 
  total_registrations?: number;
}

export interface EventRegistration {
  id?: number;
  event_id: number;
  user_name: string;
  contact_email: string;
  num_tickets: number;
  created_at?: string;
}