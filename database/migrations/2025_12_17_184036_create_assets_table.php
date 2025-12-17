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
        // Tabel Aset Utama
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique(); // Barcode/Kode Aset
            $table->foreignId('category_id')->constrained()->onDelete('restrict'); // Jangan hapus kategori jika ada asetnya

            // Enum Status (Akan kita buat Enum-nya nanti)
            $table->string('status')->default('active'); // active, repair, disposed

            // Logika Jadwal
            $table->integer('maintenance_interval_days')->nullable(); // Misal: 90 hari (3 bulan)
            $table->date('last_maintenance_date')->nullable();
            $table->date('next_maintenance_date')->nullable(); // Ini yang dihitung otomatis

            // Info Tambahan
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 15, 2)->nullable();
            $table->string('location')->nullable();
            $table->text('image_path')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }

    public function documents()
    {
        return $this->hasMany(AssetDocument::class)->orderBy('expiry_date', 'asc');
    }
};
