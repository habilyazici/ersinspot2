import { useState, useEffect, useMemo, useCallback, memo } from 'react';
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
  AlertCircle,
  Download,
  FileText,
  Printer,
  Maximize2,
  Minimize2,
  RefreshCw,
  TrendingDown
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
    cartAbandonmentRate: number; // YENİ
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
    topFavoriteProducts: any[]; // YENİ
    topAbandonedProducts: any[]; // YENİ
    customerSegmentation: any[]; // YENİ
    avgTransactionValues: any[]; // YENİ
    completionRates: any[]; // YENİ
    stockByMonth: any[]; // YENİ
  };
  pendingWork: {
    urgent: any[];
    awaitingResponse: any[];
  };
  topActiveCustomers: any[]; // YENİ
  monthlyRevenueComparison: { // YENİ
    thisMonth: number;
    lastMonth: number;
    change: number;
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

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function AdminDashboard() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [filter, setFilter] = useState('month');
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [animateCards, setAnimateCards] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadDashboardData();
    setAnimateCards(true);
  }, [filter]);

  // Auto refresh logic
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadDashboardData();
      }, 60000); // Her 1 dakikada bir
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [autoRefresh]);

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

  // Export to CSV
  const exportToCSV = useCallback(() => {
    if (!data) return;
    
    try {
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += '=== ERSINSPOT DASHBOARD RAPORU ===\n\n';
      
      // KPIs
      csvContent += 'ANA METRIKLER\n';
      csvContent += `Toplam Gelir,${formatCurrency(data.kpis.totalRevenue)}\n`;
      csvContent += `Toplam Talepler,${data.kpis.totalRequests}\n`;
      csvContent += `İptal Oranı,%${data.kpis.cancellationRate}\n`;
      csvContent += `Kabul Oranı,%${data.kpis.acceptanceRate}\n`;
      csvContent += `Ort. Yanıt Süresi,${data.kpis.avgResponseTime} saat\n`;
      csvContent += `Müşteri Sayısı,${data.kpis.customersCount}\n`;
      csvContent += `Sepet Terk Oranı,%${data.kpis.cartAbandonmentRate}\n\n`;
      
      // Top selling products
      csvContent += 'EN ÇOK SATAN ÜRÜNLER\n';
      csvContent += 'Ürün,Satış Sayısı\n';
      data.charts.topSellingProducts.forEach((p: any) => {
        csvContent += `${p.name},${p.value}\n`;
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `dashboard_rapor_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Rapor indirildi', {
        description: 'CSV dosyası başarıyla oluşturuldu',
      });
    } catch (error) {
      toast.error('Export hatası', {
        description: 'Rapor oluşturulamadı',
      });
    }
  }, [data]);

  // Print dashboard
  const printDashboard = useCallback(() => {
    window.print();
  }, []);

  // Toggle chart expansion
  const toggleChartExpansion = useCallback((chartId: string) => {
    setExpandedChart(prev => prev === chartId ? null : chartId);
  }, []);

  // Memoized calculations
  const revenueGrowth = useMemo(() => {
    if (!data?.monthlyRevenueComparison) return null;
    return data.monthlyRevenueComparison.change;
  }, [data]);

  const totalActiveRequests = useMemo(() => {
    if (!data?.pendingWork) return 0;
    return (data.pendingWork.urgent?.length || 0) + (data.pendingWork.awaitingResponse?.length || 0);
  }, [data]);

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

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {/* Auto Refresh Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`text-white hover:bg-white/20 ${autoRefresh ? 'bg-white/20' : ''}`}
                  title="Otomatik Yenileme (1 dk)"
                >
                  <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                </Button>

                {/* Export CSV */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportToCSV}
                  disabled={!data}
                  className="text-white hover:bg-white/20"
                  title="CSV İndir"
                >
                  <Download className="w-4 h-4" />
                </Button>

                {/* Print */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={printDashboard}
                  disabled={!data}
                  className="text-white hover:bg-white/20"
                  title="Yazdır"
                >
                  <Printer className="w-4 h-4" />
                </Button>

                <div className="h-6 w-px bg-white/30 mx-2" />

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-6">
          {!data ? (
            // Skeleton Loaders
            <>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
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
              <Card className={`bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105 ${animateCards ? 'animate-fade-in' : ''}`}>
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
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-green-600">
                      Onaylanan işlemler
                    </p>
                    {revenueGrowth !== null && (
                      <div className={`flex items-center gap-1 text-xs font-semibold ${
                        revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {revenueGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        %{Math.abs(revenueGrowth).toFixed(1)}
                      </div>
                    )}
                  </div>
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
              <Card className={`bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200 hover:shadow-lg transition-all duration-300 hover:scale-105 ${animateCards ? 'animate-fade-in' : ''}`} style={{ animationDelay: '0.5s' }}>
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

              {/* Cart Abandonment Rate */}
              {data.kpis?.cartAbandonmentRate !== undefined && (
                <Card className={`bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 hover:shadow-lg transition-all duration-300 hover:scale-105 ${animateCards ? 'animate-fade-in' : ''}`} style={{ animationDelay: '0.6s' }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-yellow-700 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Sepet Terk Oranı
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-900">
                      %{data.kpis.cartAbandonmentRate}
                    </div>
                    <p className="text-xs text-yellow-600 mt-1">
                      {data.kpis.cartAbandonmentRate < 30 ? '✅ İyi' : data.kpis.cartAbandonmentRate < 60 ? '⚠️ Orta' : '🔴 Yüksek'}
                    </p>
                  </CardContent>
                </Card>
              )}
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
              <ResponsiveContainer width="100%" height={350}>
                <RechartsPie>
                  <Pie
                    data={data.charts.revenueDistribution}
                    cx="50%"
                    cy="45%"
                    labelLine={true}
                    label={(entry) => {
                      const percent = ((entry.value / data.charts.revenueDistribution.reduce((sum: number, item: any) => sum + item.value, 0)) * 100).toFixed(1);
                      return `${entry.name}: ${formatCurrency(entry.value)}`;
                    }}
                    outerRadius={90}
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
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value: string, entry: any) => `${value}: ${formatCurrency(entry.payload.value)}`}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
            </>
          )}
        </div>

        {/* Cancellation Analysis */}
        <div className="grid grid-cols-1 gap-6">
          {!data ? (
            <Card className="shadow-xl">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-36" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
              </CardContent>
            </Card>
          ) : (
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
                En Çok Satış Talebi Olan Markalar
              </CardTitle>
              <CardDescription>Hangi markaların ürünleri daha çok satılmak isteniyor</CardDescription>
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

        {/* Monthly Revenue Comparison */}
        {!data || !data.monthlyRevenueComparison ? (
          <Card className="shadow-xl">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-64 mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
            </CardHeader>
            <CardContent>
              <div className="h-[200px] bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <TrendingUp className="w-5 h-5" />
                Aylık Gelir Karşılaştırması
              </CardTitle>
              <CardDescription>Bu ay ile geçen ayın karşılaştırması</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Geçen Ay</p>
                  <p className="text-2xl font-bold text-blue-900">
                    ₺{formatNumber(data.monthlyRevenueComparison.lastMonth)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Bu Ay</p>
                  <p className="text-2xl font-bold text-green-900">
                    ₺{formatNumber(data.monthlyRevenueComparison.thisMonth)}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${data.monthlyRevenueComparison.change >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm text-gray-600 mb-1">Değişim</p>
                  <p className={`text-2xl font-bold ${data.monthlyRevenueComparison.change >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {data.monthlyRevenueComparison.change >= 0 ? '↗' : '↘'} %{Math.abs(data.monthlyRevenueComparison.change)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Favorite Products */}
          {!data || !data.charts?.topFavoriteProducts ? (
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
            <Card className="shadow-xl border-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-700">
                  <Activity className="w-5 h-5" />
                  En Çok Favori Eklenen Ürünler
                </CardTitle>
                <CardDescription>Kullanıcıların favorilerine en çok eklediği ürünler</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.charts.topFavoriteProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#6b7280" />
                    <YAxis dataKey="name" type="category" width={120} stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" fill="#ec4899" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Cart Abandonment Products */}
          {!data || !data.charts?.topAbandonedProducts ? (
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
            <Card className="shadow-xl border-yellow-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <ShoppingBag className="w-5 h-5" />
                  Sepette Bırakılan Ürünler
                </CardTitle>
                <CardDescription>Sepete eklenen ama satın alınmayan ürünler</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.charts.topAbandonedProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#6b7280" />
                    <YAxis dataKey="name" type="category" width={120} stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Customer Segmentation */}
        {!data || !data.charts?.customerSegmentation ? (
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
          <Card className="shadow-xl border-indigo-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <PieChart className="w-5 h-5" />
                Müşteri Segmentasyonu
              </CardTitle>
              <CardDescription>Müşterilerin hizmet kullanım durumları</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.charts.customerSegmentation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.charts.customerSegmentation.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Average Transaction Values & Completion Rates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Average Transaction Values */}
          {!data || !data.charts?.avgTransactionValues ? (
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
            <Card className="shadow-xl border-emerald-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <DollarSign className="w-5 h-5" />
                  Modül Bazında Ortalama İşlem Değeri
                </CardTitle>
                <CardDescription>Her modüldeki ortalama gelir</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.charts.avgTransactionValues}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => `₺${formatNumber(value)}`}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Completion Rates */}
          {!data || !data.charts?.completionRates ? (
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
            <Card className="shadow-xl border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  Modül Bazında Tamamlanma Oranları
                </CardTitle>
                <CardDescription>Her modülde sonlandırılan işlem oranı</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.charts.completionRates}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => `%${value}`}
                    />
                    <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stock by Month */}
        {!data || !data.charts?.stockByMonth ? (
          <Card className="shadow-xl">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-64 mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
            </CardHeader>
            <CardContent>
              <div className="h-[350px] bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Package className="w-5 h-5" />
                Aylara Göre Stok Analizi
              </CardTitle>
              <CardDescription>Son 6 ayda stok değişimi (Ürün sayısı ve toplam değer)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data.charts.stockByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis yAxisId="left" stroke="#6b7280" label={{ value: 'Ürün Sayısı', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" label={{ value: 'Toplam Değer (₺)', angle: 90, position: 'insideRight' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'Toplam Değer') return `₺${formatNumber(value)}`;
                      return value;
                    }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="productCount" stroke="#8b5cf6" strokeWidth={2} name="Ürün Sayısı" />
                  <Line yAxisId="right" type="monotone" dataKey="totalValue" stroke="#ec4899" strokeWidth={2} name="Toplam Değer" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Active Customers */}
        {!data || !data.topActiveCustomers ? (
          <Card className="shadow-xl">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-64 mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
            </CardHeader>
            <CardContent>
              <div className="h-[400px] bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl border-cyan-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-700">
                <Users className="w-5 h-5" />
                En Aktif Müşteriler
              </CardTitle>
              <CardDescription>En çok sipariş veren ve en çok harcama yapan müşteriler (Top 20)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold text-gray-700">#</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Müşteri Adı</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Sipariş Sayısı</th>
                      <th className="text-right p-3 font-semibold text-gray-700">Toplam Harcama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topActiveCustomers.map((customer: any, idx: number) => (
                      <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-gray-600">{idx + 1}</td>
                        <td className="p-3 font-medium text-gray-900">{customer.customer_name}</td>
                        <td className="p-3 text-center">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                            {customer.order_count} sipariş
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-semibold text-green-700">
                          ₺{formatNumber(customer.total_spent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
