<?php

namespace App\Enums;

enum AssetStatus: string
{
    case Active = 'active';
    case UnderRepair = 'repair';
    case Disposed = 'disposed';
    case Lost = 'lost';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Aktif / Baik',
            self::UnderRepair => 'Sedang Perbaikan',
            self::Disposed => 'Rusak Total / Afkir',
            self::Lost => 'Hilang',
        };
    }

    // --- TAMBAHKAN METHOD INI UNTUK TEST INVARIANT ---
    public function canTransitionTo(AssetStatus $target): bool
    {
        // 1. CEK DULU: Jika status sama (Self-transition), selalu BOLEH.
        // (Ini memperbaiki error test Invariant)
        if ($this === $target) {
            return true;
        }

        // 2. BARU CEK: Terminal State (Disposed/Lost) tidak bisa berubah ke status LAIN.
        if (in_array($this, [self::Disposed, self::Lost])) {
            return false;
        }

        // 3. Aturan Bisnis: Repair tidak boleh langsung Disposed
        if ($this === self::UnderRepair && $target === self::Disposed) {
            return false;
        }

        return true;
    }
}
