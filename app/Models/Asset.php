<?php

namespace App\Models;

use App\Enums\AssetStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Asset extends Model
{
    protected $guarded = ['id'];

    // Casting agar otomatis jadi Object Carbon & Enum
    protected $casts = [
        'status' => AssetStatus::class,
        'purchase_date' => 'date',
        'last_maintenance_date' => 'date',
        'next_maintenance_date' => 'date',
    ];

    // 1. Relasi ke Kategori
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // 2. Relasi ke Log Servis (Maintenance)
    public function maintenanceLogs(): HasMany
    {
        return $this->hasMany(MaintenanceLog::class)->latest('service_date');
    }

    // 3. Relasi ke Dokumen (INI YANG HILANG SEBELUMNYA)
    public function documents(): HasMany
    {
        // Kita urutkan berdasarkan tanggal kadaluarsa terdekat
        return $this->hasMany(AssetDocument::class)->orderBy('expiry_date', 'asc');
    }
}
