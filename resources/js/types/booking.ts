import { Event } from "./event";
import { User } from "./user";
import { Ticket } from "./ticket";

export interface Booking {
  id: number;
  user_id: number;
  event_id: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  booking_time: string; // ISO DateTime format
  created_at?: string;
  updated_at?: string;

  user?: User;
  tickets?: Ticket[];
  event?: Event;
}
