<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AssetDocumentController extends Controller
{
    // MENYIMPAN DOKUMEN BARU
    public function store(Request $request)
    {
        $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'type' => 'required|string|max:50', // Contoh: STNK, PAJAK
            'document_number' => 'nullable|string|max:100',
            'expiry_date' => 'required|date',
            'file' => 'nullable|image|max:2048', // Max 2MB
        ]);

        $data = $request->except('file');

        // Handle Upload
        if ($request->file('file')) {
            $data['file_path'] = $request->file('file')->store('documents', 'public');
        }

        AssetDocument::create($data);

        return back()->with('success', 'Dokumen berhasil ditambahkan.');
    }

    // MENGHAPUS DOKUMEN
    public function destroy(AssetDocument $document)
    {
        // Hapus file fisik jika ada
        if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return back()->with('success', 'Dokumen dihapus.');
    }
}
