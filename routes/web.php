<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\EventAndSeatController;
use App\Http\Controllers\User\EventAndSeatController as UserEventAndSeatController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\TicketingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserDashboardController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Home page
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Public event browsing (no auth required)
Route::get('/events', [UserEventAndSeatController::class, 'index'])->name('events.index');
Route::get('/events/{id}', [UserEventAndSeatController::class, 'show'])->name('events.show');
Route::get('/events/{eventId}/stats', [UserEventAndSeatController::class, 'seatStats'])->name('events.stats');

// Search events
Route::get('/search', function (\Illuminate\Http\Request $request) {
    $query = $request->get('q');
    $events = \App\Models\Event::where('name', 'like', "%{$query}%")
        ->orWhere('description', 'like', "%{$query}%")
        ->orWhere('location', 'like', "%{$query}%")
        ->with(['seats' => function ($q) {
            $q->where('status', 'available');
        }])
        ->get();
    
    return Inertia::render('events/search', [
        'events' => $events,
        'query' => $query
    ]);
})->name('events.search');

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()]);
})->name('health');

/*
|--------------------------------------------------------------------------
| User Authentication Required Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {
    
    // User Dashboard
    Route::get('/dashboard', [UserDashboardController::class, '__invoke'])
        ->middleware('permission:view-dashboard')
        ->name('user.dashboard');

    /*
    |--------------------------------------------------------------------------
    | User Booking Routes
    |--------------------------------------------------------------------------
    */
    
    // Create new booking with multiple seats
    Route::post('/events/{event}/book', [BookingController::class, 'store'])
        ->middleware('permission:create-booking')
        ->name('bookings.store');
    
    // Get available seats for an event
    Route::get('/events/{event}/seats', [BookingController::class, 'availableSeats'])
        ->middleware('permission:view-seat-availability')
        ->name('events.seats.available');
    
    // Booking management - Apply middleware to individual routes
    Route::prefix('bookings')->name('bookings.')->group(function () {
        // Confirm booking (after payment)
        Route::patch('/{booking}/confirm', [BookingController::class, 'confirm'])
            ->middleware('permission:confirm-own-booking')
            ->name('confirm');
        
        // Cancel booking
        Route::patch('/{booking}/cancel', [BookingController::class, 'cancel'])
            ->middleware('permission:cancel-own-booking')
            ->name('cancel');
        
        // Use ticket
        Route::patch('/{booking}/use-ticket', [BookingController::class, 'useTicket'])
            ->middleware('permission:use-own-ticket')
            ->name('use-ticket');
    });

    /*
    |--------------------------------------------------------------------------
    | User Profile and Data Management Routes
    |--------------------------------------------------------------------------
    */
    
    // User's bookings and tickets
    Route::prefix('my')->name('user.')->group(function () {
        // User's bookings list
        Route::get('/bookings', [BookingController::class, 'index'])
            ->middleware('permission:view-own-bookings')
            ->name('bookings.index');
        
        // User's specific booking details
        Route::get('/bookings/{booking}', [BookingController::class, 'show'])
            ->middleware('permission:view-own-booking-details')
            ->name('bookings.show');
        
        // User's tickets list
        Route::get('/tickets', [TicketingController::class, 'index'])
            ->middleware('permission:view-own-tickets')
            ->name('tickets.index');
        
        // User's specific ticket details
        Route::get('/tickets/{ticket}', [TicketingController::class, 'show'])
            ->middleware('permission:view-own-ticket-details')
            ->name('tickets.show');
        
        // User profile
        Route::get('/profile', function () {
            return Inertia::render('user/profile');
        })->middleware('permission:view-own-profile')->name('profile');
    });

    /*
    |--------------------------------------------------------------------------
    | Ticket Generation & Download Routes (File Downloads - No Inertia)
    |--------------------------------------------------------------------------
    */
    
    // Generate PDF tickets for booking
    Route::get('/bookings/{booking}/generate-tickets', [TicketingController::class, 'generate'])
        ->middleware('permission:generate-own-tickets')
        ->name('bookings.tickets.generate');
    
    // Download individual ticket PDF
    Route::get('/tickets/{ticket}/download', [TicketingController::class, 'downloadTicket'])
        ->middleware('permission:download-own-tickets')
        ->name('tickets.download');

    // Print routes
    Route::get('/tickets/{ticket}/print', [TicketingController::class, 'printTicket'])
        ->middleware('permission:download-own-tickets')
        ->name('tickets.print');

    Route::get('/my/tickets/print-all', [TicketingController::class, 'printAllTickets'])
        ->middleware('permission:view-own-tickets')
        ->name('tickets.print-all');

    Route::get('/bookings/{booking}/print-tickets', [TicketingController::class, 'printBookingTickets'])
        ->middleware('permission:view-own-booking-details')
        ->name('bookings.print-tickets');
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified', 'role:admin'])->group(function () {
    
    // Admin Dashboard
    Route::get('/dashboard', [EventAndSeatController::class, 'dashboard'])
        ->middleware('permission:access-admin-dashboard')
        ->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Admin Event Management
    |--------------------------------------------------------------------------
    */
    
    Route::prefix('events')->name('events.')->group(function () {
        Route::get('/', [EventAndSeatController::class, 'index'])
            ->middleware('permission:view-events')
            ->name('index');
        
        Route::get('/{id}', [EventAndSeatController::class, 'show'])
            ->middleware('permission:view-event-details')
            ->name('show');
        
        Route::post('/', [EventAndSeatController::class, 'storeEvent'])
            ->middleware('permission:create-events')
            ->name('store');
        
        Route::put('/{eventId}', [EventAndSeatController::class, 'updateEvent'])
            ->middleware('permission:update-events')
            ->name('update');
        
        Route::delete('/{eventId}', [EventAndSeatController::class, 'deleteEvent'])
            ->middleware('permission:delete-events')
            ->name('destroy');
        
        // Event statistics
        Route::get('/{event}/stats', [BookingController::class, 'eventStats'])
            ->middleware('permission:manage-event-stats')
            ->name('stats');
        
        // Available seats for admin
        Route::get('/{event}/available-seats', [BookingController::class, 'availableSeats'])
            ->middleware('permission:view-seat-availability')
            ->name('available-seats');
    });

    /*
    |--------------------------------------------------------------------------
    | Admin Seat Management
    |--------------------------------------------------------------------------
    */
    
    Route::prefix('seats')->name('seats.')->group(function () {
        Route::post('/{seatId}/book', [EventAndSeatController::class, 'bookSeat'])
            ->middleware('permission:book-seats-for-others')
            ->name('book');
        
        Route::delete('/{seatId}/cancel', [EventAndSeatController::class, 'cancelSeat'])
            ->middleware('permission:cancel-seat-bookings')
            ->name('cancel');
        
        Route::put('/{seatId}', [EventAndSeatController::class, 'updateSeat'])
            ->middleware('permission:update-seats')
            ->name('update');
        
        Route::delete('/{seatId}', [EventAndSeatController::class, 'deleteSeat'])
            ->middleware('permission:delete-seats')
            ->name('destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | Admin Ticket Management
    |--------------------------------------------------------------------------
    */
    
    Route::prefix('tickets')->name('tickets.')->group(function () {
        Route::get('/', function () {
            $tickets = \App\Models\Ticket::with(['booking', 'user', 'event', 'seat'])->latest()->paginate(20);
            return Inertia::render('admin/tickets/index', ['tickets' => $tickets]);
        })->middleware('permission:view-all-tickets')->name('index');
        
        Route::get('/{ticket}', function (\App\Models\Ticket $ticket) {
            $ticket->load(['booking', 'user', 'event', 'seat']);
            return Inertia::render('admin/tickets/show', ['ticket' => $ticket]);
        })->middleware('permission:view-any-ticket-details')->name('show');
        
        Route::post('/', [TicketingController::class, 'store'])
            ->middleware('permission:create-tickets')
            ->name('store');
        
        Route::put('/{ticket}', [TicketingController::class, 'update'])
            ->middleware('permission:update-tickets')
            ->name('update');
        
        Route::delete('/{ticket}', [TicketingController::class, 'delete'])
            ->middleware('permission:delete-tickets')
            ->name('delete');
    });

    /*
    |--------------------------------------------------------------------------
    | Admin Booking Management
    |--------------------------------------------------------------------------
    */
    
    Route::prefix('bookings')->name('bookings.')->group(function () {
        // All bookings for admin
        Route::get('/', function () {
            $bookings = \App\Models\Booking::with(['user', 'event', 'tickets'])->latest()->paginate(20);
            return Inertia::render('admin/bookings/index', ['bookings' => $bookings]);
        })->middleware('permission:view-all-bookings')->name('index');
        
        // Show specific booking for admin
        Route::get('/{booking}', function (\App\Models\Booking $booking) {
            $booking->load(['user', 'event', 'tickets.seat']);
            return Inertia::render('admin/bookings/show', ['booking' => $booking]);
        })->middleware('permission:view-any-booking-details')->name('show');
        
        // Admin can confirm bookings
        Route::patch('/{booking}/confirm', [BookingController::class, 'confirm'])
            ->middleware('permission:confirm-any-booking')
            ->name('confirm');
        
        // Admin can cancel bookings
        Route::patch('/{booking}/cancel', [BookingController::class, 'cancel'])
            ->middleware('permission:cancel-any-booking')
            ->name('cancel');
        
        // Admin can use tickets
        Route::patch('/{booking}/use-ticket', [BookingController::class, 'useTicket'])
            ->middleware('permission:use-any-ticket')
            ->name('use-ticket');
    });

    /*
    |--------------------------------------------------------------------------
    | Admin User Management
    |--------------------------------------------------------------------------
    */
    
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', function () {
            $users = \App\Models\User::with(['bookings', 'tickets'])->latest()->paginate(20);
            return Inertia::render('admin/users/index', ['users' => $users]);
        })->middleware('permission:view-all-users')->name('index');
        
        Route::get('/{user}', function (\App\Models\User $user) {
            $user->load(['bookings.event', 'tickets.event']);
            return Inertia::render('admin/users/show', ['user' => $user]);
        })->middleware('permission:view-user-details')->name('show');
    });
});

