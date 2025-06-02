<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class TicketingController extends Controller
{
    /**
     * Display user's tickets
     */
    public function index(Request $request)
    {
        $tickets = Ticket::where('user_id', Auth::id())
            ->with(['booking', 'seat', 'event'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Always calculate stats, even if tickets collection is empty
        $stats = [
            'total_tickets' => $tickets->count(),
            'confirmed_tickets' => $tickets->where('status', 'confirmed')->count(),
            'used_tickets' => $tickets->where('status', 'used')->count(),
            'pending_tickets' => $tickets->where('status', 'booked')->count(),
        ];

        return Inertia::render('user/tickets/index', [
            'tickets' => $tickets,
            'stats' => $stats
        ]);
    }

    /**
     * Show specific ticket details
     */
    public function show(Ticket $ticket) 
    {
        // Check if user owns this ticket
        if ($ticket->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to ticket');
        }

        $ticket->load(['booking', 'seat', 'event', 'user']);

        return Inertia::render('user/tickets/show', [
            'ticket' => $ticket
        ]);
    }

    /**
     * Generate PDF tickets for booking
     */
    public function generate(Booking $booking) 
    {
        // Check if user owns this booking
        if ($booking->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        $booking->load(['tickets.seat', 'event', 'user']);
        
        // Generate PDF using dompdf
        $pdf = Pdf::loadView('pdf.booking-tickets', [
            'booking' => $booking
        ]);
        
        // Return PDF download response
        return $pdf->download('booking-' . $booking->id . '-tickets.pdf');
    }

    /**
     * Download individual ticket PDF
     */
    public function downloadTicket(Ticket $ticket)
    {
        // Check if user owns this ticket
        if ($ticket->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        $ticket->load(['booking', 'seat', 'event', 'user']);
        
        // Generate individual ticket PDF
        $pdf = Pdf::loadView('pdf.single-ticket', [
            'ticket' => $ticket
        ]);
        
        return $pdf->download('ticket-' . $ticket->id . '.pdf');
    }

    /**
     * Validate QR code (for staff/admin use)
     */
    public function validateQR(Request $request) 
    {
        $request->validate([
            'ticket_id' => 'required|exists:tickets,id'
        ]);

        $ticket = Ticket::with(['booking', 'seat', 'event', 'user'])
                       ->find($request->ticket_id);

        if (!$ticket) {
            return response()->json(['valid' => false, 'message' => 'Ticket not found']);
        }

        if ($ticket->status !== 'confirmed') {
            return response()->json(['valid' => false, 'message' => 'Ticket is not confirmed']);
        }

        if ($ticket->status === 'used') {
            return response()->json(['valid' => false, 'message' => 'Ticket already used']);
        }

        // Mark ticket as used
        $ticket->update([
            'status' => 'used',
            'used_at' => now()
        ]);

        return response()->json([
            'valid' => true, 
            'message' => 'Ticket validated successfully',
            'ticket' => $ticket
        ]);
    }

    // Admin methods
    public function store(Request $request) 
    {
        return Ticket::create($request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'seat_id' => 'required|exists:seats,id',
            'event_id' => 'required|exists:events,id',
            'user_id' => 'required|exists:users,id',
            'price' => 'required|numeric'
        ]));
    }
    
    public function update(Request $request, Ticket $ticket) 
    {
        $ticket->update($request->validate([
            'seat_id' => 'sometimes|exists:seats,id',
            'status' => 'sometimes|in:booked,confirmed,used,cancelled'
        ]));
        return $ticket;
    }
    
    public function delete(Ticket $ticket) 
    {
        $ticket->delete();
        return response()->noContent();
    }
}
