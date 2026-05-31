import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowLeft, MapPin, Package, Plus, Minus, Store } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const STATUS_COLORS = { delivered: 'badge-green', pending: 'badge-yellow', confirmed: 'badge-blue', processing: 'badge-orange', cancelled: 'badge-red' };

export default function ProductDetail() {
  const { id } = useParams();
  const { t, lang } = useLang();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => { setProduct(data); setQty(data.min_order_qty || 1); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  if (!product) return <div className="text-center py-20 text-slate-400"><p>{lang === 'ar' ? 'المنتج غير موجود' : 'Product not found'}</p></div>;

  const name = lang === 'ar' && product.name_ar ? product.name_ar : product.name;
  const desc = lang === 'ar' && product.description_ar ? product.description_ar : product.description;
  const unit = lang === 'ar' && product.unit_ar ? product.unit_ar : product.unit;
  const supplier = product.business_name_ar && lang === 'ar' ? product.business_name_ar : product.business_name || product.wholesaler_name;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/catalog" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm font-medium">
        <ArrowLeft size={16} className={lang === 'ar' ? 'rotate-180' : ''} /> {t.back}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center overflow-hidden">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={name} className="w-full h-full object-cover" />
            ) : (
              <Package size={80} className="text-slate-300" />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-5">
          {product.category_name && (
            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
              {lang === 'ar' ? product.category_name_ar : product.category_name}
            </span>
          )}

          <h1 className="text-2xl font-bold text-slate-800">{name}</h1>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-slate-900">{product.price?.toLocaleString()} <span className="text-base font-normal text-slate-500">DZD</span></span>
            <span className="text-slate-400">/ {unit}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-0.5">{t.minOrderQty}</p>
              <p className="font-semibold text-slate-800">{product.min_order_qty} {unit}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-0.5">{t.stock}</p>
              <p className={`font-semibold ${product.stock_qty > 0 ? 'text-primary-600' : 'text-red-500'}`}>
                {product.stock_qty > 0 ? `${product.stock_qty} ${unit}` : t.outOfStock}
              </p>
            </div>
          </div>

          {desc && <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>}

          {/* Supplier */}
          <Link to={`/supplier/${product.wholesaler_id}`} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl hover:bg-primary-50 transition-colors group">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Store size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 group-hover:text-primary-700">{supplier}</p>
              {product.wilaya && <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={10} />{product.wilaya}</p>}
            </div>
          </Link>

          {/* Quantity + Add to cart */}
          {user?.role === 'retailer' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setQty(q => Math.max(product.min_order_qty, q - 1))} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                  <Minus size={16} />
                </button>
                <input type="number" className="input text-center w-20 font-semibold" value={qty} min={product.min_order_qty} onChange={e => setQty(Math.max(product.min_order_qty, parseInt(e.target.value) || product.min_order_qty))} />
                <button onClick={() => setQty(q => q + 1)} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                  <Plus size={16} />
                </button>
                <span className="text-slate-500 text-sm">{unit}</span>
              </div>

              <div className="bg-primary-50 rounded-xl p-3">
                <p className="text-sm text-slate-600">{lang === 'ar' ? 'الإجمالي' : 'Total'}: <span className="font-bold text-primary-700">{(product.price * qty).toLocaleString()} DZD</span></p>
              </div>

              <button onClick={() => { addToCart({ ...product, quantity: qty }); toast.success(t.addToCart); }} disabled={!product.stock_qty} className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-40">
                <ShoppingCart size={20} /> {t.addToCart}
              </button>
            </div>
          )}

          {!user && (
            <Link to="/login" className="btn-primary w-full text-center block py-3">{lang === 'ar' ? 'سجّل الدخول للطلب' : 'Login to Order'}</Link>
          )}
        </div>
      </div>
    </div>
  );
}
