export interface Seat {
    id: string;
    section: string;
    row: string;
    seat_number: string;
    status: 'available' | 'booked' | 'occupied';
}