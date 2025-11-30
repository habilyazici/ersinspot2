import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

// Supabase client helper
function getSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

// User verification helper
async function verifyUser(authHeader: string | undefined) {
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  const supabase = getSupabaseClient();
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    console.error('[AUTH] User verification failed:', error);
    return null;
  }
  
  return user;
}

// Admin email listesi
const ADMIN_EMAILS = [
  'admin@ersinspot.com',
  'ersinspot@gmail.com'
];

// Admin verification helper (EMAIL bazlı)
async function verifyAdmin(authHeader: string | undefined) {
  const user = await verifyUser(authHeader);
  if (!user) return null;

  // Email kontrolü yap
  const isAdmin = ADMIN_EMAILS.includes(user.email || '');
  
  if (!isAdmin) {
    console.error('[AUTH] Not an admin email:', user.email);
    return null;
  }

  return user;
}

// Helper: Calculate date range
function getDateRange(filter: string) {
  const now = new Date();
  let startDate = new Date();

  switch (filter) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case '3months':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case '6months':
      startDate.setMonth(now.getMonth() - 6);
      break;
    case 'all':
    default:
      startDate = new Date('2020-01-01'); // Beginning of time
      break;
  }

  return { startDate: startDate.toISOString(), endDate: now.toISOString() };
}

