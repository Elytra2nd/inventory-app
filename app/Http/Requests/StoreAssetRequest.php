<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssetRequest extends FormRequest
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
            // Kode aset harus unik di tabel assets
            'code' => ['required', 'string', 'unique:assets,code', 'max:50'],
            'category_id' => ['required', 'exists:categories,id'],
            'status' => ['required'], // Nanti divalidasi Enum otomatis oleh Frontend/Model
            'image' => ['nullable', 'image', 'max:2048'], // Max 2MB, harus file gambar
            'maintenance_interval_days' => ['nullable', 'integer', 'min:1'],
            'purchase_date' => ['nullable', 'date'],
            'purchase_price' => ['nullable', 'numeric'],
            'location' => ['nullable', 'string'],
        ];
    }
}
