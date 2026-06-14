import { Link } from 'react-router-dom';
import { ArrowRight, Package, Store, Truck, CheckCircle, TrendingUp, Shield, Zap, Star, Users, Globe, LayoutDashboard } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { icon: '🍞', en: 'Food & Beverages', ar: 'مواد غذائية' },
  { icon: '🧴', en: 'Cleaning Products', ar: 'منتجات التنظيف' },
  { icon: '📱', en: 'Electronics', ar: 'إلكترونيات' },
  { icon: '👗', en: 'Clothing & Textiles', ar: 'ملابس ومنسوجات' },
  { icon: '🏗️', en: 'Construction', ar: 'مواد البناء' },
  { icon: '🌿', en: 'Agricultural', ar: 'منتجات زراعية' },
  { icon: '💄', en: 'Cosmetics', ar: 'مستحضرات التجميل' },
  { icon: '📚', en: 'Stationery', ar: 'قرطاسية' },
  { icon: '🔧', en: 'Hardware & Tools', ar: 'أدوات ومعدات' },
  { icon: '👜', en: 'Accessories', ar: 'إكسسوارات' },
];

const STATS = [
  { value: '200+', labelEn: 'Active Suppliers', labelAr: 'مورد نشط' },
  { value: '5,000+', labelEn: 'Listed Products', labelAr: 'منتج مدرج' },
  { value: '12,000+', labelEn: 'Orders Placed', labelAr: 'طلب منجز' },
  { value: '69', labelEn: 'Wilayas Covered', labelAr: 'ولاية مغطاة' },
];

const PARTNERS = [
  { name: 'Yalidine', initials: 'YL' },
  { name: 'Yassir', initials: 'YS' },
  { name: 'Zaki Express', initials: 'ZE' },
  { name: 'Maystro', initials: 'MY' },
  { name: 'BaridiMob', initials: 'BM' },
];

