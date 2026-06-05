import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, ShoppingCart, Clock, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';
import toast from 'react-hot-toast';

function highlight(text, query) {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-primary-700 font-semibold bg-primary-50 rounded">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

const RECENT_KEY = 'sla3li_searches';

function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function saveRecent(term) {
  if (!term.trim()) return;
  const updated = [term.trim(), ...getRecent().filter(s => s !== term.trim())].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  return updated;
}

export default function Catalog() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const { cart } = useCart();
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
  });

  // Smart search state
  const [inputValue, setInputValue] = useState(searchParams.get('search') || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [recentSearches, setRecentSearches] = useState(getRecent);
  const [activeIdx, setActiveIdx] = useState(-1);
  const searchRef = useRef(null);
  const dropRef = useRef(null);

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));

  // Debounce: update filters.search + fetch suggestions after 350ms pause
  useEffect(() => {
    const timer = setTimeout(async () => {
      const q = inputValue.trim();
      setFilter('search', q);
      if (q.length >= 2) {
        try {
          const { data } = await api.get('/products/search/suggestions', { params: { q } });
          setSuggestions(data);
        } catch { setSuggestions([]); }
      } else {
        setSuggestions([]);
      }
      setActiveIdx(-1);
    }, 350);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowDrop(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  useEffect(() => { api.get('/categories').then(({ data }) => setCategories(data)); }, []);

  const commitSearch = (term) => {
    const q = (term ?? inputValue).trim();
    setInputValue(q);
    setFilter('search', q);
    const updated = saveRecent(q);
    if (updated) setRecentSearches(updated);
    setShowDrop(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    const items = suggestions.length > 0 ? suggestions : [];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && items[activeIdx]) {
        const name = lang === 'ar' && items[activeIdx].name_ar ? items[activeIdx].name_ar : items[activeIdx].name;
        commitSearch(name);
      } else {
        commitSearch();
      }
    } else if (e.key === 'Escape') {
      setShowDrop(false);
    }
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const dropItems = suggestions.length > 0 ? suggestions : [];
  const showRecentSection = showDrop && inputValue.trim().length === 0 && recentSearches.length > 0;

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

      {/* Smart search bar */}
      <div className="relative mb-5" ref={searchRef}>
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            className="input pl-11 pr-10 py-3 text-base"
            placeholder={lang === 'ar' ? 'ابحث عن منتج، مورد، أو صنف...' : 'Search products, suppliers, categories…'}
            value={inputValue}
            onChange={e => { setInputValue(e.target.value); setShowDrop(true); setActiveIdx(-1); }}
            onFocus={() => setShowDrop(true)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {inputValue && (
            <button onClick={() => { setInputValue(''); setFilter('search', ''); setSuggestions([]); setShowDrop(false); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDrop && (showRecentSection || dropItems.length > 0) && (
          <div ref={dropRef} className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 overflow-hidden animate-fade-in">

            {/* Recent searches */}
            {showRecentSection && (
              <div className="p-2">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider px-3 py-1.5">{lang === 'ar' ? 'عمليات البحث الأخيرة' : 'Recent Searches'}</p>
                {recentSearches.map((s, i) => (
                  <button
                    key={i}
                    onMouseDown={e => { e.preventDefault(); commitSearch(s); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                  >
                    <Clock size={14} className="text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-700 flex-1 truncate">{s}</span>
                    <ArrowUpRight size={13} className="text-slate-300 group-hover:text-primary-500 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* Live suggestions */}
            {dropItems.length > 0 && (
              <div className="p-2">
                {showRecentSection && <div className="border-t border-slate-100 my-1" />}
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider px-3 py-1.5">{lang === 'ar' ? 'اقتراحات' : 'Suggestions'}</p>
                {dropItems.map((item, i) => {
                  const name = lang === 'ar' && item.name_ar ? item.name_ar : item.name;
                  const catName = lang === 'ar' && item.category_name_ar ? item.category_name_ar : item.category_name;
                  return (
                    <button
                      key={item.id}
                      onMouseDown={e => { e.preventDefault(); commitSearch(name); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${activeIdx === i ? 'bg-primary-50' : 'hover:bg-slate-50'}`}
                    >
                      <TrendingUp size={14} className={`shrink-0 ${activeIdx === i ? 'text-primary-500' : 'text-slate-300'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800 font-medium truncate">{highlight(name, inputValue.trim())}</p>
                        {catName && <p className="text-xs text-slate-400 truncate">{catName}</p>}
                      </div>
                      <ArrowUpRight size={13} className={`shrink-0 transition-colors ${activeIdx === i ? 'text-primary-500' : 'text-slate-300'}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active search chip */}
      {filters.search && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm text-slate-500">{lang === 'ar' ? 'نتائج:' : 'Results for:'}</span>
          <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 border border-primary-200 text-sm font-medium px-3 py-1 rounded-full">
            "{filters.search}"
            <button onClick={() => { setInputValue(''); setFilter('search', ''); }} className="hover:text-primary-900 transition-colors ml-0.5"><X size={13} /></button>
          </span>
          <span className="text-xs text-slate-400">{total} {lang === 'ar' ? 'نتيجة' : 'results'}</span>
        </div>
      )}

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

            <button onClick={() => { setFilters({ search: '', category: '', wilaya: '', min_price: '', max_price: '', page: 1 }); setInputValue(''); }} className="w-full text-sm text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1">
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
              {filters.search && (
                <p className="text-sm mt-2">
                  {lang === 'ar' ? 'لا توجد نتائج لـ ' : 'No results for '}"<span className="text-slate-600">{filters.search}</span>"
                </p>
              )}
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
