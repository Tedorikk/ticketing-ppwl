<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_id',
        'total_amount',
        'status', // pending, confirmed, cancelled
        'booking_time',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'booking_time' => 'datetime',
        ];
    }

    /**
     * Get the user who made the booking.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the event related to the booking.
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get all tickets under this booking.
     */
    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }
}