function MockupCard() {
  return (
    <div className="relative animate-float">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 w-80 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Live Orders</span>
          <span className="flex items-center gap-1.5 text-xs text-primary-400 font-semibold">
            <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" /> Live
          </span>
        </div>
        {[
          { name: 'Olive Oil × 48', status: 'Delivered', color: 'text-primary-400' },
          { name: 'Sugar 50kg × 10', status: 'In Transit', color: 'text-blue-400' },
          { name: 'Flour 25kg × 20', status: 'Pending', color: 'text-amber-400' },
        ].map((o) => (
          <div key={o.name} className="flex items-center justify-between py-2.5 border-b border-white/8 last:border-0">
            <div>
              <p className="text-white text-sm font-medium">{o.name}</p>
              <p className={`text-xs font-semibold ${o.color}`}>{o.status}</p>
            </div>
            <CheckCircle size={16} className={o.color} />
          </div>
        ))}
      </div>

      <div className="absolute -bottom-6 -right-6 bg-primary-500/20 backdrop-blur-xl border border-primary-500/30 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">+34%</p>
            <p className="text-white/50 text-xs">This month</p>
          </div>
        </div>
      </div>

      <div className="absolute -top-4 -left-4 bg-navy-800/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {['bg-primary-400','bg-blue-400','bg-amber-400'].map(c => (
              <div key={c} className={`w-5 h-5 ${c} rounded-full border-2 border-navy-800`} />
            ))}
          </div>
          <p className="text-white/80 text-xs font-medium">69 Wilayas</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { t, lang } = useLang();
  const { user } = useAuth();

  const dashPath = user
    ? { wholesaler: '/dashboard/wholesaler', retailer: '/dashboard/retailer', admin: '/dashboard/admin', driver: '/dashboard/delivery' }[user.role]
    : null;

  return (
    <div>
      {/* ── Hero (Split Layout) ─────────────────────────────── */}
      <section className="gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-navy-600/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Typography */}
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-primary-500/15 border border-primary-500/25 rounded-full px-4 py-2 text-sm font-medium mb-8">
                <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse-slow" />
                <span className="text-primary-300">{lang === 'ar' ? 'منصة B2B رائدة في الجزائر' : "Algeria's #1 B2B Marketplace"}</span>
              </div>

              <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold leading-tight mb-6 text-balance">
                {lang === 'ar' ? (
                  <>تجارة الجملة <span className="gradient-text">بذكاء وسرعة</span></>
                ) : (
                  <>Wholesale Trade <span className="gradient-text">Reimagined</span> for Algeria</>
                )}
              </h1>

              <p className="text-lg text-white/60 leading-relaxed mb-10 max-w-lg">
                {t.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {user && dashPath ? (
                  <Link
                    to={dashPath}
                    className="inline-flex items-center justify-center gap-2.5 bg-primary-500 hover:bg-primary-400 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 active:scale-95 text-base"
                  >
                    <LayoutDashboard size={18} />
                    {lang === 'ar' ? 'لوحة التحكم' : 'Go to Dashboard'}
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2.5 bg-primary-500 hover:bg-primary-400 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 active:scale-95 text-base"
                  >
                    {t.getStarted}
                    <ArrowRight size={18} className={lang === 'ar' ? 'rotate-180' : ''} />
                  </Link>
                )}
                <Link
                  to="/catalog"
                  className="inline-flex items-center justify-center gap-2 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-semibold px-8 py-4 rounded-2xl hover:bg-white/5 transition-all text-base"
                >
                  {t.browseProducts}
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/10">
                {STATS.slice(0, 3).map(s => (
                  <div key={s.value}>
                    <div className="text-2xl font-bold text-white">{s.value}</div>
                    <div className="text-xs text-white/40 mt-0.5">{lang === 'ar' ? s.labelAr : s.labelEn}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Mockup */}
            <div className="hidden lg:flex justify-center items-center relative h-80">
              <MockupCard />
            </div>
          </div>
        </div>

        {/* Trust Banner */}
        <div className="border-t border-white/8 bg-white/3 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between gap-8 overflow-x-auto scrollbar-hide">
              <span className="text-white/30 text-xs font-semibold uppercase tracking-widest whitespace-nowrap shrink-0">
                {lang === 'ar' ? 'شركاؤنا' : 'Trusted Partners'}
              </span>
              <div className="flex items-center gap-8">
                {PARTNERS.map(p => (
                  <div
                    key={p.name}
                    className="flex items-center gap-2 text-white/30 hover:text-primary-400 transition-all duration-300 cursor-pointer group whitespace-nowrap"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/8 group-hover:bg-primary-500/20 flex items-center justify-center text-xs font-bold transition-all">
                      {p.initials}
                    </div>
                    <span className="text-sm font-semibold">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Role Cards ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">Who is it for?</p>
          <h2 className="text-3xl font-bold text-slate-800">Built for Every Player in the Supply Chain</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Package, title: t.forWholesalers, desc: t.wholesalerDesc,
              gradient: 'from-navy-800 to-navy-600',
              glow: 'shadow-navy-500/20',
              iconBg: 'bg-white/10',
            },
            {
              icon: Store, title: t.forRetailers, desc: t.retailerDesc,
              gradient: 'from-primary-700 to-primary-500',
              glow: 'shadow-primary-500/25',
              iconBg: 'bg-white/10',
            },
            {
              icon: Truck, title: t.forDelivery, desc: t.deliveryDesc,
              gradient: 'from-slate-700 to-slate-500',
              glow: 'shadow-slate-500/20',
              iconBg: 'bg-white/10',
            },
          ].map(({ icon: Icon, title, desc, gradient, glow, iconBg }) => (
            <div key={title} className={`relative bg-gradient-to-br ${gradient} text-white rounded-3xl p-7 shadow-xl ${glow} hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
              <div className={`w-14 h-14 ${iconBg} backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5 border border-white/20`}>
                <Icon size={26} className="text-white" />
              </div>
              <h3 className="font-bold text-xl mb-3">{title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────── */}
      <section className="bg-white py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-800">{t.featuredCats}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.en}
                to={`/catalog?category=${encodeURIComponent(cat.en)}`}
                className="flex flex-col items-center gap-2.5 p-4 bg-slate-50 hover:bg-primary-50 rounded-2xl border border-transparent hover:border-primary-200 transition-all group cursor-pointer"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
                <span className="text-xs font-medium text-slate-600 group-hover:text-primary-700 text-center leading-tight">{lang === 'ar' ? cat.ar : cat.en}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">Simple Process</p>
          <h2 className="text-3xl font-bold text-slate-800">{t.howItWorks}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-100 via-primary-300 to-primary-100" />
          {[
            { num: '01', title: t.step1, desc: t.step1Desc, icon: Shield },
            { num: '02', title: t.step2, desc: t.step2Desc, icon: Package },
            { num: '03', title: t.step3, desc: t.step3Desc, icon: Truck },
          ].map(({ num, title, desc, icon: Icon }) => (
            <div key={num} className="text-center relative">
              <div className="relative inline-flex mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-primary-100 rounded-3xl flex items-center justify-center shadow-sm">
                  <Icon size={30} className="text-primary-600" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-navy-800 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                  {num}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-3">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────── */}
      <section className="gradient-hero py-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {STATS.map(s => (
              <div key={s.value} className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/8 transition-all">
                <div className="text-4xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-primary-400 text-sm font-medium">{lang === 'ar' ? s.labelAr : s.labelEn}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features (Asymmetric Floating Cards) ───────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">Why SELAALI</p>
          <h2 className="text-3xl font-bold text-slate-800">Everything Your Business Needs</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: Zap,
              title: lang === 'ar' ? 'سريع وسهل' : 'Fast & Effortless',
              desc: lang === 'ar' ? 'تصفح وطلب في دقائق من أي جهاز.' : 'Browse, compare, and order in minutes from any device — no paperwork.',
              accent: 'primary',
              large: false,
            },
            {
              icon: Shield,
              title: lang === 'ar' ? 'آمن وموثوق' : 'Verified Suppliers',
              desc: lang === 'ar' ? 'جميع الموردين موثقون من قبل فريقنا.' : 'Every supplier is individually verified by our admin team before going live.',
              accent: 'navy',
              large: true,
            },
            {
              icon: Globe,
              title: lang === 'ar' ? 'تغطية وطنية' : 'Nationwide Coverage',
              desc: lang === 'ar' ? 'وصل إلى مئات العملاء عبر 69 ولاية.' : 'Connect with buyers and suppliers across all 69 Algerian wilayas.',
              accent: 'primary',
              large: false,
            },
          ].map(({ icon: Icon, title, desc, accent, large }) => (
            <div
              key={title}
              className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                accent === 'navy'
                  ? 'bg-navy-900 border-navy-700 text-white shadow-lg shadow-navy-900/20'
                  : 'bg-white border-slate-100 text-slate-800 shadow-sm'
              } ${large ? 'p-8' : 'p-7'}`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2 ${
                accent === 'navy' ? 'bg-primary-400' : 'bg-primary-400'
              }`} />
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${
                accent === 'navy' ? 'bg-primary-500/20' : 'bg-primary-50'
              }`}>
                <Icon size={22} className={accent === 'navy' ? 'text-primary-400' : 'text-primary-600'} />
              </div>
              <h4 className={`font-bold text-lg mb-3 ${accent === 'navy' ? 'text-white' : 'text-slate-800'}`}>{title}</h4>
              <p className={`text-sm leading-relaxed ${accent === 'navy' ? 'text-white/60' : 'text-slate-500'}`}>{desc}</p>
              {large && (
                <div className="mt-6 flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-primary-400 text-primary-400" />
                  ))}
                  <span className="text-white/50 text-xs ml-1">4.9 / 5 rating</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="mx-4 sm:mx-8 lg:mx-16 mb-16 rounded-3xl overflow-hidden">
        <div className="gradient-hero relative py-16 px-8 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12)_0%,transparent_60%)]" />
          <div className="relative max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-500/15 border border-primary-500/25 rounded-full px-4 py-2 text-sm font-medium text-primary-300 mb-6">
              <Users size={14} /> {lang === 'ar' ? 'انضم إلى آلاف التجار' : 'Join thousands of merchants'}
            </div>
            {user && dashPath ? (
              <>
                <h2 className="text-3xl font-bold text-white mb-4">
                  {lang === 'ar' ? `مرحباً، ${user.name}` : `Welcome back, ${user.name}`}
                </h2>
                <p className="text-white/50 mb-8 text-base">
                  {lang === 'ar' ? 'تابع من حيث توقفت.' : 'Pick up right where you left off.'}
                </p>
                <Link
                  to={dashPath}
                  className="inline-flex items-center gap-2.5 bg-primary-500 hover:bg-primary-400 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 active:scale-95"
                >
                  <LayoutDashboard size={18} />
                  {lang === 'ar' ? 'لوحة التحكم' : 'Go to Dashboard'}
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-white mb-4">
                  {lang === 'ar' ? 'انضم إلى سلعلي اليوم' : 'Start Trading Smarter Today'}
                </h2>
                <p className="text-white/50 mb-8 text-base">
                  {lang === 'ar' ? 'سجّل مجاناً وابدأ التجارة مع أفضل الموردين في الجزائر.' : 'Free to join. Connect with Algeria\'s top wholesale suppliers instantly.'}
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2.5 bg-primary-500 hover:bg-primary-400 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 active:scale-95"
                >
                  {t.getStarted} <ArrowRight size={18} className={lang === 'ar' ? 'rotate-180' : ''} />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
