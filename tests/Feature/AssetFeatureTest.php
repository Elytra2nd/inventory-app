<?php

use App\Models\Asset;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

// CUKUP RefreshDatabase SAJA
uses(RefreshDatabase::class);

test('user yang login bisa melihat daftar aset', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->get(route('assets.index'));
    $response->assertStatus(200);
});

test('user bisa menambah aset baru', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Kendaraan', 'slug' => 'kendaraan']);

    $response = $this->actingAs($user)->post(route('assets.store'), [
        'name' => 'Mobil Avanza',
        'code' => 'MBL-001',
        'category_id' => $category->id,
        'status' => 'active',
        'purchase_date' => '2024-01-01',
        'purchase_price' => 200000000,
        'location' => 'Garasi Utama'
    ]);

    $response->assertRedirect(route('assets.index'));

    $this->assertDatabaseHas('assets', [
        'name' => 'Mobil Avanza',
        'code' => 'MBL-001',
    ]);
});

test('validasi gagal jika input tidak lengkap', function () {
    $user = User::factory()->create();
    $response = $this->actingAs($user)->post(route('assets.store'), []);
    $response->assertSessionHasErrors(['name', 'code', 'category_id']);
});
