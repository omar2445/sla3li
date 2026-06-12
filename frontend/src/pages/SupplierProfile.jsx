import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Package, ArrowLeft, Store } from 'lucide-react';
import { useLang } from '../context/LangContext';
import ProductCard from '../components/ProductCard';
import Stars from '../components/Stars';
import api from '../api/axios';

export default function SupplierProfile() {
  const { id } = useParams();
  const { t, lang } = useLang();
  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/auth/me`).catch(() => null),
      api.get(`/products`, { params: { wholesaler_id: id } }),
    ]).then(([userRes, prodRes]) => {
      api.get('/admin/users', { params: { } }).catch(() => null);
      setProducts(prodRes.data.products);
      if (prodRes.data.products[0]) {
        setSupplier({ name: prodRes.data.products[0].wholesaler_name, business_name: prodRes.data.products[0].business_name, wilaya: prodRes.data.products[0].wilaya, phone: prodRes.data.products[0].wholesaler_phone });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  const supplierName = supplier?.business_name || supplier?.name || (lang === 'ar' ? 'مورد' : 'Supplier');

  // Overall supplier rating: weighted average across all their rated products
  const totalRatings = products.reduce((s, p) => s + (p.rating_count || 0), 0);
  const supplierRating = totalRatings > 0
    ? products.reduce((s, p) => s + (p.avg_rating || 0) * (p.rating_count || 0), 0) / totalRatings
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/catalog" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm font-medium">
        <ArrowLeft size={16} /> {t.back}
      </Link>

      {/* Supplier header */}
      <div className="card mb-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center shrink-0">
            <Store size={36} className="text-primary-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">{supplierName}</h1>
            {supplier?.wilaya && (
              <p className="text-slate-500 flex items-center gap-1.5 text-sm mb-1">
                <MapPin size={14} className="text-primary-500" /> {supplier.wilaya}
              </p>
            )}
            {supplier?.phone && (
              <p className="text-slate-500 flex items-center gap-1.5 text-sm">
                <Phone size={14} className="text-primary-500" /> {supplier.phone}
              </p>
            )}
            <div className="flex items-center gap-3 mt-3">
              <span className="badge-green">{lang === 'ar' ? 'مورد موثق' : 'Verified Supplier'}</span>
              <span className="text-xs text-slate-400">{products.length} {lang === 'ar' ? 'منتجات' : 'products'}</span>
              {totalRatings > 0 && <Stars value={supplierRating} count={totalRatings} size={15} />}
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <h2 className="text-xl font-bold text-slate-800 mb-5">
        {lang === 'ar' ? 'منتجات المورد' : 'Supplier Products'} <span className="text-slate-400 font-normal text-base">({products.length})</span>
      </h2>

      {products.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Package size={48} className="mx-auto mb-3 opacity-50" />
          <p>{t.noProducts}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
