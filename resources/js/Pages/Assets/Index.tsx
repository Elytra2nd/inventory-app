import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import Pagination from '@/Components/Pagination';
import { useDebounce } from 'use-debounce';

// UI Components
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/Components/ui/alert-dialog';
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  FileText,
  FileDown,
  Eye,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

// Definisi Tipe Data
interface Asset {
  id: number;
  name: string;
  code: string;
  status_label: string;
  status_value: string;
  category: { name: string };
  image_path: string | null;
  location: string;
}

interface IndexProps extends PageProps {
  assets: {
    data: Asset[];
    meta: {
      links: Array<{
        url: string | null;
        label: string;
        active: boolean;
      }>;
    };
  };
  filters: { search?: string; category_id?: string };
  categories: Array<{ id: number; name: string }>;
}

export default function AssetIndex({ auth, assets, filters, categories }: IndexProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [category, setCategory] = useState(filters.category_id || 'all');
  const [debouncedSearch] = useDebounce(search, 500);

  useEffect(() => {
    if (debouncedSearch === (filters.search || '') && category === (filters.category_id || 'all'))
      return;

    router.get(
      route('assets.index'),
      {
        search: debouncedSearch,
        category_id: category === 'all' ? '' : category,
      },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      },
    );
  }, [debouncedSearch, category]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 hover:bg-green-600';
      case 'repair':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'disposed':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <AuthenticatedLayout user={auth.user} breadcrumbs={[{ label: 'Daftar Aset' }]}>
      <Head title="Manajemen Aset" />

      <div className="space-y-6">
        {/* HEADER & TOOLBAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Data Aset</h2>
            <p className="text-muted-foreground">Kelola inventaris dan riwayat pemeliharaan.</p>
          </div>

          <div className="flex gap-2">
            {/* TOMBOL PDF */}
            <a href={route('reports.pdf')} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="bg-white">
                <FileDown className="mr-2 h-4 w-4" /> Export PDF
              </Button>
            </a>

            {/* TOMBOL TAMBAH */}
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href={route('assets.create')}>
                <Plus className="mr-2 h-4 w-4" /> Tambah Aset
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau kode aset..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Kategori */}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* TABEL DATA */}
        <div className="rounded-md border bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[80px]">Gambar</TableHead>
                <TableHead>Info Aset</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Lokasi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Tidak ada data aset yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                assets.data.map((asset) => (
                  <TableRow key={asset.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      {asset.image_path ? (
                        <img
                          src={`/storage/${asset.image_path}`}
                          alt={asset.name}
                          className="h-10 w-10 rounded-md object-cover border"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 border">
                          N/A
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{asset.name}</div>
                      <div className="text-xs text-muted-foreground">{asset.code}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {asset.category?.name || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(asset.status_value)} border-0`}>
                        {asset.status_label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-gray-600">
                      {asset.location || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {/* DROPDOWN ACTIONS */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>

                          {/* 1. LIHAT DETAIL (BARU) */}
                          <DropdownMenuItem asChild>
                            <Link href={route('assets.show', asset.id)}>
                              <Eye className="mr-2 h-4 w-4" /> Lihat Detail
                            </Link>
                          </DropdownMenuItem>

                          {/* 2. EDIT DATA */}
                          <DropdownMenuItem asChild>
                            <Link href={route('assets.edit', asset.id)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit Data
                            </Link>
                          </DropdownMenuItem>

                          {/* 3. CATAT SERVIS */}
                          <DropdownMenuItem asChild>
                            <Link href={route('maintenance.create', asset.id)}>
                              <FileText className="mr-2 h-4 w-4" /> Catat Servis
                            </Link>
                          </DropdownMenuItem>

                          {/* 4. HAPUS */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-600 focus:text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Hapus
                              </div>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Data aset <b>{asset.name}</b> beserta riwayat servisnya akan
                                  dihapus permanen.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => router.delete(route('assets.destroy', asset.id))}
                                >
                                  Ya, Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination links={assets.meta?.links || []} />
      </div>
    </AuthenticatedLayout>
  );
}
