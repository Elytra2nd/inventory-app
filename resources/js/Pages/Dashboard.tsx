import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { AlertTriangle, CheckCircle2, Package, Wrench, DollarSign } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface AssetAlert {
  id: number;
  name: string;
  code: string;
  next_maintenance: string;
  status_label: string;
}

interface DashboardProps extends PageProps {
  total_assets?: number;
  active_assets?: number;
  repair_assets?: number;
  total_cost?: number;
  alerts?: any; // Kita buat any dulu untuk handle berbagai bentuk response
  chart_status?: Array<{ name: string; value: number; color: string }>;
  chart_cost?: Array<{ name: string; total: number }>;
}

export default function Dashboard({
  auth,
  total_assets = 0,
  active_assets = 0,
  repair_assets = 0,
  total_cost = 0,
  alerts = [],
  chart_status = [],
  chart_cost = [],
}: DashboardProps) {
  // --- LAPISAN KEAMANAN DATA (SAFETY LAYER) ---

  // 1. Amankan Alerts: Handle jika dibungkus .data (Resource) atau array murni
  const safeAlerts = Array.isArray(alerts)
    ? alerts
    : Array.isArray(alerts?.data)
      ? alerts.data
      : [];

  // 2. Amankan Charts: Pastikan selalu Array, jika undefined ubah jadi []
  const safeChartStatus = Array.isArray(chart_status) ? chart_status : [];
  const safeChartCost = Array.isArray(chart_cost) ? chart_cost : [];

  // Helper Format Rupiah
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  return (
    <AuthenticatedLayout user={auth.user} breadcrumbs={[{ label: 'Dashboard' }]}>
      <Head title="Dashboard" />

      <div className="space-y-6">
        {/* 1. STATISTIK UTAMA */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Aset</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total_assets}</div>
              <p className="text-xs text-muted-foreground">Unit terdaftar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kondisi Prima</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{active_assets}</div>
              <p className="text-xs text-muted-foreground">Siap operasi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perbaikan</CardTitle>
              <Wrench className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{repair_assets}</div>
              <p className="text-xs text-muted-foreground">Dalam maintenance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Biaya Servis</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-blue-600">{formatCurrency(total_cost)}</div>
              <p className="text-xs text-muted-foreground">Total akumulasi</p>
            </CardContent>
          </Card>
        </div>

        {/* 2. BAGIAN GRAFIK (CHARTS) */}
        <div className="grid gap-4 md:grid-cols-7">
          {/* Bar Chart */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Tren Biaya Maintenance</CardTitle>
              <CardDescription>Pengeluaran servis 6 bulan terakhir</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={safeChartCost}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `Rp${value / 1000}k`}
                    />
                    <Tooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
                    <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Distribusi Status</CardTitle>
              <CardDescription>Komposisi kondisi aset saat ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {safeChartStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={safeChartStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {safeChartStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Belum ada data status
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. TABEL ALERT MAINTENANCE */}
        <Card className="border-l-4 border-l-yellow-500 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle>Perlu Perhatian (H-30)</CardTitle>
            </div>
            <CardDescription>Aset berikut mendekati jadwal servis rutin.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeAlerts.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  Aman. Tidak ada jadwal maintenance mendesak.
                </p>
              ) : (
                safeAlerts.map((asset: AssetAlert) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-yellow-100 rounded-full text-yellow-700">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{asset.name}</p>
                        <p className="text-sm text-gray-500">
                          Kode: {asset.code} • Jadwal:{' '}
                          <span className="font-medium text-red-600">{asset.next_maintenance}</span>
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={route('maintenance.create', asset.id)}>Proses Servis</Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
