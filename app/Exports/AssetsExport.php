<?php

namespace App\Exports;

use App\Models\Asset;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AssetsExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Asset::with('category')->get();
    }

    public function headings(): array
    {
        return ['Kode Aset', 'Nama Aset', 'Kategori', 'Status', 'Lokasi', 'Tanggal Beli', 'Harga Beli'];
    }

    public function map($asset): array
    {
        return [
            $asset->code,
            $asset->name,
            $asset->category->name,
            $asset->status->label(), // Pakai Enum label
            $asset->location,
            $asset->purchase_date?->format('d-m-Y'),
            $asset->purchase_price,
        ];
    }
}
