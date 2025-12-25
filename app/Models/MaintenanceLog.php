<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\AssetStatus; // Import Enum

class MaintenanceLog extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    // TAMBAHKAN INI (CASTING)
    protected $casts = [
        'service_date' => 'date', // Agar jadi object Carbon
        'status_after_service' => AssetStatus::class, // Agar jadi Enum
        'cost' => 'decimal:2', // Agar angka desimal aman
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }
}
