<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InitiateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // ubah ke true jika tidak pakai policy
    }

    public function rules(): array
    {
        return [
            'event_id' => 'required|exists:events,id',
        ];
    }
}
