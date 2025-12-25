<?php

use App\Enums\AssetStatus;
use App\Models\Asset;
use App\Models\Category;
use App\Models\MaintenanceLog;
use App\Services\MaintenanceService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use Tests\TestCase;

uses(RefreshDatabase::class, TestCase::class);

/*
|--------------------------------------------------------------------------
| Helper Function
|--------------------------------------------------------------------------
*/
function createAsset(string $status = 'active'): Asset
{
    // Default status 'active' agar aman untuk general testing
    $category = Category::create([
        'name' => 'Elektronik ' . rand(1, 1000),
        'slug' => 'elektronik-' . rand(1000, 9999),
    ]);

    return Asset::create([
        'name' => 'Laptop Test',
        'code' => 'LPT-' . rand(1000, 9999),
        'category_id' => $category->id,
        'status' => $status,
        'purchase_price' => 5_000_000,
        // Set tanggal beli ke 2 tahun lalu agar aman diservis kapanpun
        'purchase_date' => now()->subYears(2),
    ]);
}

/*
|--------------------------------------------------------------------------
| 1. HAPPY PATH (Skenario Normal)
|--------------------------------------------------------------------------
*/
test('service mencatat maintenance log dan update asset', function () {
    // Arrange: Start dari Repair
    $asset = createAsset(AssetStatus::UnderRepair->value);

    // Gunakan tanggal masa depan agar aman dari validasi tanggal beli
    $serviceDate = now()->addDay()->format('Y-m-d');
    $nextDate = now()->addMonths(6)->format('Y-m-d');

    (new MaintenanceService())->recordMaintenance($asset, [
        'service_date' => $serviceDate,
        'technician_name' => 'Pak Budi',
        'description' => 'Ganti LCD',
        'cost' => 1_500_000,
        'status_after_service' => AssetStatus::Active->value,
        'next_maintenance_date' => $nextDate,
    ]);

    $asset->refresh();

    $this->assertDatabaseHas('maintenance_logs', [
        'asset_id' => $asset->id,
        'technician_name' => 'Pak Budi',
        'cost' => 1_500_000,
    ]);

    expect($asset->status->value)->toBe(AssetStatus::Active->value);
});

test('service menghitung jadwal maintenance otomatis', function () {
    $asset = createAsset(AssetStatus::Active->value);
    $asset->update(['maintenance_interval_days' => 30]);

    // Gunakan tanggal hari ini
    $today = now()->format('Y-m-d');

    (new MaintenanceService())->recordMaintenance($asset, [
        'service_date' => $today,
        'technician_name' => 'Bengkel',
        'description' => 'Rutin',
        'cost' => 50_000,
        'status_after_service' => AssetStatus::Active->value,
    ]);

    $asset->refresh();

    // Harapan: Hari ini + 30 Hari
    $expectedNext = now()->addDays(30)->format('Y-m-d');
    expect($asset->next_maintenance_date->format('Y-m-d'))->toBe($expectedNext);
});

/*
|--------------------------------------------------------------------------
| 2. EDGE CASES (Data Tidak Lazim)
|--------------------------------------------------------------------------
*/
test('next maintenance date boleh null', function () {
    $asset = createAsset();

    (new MaintenanceService())->recordMaintenance($asset, [
        'service_date' => now(),
        'technician_name' => 'Pak Doni',
        'description' => 'Cek rutin',
        'cost' => 100_000,
        'status_after_service' => AssetStatus::Active->value,
    ]);

    expect($asset->fresh()->next_maintenance_date)->toBeNull();
});

test('service menerima object Carbon sebagai tanggal', function () {
    $asset = createAsset();

    (new MaintenanceService())->recordMaintenance($asset, [
        'service_date' => Carbon::now(),
        'technician_name' => 'Montir',
        'description' => 'Ganti ban',
        'cost' => 500_000,
        'status_after_service' => AssetStatus::Active->value,
        'next_maintenance_date' => Carbon::now()->addMonth(),
    ]);

    expect($asset->fresh()->next_maintenance_date)->not->toBeNull();
});

