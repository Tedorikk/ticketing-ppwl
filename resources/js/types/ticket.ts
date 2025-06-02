import { Seat } from "./seat";
import { Event } from "./event";
import { Booking } from "./booking";

export interface Ticket {
    id: string;
    booking_id: string;
    seat_id: string;
    event_id: string;
    user_id: string;
    price: number;
    status: 'valid' | 'used' | 'cancelled';
    used_at?: string;
    event: Event;
    seat: Seat;
    booking: Booking;
    created_at?: string;
    updated_at?: string;
}