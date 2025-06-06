<?php

namespace App\Http\Controllers\User;

use App\Models\Event;
use App\Models\Seat;
use App\Models\Booking;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon; 
use Inertia\Inertia;
use App\Http\Controllers\Controller;


class EventAndSeatController extends Controller
{
    /**
     * Show all events with available seats.
     */
    public function index()
    {
        $events = Event::with(['seats' => function ($query) {
            $query->where('status', 'available');
        }])->get();

        return Inertia::render('user/events/index', [
            'events' => $events,
        ]);
    }

    /**
     * Show specific event and its seats.
     */
    public function show($id)
    {
        $event = Event::with(['seats.user', 'organizer'])->findOrFail($id);
        
        return Inertia::render('user/events/show', [
            'event' => $event,
        ]);
    }

    /**
     * Book a seat and create ticket.
     */
    public function bookSeat(Request $request, $seatId, $eventId = null)
    {
        $request->validate([
            'user_id' => 'sometimes|exists:users,id',
        ]);

        try {
            DB::beginTransaction();

            // Check if seat exists first
            $seat = Seat::with('event')->find($seatId);
            
            if (!$seat) {
                return back()->with('error', 'Seat not found. Please refresh the page and try again.');
            }
            
            // If eventId is provided, verify it matches the seat's event
            if ($eventId && $seat->event_id != $eventId) {
                return back()->with('error', 'Seat does not belong to this event.');
            }
            
            if (!$seat->isAvailable()) {
                return back()->with('error', 'Seat is already booked. Please select another seat.');
            }

            $userId = $request->input('user_id', Auth::id());

            // Create booking
            $booking = Booking::create([
                'user_id' => $userId,
                'event_id' => $seat->event_id,
                'total_amount' => $seat->price,
                'booking_time' => now(),
                'status' => 'confirmed',
            ]);

            // Book the seat
            $success = $seat->book($userId);
            
            if ($success) {
                // Create ticket
                Ticket::create([
                    'booking_id' => $booking->id,
                    'seat_id' => $seat->id,
                    'event_id' => $seat->event_id,
                    'user_id' => $userId,
                    'price' => $seat->price,
                    'status' => 'valid',
                ]);

                DB::commit();
                
                // Return Inertia response for success
                return back()->with('success', 'Seat booked successfully! Check your tickets in the dashboard.');
            }

            DB::rollBack();
            return back()->with('error', 'Failed to book seat. Please try again.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Seat booking failed: ' . $e->getMessage());
            return back()->with('error', 'Booking failed. Please try again later.');
        }
    }

    /**
     * Cancel a seat booking.
     */
    public function cancelSeat($seatId)
    {
        try {
            DB::beginTransaction();

            $seat = Seat::findOrFail($seatId);
            
            if ($seat->user_id !== Auth::id()) {
                return response()->json(['message' => 'Unauthorized to cancel this seat.'], 403);
            }

            // Find and update related ticket
            $ticket = Ticket::where('seat_id', $seatId)->first();
            if ($ticket) {
                $ticket->update(['status' => 'cancelled']);
            }

            $success = $seat->release();
            
            if ($success) {
                DB::commit();
                return response()->json(['message' => 'Seat released successfully.']);
            }

            DB::rollBack();
            return response()->json(['message' => 'Failed to release seat.'], 500);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to release seat: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get seat availability statistics for event.
     */
    public function seatStats($eventId)
    {
        $event = Event::findOrFail($eventId);

        return response()->json([
            'available' => $event->availableSeats(),
            'sold' => $event->soldSeats(),
            'total' => $event->seats()->count(),
            'is_sold_out' => $event->isSoldOut(),
        ]);
    }

    /**
     * Store a new event.
     */
    public function storeEvent(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'required|string|max:255',
            'event_date' => 'required|date|after:today',
            'start_time' => 'required|date_format:Y-m-d\TH:i', // ISO format for datetime-local
            'end_time' => 'required|date_format:Y-m-d\TH:i|after:start_time', // ISO format for datetime-local
            'status' => 'required|in:active,inactive,canceled',
            'max_seats' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Convert ISO datetime to database format
            $validated['start_time'] = Carbon::createFromFormat('Y-m-d\TH:i', $validated['start_time'])->format('Y-m-d H:i:s');
            $validated['end_time'] = Carbon::createFromFormat('Y-m-d\TH:i', $validated['end_time'])->format('Y-m-d H:i:s');

            $event = Event::create($validated);

            // Auto-generate seats
            for ($i = 1; $i <= $validated['max_seats']; $i++) {
                Seat::create([
                    'event_id' => $event->id,
                    'seat_number' => str_pad($i, 3, '0', STR_PAD_LEFT),
                    'row' => chr(64 + ceil($i / 10)),
                    'section' => 'General',
                    'price' => $validated['price'],
                    'status' => 'available',
                ]);
            }

            DB::commit();

            return redirect()->route('events.index')->with('success', 'Event created successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create event: ' . $e->getMessage()]);
        }
    }