test('maintenance dengan biaya negatif tetap tercatat', function () {
    $asset = createAsset();

    (new MaintenanceService())->recordMaintenance($asset, [
        'service_date' => now(),
        'technician_name' => 'Admin',
        'description' => 'Refund',
        'cost' => -50_000,
        'status_after_service' => AssetStatus::Active->value,
    ]);

    $this->assertDatabaseHas('maintenance_logs', [
        'asset_id' => $asset->id,
        'cost' => -50_000,
    ]);
});

/*
|--------------------------------------------------------------------------
| 3. TRANSACTION & ERROR HANDLING
|--------------------------------------------------------------------------
*/
test('transaction rollback jika terjadi error database', function () {
    $asset = createAsset();

    // Expectation: QueryException (Database Error) karena tanggal NULL
    expect(
        fn() => (new MaintenanceService())->recordMaintenance($asset, [
            'service_date' => null, // INVALID (Not Null Constraint)
            'technician_name' => 'Teknisi Valid',
            'description' => 'Error case',
            'cost' => 100_000,
            'status_after_service' => AssetStatus::Active->value,
        ])
    )->toThrow(\Illuminate\Database\QueryException::class);

    $this->assertDatabaseCount('maintenance_logs', 0);
    expect($asset->fresh()->status->value)
        ->toBe(AssetStatus::Active->value);
});

test('recordMaintenance menggunakan DB::transaction', function () {
    DB::spy();

    $asset = createAsset();

    (new MaintenanceService())->recordMaintenance($asset, [
        'service_date' => now(),
        'technician_name' => 'Spy',
        'description' => 'Transaction test',
        'cost' => 100,
        'status_after_service' => AssetStatus::Active->value,
    ]);

    DB::shouldHaveReceived('transaction')->once();
});

/*
|--------------------------------------------------------------------------
| 4. PROPERTY-BASED TESTING (Kombinasi Input)
|--------------------------------------------------------------------------
*/
dataset('costs', [0, 1, 100_000, -10_000]);
dataset('statuses', array_map(fn($c) => $c->value, AssetStatus::cases()));

test('property-based: berbagai kombinasi input aman', function (int $cost, string $status) {
    $asset = createAsset(AssetStatus::Active->value);

    // Skip terminal state self-transition
    if (in_array($asset->status->value, [AssetStatus::Disposed->value, AssetStatus::Lost->value], true)) {
        $this->markTestSkipped();
    }

    (new MaintenanceService())->recordMaintenance($asset, [
        'service_date' => now(),
        'technician_name' => 'PropertyBot',
        'description' => 'Property test',
        'cost' => $cost,
        'status_after_service' => $status,
    ]);

    expect($asset->fresh()->status->value)->toBe($status);
})
    ->with('costs')
    ->with('statuses');

/*
|--------------------------------------------------------------------------
| 5. IDEMPOTENCY (Mencegah Double Input)
|--------------------------------------------------------------------------
*/
test('maintenance idempotent terhadap retry', function () {
    $asset = createAsset();

    $payload = [
        'service_date' => '2025-01-01 10:00:00',
        'technician_name' => 'Omega',
        'description' => 'Retry-safe',
        'cost' => 100,
        'status_after_service' => AssetStatus::Active->value,
    ];

    $service = new MaintenanceService();

    $service->recordMaintenance($asset, $payload);
    $service->recordMaintenance($asset, $payload);

    expect(MaintenanceLog::where('asset_id', $asset->id)->count())->toBe(1);
});

/*
|--------------------------------------------------------------------------
| 6. BUSINESS RULES (Guard Clauses)
|--------------------------------------------------------------------------
*/
test('asset disposed tidak boleh di-maintenance', function () {
    $asset = createAsset(AssetStatus::Disposed->value);

    expect(
        fn() => (new MaintenanceService())->recordMaintenance($asset, [
            'service_date' => now(),
            'technician_name' => 'Teknisi',
            'description' => 'Coba servis',
            'cost' => 100_000,
            'status_after_service' => AssetStatus::Active->value,
        ])
    )->toThrow(InvalidArgumentException::class);
});

test('asset lost tidak boleh di-maintenance', function () {
    $asset = createAsset(AssetStatus::Lost->value);

    expect(
        fn() => (new MaintenanceService())->recordMaintenance($asset, [
            'service_date' => now(),
            'technician_name' => 'Teknisi',
            'description' => 'Coba servis',
            'cost' => 50_000,
            'status_after_service' => AssetStatus::Active->value,
        ])
    )->toThrow(InvalidArgumentException::class);
});

