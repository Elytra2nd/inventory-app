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
        Schema::create('maintenance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->onDelete('cascade'); // Hapus log jika aset dihapus

            $table->date('service_date'); // Tanggal servis dilakukan
            $table->decimal('cost', 15, 2)->default(0);
            $table->string('technician_name')->nullable();
            $table->text('description')->nullable(); // Apa yang diperbaiki

            // Snapshot kondisi saat itu
            $table->string('status_after_service'); // good, needs_monitoring

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_logs');
    }
};
