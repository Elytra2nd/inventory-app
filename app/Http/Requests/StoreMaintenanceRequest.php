<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaintenanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'asset_id' => ['required', 'exists:assets,id'],
            'service_date' => ['required', 'date', 'before_or_equal:today'], // Tidak boleh masa depan
            'cost' => ['required', 'numeric', 'min:0'],
            'technician_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status_after_service' => 'required|in:active,repair,disposed,lost',
            'next_maintenance_date' => 'nullable|date|after:service_date',
        ];
    }
}
