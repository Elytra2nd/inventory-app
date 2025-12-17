<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\MaintenanceLog;
use App\Http\Resources\AssetResource;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. DATA CARD STATISTIK (Tetap)
        $totalAssets = Asset::count();
        $activeAssets = Asset::where('status', 'active')->count();
        $repairAssets = Asset::where('status', 'repair')->count();
        $totalCost = MaintenanceLog::sum('cost'); // Total pengeluaran servis seumur hidup

        // 2. DATA ALERT (Tetap)
        $upcomingMaintenance = Asset::where('status', 'active')
            ->whereNotNull('next_maintenance_date')
            ->where('next_maintenance_date', '<=', Carbon::now()->addDays(30))
            ->orderBy('next_maintenance_date', 'asc')
            ->limit(5)
            ->get();

        // 3. DATA PIE CHART (Status Aset)
        // Output: [{ name: 'Active', value: 80 }, { name: 'Repair', value: 10 }, ...]
        $statusChart = Asset::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => ucfirst($item->status->value ?? $item->status), // Handle enum/string
                    'value' => $item->total,
                    'color' => match ($item->status->value ?? $item->status) {
                        'active' => '#22c55e', // Hijau
                        'repair' => '#f97316', // Orange
                        'disposed' => '#64748b', // Abu-abu
                        'lost' => '#ef4444',   // Merah
                        default => '#3b82f6'
                    }
                ];
            });

        // 4. DATA BAR CHART (Biaya Servis 6 Bulan Terakhir)
        // Output: [{ name: 'Jan', total: 500000 }, ...]
        $costChart = MaintenanceLog::select(
            DB::raw('DATE_FORMAT(service_date, "%Y-%m") as month'),
            DB::raw('SUM(cost) as total')
        )
            ->where('service_date', '>=', Carbon::now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => Carbon::createFromFormat('Y-m', $item->month)->format('M Y'),
                    'total' => $item->total
                ];
            });

        return Inertia::render('Dashboard', [
            'total_assets' => $totalAssets,
            'active_assets' => $activeAssets,
            'repair_assets' => $repairAssets,
            'total_cost' => $totalCost, // Kirim total biaya
            'alerts' => AssetResource::collection($upcomingMaintenance)->resolve(),

            // Data Grafik Baru
            'chart_status' => $statusChart,
            'chart_cost' => $costChart,
        ]);
    }
}
