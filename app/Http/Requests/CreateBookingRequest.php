<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    
    public function rules(): array
    {
        return [
            'seat_ids' => 'required|array|min:1|max:10',
            'seat_ids.*' => 'required|integer|exists:seats,id',
        ];
    }
    
    public function messages(): array
    {
        return [
            'seat_ids.required' => 'Please select at least one seat',
            'seat_ids.max' => 'Maximum 10 seats per booking',
            'seat_ids.*.exists' => 'One or more selected seats do not exist',
        ];
    }
}