/*
|--------------------------------------------------------------------------
| API Routes (for AJAX calls)
|--------------------------------------------------------------------------
*/

Route::prefix('api')->name('api.')->group(function () {
    // Public API routes
    Route::get('/events', [EventAndSeatController::class, 'index'])->name('events.index');
    Route::get('/events/{event}/seats', [BookingController::class, 'availableSeats'])->name('events.seats');
    
    // Authenticated API routes
    Route::middleware('auth')->group(function () {
        // Booking API routes
        Route::prefix('bookings')->name('bookings.')->group(function () {
            Route::get('/', [BookingController::class, 'index'])
                ->middleware('permission:view-own-bookings')
                ->name('index');
            
            Route::post('/events/{event}', [BookingController::class, 'store'])
                ->middleware('permission:create-booking')
                ->name('store');
            
            Route::get('/{booking}', [BookingController::class, 'show'])
                ->middleware('permission:view-own-booking-details')
                ->name('show');
            
            Route::patch('/{booking}/confirm', [BookingController::class, 'confirm'])
                ->middleware('permission:confirm-own-booking')
                ->name('confirm');
            
            Route::patch('/{booking}/cancel', [BookingController::class, 'cancel'])
                ->middleware('permission:cancel-own-booking')
                ->name('cancel');
            
            Route::patch('/{booking}/use-ticket', [BookingController::class, 'useTicket'])
                ->middleware('permission:use-own-ticket')
                ->name('use-ticket');
        });
        
        // QR Code validation (for staff/admin use)
        Route::post('/tickets/validate-qr', [TicketingController::class, 'validateQR'])
            ->middleware('permission:validate-tickets')
            ->name('tickets.validate-qr');
        
        // Real-time seat availability check
        Route::get('/events/{event}/availability', [BookingController::class, 'availableSeats'])
            ->middleware('permission:view-seat-availability')
            ->name('events.availability');
        
        // Event statistics
        Route::get('/events/{event}/stats', [BookingController::class, 'eventStats'])
            ->middleware('permission:view-event-stats')
            ->name('events.stats');
        
        // Check user's booking status for specific event
        Route::get('/user/booking-status/{eventId}', function ($eventId) {
            $booking = auth()->user()->bookings()->where('event_id', $eventId)->first();
            return response()->json([
                'has_booking' => !!$booking, 
                'booking' => $booking ? $booking->load('tickets.seat') : null
            ]);
        })->middleware('permission:view-own-bookings')->name('user.booking-status');
    });
});

/*
|--------------------------------------------------------------------------
| Include Additional Route Files
|--------------------------------------------------------------------------
*/

require __DIR__.'/auth.php';
