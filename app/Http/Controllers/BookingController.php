<?php

namespace App\Http\Controllers;

use App\Http\Requests\InitiateBookingRequest;
use App\Models\Booking;
use App\Models\Event;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Auth;


class BookingController extends Controller
{
    public function initiate(InitiateBookingRequest $request)
    {
        try {
            DB::transaction(function () use ($request) {
                // Kunci event agar tidak overbooking
                $event = Event::where('id', $request->event_id)
                              ->lockForUpdate()
                              ->firstOrFail();

                if ($event->available_seats <= 0) {
                    throw new \Exception("Maaf, seat sudah habis.");
                }

                // Kurangi jumlah kursi
                $event->available_seats--;
                $event->save();

                // Hitung harga (dari event atau logika lainnya)
                $totalAmount = $this->calculatePrice($event);

                // Simpan booking
                Booking::create([
                    'user_id' => auth()->id(),
                    'event_id' => $event->id,
                    'total_amount' => $totalAmount,
                    'status' => 'pending',
                    'booking_time' => now(),
                ]);

                // Kunci seat sementara
                $this->lockSeats($event);
            });

            return back()->with('success', 'Booking berhasil. Selesaikan pembayaran dalam 15 menit.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function lockSeats(Event $event)
    {
        // Simulasi penguncian seat
        Log::info("Seat dikunci untuk Event ID: " . $event->id);
    }

    public function calculatePrice(Event $event)
    {
        // Logika harga bisa dibuat dinamis jika perlu
        return $event->base_price ?? 100000; // fallback jika tidak ada
    }
}
