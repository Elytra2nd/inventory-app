<?php

namespace App\Services;

use App\Enums\AssetStatus;
use App\Models\Asset;
use App\Models\MaintenanceLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class MaintenanceService
{
    /**
     * Mencatat log servis baru DAN update status aset.
     */
    public function recordMaintenance(Asset $asset, array $data)
    {
        // ==========================================================
        // 1. GUARD CLAUSES (VALIDASI LOGIKA BISNIS)
        // ==========================================================

        // CEK 1: Terminal State Check
        if (in_array($asset->status, [AssetStatus::Disposed, AssetStatus::Lost])) {
            throw new InvalidArgumentException("Aset dengan status Disposed atau Lost tidak dapat diservis.");
        }

        // CEK 2: Illegal Transition Check (Repair -> Disposed)
        if ($asset->status === AssetStatus::UnderRepair && $data['status_after_service'] === AssetStatus::Disposed->value) {
            throw new InvalidArgumentException("Aset dalam perbaikan tidak boleh langsung dibuang (Disposed).");
        }

        // CEK 3: Time Paradox Check (Servis sebelum Beli) [INI YANG KURANG TADI]
        $serviceDate = $data['service_date'] instanceof Carbon
            ? $data['service_date']
            : Carbon::parse($data['service_date']);

        if ($serviceDate->startOfDay()->lt($asset->purchase_date->startOfDay())) {
            throw new InvalidArgumentException("Tanggal servis tidak boleh sebelum tanggal pembelian aset.");
        }

        // CEK 4: Idempotency Check (Mencegah Double Submit)
        $existingLog = MaintenanceLog::where('asset_id', $asset->id)
            ->where('service_date', $data['service_date'])
            ->where('technician_name', $data['technician_name'])
            ->where('description', $data['description'])
            ->first();

        if ($existingLog) {
            return $existingLog;
        }

        // ==========================================================
        // 2. EKSEKUSI DATA (DATABASE TRANSACTION)
        // ==========================================================
        return DB::transaction(function () use ($asset, $data) {

            // A. Simpan Log Servis
            $log = $asset->maintenanceLogs()->create([
                'service_date' => $data['service_date'],
                'cost' => $data['cost'],
                'technician_name' => $data['technician_name'],
                'description' => $data['description'],
                'status_after_service' => $data['status_after_service'],
            ]);

            // B. Siapkan Data Update Aset
            $updateData = [
                'status' => $data['status_after_service'],
                'last_maintenance_date' => $data['service_date'],
            ];

            // C. Logika Jadwal Berikutnya
            if (!empty($data['next_maintenance_date'])) {
                $updateData['next_maintenance_date'] = $data['next_maintenance_date'];
            } elseif ($asset->maintenance_interval_days) {
                $dateBase = $data['service_date'] instanceof Carbon
                    ? $data['service_date']
                    : Carbon::parse($data['service_date']);

                $updateData['next_maintenance_date'] = $dateBase->addDays($asset->maintenance_interval_days);
            }

            // D. Eksekusi Update
            $asset->update($updateData);

            return $log;
        });
    }
}
