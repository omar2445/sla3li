const ar = {
  // Nav
  home: 'الرئيسية', catalog: 'المنتجات', login: 'تسجيل الدخول', register: 'إنشاء حساب', logout: 'خروج',
  dashboard: 'لوحة التحكم', profile: 'الملف الشخصي', notifications: 'الإشعارات',
  // Home
  welcome: 'مرحباً بكم في سلعلي', tagline: 'التجارة بسيطة',
  subtitle: 'يربط تجار الجملة والتجزئة ومزودي التوصيل عبر الجزائر',
  getStarted: 'ابدأ الآن', browseProducts: 'تصفح المنتجات',
  forWholesalers: 'لتجار الجملة', forRetailers: 'للتجار', forDelivery: 'لعمال التوصيل',
  wholesalerDesc: 'انشر منتجاتك، أدر مخزونك، أكد الطلبات، وطوّر عملك رقمياً.',
  retailerDesc: 'ابحث عن أفضل الأسعار، قارن الموردين، واطلب البضائع دون الذهاب إلى السوق.',
  deliveryDesc: 'اقبل مهام التوصيل، حدّث الحالة في الوقت الفعلي، وزد دخلك.',
  howItWorks: 'كيف يعمل', step1: 'سجّل واحصل على موافقة', step2: 'انشر أو تصفح المنتجات', step3: 'اطلب وتابع التوصيل',
  step1Desc: 'أنشئ حسابك، اختر دورك، واحصل على موافقة فريق الإدارة.',
  step2Desc: 'تجار الجملة ينشرون المنتجات. التجار يبحثون ويقارنون ويختارون.',
  step3Desc: 'ضع الطلبات، تابع الحالة في الوقت الفعلي، والتوصيل يصل إليك.',
  stats: 'إحصائيات المنصة', statSuppliers: 'موردون نشطون', statProducts: 'منتجات مدرجة', statOrders: 'طلبات منجزة', statWilayas: 'ولاية مغطاة',
  featuredCats: 'تصفح حسب الفئة',
  // Auth
  email: 'البريد الإلكتروني', password: 'كلمة المرور', confirmPassword: 'تأكيد كلمة المرور',
  name: 'الاسم الكامل', phone: 'رقم الهاتف', wilaya: 'الولاية', address: 'العنوان',
  businessName: 'اسم المتجر / المؤسسة', selectRole: 'اختر دورك',
  roleWholesaler: 'تاجر جملة (Grossiste)', roleRetailer: 'تاجر تجزئة (Détaillant)', roleDriver: 'سائق توصيل',
  alreadyHaveAccount: 'لديك حساب بالفعل؟', dontHaveAccount: 'ليس لديك حساب؟',
  loginHere: 'سجّل الدخول هنا', registerHere: 'أنشئ حساباً هنا',
  loginSuccess: 'مرحباً بعودتك!', registerSuccess: 'تم إنشاء الحساب! في انتظار الموافقة.',
  // Products
  products: 'المنتجات', search: 'ابحث عن منتجات...', filter: 'تصفية', sortBy: 'ترتيب حسب',
  category: 'الفئة', allCategories: 'جميع الفئات', priceRange: 'نطاق السعر',
  minOrder: 'الحد الأدنى للطلب', unit: 'الوحدة', stock: 'المخزون', inStock: 'متوفر', outOfStock: 'غير متوفر',
  addToCart: 'أضف للسلة', buyNow: 'اطلب الآن', viewDetails: 'عرض التفاصيل',
  supplier: 'المورد', minOrderQty: 'الحد الأدنى للطلب', pricePerUnit: 'السعر / الوحدة',
  noProducts: 'لا توجد منتجات', relatedProducts: 'منتجات مشابهة',
  // Orders
  orders: 'الطلبات', orderHistory: 'سجل الطلبات', placeOrder: 'تأكيد الطلب',
  orderTotal: 'إجمالي الطلب', orderStatus: 'الحالة', orderDate: 'التاريخ',
  pending: 'قيد الانتظار', confirmed: 'مؤكد', processing: 'قيد المعالجة',
  shipped: 'تم الشحن', delivered: 'تم التوصيل', cancelled: 'ملغي',
  cancelOrder: 'إلغاء الطلب', trackOrder: 'تتبع الطلب', orderDetails: 'تفاصيل الطلب',
  quantity: 'الكمية', subtotal: 'المجموع الجزئي', total: 'الإجمالي', notes: 'ملاحظات',
  deliveryAddress: 'عنوان التوصيل',
  // Dashboard
  overview: 'نظرة عامة', myProducts: 'منتجاتي', myOrders: 'طلباتي',
  favorites: 'المفضلة', reports: 'التقارير', settings: 'الإعدادات',
  addProduct: 'إضافة منتج', editProduct: 'تعديل المنتج', deleteProduct: 'حذف المنتج',
  stockAlert: 'تنبيه مخزون منخفض', totalRevenue: 'إجمالي الإيرادات', totalOrders: 'إجمالي الطلبات',
  pendingOrders: 'طلبات معلقة', activeProducts: 'منتجات نشطة',
  // Admin
  users: 'المستخدمون', moderation: 'الإشراف', categories: 'الفئات', platformStats: 'إحصائيات المنصة',
  approve: 'موافقة', suspend: 'تعليق', delete: 'حذف', activate: 'تفعيل',
  pendingApproval: 'بانتظار الموافقة', active: 'نشط', suspended: 'موقوف',
  // Delivery
  availableDeliveries: 'التوصيلات المتاحة', myDeliveries: 'توصيلاتي',
  acceptDelivery: 'قبول', pickUp: 'تم الاستلام', inTransit: 'في الطريق', markDelivered: 'تم التوصيل',
  driver: 'السائق', pickupAddress: 'عنوان الاستلام', estimatedTime: 'الوقت المتوقع',
  // Common
  loading: 'جاري التحميل...', error: 'حدث خطأ', save: 'حفظ', cancel: 'إلغاء',
  confirm: 'تأكيد', back: 'رجوع', next: 'التالي', submit: 'إرسال', edit: 'تعديل',
  viewAll: 'عرض الكل', noData: 'لا توجد بيانات', required: 'هذا الحقل مطلوب',
  price: 'السعر', actions: 'الإجراءات', status: 'الحالة', date: 'التاريخ', name: 'الاسم',
  pendingApprovalMsg: 'حسابك بانتظار موافقة المشرف. سيتم إشعارك قريباً.',
  cartEmpty: 'سلة الشراء فارغة', checkout: 'إتمام الشراء', cart: 'السلة',
  supplierProfile: 'ملف المورد', contactSupplier: 'تواصل مع المورد',
  searchResults: 'نتائج البحث', showing: 'عرض', of: 'من', results: 'نتيجة',
  // Chatbot
  chatbotTitle: 'مساعد سلعلي', chatbotSubtitle: 'متصل · اسألني أي شيء',
  chatbotWelcome: 'مرحباً! أنا مساعد سلعلي. كيف يمكنني مساعدتك اليوم؟',
  chatbotPlaceholder: 'اكتب رسالة...', chatbotError: 'عذراً، حدث خطأ ما. الرجاء المحاولة مرة أخرى.',
};

export default ar;
