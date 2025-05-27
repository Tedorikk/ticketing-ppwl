<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;


class TicketingController extends Controller
{
    // CRUD Basic
    public function index() {
        return Ticket::with(['booking', 'user', 'event'])->paginate();
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

    public function generate(Booking $booking)
    {
    // Validasi status booking
    if ($booking->status !== 'confirmed') {
        abort(403, 'Hanya bisa generate tiket untuk booking yang sudah dikonfirmasi');
    }

    // Pastikan tiket sudah dibuat
    if ($booking->tickets->isEmpty()) {
        abort(404, 'Tiket belum tersedia untuk booking ini');
    }

    $data = [
        'booking' => $booking->load('tickets.seat', 'user', 'event'),
        'tickets' => $booking->tickets
    ];

    return Pdf::loadView('tickets.pdf', $data)
        ->setPaper('A4')
        ->download("Tiket-{$booking->event->name}-{$booking->id}.pdf");

    }

    public function validateQR(Request $request)
    {
    $validated = $request->validate([
        'ticket_id' => 'required|uuid|exists:tickets,id'
    ]);

    $ticket = Ticket::find($validated['ticket_id']);

    // Cek tiket sudah digunakan
    if ($ticket->used_at) {
        return response()->json([
            'status' => 'error',
            'message' => 'Tiket sudah digunakan pada: ' . $ticket->used_at->format('d M Y H:i')
        ], 400);
    }

    // Update status
    $ticket->update([
        'used_at' => now(),
        'status' => 'used'
    ]);

    return response()->json([
        'status' => 'success',
        'data' => $ticket->load('event', 'seat', 'user'),
        'message' => 'Tiket valid!'
    ]);
    }


}

