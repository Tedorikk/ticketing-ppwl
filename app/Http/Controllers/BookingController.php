<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateBookingRequest;
use App\Models\Booking;
use App\Models\Event;
use App\Models\Seat;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Display user's bookings - redirect to existing page
     */
    public function index()
    {
        $bookings = Booking::where('user_id', Auth::id())
                        ->with(['event', 'tickets.seat'])
                        ->orderBy('booking_time', 'desc')
                        ->get();
        
        return Inertia::render('user/bookings/index', [
            'bookings' => $bookings
        ]);
    }

    /**
     * Create a new booking
     */
    public function store(CreateBookingRequest $request, Event $event)
    {
        try {
            $booking = DB::transaction(function () use ($request, $event) {
                // Validate seats availability
                $seats = Seat::where('event_id', $event->id)
                           ->whereIn('id', $request->seat_ids)
                           ->where('status', 'available')
                           ->lockForUpdate()
                           ->get();
                
                // Check if all requested seats are available
                if ($seats->count() !== count($request->seat_ids)) {
                    throw new Exception('Some seats are no longer available');
                }
                
                // Calculate total amount
                $totalAmount = $seats->sum('price');
                
                // Create booking
                $booking = Booking::create([
                    'user_id' => Auth::id(),
                    'event_id' => $event->id,
                    'total_amount' => $totalAmount,
                    'status' => 'pending',
                    'booking_time' => now(),
                ]);
                
                // Create tickets and update seats
                foreach ($seats as $seat) {
                    // Create ticket
                    Ticket::create([
                        'booking_id' => $booking->id,
                        'seat_id' => $seat->id,
                        'event_id' => $event->id,
                        'user_id' => Auth::id(),
                        'price' => $seat->price,
                        'status' => 'booked',
                    ]);
                    
                    // Book the seat
                    $seat->update([
                        'user_id' => Auth::id(),
                        'status' => 'sold',
                        'booking_time' => now()
                    ]);
                }
                
                return $booking;
            });
            
            // Redirect to dashboard with success message
            return redirect()->route('user.dashboard')
                ->with('success', 'Booking created successfully! Your seats have been reserved.');
            
        } catch (Exception $e) {
            // Return back with error message
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Show specific booking
     */
    /**
     * Show specific booking with detailed information
     */
    public function show(Booking $booking)
    {
        // Check if user owns this booking
        if ($booking->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to booking');
        }
        
        // Load all related data
        $booking->load([
            'event',
            'tickets.seat',
            'user'
        ]);
        
        return Inertia::render('user/bookings/show', [
            'booking' => $booking
        ]);
    }

    /**
     * Confirm booking (after payment)
     */
    public function confirm(Booking $booking)
    {
        // Check if user owns this booking
        if ($booking->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }
        
        if ($booking->status !== 'pending') {
            return redirect()->back()->withErrors(['error' => 'Booking cannot be confirmed']);
        }
        
        try {
            DB::transaction(function () use ($booking) {
                // Update booking status
                $booking->update(['status' => 'confirmed']);
                
                // Update all tickets status
                $booking->tickets()->update(['status' => 'confirmed']);
            });
            
            return redirect()->back()
                ->with('success', 'Booking confirmed successfully!');
            
            } catch (Exception $e) {
                return redirect()->back()
                    ->with('error', 'Failed to confirm booking');
            }
    }

    /**
     * Cancel booking
     */
    public function cancel(Booking $booking)
    {
        // Check if user owns this booking
        if ($booking->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }
        
        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return redirect()->back()->withErrors(['error' => 'Booking cannot be cancelled']);
        }
        
        try {
            DB::transaction(function () use ($booking) {
                // Release all seats
                foreach ($booking->tickets as $ticket) {
                    Seat::where('id', $ticket->seat_id)->update([
                        'user_id' => null,
                        'status' => 'available',
                        'booking_time' => null
                    ]);
                }
                
                // Update booking status
                $booking->update(['status' => 'cancelled']);
                
                // Update tickets status
                $booking->tickets()->update(['status' => 'cancelled']);
            });
            
            return redirect()->back()
                ->with('success', 'Booking cancelled successfully!');
            
            } catch (Exception $e) {
                return redirect()->back()
                    ->with('error', 'Failed to cancel booking');
            }
    }

    /**
     * Use ticket (mark as used)
     */
    public function useTicket(Request $request, Booking $booking)
    {
        $request->validate([
            'ticket_id' => 'required|exists:tickets,id'
        ]);
        
        // Check if user owns this booking
        if ($booking->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }
        
        $ticket = Ticket::where('id', $request->ticket_id)
                       ->where('booking_id', $booking->id)
                       ->first();
        
        if (!$ticket) {
            return redirect()->back()->withErrors(['error' => 'Ticket not found']);
        }
        
        if ($ticket->status !== 'confirmed') {
            return redirect()->back()->withErrors(['error' => 'Ticket must be confirmed to be used']);
        }
        
        $ticket->update([
            'status' => 'used',
            'used_at' => now()
        ]);
        
        return redirect()->back()->with('success', 'Ticket used successfully!');
    }

    /**
     * Get available seats for an event (JSON response for AJAX)
     */
    public function availableSeats(Event $event)
    {
        $seats = $event->seats()
                      ->where('status', 'available')
                      ->orderBy('row')
                      ->orderBy('seat_number')
                      ->get();
        
        return response()->json([
            'success' => true,
            'data' => $seats
        ]);
    }

    /**
     * Get booking statistics for an event (JSON response for AJAX)
     */
    public function eventStats(Event $event)
    {
        $stats = [
            'total_seats' => $event->seats()->count(),
            'available_seats' => $event->availableSeats(),
            'sold_seats' => $event->soldSeats(),
            'total_revenue' => $event->bookings()
                                   ->where('status', 'confirmed')
                                   ->sum('total_amount'),
            'total_bookings' => $event->bookings()->count(),
            'confirmed_bookings' => $event->bookings()
                                         ->where('status', 'confirmed')
                                         ->count(),
        ];
        
        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
