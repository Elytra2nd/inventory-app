<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'location' => $this->location,
            'image_path' => $this->image_path,

            'category' => [
                'id' => $this->category_id,
                // Gunakan operator ?? '-' untuk berjaga-jaga jika kategori terhapus
                'name' => $this->category->name ?? 'Tanpa Kategori',
            ],

            'status_label' => $this->status->label(),
            'status_value' => $this->status->value,

            'last_maintenance' => $this->last_maintenance_date?->format('d M Y') ?? '-',
            'next_maintenance' => $this->next_maintenance_date?->format('d M Y') ?? '-',
            'purchase_date' => $this->purchase_date?->format('Y-m-d'),
            'purchase_price' => $this->purchase_price,
            'maintenance_interval_days' => $this->maintenance_interval_days,
        ];
    }
}
