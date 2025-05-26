<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\EventAndSeatController;
use App\Http\Controllers\TicketingController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('admin/dashboard', function () {
        return Inertia::render('admin/dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('user/dashboard');
    })->name('dashboard');
});


// Tiket CRUD Routes
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

// Custom Ticket Routes
Route::prefix('bookings')->group(function () {
    // Generate PDF tickets for booking
    Route::get('/{booking}/generate-tickets', [TicketingController::class, 'generate'])
        ->name('bookings.tickets.generate');
});

// QR Validation (API Endpoint)
Route::post('/tickets/validate-qr', [TicketingController::class, 'validateQR'])
    ->name('tickets.validate-qr');



// Event CRUD routes
Route::get('/events', [EventAndSeatController::class, 'indexEvents']);        // List all events
Route::get('/events/{id}', [EventAndSeatController::class, 'showEvent']);     // Show one event
Route::post('/events', [EventAndSeatController::class, 'storeEvent']);        // Create new event
Route::put('/events/{id}', [EventAndSeatController::class, 'updateEvent']);   // Update event
Route::delete('/events/{id}', [EventAndSeatController::class, 'deleteEvent']); // Delete event

// Seat CRUD routes
Route::get('/seats', [EventAndSeatController::class, 'indexSeats']);          // List all seats
Route::get('/seats/{id}', [EventAndSeatController::class, 'showSeat']);       // Show one seat
Route::post('/seats', [EventAndSeatController::class, 'storeSeat']);          // Create new seat
Route::put('/seats/{id}', [EventAndSeatController::class, 'updateSeat']);     // Update seat
Route::delete('/seats/{id}', [EventAndSeatController::class, 'deleteSeat']);  // Delete seat


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
