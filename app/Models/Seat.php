<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Seat extends Model
{
    /** @use HasFactory<\Database\Factories\SeatFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'event_id',
        'seat_number',
        'row',
        'section',
        'price',
        'status',
        'user_id',
        'booking_time',
        'special_requirements',
    ];

    
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'booking_time' => 'datetime', // mantap
        ];
    }

    /**
     * Get the event that owns the seat.
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the user who booked the seat.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if seat is available
     * 
     * @return bool
     */
    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    /**
     * Book this seat for a user
     * 
     * @param int $userId
     * @return bool
     */
    public function book(int $userId): bool
    {
        if (!$this->isAvailable()) {
            return false;
        }

        $this->user_id = $userId;
        $this->status = 'sold';
        $this->booking_time = now();
        
        return $this->save();
    }

    /**
     * Release this seat (cancel booking)
     * 
     * @return bool
     */
    public function release(): bool
    {
        $this->user_id = null;
        $this->status = 'available';
        $this->booking_time = null;
        
        return $this->save();
    }
}