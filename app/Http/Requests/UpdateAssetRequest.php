<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAssetRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            // PENTING: Unik tapi kecualikan ID aset ini sendiri
            'code' => ['required', 'string', Rule::unique('assets')->ignore($this->asset), 'max:50'],
            'category_id' => ['required', 'exists:categories,id'],
            'status' => ['required'],
            'image' => ['nullable', 'image', 'max:2048'],
            'maintenance_interval_days' => ['nullable', 'integer', 'min:1'],
            'purchase_date' => ['nullable', 'date'],
            'purchase_price' => ['nullable', 'numeric'],
            'location' => ['nullable', 'string'],
        ];
    }
}
