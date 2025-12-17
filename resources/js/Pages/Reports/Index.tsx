import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { FileText, FileSpreadsheet, Download, Printer } from 'lucide-react';

export default function ReportsIndex({ auth }: PageProps) {
  return (
    <AuthenticatedLayout user={auth.user} breadcrumbs={[{ label: 'Pusat Laporan' }]}>
      <Head title="Laporan" />

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pusat Laporan</h2>
          <p className="text-muted-foreground">
            Unduh rekapitulasi data aset dalam berbagai format.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CARD 1: PDF EXPORT */}
          <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <FileText className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <CardTitle>Laporan Dokumen (PDF)</CardTitle>
                  <CardDescription>Format siap cetak untuk lampiran fisik.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Daftar lengkap aset & status kondisi</li>
                <li>Format A4 layout portrait</li>
                <li>Cocok untuk pelaporan ke atasan/audit</li>
              </ul>
            </CardContent>
            <CardFooter className="bg-gray-50/50 border-t p-4">
              {/* Gunakan tag <a> biasa untuk download file */}
              <a
                href={route('reports.pdf')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  <Printer className="mr-2 h-4 w-4" /> Download PDF
                </Button>
              </a>
            </CardFooter>
          </Card>

          {/* CARD 2: EXCEL EXPORT */}
          <Card className="border-l-4 border-l-green-600 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileSpreadsheet className="w-8 h-8 text-green-700" />
                </div>
                <div>
                  <CardTitle>Laporan Data (Excel)</CardTitle>
                  <CardDescription>Format spreadsheet untuk olah data lanjut.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Raw data (Data mentah) lengkap</li>
                <li>Bisa diedit di Microsoft Excel / Google Sheets</li>
                <li>Cocok untuk analisis biaya & pivot table</li>
              </ul>
            </CardContent>
            <CardFooter className="bg-gray-50/50 border-t p-4">
              <a
                href={route('reports.excel')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full bg-green-700 hover:bg-green-800">
                  <Download className="mr-2 h-4 w-4" /> Download Excel
                </Button>
              </a>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
