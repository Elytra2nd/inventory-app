<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Category;
use App\Http\Requests\StoreAssetRequest;
use App\Http\Requests\UpdateAssetRequest;
use App\Http\Resources\AssetResource;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AssetController extends Controller
{
    // 1. MENAMPILKAN DAFTAR ASET
    public function index(Request $request)
    {
        $query = Asset::with('category');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('code', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        return Inertia::render('Assets/Index', [
            'assets' => AssetResource::collection($query->latest()->paginate(10)),
            'filters' => $request->only(['search', 'category_id']),
            'categories' => Category::all(),
        ]);
    }

    // 2. MENAMPILKAN FORM TAMBAH (METHOD INI YANG HILANG SEBELUMNYA)
    public function create()
    {
        return Inertia::render('Assets/Create', [
            'categories' => Category::all(),
        ]);
    }

    // 3. MENYIMPAN DATA BARU
    public function store(StoreAssetRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('assets', 'public');
            $data['image_path'] = $path;
        }

        Asset::create($data);

        return redirect()->route('assets.index')->with('success', 'Aset berhasil ditambahkan.');
    }

    // 4. MENAMPILKAN FORM EDIT (METHOD INI JUGA HILANG SEBELUMNYA)
    public function edit(Asset $asset)
    {
        return Inertia::render('Assets/Edit', [
            'asset' => new AssetResource($asset),
            'categories' => Category::all(),
        ]);
    }

    // 5. UPDATE DATA
    public function update(UpdateAssetRequest $request, Asset $asset)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($asset->image_path && Storage::disk('public')->exists($asset->image_path)) {
                Storage::disk('public')->delete($asset->image_path);
            }

            $path = $request->file('image')->store('assets', 'public');
            $data['image_path'] = $path;
        }

        $asset->update($data);

        return redirect()->route('assets.index')->with('success', 'Data aset diperbarui.');
    }

    public function show($id)
    {
        $asset = Asset::with([
            'category',
            'maintenanceLogs' => function ($q) {
                $q->latest(); // Urutkan log servis dari yang terbaru
            },
            'documents' // Load dokumen (STNK, dll)
        ])->findOrFail($id);

        return Inertia::render('Assets/Show', [
            'asset' => (new AssetResource($asset))->resolve(),
            // Kirim raw data untuk logs & documents karena strukturnya simpel
            'logs' => $asset->maintenanceLogs,
            'documents' => $asset->documents,
        ]);
    }

    // 6. HAPUS DATA
    public function destroy(Asset $asset)
    {
        if ($asset->image_path && Storage::disk('public')->exists($asset->image_path)) {
            Storage::disk('public')->delete($asset->image_path);
        }

        $asset->delete();

        return redirect()->route('assets.index')->with('success', 'Aset berhasil dihapus.');
    }

    public function printLabel($id)
    {
        $asset = Asset::with('category')->findOrFail($id);

        // Generate QR Code berisi URL Detail Aset
        // Format: SVG (Paling tajam untuk cetak)
        $qrCode = QrCode::size(100)->generate(route('assets.show', $asset->id));

        return view('assets.print_label', compact('asset', 'qrCode'));
    }
}
