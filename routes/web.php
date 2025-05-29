<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\EventAndSeatController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\TicketingController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('admin/dashboard', function () {
        return Inertia::render('admin/dashboard');
    })->name('dashboard');
});

Route::prefix('/admin')->group(function () {
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('dashboard', [EventAndSeatController::class, 'dashboard'])->name('dashboard');

        // Event routes
        Route::get('/events', [EventAndSeatController::class, 'index'])->name('events.index');
    Route::get('/events/{id}', [EventAndSeatController::class, 'show'])->name('events.show');
        Route::post('/events', [EventAndSeatController::class, 'storeEvent'])->name('events.store');
        Route::put('/events/{eventId}', [EventAndSeatController::class, 'updateEvent'])->name('events.update');
        Route::delete('/events/{eventId}', [EventAndSeatController::class, 'deleteEvent'])->name('events.destroy');
        
        // Seat and booking routes
        Route::post('/seats/{seatId}/book', [EventAndSeatController::class, 'bookSeat'])->name('seats.book');
        Route::delete('/seats/{seatId}/cancel', [EventAndSeatController::class, 'cancelSeat'])->name('seats.cancel');
        Route::get('/events/{eventId}/stats', [EventAndSeatController::class, 'seatStats'])->name('events.stats');
        Route::put('/seats/{seatId}', [EventAndSeatController::class, 'updateSeat'])->name('seats.update');
        Route::delete('/seats/{seatId}', [EventAndSeatController::class, 'deleteSeat'])->name('seats.destroy');

        Route::prefix('tickets')->group(function () {
        // Get all tickets (Paginated)
        Route::get('/', [TicketingController::class, 'index'])->name('tickets.index');
        
        // Get single ticket details
        Route::get('/{ticket}', [TicketingController::class, 'show'])->name('tickets.show');
        
        // Create new ticket
        Route::post('/', [TicketingController::class, 'store'])->name('tickets.store');
        
        // Update ticket
        Route::put('/{ticket}', [TicketingController::class, 'update'])->name('tickets.update');
        
        // Delete ticket
        Route::delete('/{ticket}', [TicketingController::class, 'delete'])->name('tickets.delete');
    });
    });
});

Route::middleware('auth')->group(function () {
    Route::post('/booking/initiate', [BookingController::class, 'initiate'])->name('booking.initiate');
});

Route::post('/bookings/initiate', [BookingController::class, 'initiate'])->name('bookings.initiate');

// Tiket CRUD Routes


// Custom Ticket Routes
Route::prefix('bookings')->group(function () {
    // Generate PDF tickets for booking
    Route::get('/{booking}/generate-tickets', [TicketingController::class, 'generate'])
        ->name('bookings.tickets.generate');
});

// QR Validation (API Endpoint)
Route::post('/tickets/validate-qr', [TicketingController::class, 'validateQR'])
    ->name('tickets.validate-qr');

// Ticketing Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/ticketing', [TicketingController::class, 'index'])->name('ticketing.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
