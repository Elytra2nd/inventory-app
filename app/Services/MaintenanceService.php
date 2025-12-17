<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\MaintenanceLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class MaintenanceService
{
    /**
     * Mencatat log servis baru DAN update status aset.
     */
    public function recordMaintenance(Asset $asset, array $data)
    {
        return DB::transaction(function () use ($asset, $data) {

            // 1. Simpan Log Servis
            $log = $asset->maintenanceLogs()->create([
                'service_date' => $data['service_date'],
                'cost' => $data['cost'],
                'technician_name' => $data['technician_name'],
                'description' => $data['description'],
                'status_after_service' => $data['status_after_service'],
            ]);

            // 2. SIAPKAN DATA UPDATE ASET
            // Kita tampung dulu data yang mau diupdate ke dalam array
            $updateData = [
                // PENTING: Langsung pakai data dari input form agar sesuai (active/repair/disposed)
                'status' => $data['status_after_service'],
                'last_maintenance_date' => $data['service_date'],
            ];

            // 3. LOGIKA JADWAL BERIKUTNYA
            // Jika user mengisi manual 'next_maintenance_date', pakai itu.
            if (!empty($data['next_maintenance_date'])) {
                $updateData['next_maintenance_date'] = $data['next_maintenance_date'];
            }
            // Jika tidak diisi manual, tapi aset punya interval otomatis (misal tiap 90 hari)
            elseif ($asset->maintenance_interval_days) {
                $updateData['next_maintenance_date'] = Carbon::parse($data['service_date'])
                    ->addDays($asset->maintenance_interval_days);
            }

            // 4. EKSEKUSI UPDATE
            $asset->update($updateData);

            return $log;
        });
    }
}
