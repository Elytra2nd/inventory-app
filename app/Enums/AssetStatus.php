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
            self::Active => 'Aktif',
            self::UnderRepair => 'Sedang Diperbaiki',
            self::Disposed => 'Sudah Dijual/Dibuang',
            self::Lost => 'Hilang',
        };
    }
}
