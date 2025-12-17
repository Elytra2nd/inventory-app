<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('asset_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->onDelete('cascade');

            // Jenis Dokumen (STNK, Pajak 5 Tahunan, KIR, Asuransi, Sertifikat)
            $table->string('type');
            $table->string('document_number')->nullable();

            // Kunci Notifikasi: Tanggal Kadaluarsa
            $table->date('expiry_date');

            // Foto Fisik Dokumen
            $table->string('file_path')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_documents');
    }
};
