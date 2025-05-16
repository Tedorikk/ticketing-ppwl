<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    /** @use HasFactory<\Database\Factories\EventFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'description',
        'location',
        'event_date',
        'start_time',
        'end_time',
        'status',
        'organizer_id',
        'max_seats',
        'price',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'price' => 'decimal:2',
        ];
    }

    /**
     * Get the seats for the event.
     */
    public function seats(): HasMany
    {
        return $this->hasMany(Seat::class);
    }

    /**
     * Get the organizer of the event.
     */
    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    /**
     * Get available seats count
     * 
     * @return int
     */
    public function availableSeats(): int
    {
        return $this->seats()->where('status', 'available')->count();
    }

    /**
     * Get sold seats count
     * 
     * @return int
     */
    public function soldSeats(): int
    {
        return $this->seats()->where('status', 'sold')->count();
    }

    /**
     * Check if event is sold out
     * 
     * @return bool
     */
    public function isSoldOut(): bool
    {
        return $this->availableSeats() <= 0;
    }
}
