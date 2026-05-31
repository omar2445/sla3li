import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'newest', labelEn: 'Newest', labelAr: 'الأحدث' },
  { value: 'price_asc', labelEn: 'Price: Low to High', labelAr: 'السعر: الأقل أولاً' },
  { value: 'price_desc', labelEn: 'Price: High to Low', labelAr: 'السعر: الأعلى أولاً' },
];

export default function Catalog() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const { cart, checkout } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    wilaya: '',
    min_price: '',
    max_price: '',
    page: 1,
    sort: 'newest',
  });

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.wilaya) params.wilaya = filters.wilaya;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      params.page = filters.page;
      const { data } = await api.get('/products', { params });
      data.products.forEach(p => p.images = JSON.parse(p.images || '[]'));
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error(t.error); }
    finally { setLoading(false); }
  }, [filters, t]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    const p = {};
    if (filters.search) p.search = filters.search;
    if (filters.category) p.category = filters.category;
    setSearchParams(p, { replace: true });
  }, [filters.search, filters.category]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data));
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t.catalog}</h1>
          {total > 0 && <p className="text-sm text-slate-500 mt-0.5">{t.showing} {products.length} {t.of} {total} {t.results}</p>}
        </div>
        <div className="flex items-center gap-2">
          {user?.role === 'retailer' && cartCount > 0 && (
            <Link to="/dashboard/retailer" className="btn-primary text-sm flex items-center gap-2 py-2">
              <ShoppingCart size={16} /> {t.cart} ({cartCount})
            </Link>
          )}
          <button onClick={() => setFilterOpen(o => !o)} className="flex items-center gap-2 btn-secondary text-sm py-2">
            <SlidersHorizontal size={16} /> {t.filter}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input type="text" className="input pl-11 py-3 text-base" placeholder={t.search} value={filters.search} onChange={e => setFilter('search', e.target.value)} />
        {filters.search && <button onClick={() => setFilter('search', '')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={16} /></button>}
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <div className={`${filterOpen ? 'block' : 'hidden'} lg:block w-64 shrink-0`}>
          <div className="card sticky top-20">
            <h3 className="font-semibold text-slate-700 mb-4">{t.filter}</h3>

            <div className="mb-5">
              <label className="label text-xs uppercase tracking-wider text-slate-400">{t.category}</label>
              <select className="input text-sm" value={filters.category} onChange={e => setFilter('category', e.target.value)}>
                <option value="">{t.allCategories}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{lang === 'ar' ? c.name_ar : c.name}</option>)}
              </select>
            </div>

            <div className="mb-5">
              <label className="label text-xs uppercase tracking-wider text-slate-400">{t.priceRange}</label>
              <div className="flex gap-2">
                <input type="number" className="input text-sm" placeholder="Min" value={filters.min_price} onChange={e => setFilter('min_price', e.target.value)} />
                <input type="number" className="input text-sm" placeholder="Max" value={filters.max_price} onChange={e => setFilter('max_price', e.target.value)} />
              </div>
            </div>

            <div className="mb-5">
              <label className="label text-xs uppercase tracking-wider text-slate-400">{lang === 'ar' ? 'الولاية' : 'Wilaya'}</label>
              <input type="text" className="input text-sm" placeholder={lang === 'ar' ? 'ابحث بالولاية...' : 'Filter by wilaya...'} value={filters.wilaya} onChange={e => setFilter('wilaya', e.target.value)} />
            </div>

            <button onClick={() => setFilters({ search: '', category: '', wilaya: '', min_price: '', max_price: '', page: 1, sort: 'newest' })} className="w-full text-sm text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1">
              <X size={14} /> {lang === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}
            </button>
          </div>
        </div>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-video bg-slate-200 rounded-xl mb-4" />
                  <div className="h-4 bg-slate-200 rounded mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-2/3 mb-3" />
                  <div className="h-6 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <div className="text-5xl mb-4">📦</div>
              <p className="font-medium text-lg">{t.noProducts}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))} disabled={filters.page === 1} className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                    <ChevronLeft size={18} />
                  </button>
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setFilters(f => ({ ...f, page: p }))} className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${filters.page === p ? 'bg-primary-600 text-white' : 'border border-slate-200 hover:bg-slate-50'}`}>{p}</button>
                  ))}
                  <button onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))} disabled={filters.page === pages} className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
