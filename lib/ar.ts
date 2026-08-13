/** Arabic UI strings — Elkahmed Admin */

export const ar = {
  appName: 'قـا أحمد',
  appSubtitle: 'لوحة إدارة المطعم',
  admin: 'المسؤول',
  loading: 'جاري التحميل...',
  error: 'خطأ',
  save: 'حفظ',
  cancel: 'إلغاء',
  close: 'إغلاق',
  delete: 'حذف',
  edit: 'تعديل',
  refresh: 'تحديث',
  search: 'بحث',
  searchPlaceholder: 'ابحث عن طلبات، طاولات، منتجات...',
  noResults: 'لا توجد نتائج',
  viewAll: 'عرض الكل',
  currency: 'درهم',
  dh: 'د.م',

  nav: {
    dashboard: 'لوحة التحكم',
    menu: 'المنيو',
    products: 'المنتجات',
    categories: 'التصنيفات',
    orders: 'الطلبات',
    tables: 'الطاولات',
    qr: 'رموز QR',
    waiterRequests: 'نداءات النادل',
    analytics: 'التحليلات',
    staff: 'الموظفون',
    settings: 'الإعدادات',
  },

  dashboard: {
    title: 'لوحة التحكم',
    subtitle: 'مرحباً بك! إليك نظرة عامة على المطعم.',
    todayOrders: 'طلبات اليوم',
    todayRevenue: 'إيرادات اليوم',
    activeTables: 'الطاولات النشطة',
    preparingOrders: 'قيد التحضير',
    avgOrderValue: 'متوسط قيمة الطلب',
    vsYesterday: 'مقارنة بالأمس',
    occupied: 'مشغولة',
    inKitchen: 'في المطبخ',
    salesChart: 'المبيعات والطلبات',
    topSelling: 'الأكثر مبيعاً',
    recentOrders: 'أحدث الطلبات',
    noOrders: 'لا توجد طلبات حالياً',
    noProducts: 'لا توجد منتجات مبيعة',
    noChartData: 'لا توجد بيانات للعرض',
    viewAnalytics: 'عرض التحليلات التفصيلية',
    sales: 'مبيعات',
    ordersCount: 'طلب',
  },

  periods: {
    today: 'اليوم',
    yesterday: 'أمس',
    week: 'هذا الأسبوع',
    month: 'هذا الشهر',
  },

  orderStatus: {
    new: 'جديد',
    preparing: 'قيد التحضير',
    ready: 'جاهز',
    served: 'تم التقديم',
    cancelled: 'ملغى',
    all: 'الكل',
  },

  tableStatus: {
    empty: 'فارغة',
    occupied: 'مشغولة',
    needs_attention: 'تحتاج انتباهاً',
  },

  waiterType: {
    waiter: 'نداء نادل',
    bill: 'طلب الحساب',
    issue: 'مشكلة',
    other: 'أخرى',
  },

  waiterStatus: {
    new: 'جديد',
    accepted: 'مقبول',
    resolved: 'تم الحل',
    all: 'الكل',
  },

  staffRole: {
    Waiter: 'نادل',
    Kitchen: 'مطبخ',
    Staff: 'موظف',
  },

  staffStatus: {
    online: 'متصل',
    offline: 'غير متصل',
  },

  notifications: {
    title: 'الإشعارات',
    empty: 'لا توجد إشعارات جديدة',
    newOrder: 'طلب جديد من الطاولة',
    waiterRequest: 'نداء نادل من الطاولة',
  },

  header: {
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
  },
} as const;

export type OrderStatusKey = keyof typeof ar.orderStatus;
export type TableStatusKey = keyof typeof ar.tableStatus;

export function formatRelativeTimeAr(dateString: string): string {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  return date.toLocaleDateString('ar-MA');
}

export function formatTimeAr(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('ar-MA', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatNumberAr(value: number): string {
  return new Intl.NumberFormat('ar-MA').format(Math.round(value));
}
