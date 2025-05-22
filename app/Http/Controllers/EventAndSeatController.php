<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Seat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EventAndSeatController extends Controller
{
    /**
     * Display all events.
     */
    public function index()
    {
        $events = Event::withCount(['seats as available_seats' => function ($query) {
            $query->where('status', 'available');
        }])->get();

        return response()->json($events);
    }

    /**
     * Show specific event and its seats.
     */
    public function show($id)
    {
        $event = Event::with('seats')->findOrFail($id);
        return response()->json($event);
    }

    /**
     * Book a seat.
     */
    public function bookSeat(Request $request, $seatId)
    {
        $seat = Seat::findOrFail($seatId);

        if (!$seat->isAvailable()) {
            return response()->json(['message' => 'Seat is already sold.'], 409);
        }

        $userId = Auth::id();
        $success = $seat->book($userId);

        if ($success) {
            return response()->json(['message' => 'Seat booked successfully.']);
        }

        return response()->json(['message' => 'Failed to book seat.'], 500);
    }

    /**
     * Cancel a seat.
     */
    public function cancelSeat($seatId)
    {
        $seat = Seat::findOrFail($seatId);

        if ($seat->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized to cancel this seat.'], 403);
        }

        $success = $seat->release();

        if ($success) {
            return response()->json(['message' => 'Seat released successfully.']);
        }

        return response()->json(['message' => 'Failed to release seat.'], 500);
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
            'is_sold_out' => $event->isSoldOut(),
        ]);
    }

    /**
     * Update event data.
     */
    public function updateEvent(Request $request, $eventId)
    {
        $event = Event::findOrFail($eventId);
        $event->update($request->only([
            'name', 'description', 'location', 'event_date',
            'start_time', 'end_time', 'status', 'organizer_id',
            'max_seats', 'price'
        ]));

        return response()->json(['message' => 'Event updated successfully.', 'event' => $event]);
    }

    /**
     * Delete event and its seats.
     */
    public function deleteEvent($eventId)
    {
        $event = Event::findOrFail($eventId);
        $event->seats()->delete(); // delete related seats
        $event->delete();

        return response()->json(['message' => 'Event and its seats deleted successfully.']);
    }

    /**
     * Update seat data.
     */
    public function updateSeat(Request $request, $seatId)
    {
        $seat = Seat::findOrFail($seatId);
        $seat->update($request->only([
            'seat_number', 'row', 'section', 'price',
            'status', 'special_requirements'
        ]));

        return response()->json(['message' => 'Seat updated successfully.', 'seat' => $seat]);
    }

    /**
     * Delete a seat.
     */
    public function deleteSeat($seatId)
    {
        $seat = Seat::findOrFail($seatId);
        $seat->delete();

        return response()->json(['message' => 'Seat deleted successfully.']);
    }

    public function storeEvent(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'location' => 'required|string|max:255',
        'event_date' => 'required|date',
        'start_time' => 'required|date_format:Y-m-d H:i:s',
        'end_time' => 'required|date_format:Y-m-d H:i:s|after:start_time',
        'status' => 'required|in:active,inactive,canceled',
        'organizer_id' => 'required|exists:users,id',
        'max_seats' => 'required|integer|min:1',
        'price' => 'required|numeric|min:0',
    ]);

    $event = Event::create($validated);

    return response()->json([
        'message' => 'Event created successfully.',
        'event' => $event
    ], 201);
}
}