    /**
     * Update event data.
     */
    public function updateEvent(Request $request, $eventId)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'location' => 'sometimes|string|max:255',
            'event_date' => 'sometimes|date',
            'start_time' => 'sometimes|date_format:Y-m-d\TH:i', // Changed to ISO format
            'end_time' => 'sometimes|date_format:Y-m-d\TH:i|after:start_time', // Changed to ISO format
            'status' => 'sometimes|in:active,inactive,canceled',
            'max_seats' => 'sometimes|integer|min:1',
            'price' => 'sometimes|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Convert ISO datetime to database format if provided
            if (isset($validated['start_time'])) {
                $validated['start_time'] = Carbon::createFromFormat('Y-m-d\TH:i', $validated['start_time'])->format('Y-m-d H:i:s');
            }
            if (isset($validated['end_time'])) {
                $validated['end_time'] = Carbon::createFromFormat('Y-m-d\TH:i', $validated['end_time'])->format('Y-m-d H:i:s');
            }

            $event = Event::findOrFail($eventId);
            $event->update($validated);

            DB::commit();

            return redirect()->route('events.index')->with('success', 'Event updated successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update event: ' . $e->getMessage()]);
        }
    }

    /**
     * Delete event and its seats.
     */
    public function deleteEvent($eventId)
    {
        try {
            DB::beginTransaction();

            $event = Event::findOrFail($eventId);
            
            // Delete related tickets first
            Ticket::where('event_id', $eventId)->delete();
            
            // Delete related bookings
            Booking::where('event_id', $eventId)->delete();
            
            // Delete seats
            $event->seats()->delete();
            
            // Delete event
            $event->delete();

            DB::commit();

            return to_route('events.index')->with('success', 'Event deleted successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return to_route('events.index')->withErrors(['error' => 'Failed to delete event: ' . $e->getMessage()]);
        }
    }

    /**
     * Update seat data.
     */
    public function updateSeat(Request $request, $seatId)
    {
        $validated = $request->validate([
            'seat_number' => 'sometimes|string|max:10',
            'row' => 'sometimes|string|max:5',
            'section' => 'sometimes|string|max:50',
            'price' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:available,sold,reserved',
            'special_requirements' => 'nullable|string',
        ]);

        $seat = Seat::findOrFail($seatId);
        $seat->update($validated);

        return response()->json(['message' => 'Seat updated successfully.', 'seat' => $seat]);
    }

    /**
     * Delete a seat.
     */
    public function deleteSeat($seatId)
    {
        try {
            DB::beginTransaction();

            $seat = Seat::findOrFail($seatId);
            
            // Check if seat is booked
            if ($seat->status === 'sold') {
                return response()->json(['message' => 'Cannot delete a sold seat.'], 400);
            }

            // Delete related tickets if any
            Ticket::where('seat_id', $seatId)->delete();
            
            $seat->delete();

            DB::commit();

            return response()->json(['message' => 'Seat deleted successfully.']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to delete seat: ' . $e->getMessage()], 500);
        }
    }
}