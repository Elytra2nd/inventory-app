import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import InputLabel from '@/Components/InputLabel';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
// TAMBAHAN: Import QrCode
import {
  ArrowLeft,
  Pencil,
  Wrench,
  FileText,
  Trash2,
  Calendar,
  Download,
  QrCode,
} from 'lucide-react';

// Definisi Tipe Data (Agar coding lebih aman)
interface Log {
  id: number;
  service_date: string;
  technician_name: string;
  description: string;
  cost: number;
  status_after_service: string;
}

interface Document {
  id: number;
  type: string;
  document_number: string;
  expiry_date: string;
  file_path: string;
}

export default function AssetShow({ auth, asset, logs, documents }: any) {
  // 1. SAFETY CHECK: Cegah layar putih jika data belum siap
  if (!asset) return <div className="p-10 text-center text-gray-500">Memuat data aset...</div>;

  // Pastikan logs & documents selalu array
  const safeLogs = Array.isArray(logs) ? logs : [];
  const safeDocuments = Array.isArray(documents) ? documents : [];

  // FORM UPLOAD DOKUMEN
  const { data, setData, post, processing, reset, errors } = useForm({
    asset_id: asset.id,
    type: '',
    expiry_date: '',
    file: null as File | null,
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('documents.store'), {
      onSuccess: () => reset(),
    });
  };

  // Helper Status Warna
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'repair':
        return 'bg-orange-500';
      case 'disposed':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Helper Format Rupiah
  const formatRupiah = (val: any) => {
    return new Intl.NumberFormat('id-ID').format(Number(val) || 0);
  };

  // Helper Format Tanggal
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      breadcrumbs={[
        { label: 'Daftar Aset', href: route('assets.index') },
        { label: asset.code || 'Detail' },
      ]}
    >
      <Head title={`Detail: ${asset.name}`} />

      <div className="space-y-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            {asset.image_path ? (
              <img
                src={`/storage/${asset.image_path}`}
                className="w-16 h-16 rounded-lg object-cover border"
                alt="Foto Aset"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 font-bold">
                N/A
              </div>
            )}
            <div>
              {/* Gunakan Optional Chaining (?.) agar aman */}
              <h1 className="text-2xl font-bold">{asset.name || 'Nama Aset'}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{asset.code || '-'}</Badge>
                <Badge className={getStatusColor(asset.status_value)}>
                  {asset.status_label || 'Status'}
                </Badge>
              </div>
            </div>
          </div>

          {/* TOMBOL AKSI */}
          <div className="flex gap-2">
            {/* 1. TOMBOL LABEL QR (BARU) */}
            <a
              href={route('assets.print-label', asset.id)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary">
                <QrCode className="mr-2 h-4 w-4" /> Label QR
              </Button>
            </a>

            {/* 2. TOMBOL EDIT */}
            <Button variant="outline" asChild>
              <Link href={route('assets.edit', asset.id)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Aset
              </Link>
            </Button>

            {/* 3. TOMBOL CATAT SERVIS */}
            <Button asChild>
              <Link href={route('maintenance.create', asset.id)}>
                <Wrench className="mr-2 h-4 w-4" /> Catat Servis
              </Link>
            </Button>
          </div>
        </div>

        {/* TABS CONTENT */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="info">Informasi</TabsTrigger>
            <TabsTrigger value="history">Riwayat Servis</TabsTrigger>
            <TabsTrigger value="documents">Dokumen</TabsTrigger>
          </TabsList>

          {/* TAB 1: INFORMASI UMUM */}
          <TabsContent value="info" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Detail Spesifikasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Kategori</p>
                    <p className="font-medium">{asset.category?.name || '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Lokasi</p>
                    <p className="font-medium">{asset.location || '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Tanggal Beli</p>
                    <p className="font-medium">{formatDate(asset.purchase_date)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Harga Beli</p>
                    <p className="font-medium">Rp {formatRupiah(asset.purchase_price)}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                    <p className="text-sm text-blue-600">Servis Terakhir</p>
                    <p className="font-bold text-blue-800">{asset.last_maintenance || '-'}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                    <p className="text-sm text-blue-600">Servis Berikutnya</p>
                    <p className="font-bold text-blue-800">{asset.next_maintenance || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: RIWAYAT SERVIS */}
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Log Perawatan & Perbaikan</CardTitle>
                <CardDescription>Riwayat lengkap aktivitas maintenance aset ini.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Teknisi</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Biaya</TableHead>
                      <TableHead>Kondisi Akhir</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safeLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Belum ada riwayat servis.
                        </TableCell>
                      </TableRow>
                    ) : (
                      safeLogs.map((log: Log) => (
                        <TableRow key={log.id}>
                          <TableCell>{formatDate(log.service_date)}</TableCell>
                          <TableCell>{log.technician_name}</TableCell>
                          <TableCell>{log.description}</TableCell>
                          <TableCell>Rp {formatRupiah(log.cost)}</TableCell>
                          <TableCell>
                            {log.status_after_service === 'good' ? (
                              <Badge className="bg-green-500">Baik</Badge>
                            ) : (
                              <Badge className="bg-yellow-500">Perlu Pantau</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: DOKUMEN LEGALITAS */}
          <TabsContent value="documents" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* List Dokumen */}
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Dokumen Tersimpan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {safeDocuments.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        Belum ada dokumen yang diupload.
                      </p>
                    ) : (
                      safeDocuments.map((doc: Document) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-white"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded text-red-600">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">
                                {doc.type}{' '}
                                <span className="text-gray-400 font-normal">
                                  ({doc.document_number || '-'})
                                </span>
                              </p>
                              <p className="text-xs text-gray-500">
                                Exp: {formatDate(doc.expiry_date)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a href={`/storage/${doc.file_path}`} target="_blank" rel="noreferrer">
                              <Button size="icon" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                            </a>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => router.delete(route('documents.destroy', doc.id))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Form Upload */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Upload Dokumen Baru</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpload} className="space-y-4">
                      <div>
                        <InputLabel value="Jenis Dokumen" />
                        <Input
                          placeholder="Contoh: STNK / Pajak"
                          value={data.type}
                          onChange={(e) => setData('type', e.target.value)}
                        />
                      </div>
                      <div>
                        <InputLabel value="Tgl Kadaluarsa" />
                        <Input
                          type="date"
                          value={data.expiry_date}
                          onChange={(e) => setData('expiry_date', e.target.value)}
                        />
                      </div>
                      <div>
                        <InputLabel value="File Foto/PDF" />
                        <Input
                          type="file"
                          onChange={(e) => setData('file', e.target.files?.[0] || null)}
                        />
                      </div>
                      <Button className="w-full" disabled={processing}>
                        {processing ? 'Mengupload...' : 'Simpan Dokumen'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}
