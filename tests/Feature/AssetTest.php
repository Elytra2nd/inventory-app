<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\Category;
use App\Models\User;
use App\Enums\AssetStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssetTest extends TestCase
{
    use RefreshDatabase;

    // Helper untuk membuat user dan login
    private function authenticateUser()
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        return $user;
    }

    // Helper untuk membuat kategori dummy
    private function createCategory()
    {
        return Category::create([
            'name' => 'Elektronik',
            'slug' => 'elektronik',
        ]);
    }

    // --- SKENARIO 1: KEAMANAN (AUTH) ---

    public function test_guest_cannot_access_assets_page()
    {
        // User belum login mencoba akses halaman aset
        $response = $this->get(route('assets.index'));

        // Harus ditendang ke halaman login
        $response->assertRedirect(route('login'));
    }

    // --- SKENARIO 2: MELIHAT DATA (READ) ---

    public function test_user_can_view_asset_list()
    {
        $this->authenticateUser();
        $category = $this->createCategory();

        // Buat 3 aset dummy
        Asset::create(['name' => 'Laptop A', 'code' => 'L-01', 'category_id' => $category->id, 'status' => 'active', 'purchase_price' => 5000000, 'purchase_date' => now()]);
        Asset::create(['name' => 'Laptop B', 'code' => 'L-02', 'category_id' => $category->id, 'status' => 'active', 'purchase_price' => 5000000, 'purchase_date' => now()]);
        Asset::create(['name' => 'Laptop C', 'code' => 'L-03', 'category_id' => $category->id, 'status' => 'active', 'purchase_price' => 5000000, 'purchase_date' => now()]);

        // Kunjungi halaman index
        $response = $this->get(route('assets.index'));

        // Pastikan sukses (200) dan melihat data aset
        $response->assertStatus(200);
        // Jika pakai Inertia, kita cek props-nya
        // $response->assertInertia(fn ($page) => $page->has('assets.data', 3));
    }

    // --- SKENARIO 3: MENAMBAH DATA (CREATE) ---

    public function test_user_can_create_asset()
    {
        $this->authenticateUser();
        $category = $this->createCategory();

        $assetData = [
            'name' => 'Macbook Pro',
            'code' => 'MBP-2024',
            'category_id' => $category->id,
            'status' => AssetStatus::Active->value,
            'purchase_price' => 25000000,
            'purchase_date' => '2024-01-01',
            'location' => 'Ruang Direktur',
            'description' => 'Aset baru',
        ];

        // Kirim POST request
        $response = $this->post(route('assets.store'), $assetData);

        // Pastikan redirect setelah simpan
        $response->assertRedirect(route('assets.index'));

        // Cek data masuk database
        $this->assertDatabaseHas('assets', [
            'name' => 'Macbook Pro',
            'code' => 'MBP-2024',
        ]);
    }

    public function test_create_asset_validation_error()
    {
        $this->authenticateUser();

        // Kirim data kosong
        $response = $this->post(route('assets.store'), []);

        // Harus ada error validasi pada field wajib
        $response->assertSessionHasErrors(['name', 'code', 'category_id', 'status']);
    }

    // --- SKENARIO 4: MENGUPDATE DATA (UPDATE) ---

    public function test_user_can_update_asset()
    {
        $this->authenticateUser();
        $category = $this->createCategory();

        $asset = Asset::create([
            'name' => 'Laptop Lama',
            'code' => 'OLD-01',
            'category_id' => $category->id,
            'status' => 'active',
            'purchase_price' => 5000000,
            'purchase_date' => now(),
        ]);

        $updateData = [
            'name' => 'Laptop Baru Diupdate',
            'code' => 'OLD-01', // Code tetap sama
            'category_id' => $category->id,
            'status' => AssetStatus::UnderRepair->value, // Ubah status
            'purchase_price' => 5000000,
            'purchase_date' => '2024-01-01',
        ];

        // Kirim PUT request
        $response = $this->put(route('assets.update', $asset->id), $updateData);

        $response->assertRedirect(route('assets.index'));

        // Pastikan DB berubah
        $this->assertDatabaseHas('assets', [
            'id' => $asset->id,
            'name' => 'Laptop Baru Diupdate',
            'status' => 'repair',
        ]);
    }

    // --- SKENARIO 5: MENGHAPUS DATA (DELETE) ---

    public function test_user_can_delete_asset()
    {
        $this->authenticateUser();
        $category = $this->createCategory();

        $asset = Asset::create([
            'name' => 'Laptop Rusak',
            'code' => 'DEL-01',
            'category_id' => $category->id,
            'status' => 'active',
            'purchase_price' => 1000000,
            'purchase_date' => now(),
        ]);

        // Kirim DELETE request
        $response = $this->delete(route('assets.destroy', $asset->id));

        $response->assertRedirect(route('assets.index'));

        // Pastikan data hilang dari DB
        $this->assertDatabaseMissing('assets', [
            'id' => $asset->id,
        ]);
    }
}
