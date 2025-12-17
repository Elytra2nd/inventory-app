<?php

use App\Models\Asset;
use App\Models\Category;
use App\Models\MaintenanceLog;
use App\Services\MaintenanceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase; // Pastikan ini di-import

// PERBAIKAN: Tambahkan TestCase::class di sini
uses(RefreshDatabase::class, TestCase::class);

test('service mencatat log dan otomatis mengupdate status aset', function () {
    // 1. ARRANGE
    $category = Category::create(['name' => 'Elektronik', 'slug' => 'elektronik']);

    $asset = Asset::create([
        'name' => 'Laptop Test',
        'code' => 'LPT-001',
        'category_id' => $category->id,
        'status' => 'repair',
        'purchase_price' => 5000000,
        'purchase_date' => now(),
    ]);

    $maintenanceData = [
        'service_date' => '2025-12-20',
        'technician_name' => 'Pak Budi',
        'description' => 'Ganti LCD',
        'cost' => 1500000,
        'status_after_service' => 'active',
        'next_maintenance_date' => '2026-06-20',
    ];

    // 2. ACT
    $service = new MaintenanceService();
    $service->recordMaintenance($asset, $maintenanceData);

    // 3. ASSERT
    $this->assertDatabaseHas('maintenance_logs', [
        'asset_id' => $asset->id,
        'technician_name' => 'Pak Budi',
        'cost' => 1500000,
    ]);

    $updatedAsset = Asset::find($asset->id);
    expect($updatedAsset->status->value)->toBe('active');

    // Gunakan format string agar aman
    expect($updatedAsset->last_maintenance_date->format('Y-m-d'))->toBe('2025-12-20');
    expect($updatedAsset->next_maintenance_date->format('Y-m-d'))->toBe('2026-06-20');
});
