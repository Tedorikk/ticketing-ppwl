<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PDF;

class TicketingController extends Controller
{
    // CRUD Basic
    public function index(Request $request)
{
    $bookings = Booking::with(['event', 'user'])
        ->latest()
        ->get();

    return Inertia::render('user/ticket/index', [
        'bookings' => $bookings,
    ]);
}
    
    public function show(Ticket $ticket) {
        return $ticket->load(['booking', 'seat', 'event', 'user']);
    }
    
    public function store(Request $request) {
        return Ticket::create($request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'seat_id' => 'required|exists:seats,id',
            'event_id' => 'required|exists:events,id',
            'user_id' => 'required|exists:users,id',
            'price' => 'required|numeric'
        ]));
    }
    
    public function update(Request $request, Ticket $ticket) {
        $ticket->update($request->validate([
            'seat_id' => 'sometimes|exists:seats,id',
            'status' => 'sometimes|in:valid,used,cancelled'
        ]));
        return $ticket;
    }
    
    public function delete(Ticket $ticket) {
        $ticket->delete();
        return response()->noContent();
    }

    // Existing methods
    public function generate(Booking $booking) { /* ... */ }
    public function validateQR(Request $request) { /* ... */ }
}

