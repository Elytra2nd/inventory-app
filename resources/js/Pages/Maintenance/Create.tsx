import { FormEventHandler } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Textarea } from '@/Components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { ArrowLeft, Save, Wrench } from 'lucide-react';

interface AssetData {
  id: number;
  name: string;
  code: string;
  category_id: number;
}

interface Props extends PageProps {
  // Karena pakai Resource, data dibungkus dalam 'data'
  asset: {
    data: AssetData;
  };
}

export default function MaintenanceCreate({ auth, asset }: Props) {
  const assetData = asset.data; // Ambil data asli dari wrapper Resource
  const today = new Date().toISOString().split('T')[0];

  const { data, setData, post, processing, errors } = useForm({
    asset_id: assetData.id, // WAJIB: Kirim asset_id karena Controller membutuhkannya
    service_date: today,
    technician_name: '',
    description: '',
    cost: '',
    status_after_service: 'active',
    next_maintenance_date: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    // Post ke route 'maintenance.store' (tanpa parameter ID di URL)
    post(route('maintenance.store'));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      breadcrumbs={[
        { label: 'Daftar Aset', href: route('assets.index') },
        { label: assetData.code, href: route('assets.show', assetData.id) },
        { label: 'Catat Servis' },
      ]}
    >
      <Head title="Catat Servis Aset" />

      <div className="max-w-3xl mx-auto">
        <form onSubmit={submit}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Wrench className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Formulir Pencatatan Servis</CardTitle>
                  <CardDescription>
                    Mencatat perbaikan untuk aset:{' '}
                    <span className="font-bold text-gray-800">
                      {assetData.name} ({assetData.code})
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Baris 1: Tanggal & Teknisi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <InputLabel value="Tanggal Servis *" />
                  <Input
                    type="date"
                    value={data.service_date}
                    onChange={(e) => setData('service_date', e.target.value)}
                    className="mt-1"
                  />
                  <InputError message={errors.service_date} />
                </div>
                <div>
                  <InputLabel value="Nama Teknisi / Bengkel *" />
                  <Input
                    placeholder="Contoh: Bengkel Honda Resmi"
                    value={data.technician_name}
                    onChange={(e) => setData('technician_name', e.target.value)}
                    className="mt-1"
                  />
                  <InputError message={errors.technician_name} />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <InputLabel value="Deskripsi Pengerjaan *" />
                <Textarea
                  placeholder="Jelaskan perbaikan yang dilakukan..."
                  className="mt-1 min-h-[100px]"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                />
                <InputError message={errors.description} />
              </div>

              {/* Baris 3: Biaya & Status Akhir */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <InputLabel value="Biaya Servis (Rp) *" />
                  <Input
                    type="number"
                    placeholder="0"
                    value={data.cost}
                    onChange={(e) => setData('cost', e.target.value)}
                    className="mt-1"
                  />
                  <InputError message={errors.cost} />
                </div>
                <div>
                  <InputLabel value="Kondisi Aset Setelah Servis *" />
                  <Select
                    value={data.status_after_service}
                    onValueChange={(val) => setData('status_after_service', val)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">✅ Baik / Aktif Kembali</SelectItem>
                      <SelectItem value="repair">⚠️ Masih Perlu Perbaikan</SelectItem>
                      <SelectItem value="disposed">❌ Rusak Total / Afkir</SelectItem>
                    </SelectContent>
                  </Select>
                  <InputError message={errors.status_after_service} />
                </div>
              </div>

              {/* Jadwal Berikutnya */}
              <div className="pt-4 border-t">
                <InputLabel value="Jadwal Servis Berikutnya (Opsional)" />
                <Input
                  type="date"
                  value={data.next_maintenance_date}
                  onChange={(e) => setData('next_maintenance_date', e.target.value)}
                  className="mt-1 w-full md:w-1/2"
                />
                <InputError message={errors.next_maintenance_date} />
              </div>

              {/* Tombol Aksi */}
              <div className="flex items-center justify-between pt-4">
                <Button variant="ghost" asChild>
                  <Link href={route('assets.show', assetData.id)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Batal
                  </Link>
                </Button>
                <Button
                  type="submit"
                  disabled={processing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="mr-2 h-4 w-4" /> Simpan Riwayat
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