test('status under repair tidak boleh langsung ke disposed', function () {
    $asset = createAsset(AssetStatus::UnderRepair->value);

    expect(
        fn() => (new MaintenanceService())->recordMaintenance($asset, [
            'service_date' => now(),
            'technician_name' => 'Teknisi',
            'description' => 'Buang',
            'cost' => 0,
            'status_after_service' => AssetStatus::Disposed->value,
        ])
    )->toThrow(InvalidArgumentException::class);
});

/*
|--------------------------------------------------------------------------
| 7. FINAL INVARIANT (Terminal State)
|--------------------------------------------------------------------------
*/
test('INVARIANT: disposed dan lost adalah terminal state', function () {
    foreach ([AssetStatus::Disposed, AssetStatus::Lost] as $status) {
        foreach (AssetStatus::cases() as $target) {
            $canMove = $status->canTransitionTo($target);
            if ($status === $target) {
                expect($canMove)->toBeTrue();
            } else {
                expect($canMove)->toBeFalse();
            }
        }
    }
});

/*
|--------------------------------------------------------------------------
| 8. ADVANCED SCENARIOS (Time & Logic)
|--------------------------------------------------------------------------
*/
test('time paradox: gagal jika tanggal servis sebelum tanggal beli', function () {
    // Arrange: Aset dibeli HARI INI
    $asset = createAsset(AssetStatus::Active->value);
    $asset->update(['purchase_date' => now()]);

    // Act & Assert: Coba servis KEMARIN (Harus Gagal)
    expect(
        fn() => (new MaintenanceService())->recordMaintenance($asset, [
            'service_date' => now()->subDay(),
            'technician_name' => 'Dr. Strange',
            'description' => 'Time Travel',
            'cost' => 100_000,
            'status_after_service' => AssetStatus::Active->value,
        ])
    )->toThrow(InvalidArgumentException::class);

    $this->assertDatabaseCount('maintenance_logs', 0);
});

test('priority check: input manual next_maintenance mengalahkan interval otomatis', function () {
    $asset = createAsset(AssetStatus::Active->value);
    $asset->update(['maintenance_interval_days' => 30]);

    // Kita set tanggal servis hari ini
    $today = now();
    $manualNextDate = now()->addDays(7); // Seminggu lagi (Manual)

    (new MaintenanceService())->recordMaintenance($asset, [
        'service_date' => $today,
        'technician_name' => 'Teknisi',
        'description' => 'Cek',
        'cost' => 50_000,
        'status_after_service' => AssetStatus::Active->value,
        'next_maintenance_date' => $manualNextDate, // Override
    ]);

    $asset->refresh();

    // Assert: Harus ikut tanggal manual
    expect($asset->next_maintenance_date->format('Y-m-d'))
        ->toBe($manualNextDate->format('Y-m-d'));
});

test('preventive maintenance: status active ke active tetap valid', function () {
    $asset = createAsset(AssetStatus::Active->value);

    (new MaintenanceService())->recordMaintenance($asset, [
        'service_date' => now(),
        'technician_name' => 'Montir',
        'description' => 'Ganti Oli Rutin',
        'cost' => 50_000,
        'status_after_service' => AssetStatus::Active->value,
    ]);

    $asset->refresh();

    expect($asset->status->value)->toBe(AssetStatus::Active->value);
});

test('service history check: logging mencatat detail aset snapshot', function () {
    $asset = createAsset(AssetStatus::UnderRepair->value);
    $today = now()->format('Y-m-d');

    (new MaintenanceService())->recordMaintenance($asset, [
        'service_date' => $today,
        'technician_name' => 'Audit',
        'description' => 'Final Fix',
        'cost' => 999,
        'status_after_service' => AssetStatus::Active->value,
    ]);

    $log = MaintenanceLog::where('asset_id', $asset->id)->first();

    expect($log->service_date->format('Y-m-d'))->toBe($today);
    expect($log->status_after_service->value)->toBe(AssetStatus::Active->value);

    // PERBAIKAN UTAMA: Bandingkan dengan String karena Decimal:2 casting mengembalikan string
    expect($log->cost)->toBe('999.00');
});
