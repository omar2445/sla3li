import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, MapPin, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const statusBadge = (stock) => {
  if (stock > 20) return <span className="badge-green">✓ In Stock</span>;
  if (stock > 0) return <span className="badge-yellow">Low Stock</span>;
  return <span className="badge-red">Out of Stock</span>;
};

export default function ProductCard({ product, onFavoriteToggle }) {
  const { addToCart } = useCart();
  const { t, lang } = useLang();
  const { user } = useAuth();

  const name = lang === 'ar' && product.name_ar ? product.name_ar : product.name;
  const supplier = product.business_name || product.wholesaler_name || '';
  const image = Array.isArray(product.images) && product.images[0] ? product.images[0] : null;

  const handleFavorite = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'retailer') { toast.error('Login as retailer to save favorites'); return; }
    try {
      await api.delete(`/products/${product.id}/favorite`);
      toast.success('Removed from favorites');
      onFavoriteToggle && onFavoriteToggle(product.id, false);
    } catch {
      try {
        await api.post(`/products/${product.id}/favorite`);
        toast.success('Added to favorites');
        onFavoriteToggle && onFavoriteToggle(product.id, true);
      } catch (err) { toast.error('Error'); }
    }
  };

  return (
    <div className="card-hover flex flex-col group">
      <Link to={`/product/${product.id}`} className="flex-1">
        <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <Package size={36} className="text-slate-300" />
          )}
        </div>

        <div className="space-y-2">
          {product.category_name && (
            <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-0.5 rounded-full">
              {lang === 'ar' ? product.category_name_ar : product.category_name}
            </span>
          )}
          <h3 className="font-semibold text-slate-800 line-clamp-2 text-sm leading-snug">{name}</h3>

          {supplier && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin size={11} />
              {supplier}{product.wilaya ? ` · ${product.wilaya}` : ''}
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-lg font-bold text-slate-900">{product.price?.toLocaleString()} <span className="text-xs font-normal text-slate-500">DZD</span></span>
              <p className="text-xs text-slate-400">/ {lang === 'ar' ? product.unit_ar : product.unit}</p>
            </div>
            {statusBadge(product.stock_qty)}
          </div>

          <p className="text-xs text-slate-400">{t.minOrder}: {product.min_order_qty} {lang === 'ar' ? product.unit_ar : product.unit}</p>
        </div>
      </Link>

      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
        <button onClick={() => addToCart(product)} disabled={!product.stock_qty} className="flex-1 btn-primary text-xs py-2 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
          <ShoppingCart size={14} />
          {t.addToCart}
        </button>
        <button onClick={handleFavorite} className="p-2 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors text-slate-400">
          <Heart size={16} />
        </button>
      </div>
    </div>
  );
}
