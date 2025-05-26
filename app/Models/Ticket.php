<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Ticket extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', // UUID akan di-generate otomatis
        'booking_id',
        'seat_id',
        'event_id',
        'user_id',
        'price',
        'status',
        'used_at' // Tambahkan ini
    ];

    protected $dates = ['used_at'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->id = (string) Str::uuid();
        });
    }

    // ... (relasi tetap sama)
}