// GET /make-server-0f4d2485/admin/dashboard - Admin Dashboard Data
app.get('/dashboard', async (c) => {
  try {
    console.log('[ADMIN DASHBOARD] 📊 Fetching dashboard data...');
    
    const authHeader = c.req.header('Authorization');
    const admin = await verifyAdmin(authHeader);

    if (!admin) {
      console.log('[ADMIN DASHBOARD] ❌ Unauthorized');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const filter = c.req.query('filter') || 'month'; // default: last month
    const { startDate, endDate } = getDateRange(filter);

    console.log('[ADMIN DASHBOARD] 📅 Date range:', { filter, startDate, endDate });

    const supabase = getSupabaseClient();

    // ============================================
    // 1. KPI METRICS
    // ============================================

    // Total Revenue (accepted orders, moving, services)
    const { data: ordersData } = await supabase
      .from('orders')
      .select('total_price, status, created_at')
      .in('status', ['processing', 'shipped', 'delivered'])
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { data: movingData } = await supabase
      .from('moving_requests')
      .select('admin_price, status, created_at')
      .in('status', ['accepted', 'completed'])
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { data: serviceData } = await supabase
      .from('service_requests')
      .select('final_price, status, created_at')
      .in('status', ['completed'])
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const totalRevenue = 
      (ordersData?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0) +
      (movingData?.reduce((sum, m) => sum + (m.admin_price || 0), 0) || 0) +
      (serviceData?.reduce((sum, s) => sum + (s.final_price || 0), 0) || 0);

    // Total Requests Count
    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { count: movingCount } = await supabase
      .from('moving_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { count: serviceCount } = await supabase
      .from('service_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { count: sellCount } = await supabase
      .from('sell_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const totalRequests = (ordersCount || 0) + (movingCount || 0) + (serviceCount || 0) + (sellCount || 0);

    // Cancellation Rate
    const { count: cancelledOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'cancelled')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { count: cancelledMoving } = await supabase
      .from('moving_requests')
      .select('*', { count: 'exact', head: true })
      .in('status', ['cancelled', 'rejected'])
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { count: cancelledService } = await supabase
      .from('service_requests')
      .select('*', { count: 'exact', head: true })
      .in('status', ['cancelled', 'rejected'])
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { count: rejectedSell } = await supabase
      .from('sell_requests')
      .select('*', { count: 'exact', head: true })
      .in('status', ['cancelled', 'rejected'])
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const totalCancellations = (cancelledOrders || 0) + (cancelledMoving || 0) + (cancelledService || 0) + (rejectedSell || 0);
    const cancellationRate = totalRequests > 0 ? (totalCancellations / totalRequests) * 100 : 0;

    // Offer Acceptance Rate (Moving + Sell Requests)
    const { count: acceptedMoving } = await supabase
      .from('moving_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { count: acceptedSell } = await supabase
      .from('sell_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { count: offersWithResponse } = await supabase
      .from('moving_requests')
      .select('*', { count: 'exact', head: true })
      .in('status', ['accepted', 'rejected'])
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { count: sellOffersWithResponse } = await supabase
      .from('sell_requests')
      .select('*', { count: 'exact', head: true })
      .in('status', ['accepted', 'rejected'])
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const totalAccepted = (acceptedMoving || 0) + (acceptedSell || 0);
    const totalOffersResponded = (offersWithResponse || 0) + (sellOffersWithResponse || 0);
    const acceptanceRate = totalOffersResponded > 0 ? (totalAccepted / totalOffersResponded) * 100 : 0;

    // Average Response Time (Hours)
    const { data: movingResponseTimes } = await supabase
      .from('moving_requests')
      .select('created_at, updated_at, status')
      .not('admin_price', 'is', null)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { data: sellResponseTimes } = await supabase
      .from('sell_requests')
      .select('created_at, updated_at, status')
      .not('admin_offer_price', 'is', null)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    let totalResponseTimeHours = 0;
    let responseCount = 0;

    if (movingResponseTimes) {
      movingResponseTimes.forEach(req => {
        const created = new Date(req.created_at).getTime();
        const updated = new Date(req.updated_at).getTime();
        const diffHours = (updated - created) / (1000 * 60 * 60);
        totalResponseTimeHours += diffHours;
        responseCount++;
      });
    }

    if (sellResponseTimes) {
      sellResponseTimes.forEach(req => {
        const created = new Date(req.created_at).getTime();
        const updated = new Date(req.updated_at).getTime();
        const diffHours = (updated - created) / (1000 * 60 * 60);
        totalResponseTimeHours += diffHours;
        responseCount++;
      });
    }

    const avgResponseTime = responseCount > 0 ? totalResponseTimeHours / responseCount : 0;

    // Total Active Customers
    const { count: customersCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    // ============================================
    // 2. MONTHLY TREND (Last 6 Months)
    // ============================================

    const monthlyTrend: any[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const monthName = monthStart.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });

      // Orders
      const { count: ordersMonth } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      // Moving
      const { count: movingMonth } = await supabase
        .from('moving_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      // Service
      const { count: serviceMonth } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      // Sell
      const { count: sellMonth } = await supabase
        .from('sell_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      monthlyTrend.push({
        month: monthName,
        sipariş: ordersMonth || 0,
        nakliye: movingMonth || 0,
        'teknik servis': serviceMonth || 0,
        'ürün satış': sellMonth || 0,
      });
    }

    // ============================================
    // 3. REVENUE DISTRIBUTION
    // ============================================

    const revenueDistribution = [
      { 
        name: 'Sipariş', 
        value: ordersData?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0,
        color: '#f97316' // orange
      },
      { 
        name: 'Nakliye', 
        value: movingData?.reduce((sum, m) => sum + (m.admin_price || 0), 0) || 0,
        color: '#1e3a8a' // navy
      },
      { 
        name: 'Teknik Servis', 
        value: serviceData?.reduce((sum, s) => sum + (s.final_price || 0), 0) || 0,
        color: '#14b8a6' // teal
      }
    ];

    // ============================================
    // 4. CANCELLATION ANALYSIS
    // ============================================

    const ordersCancellationRate = ordersCount ? ((cancelledOrders || 0) / ordersCount) * 100 : 0;
    const movingCancellationRate = movingCount ? ((cancelledMoving || 0) / movingCount) * 100 : 0;
    const serviceCancellationRate = serviceCount ? ((cancelledService || 0) / serviceCount) * 100 : 0;
    const sellRejectionRate = sellCount ? ((rejectedSell || 0) / sellCount) * 100 : 0;

    const cancellationAnalysis = [
      { name: 'Sipariş', rate: ordersCancellationRate },
      { name: 'Nakliye', rate: movingCancellationRate },
      { name: 'Teknik Servis', rate: serviceCancellationRate },
      { name: 'Ürün Satış (Red)', rate: sellRejectionRate },
    ];

    // ============================================
    // 5. TOP SELLING PRODUCTS
    // ============================================

    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_title, quantity, orders!inner(created_at)')
      .gte('orders.created_at', startDate)
      .lte('orders.created_at', endDate);

    const productSales: Record<string, number> = {};
    orderItems?.forEach(item => {
      if (!productSales[item.product_title]) {
        productSales[item.product_title] = 0;
      }
      productSales[item.product_title] += item.quantity;
    });

    const topSellingProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    // ============================================
    // 6. TOP SELL REQUEST PRODUCTS
    // ============================================

    const { data: sellRequests } = await supabase
      .from('sell_requests')
      .select('title, brand')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const sellRequestProducts: Record<string, number> = {};
    sellRequests?.forEach(req => {
      const key = `${req.brand || 'Bilinmiyor'} ${req.title || 'Ürün'}`;
      if (!sellRequestProducts[key]) {
        sellRequestProducts[key] = 0;
      }
      sellRequestProducts[key]++;
    });

    const topSellRequestProducts = Object.entries(sellRequestProducts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    // ============================================
    // 7. MOST PROBLEMATIC PRODUCTS (Technical Service)
    // ============================================

    const { data: serviceRequests } = await supabase
      .from('service_requests')
      .select('product_type, problem_category')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const problematicProducts: Record<string, number> = {};
    serviceRequests?.forEach(req => {
      const key = req.product_type || 'Bilinmiyor';
      if (!problematicProducts[key]) {
        problematicProducts[key] = 0;
      }
      problematicProducts[key]++;
    });

    const topProblematicProducts = Object.entries(problematicProducts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    // ============================================
    // 8. PROBLEM CATEGORIES
    // ============================================

    const problemCategories: Record<string, number> = {};
    serviceRequests?.forEach(req => {
      const key = req.problem_category || 'Diğer';
      if (!problemCategories[key]) {
        problemCategories[key] = 0;
      }
      problemCategories[key]++;
    });

    const topProblemCategories = Object.entries(problemCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    // ============================================
    // 9. PENDING WORK (Urgent + Awaiting Response)
    // ============================================

    const urgentThreshold = new Date();
    urgentThreshold.setHours(urgentThreshold.getHours() - 24); // 24 hours ago

    // Urgent - more than 24h in reviewing
    const { data: urgentMoving } = await supabase
      .from('moving_requests')
      .select('id, request_number, created_at, from_address, to_address')
      .eq('status', 'reviewing')
      .lt('created_at', urgentThreshold.toISOString())
      .order('created_at', { ascending: true })
      .limit(5);

    const { data: urgentService } = await supabase
      .from('service_requests')
      .select('id, request_number, created_at, product_type, service_address')
      .eq('status', 'reviewing')
      .lt('created_at', urgentThreshold.toISOString())
      .order('created_at', { ascending: true })
      .limit(5);

    // Awaiting customer response (offer_sent)
    const { data: awaitingMoving } = await supabase
      .from('moving_requests')
      .select('id, request_number, created_at, from_address, to_address, admin_price')
      .eq('status', 'offer_sent')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: awaitingSell } = await supabase
      .from('sell_requests')
      .select('id, request_number, created_at, title, brand, admin_offer_price')
      .eq('status', 'offer_sent')
      .order('created_at', { ascending: false })
      .limit(5);

    const pendingWork = {
      urgent: [
        ...(urgentMoving?.map(m => ({ ...m, type: 'nakliye' })) || []),
        ...(urgentService?.map(s => ({ ...s, type: 'teknik-servis' })) || []),
      ],
      awaitingResponse: [
        ...(awaitingMoving?.map(m => ({ ...m, type: 'nakliye' })) || []),
        ...(awaitingSell?.map(s => ({ ...s, type: 'ürün-satış' })) || []),
      ],
    };

    // ============================================
    // 10. DAILY TREND (Last 30 Days)
    // ============================================

    const dailyTrend: any[] = [];
    
    for (let i = 29; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayName = dayStart.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

      const { count: ordersDay } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dayStart.toISOString())
        .lte('created_at', dayEnd.toISOString());

      const { count: movingDay } = await supabase
        .from('moving_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dayStart.toISOString())
        .lte('created_at', dayEnd.toISOString());

      const { count: serviceDay } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dayStart.toISOString())
        .lte('created_at', dayEnd.toISOString());

      const { count: sellDay } = await supabase
        .from('sell_requests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dayStart.toISOString())
        .lte('created_at', dayEnd.toISOString());

      dailyTrend.push({
        day: dayName,
        talepler: (ordersDay || 0) + (movingDay || 0) + (serviceDay || 0) + (sellDay || 0),
      });
    }

    // ============================================
    // 11. YENİ METRİKLER - EN ÇOK FAVORİLERE EKLENEN ÜRÜNLER
    // ============================================

    const { data: allFavorites } = await supabase
      .from('favorites')
      .select('product_id')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const favoriteProductCounts: Record<string, number> = {};
    allFavorites?.forEach(fav => {
      const productId = fav.product_id;
      if (!favoriteProductCounts[productId]) {
        favoriteProductCounts[productId] = 0;
      }
      favoriteProductCounts[productId]++;
    });

    // Product bilgilerini çek
    const topFavoriteProductIds = Object.entries(favoriteProductCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id);

    let topFavoriteProducts: any[] = [];
    if (topFavoriteProductIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .in('id', topFavoriteProductIds);

      topFavoriteProducts = topFavoriteProductIds
        .map(id => {
          const product = products?.find(p => p.id === id);
          return {
            name: product?.name || 'Bilinmeyen Ürün',
            value: favoriteProductCounts[id],
          };
        });
    }

    // ============================================
    // 12. SEPETE EKLENEN AMA SATILMAYAN ÜRÜNLER
    // ============================================

    // Tüm sepet öğeleri
    const { data: allCartItems } = await supabase
      .from('cart_items')
      .select('product_id, created_at');

    // Satın alınan ürünler
    const { data: purchasedItems } = await supabase
      .from('order_items')
      .select('product_id, orders!inner(created_at, status)')
      .in('orders.status', ['processing', 'shipped', 'delivered', 'completed'])
      .gte('orders.created_at', startDate)
      .lte('orders.created_at', endDate);

    const purchasedProductIds = new Set(purchasedItems?.map(item => item.product_id) || []);
    
    const abandonedCartProducts: Record<string, number> = {};
    allCartItems?.forEach(item => {
      if (!purchasedProductIds.has(item.product_id)) {
        if (!abandonedCartProducts[item.product_id]) {
          abandonedCartProducts[item.product_id] = 0;
        }
        abandonedCartProducts[item.product_id]++;
      }
    });

    const topAbandonedProductIds = Object.entries(abandonedCartProducts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id);

    let topAbandonedProducts: any[] = [];
    if (topAbandonedProductIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .in('id', topAbandonedProductIds);

      topAbandonedProducts = topAbandonedProductIds
        .map(id => {
          const product = products?.find(p => p.id === id);
          return {
            name: product?.name || 'Bilinmeyen Ürün',
            value: abandonedCartProducts[id],
          };
        });
    }

    // Sepet terk oranı
    const totalCartItems = allCartItems?.length || 0;
    const totalPurchased = purchasedItems?.length || 0;
    const cartAbandonmentRate = totalCartItems > 0 ? ((totalCartItems - totalPurchased) / totalCartItems) * 100 : 0;

    // ============================================
    // 13. EN AKTİF MÜŞTERİLER
    // ============================================

    const { data: customerOrders } = await supabase
      .from('orders')
      .select('customer_id, total_price, customers!inner(name, email)')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const customerActivity: Record<string, { name: string; email: string; orderCount: number; totalSpent: number }> = {};

    customerOrders?.forEach(order => {
      const customerId = order.customer_id;
      if (!customerActivity[customerId]) {
        customerActivity[customerId] = {
          name: order.customers.name || 'İsimsiz',
          email: order.customers.email || '',
          orderCount: 0,
          totalSpent: 0,
        };
      }
      customerActivity[customerId].orderCount++;
      customerActivity[customerId].totalSpent += order.total_price || 0;
    });

    const topActiveCustomers = Object.entries(customerActivity)
      .sort((a, b) => b[1].orderCount - a[1].orderCount)
      .slice(0, 10)
      .map(([id, data]) => ({
        name: data.name,
        email: data.email,
        orderCount: data.orderCount,
        totalSpent: data.totalSpent,
      }));

    // ============================================
    // 14. MÜŞTERİ SEGMENTASYONU
    // ============================================

    // Sadece sipariş veren müşteriler
    const { data: orderOnlyCustomers } = await supabase
      .from('customers')
      .select('id')
      .in('id', customerOrders?.map(o => o.customer_id) || []);

    // Teknik servis kullanan müşteriler
    const { data: serviceCustomers } = await supabase
      .from('service_requests')
      .select('customer_id')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // Nakliye kullanan müşteriler
    const { data: movingCustomers } = await supabase
      .from('moving_requests')
      .select('customer_id')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // Ürün satış talebi oluşturan müşteriler
    const { data: sellCustomers } = await supabase
      .from('sell_requests')
      .select('customer_id')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const orderCustomerIds = new Set(customerOrders?.map(o => o.customer_id) || []);
    const serviceCustomerIds = new Set(serviceCustomers?.map(s => s.customer_id) || []);
    const movingCustomerIds = new Set(movingCustomers?.map(m => m.customer_id) || []);
    const sellCustomerIds = new Set(sellCustomers?.map(s => s.customer_id) || []);

    // Sadece ürün alanlar (diğer servisleri kullanmayanlar)
    const onlyOrdersCount = Array.from(orderCustomerIds).filter(
      id => !serviceCustomerIds.has(id) && !movingCustomerIds.has(id) && !sellCustomerIds.has(id)
    ).length;

    // Sadece servis kullananlar
    const onlyServiceCount = Array.from(serviceCustomerIds).filter(
      id => !orderCustomerIds.has(id) && !movingCustomerIds.has(id) && !sellCustomerIds.has(id)
    ).length;

    // Çoklu servis kullananlar
    const multiServiceCount = Array.from(new Set([
      ...orderCustomerIds,
      ...serviceCustomerIds,
      ...movingCustomerIds,
      ...sellCustomerIds,
    ])).filter(id => {
      let serviceCount = 0;
      if (orderCustomerIds.has(id)) serviceCount++;
      if (serviceCustomerIds.has(id)) serviceCount++;
      if (movingCustomerIds.has(id)) serviceCount++;
      if (sellCustomerIds.has(id)) serviceCount++;
      return serviceCount >= 2;
    }).length;

    const customerSegmentation = [
      { name: 'Sadece Ürün Alıyor', value: onlyOrdersCount },
      { name: 'Sadece Servis Kullanıyor', value: onlyServiceCount },
      { name: 'Çoklu Hizmet Kullanan', value: multiServiceCount },
    ];

    // ============================================
    // 15. AYLIK GELİR KARŞILAŞTIRMASI
    // ============================================

    const thisMonth = new Date();
    const thisMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    const thisMonthEnd = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0, 23, 59, 59);

    const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1);
    const lastMonthStart = lastMonth;
    const lastMonthEnd = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 0, 23, 59, 59);

    // Bu ay geliri
    const { data: thisMonthOrders } = await supabase
      .from('orders')
      .select('total_price')
      .in('status', ['processing', 'shipped', 'delivered'])
      .gte('created_at', thisMonthStart.toISOString())
      .lte('created_at', thisMonthEnd.toISOString());

    const { data: thisMonthMoving } = await supabase
      .from('moving_requests')
      .select('admin_price')
      .in('status', ['accepted', 'completed'])
      .gte('created_at', thisMonthStart.toISOString())
      .lte('created_at', thisMonthEnd.toISOString());

    const { data: thisMonthService } = await supabase
      .from('service_requests')
      .select('final_price')
      .eq('status', 'completed')
      .gte('created_at', thisMonthStart.toISOString())
      .lte('created_at', thisMonthEnd.toISOString());

    const thisMonthRevenue = 
      (thisMonthOrders?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0) +
      (thisMonthMoving?.reduce((sum, m) => sum + (m.admin_price || 0), 0) || 0) +
      (thisMonthService?.reduce((sum, s) => sum + (s.final_price || 0), 0) || 0);

    // Geçen ay geliri
    const { data: lastMonthOrders } = await supabase
      .from('orders')
      .select('total_price')
      .in('status', ['processing', 'shipped', 'delivered'])
      .gte('created_at', lastMonthStart.toISOString())
      .lte('created_at', lastMonthEnd.toISOString());

    const { data: lastMonthMoving } = await supabase
      .from('moving_requests')
      .select('admin_price')
      .in('status', ['accepted', 'completed'])
      .gte('created_at', lastMonthStart.toISOString())
      .lte('created_at', lastMonthEnd.toISOString());

    const { data: lastMonthService } = await supabase
      .from('service_requests')
      .select('final_price')
      .eq('status', 'completed')
      .gte('created_at', lastMonthStart.toISOString())
      .lte('created_at', lastMonthEnd.toISOString());

    const lastMonthRevenue = 
      (lastMonthOrders?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0) +
      (lastMonthMoving?.reduce((sum, m) => sum + (m.admin_price || 0), 0) || 0) +
      (lastMonthService?.reduce((sum, s) => sum + (s.final_price || 0), 0) || 0);

    const revenueChange = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    const monthlyRevenueComparison = {
      thisMonth: thisMonthRevenue,
      lastMonth: lastMonthRevenue,
      change: Math.round(revenueChange * 10) / 10,
    };

    // ============================================
    // 16. MODÜL BAZINDA ORTALAMA İŞLEM DEĞERİ
    // ============================================

    const avgOrderValue = ordersCount && ordersCount > 0 
      ? (ordersData?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0) / ordersCount 
      : 0;

    const avgMovingValue = movingCount && movingCount > 0
      ? (movingData?.reduce((sum, m) => sum + (m.admin_price || 0), 0) || 0) / movingCount
      : 0;

    const avgServiceValue = serviceCount && serviceCount > 0
      ? (serviceData?.reduce((sum, s) => sum + (s.final_price || 0), 0) || 0) / serviceCount
      : 0;

    const avgTransactionValues = [
      { name: 'Sipariş', value: Math.round(avgOrderValue) },
      { name: 'Nakliye', value: Math.round(avgMovingValue) },
      { name: 'Teknik Servis', value: Math.round(avgServiceValue) },
    ];

    // ============================================
    // 17. MODÜL BAZINDA TAMAMLANMA ORANLARI
    // ============================================

    const { count: completedOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'delivered')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { count: completedMoving } = await supabase
      .from('moving_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { count: completedService } = await supabase
      .from('service_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const { count: completedSell } = await supabase
      .from('sell_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const completionRates = [
      { 
        name: 'Sipariş', 
        rate: ordersCount ? Math.round((completedOrders || 0) / ordersCount * 100 * 10) / 10 : 0 
      },
      { 
        name: 'Nakliye', 
        rate: movingCount ? Math.round((completedMoving || 0) / movingCount * 100 * 10) / 10 : 0 
      },
      { 
        name: 'Teknik Servis', 
        rate: serviceCount ? Math.round((completedService || 0) / serviceCount * 100 * 10) / 10 : 0 
      },
      { 
        name: 'Ürün Satış', 
        rate: sellCount ? Math.round((completedSell || 0) / sellCount * 100 * 10) / 10 : 0 
      },
    ];

    // ============================================
    // 18. STOK VE ÜRÜN ANALİZİ (Aylık Grafik)
    // ============================================

    const stockByMonth: any[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthName = monthStart.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });

      // O ay için ürün sayısı ve toplam değer
      const { data: monthProducts } = await supabase
        .from('products')
        .select('price, stock')
        .lte('created_at', monthEnd.toISOString());

      const productCount = monthProducts?.length || 0;
      const totalValue = monthProducts?.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0) || 0;

      stockByMonth.push({
        month: monthName,
        productCount,
        totalValue: Math.round(totalValue),
      });
    }

    // ============================================
    // RESPONSE (YENİ VERİLER EKLENDİ)
    // ============================================

    const dashboardData = {
      kpis: {
        totalRevenue,
        totalRequests,
        cancellationRate: Math.round(cancellationRate * 10) / 10,
        acceptanceRate: Math.round(acceptanceRate * 10) / 10,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        customersCount: customersCount || 0,
        cartAbandonmentRate: Math.round(cartAbandonmentRate * 10) / 10, // YENİ
      },
      charts: {
        monthlyTrend,
        revenueDistribution,
        cancellationAnalysis,
        topSellingProducts,
        topSellRequestProducts,
        topProblematicProducts,
        topProblemCategories,
        dailyTrend,
        topFavoriteProducts, // YENİ
        topAbandonedProducts, // YENİ
        customerSegmentation, // YENİ
        avgTransactionValues, // YENİ
        completionRates, // YENİ
        stockByMonth, // YENİ
      },
      pendingWork,
      topActiveCustomers, // YENİ
      monthlyRevenueComparison, // YENİ
    };

    console.log('[ADMIN DASHBOARD] ✅ Dashboard data fetched successfully');
    return c.json(dashboardData);

  } catch (error: any) {
    console.error('[ADMIN DASHBOARD] ❌ Exception:', error);
    return c.json({ error: 'Internal server error', details: String(error) }, 500);
  }
});

export default app;
