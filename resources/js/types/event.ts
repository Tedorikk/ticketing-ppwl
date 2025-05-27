export interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  event_date: string; // ISO Date format (e.g., "2025-05-27")
  start_time: string; // ISO DateTime format (e.g., "2025-05-27T14:00:00Z")
  end_time: string;   // ISO DateTime format
  status: string;
  organizer_id: number;
  max_seats: number;
  price: number;
  created_at?: string;
  updated_at?: string;
}
