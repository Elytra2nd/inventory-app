import { FormEventHandler, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Card, CardContent } from '@/Components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';

interface AssetFormProps {
  data: any;
  setData: (key: string, value: any) => void;
  errors: any;
  processing: boolean;
  submit: FormEventHandler;
  categories: Array<{ id: number; name: string }>;
  title: string;
  isEdit?: boolean;
}

export default function AssetForm({
  data,
  setData,
  errors,
  processing,
  submit,
  categories,
  title,
  isEdit = false,
}: AssetFormProps) {
  const [preview, setPreview] = useState<string | null>(
    isEdit && data.image_path ? `/storage/${data.image_path}` : null,
  );

  // Handle Upload Gambar & Preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('image', file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href={route('assets.index')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KOLOM KIRI: Upload Gambar */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6 space-y-4">
              <InputLabel value="Foto Aset" />

              <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px] bg-gray-50">
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-48 rounded-md object-contain" />
                ) : (
                  <p className="text-sm text-gray-400">Belum ada foto</p>
                )}
              </div>

              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              <InputError message={errors.image} />
              <p className="text-xs text-muted-foreground">Format: JPG/PNG, Max 2MB.</p>
            </CardContent>
          </Card>
        </div>

        {/* KOLOM KANAN: Form Input */}
        <div className="md:col-span-2 space-y-6 bg-white p-6 rounded-lg border shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama Aset */}
            <div className="col-span-2">
              <InputLabel htmlFor="name" value="Nama Aset *" />
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="Contoh: Mobil Innova Reborn"
                className="mt-1"
              />
              <InputError message={errors.name} />
            </div>

            {/* Kode Aset */}
            <div>
              <InputLabel htmlFor="code" value="Kode Aset (Unik) *" />
              <Input
                id="code"
                value={data.code}
                onChange={(e) => setData('code', e.target.value)}
                placeholder="AST-001"
                className="mt-1"
              />
              <InputError message={errors.code} />
            </div>

            {/* Kategori */}
            <div>
              <InputLabel value="Kategori *" />
              <Select
                value={String(data.category_id)}
                onValueChange={(val) => setData('category_id', val)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InputError message={errors.category_id} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <InputLabel value="Status Aset" />
              <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif (Baik)</SelectItem>
                  <SelectItem value="repair">Dalam Perbaikan</SelectItem>
                  <SelectItem value="disposed">Rusak / Dijual</SelectItem>
                  <SelectItem value="lost">Hilang</SelectItem>
                </SelectContent>
              </Select>
              <InputError message={errors.status} />
            </div>

            {/* Lokasi */}
            <div>
              <InputLabel htmlFor="location" value="Lokasi Penyimpanan" />
              <Input
                id="location"
                value={data.location}
                onChange={(e) => setData('location', e.target.value)}
                placeholder="Gudang A / Ruang Staff"
                className="mt-1"
              />
            </div>
          </div>

          {/* Informasi Pembelian */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <InputLabel htmlFor="purchase_date" value="Tanggal Beli" />
              <Input
                id="purchase_date"
                type="date"
                value={data.purchase_date}
                onChange={(e) => setData('purchase_date', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <InputLabel htmlFor="purchase_price" value="Harga Beli (Rp)" />
              <Input
                id="purchase_price"
                type="number"
                value={data.purchase_price}
                onChange={(e) => setData('purchase_price', e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>
          </div>

          {/* Interval Servis */}
          <div>
            <InputLabel htmlFor="interval" value="Interval Servis Rutin (Hari)" />
            <Input
              id="interval"
              type="number"
              value={data.maintenance_interval_days}
              onChange={(e) => setData('maintenance_interval_days', e.target.value)}
              placeholder="Contoh: 90 (untuk 3 bulan sekali)"
              className="mt-1 w-full md:w-1/2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Kosongkan jika aset ini tidak memerlukan jadwal servis otomatis.
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={processing}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
            >
              <Save className="mr-2 h-4 w-4" />
              {processing ? 'Menyimpan...' : 'Simpan Data Aset'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
