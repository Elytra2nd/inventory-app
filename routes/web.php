<?php

use App\Http\Controllers\AssetController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AssetDocumentController;
use App\Http\Controllers\ReportController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Profile)
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| Business Logic Routes (Verified Users Only)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    // 1. DASHBOARD
    // Menggunakan Controller custom kita (bukan default Inertia) agar ada data statistik
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // 2. MANAJEMEN ASET (CRUD)
    // Otomatis membuat route: index, create, store, show, edit, update, destroy
    Route::resource('assets', AssetController::class);

    Route::get('/inventories/{asset}/print-label', [AssetController::class, 'printLabel'])->name('assets.print-label');

    // 3. MAINTENANCE / SERVIS
    // Menggunakan grouping controller agar lebih rapi
    Route::controller(MaintenanceController::class)->group(function () {
        Route::get('/assets/{asset}/maintenance/create', 'create')->name('maintenance.create');
        Route::post('/maintenance', 'store')->name('maintenance.store');
    });

    // 4. MANAJEMEN DOKUMEN (Store & Delete saja)
    Route::post('/documents', [AssetDocumentController::class, 'store'])->name('documents.store');
    Route::delete('/documents/{document}', [AssetDocumentController::class, 'destroy'])->name('documents.destroy');

    // 5. EXPORT LAPORAN
    Route::controller(ReportController::class)->group(function () {
        Route::get('/reports', 'index')->name('reports.index'); // <--- Halaman Utama Laporan
        Route::get('/reports/excel', 'exportExcel')->name('reports.excel');
        Route::get('/reports/pdf', 'exportPdf')->name('reports.pdf');
    });

});

require __DIR__ . '/auth.php';
