<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Ticket;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class UserDashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = auth()->user();
        
        // Get user's recent bookings with related data
        $recentBookings = Booking::with(['event', 'tickets.seat'])
            ->where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        // Get user's upcoming events
        $upcomingEvents = Event::whereHas('bookings', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->where('event_date', '>=', now())
            ->orderBy('event_date')
            ->take(3)
            ->get();

        // Get user's tickets
        $tickets = Ticket::with(['event', 'seat', 'booking'])
            ->where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        // Calculate statistics
        $stats = [
            'total_bookings' => Booking::where('user_id', $user->id)->count(),
            'total_tickets' => Ticket::where('user_id', $user->id)->count(),
            'total_spent' => Booking::where('user_id', $user->id)
                ->where('status', 'confirmed')
                ->sum('total_amount'),
            'upcoming_events' => Event::whereHas('bookings', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->where('event_date', '>=', now())
                ->count(),
        ];

        return Inertia::render('user/dashboard', [
            'user' => $user,
            'recentBookings' => $recentBookings,
            'upcomingEvents' => $upcomingEvents,
            'tickets' => $tickets,
            'stats' => $stats,
        ]);
    }
}
