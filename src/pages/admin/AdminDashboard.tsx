import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign,
  Package,
  Truck,
  Wrench,
  ShoppingBag,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  XCircle,
  AlertCircle
} from 'lucide-react@0.487.0';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RechartsPie, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface DashboardData {
  kpis: {
    totalRevenue: number;
    totalRequests: number;
    cancellationRate: number;
    acceptanceRate: number;
    avgResponseTime: number;
    customersCount: number;
  };
  charts: {
    monthlyTrend: any[];
    revenueDistribution: any[];
    cancellationAnalysis: any[];
    topSellingProducts: any[];
    topSellRequestProducts: any[];
    topProblematicProducts: any[];
    topProblemCategories: any[];
    dailyTrend: any[];
  };
  pendingWork: {
    urgent: any[];
    awaitingResponse: any[];
  };
}

const COLORS = {
  orange: '#f97316',
  navy: '#1e3a8a',
  teal: '#14b8a6',
  purple: '#a855f7',
  green: '#22c55e',
  red: '#ef4444',
  yellow: '#eab308',
  blue: '#3b82f6',
  pink: '#ec4899',
  indigo: '#6366f1',
};

export default function AdminDashboard() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [filter, setFilter] = useState('month');

  useEffect(() => {
    loadDashboardData();
  }, [filter]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0f4d2485/admin/dashboard?filter=${filter}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Dashboard verileri yüklenemedi');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
      console.log('📊 Dashboard data loaded:', dashboardData);

    } catch (error: any) {
      console.error('Dashboard yüklenirken hata:', error);
      toast.error('Dashboard yüklenemedi', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('tr-TR').format(value);
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--brand-orange-600)] to-[var(--brand-orange-700)] text-white py-8 shadow-xl">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl mb-2 flex items-center gap-3">
                  <BarChart3 className="w-8 h-8" />
                  Admin Dashboard
                </h1>
                <p className="text-orange-100">
                  Ersinspot - İş Zekası ve Analitik Merkezi
                </p>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                {[
                  { value: 'today', label: 'Bugün' },
                  { value: 'week', label: 'Bu Hafta' },
                  { value: 'month', label: 'Bu Ay' },
                  { value: '3months', label: '3 Ay' },
                  { value: '6months', label: '6 Ay' },
                  { value: 'all', label: 'Tümü' },
                ].map((f) => (
                  <Button
                    key={f.value}
                    variant={filter === f.value ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(f.value)}
                    className={filter === f.value ? 'bg-white text-orange-600' : 'text-white hover:bg-white/20'}
                    disabled={loading}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Loading Indicator - Küçük ve üstte */}
        {loading && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#f97316]" />
            <p className="text-sm text-orange-700">Dashboard verileri yükleniyor...</p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {!data ? (
            // Skeleton Loaders
            <>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-20 mb-2" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              {/* Total Revenue */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-green-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Toplam Gelir
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency(data.kpis.totalRevenue)}
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Onaylanan işlemler
                  </p>
                </CardContent>
              </Card>

          {/* Total Requests */}
          <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-700 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Toplam Talepler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {formatNumber(data.kpis.totalRequests)}
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Tüm modüller
              </p>
            </CardContent>
          </Card>

          {/* Cancellation Rate */}
          <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-red-700 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                İptal Oranı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">
                %{data.kpis.cancellationRate}
              </div>
              <p className="text-xs text-red-600 mt-1">
                {data.kpis.cancellationRate < 10 ? '✅ Düşük' : data.kpis.cancellationRate < 20 ? '⚠️ Orta' : '🔴 Yüksek'}
              </p>
            </CardContent>
          </Card>

          {/* Acceptance Rate */}
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-purple-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Teklif Kabul Oranı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                %{data.kpis.acceptanceRate}
              </div>
              <p className="text-xs text-purple-600 mt-1">
                {data.kpis.acceptanceRate > 70 ? '🎉 Mükemmel' : data.kpis.acceptanceRate > 50 ? '✅ İyi' : '⚠️ Düşük'}
              </p>
            </CardContent>
          </Card>

          {/* Avg Response Time */}
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-orange-700 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Ort. Yanıt Süresi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {data.kpis.avgResponseTime.toFixed(1)} sa
              </div>
              <p className="text-xs text-orange-600 mt-1">
                {data.kpis.avgResponseTime < 24 ? '⚡ Hızlı' : data.kpis.avgResponseTime < 48 ? '✅ Normal' : '⏰ Yavaş'}
              </p>
            </CardContent>
          </Card>

              {/* Total Customers */}
              <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-teal-700 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Toplam Müşteri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-teal-900">
                    {formatNumber(data.kpis.customersCount)}
                  </div>
                  <p className="text-xs text-teal-600 mt-1">
                    Kayıtlı kullanıcı
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {!data ? (
            // Skeleton Loaders for Charts
            <>
              <Card className="shadow-xl">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-36" />
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
                </CardContent>
              </Card>
              <Card className="shadow-xl">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-36" />
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Monthly Trend */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[var(--brand-orange-600)]" />
                    Modül Bazlı Talep Trendi
                  </CardTitle>
                  <CardDescription>Son 6 aylık talep sayıları</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.charts.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="sipariş" stroke={COLORS.orange} strokeWidth={2} />
                  <Line type="monotone" dataKey="nakliye" stroke={COLORS.navy} strokeWidth={2} />
                  <Line type="monotone" dataKey="teknik servis" stroke={COLORS.teal} strokeWidth={2} />
                  <Line type="monotone" dataKey="ürün satış" stroke={COLORS.purple} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Distribution */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[var(--brand-orange-600)]" />
                Gelir Dağılımı
              </CardTitle>
              <CardDescription>Modüllere göre gelir dağılımı</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={data.charts.revenueDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.charts.revenueDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
            </>
          )}
        </div>

        {/* Cancellation Analysis & Daily Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {!data ? (
            <>
              <Card className="shadow-xl">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-36" />
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
                </CardContent>
              </Card>
              <Card className="shadow-xl">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-36" />
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Cancellation Analysis */}
              <Card className="shadow-xl border-red-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    İptal Analizi (%)
                  </CardTitle>
                  <CardDescription>Modüllere göre iptal/red oranları</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.charts.cancellationAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    formatter={(value: number) => `%${value.toFixed(1)}`}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="rate" fill={COLORS.red} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Trend */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[var(--brand-orange-600)]" />
                Günlük Talep Trendi
              </CardTitle>
              <CardDescription>Son 30 günlük toplam talep sayıları</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.charts.dailyTrend}>
                  <defs>
                    <linearGradient id="colorTalepler" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.orange} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS.orange} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="talepler" 
                    stroke={COLORS.orange} 
                    fillOpacity={1} 
                    fill="url(#colorTalepler)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
            </>
          )}
        </div>

        {/* Product Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {!data ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="shadow-xl">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-2" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-36" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              {/* Top Selling Products */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[var(--brand-orange-600)]" />
                    En Çok Satılan Ürünler
                  </CardTitle>
                  <CardDescription>Sipariş modülü - Top 10</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.charts.topSellingProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="name" type="category" width={100} stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill={COLORS.green} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Sell Request Products */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[var(--brand-purple-600)]" />
                En Çok Satış Talebi Oluşturulan
              </CardTitle>
              <CardDescription>Kullanıcılar hangi ürünleri satmak istiyor</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.charts.topSellRequestProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="name" type="category" width={100} stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill={COLORS.purple} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Most Problematic Products */}
          <Card className="shadow-xl border-red-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Wrench className="w-5 h-5" />
                En Sorunlu Ürünler
              </CardTitle>
              <CardDescription>En çok teknik servis talebi oluşturulan</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.charts.topProblematicProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="name" type="category" width={100} stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill={COLORS.red} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
            </>
          )}
        </div>

        {/* Problem Categories */}
        {!data ? (
          <Card className="shadow-xl">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-64 mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[var(--brand-orange-600)]" />
                Teknik Servis Problem Kategorileri
              </CardTitle>
              <CardDescription>En sık karşılaşılan sorunlar</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.charts.topProblemCategories}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill={COLORS.teal} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        )}

        {/* Pending Work */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {!data ? (
            <>
              {[1, 2].map((i) => (
                <Card key={i} className="shadow-xl">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-2" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-64" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-20 bg-gray-100 rounded animate-pulse" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              {/* Urgent Work */}
              <Card className="shadow-xl border-red-200 bg-red-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    🔴 Acil İşler (24+ Saat)
                  </CardTitle>
                  <CardDescription>24 saatten uzun süredir bekleyen talepler</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.pendingWork.urgent.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p>Acil iş yok! Harika! 🎉</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.pendingWork.urgent.map((work: any, idx: number) => (
                    <div key={idx} className="bg-white border border-red-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                            {work.type}
                          </Badge>
                          <p className="font-medium text-sm mt-1">{work.request_number}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {new Date(work.created_at).toLocaleDateString('tr-TR')} - {
                              Math.floor((Date.now() - new Date(work.created_at).getTime()) / (1000 * 60 * 60))
                            } saat önce
                          </p>
                        </div>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          İncele
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Awaiting Response */}
          <Card className="shadow-xl border-yellow-200 bg-yellow-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <Clock className="w-5 h-5" />
                ⏳ Müşteri Yanıtı Bekleniyor
              </CardTitle>
              <CardDescription>Teklif gönderilmiş, yanıt bekleyen talepler</CardDescription>
            </CardHeader>
            <CardContent>
              {data.pendingWork.awaitingResponse.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p>Bekleyen teklif yok!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.pendingWork.awaitingResponse.map((work: any, idx: number) => (
                    <div key={idx} className="bg-white border border-yellow-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                            {work.type}
                          </Badge>
                          <p className="font-medium text-sm mt-1">{work.request_number}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Teklif: {formatCurrency(work.admin_price || work.admin_offer_price || 0)}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-50">
                          Görüntüle
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
            </>
          )}
        </div>
      </div>
    </div>
    </AdminLayout>
  );
}
