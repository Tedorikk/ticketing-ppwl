<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\EventAndSeatController;

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
