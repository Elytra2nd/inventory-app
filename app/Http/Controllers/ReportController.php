<?php

namespace App\Http\Controllers;

use App\Exports\AssetsExport;
use App\Models\Asset;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Inertia\Inertia; // <--- Jangan lupa import ini

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render('Reports/Index');
    }

    public function exportExcel()
    {
        return Excel::download(new AssetsExport, 'laporan-aset-' . date('Y-m-d') . '.xlsx');
    }

    public function exportPdf()
    {
        $assets = Asset::with('category')->get();
        $pdf = Pdf::loadView('reports.assets_pdf', compact('assets'));
        return $pdf->download('laporan-aset-' . date('Y-m-d') . '.pdf');
    }
}
