<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Http\Requests\StoreMaintenanceRequest;
use App\Services\MaintenanceService;
use App\Http\Resources\AssetResource;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaintenanceController extends Controller
{
    protected $maintenanceService;

    // Dependency Injection Service
    public function __construct(MaintenanceService $maintenanceService)
    {
        $this->maintenanceService = $maintenanceService;
    }

    public function create(Asset $asset)
    {
        return Inertia::render('Maintenance/Create', [
            // Kita kirim data aset menggunakan Resource yang baru dibuat
            'asset' => new AssetResource($asset),
        ]);
    }

    public function store(StoreMaintenanceRequest $request)
    {
        $asset = Asset::findOrFail($request->asset_id);

        // Panggil Logic Service
        $this->maintenanceService->recordMaintenance(
            $asset,
            $request->validated()
        );

        return redirect()->route('assets.index')->with('success', 'Data servis berhasil dicatat & status diperbarui.');
    }
}
