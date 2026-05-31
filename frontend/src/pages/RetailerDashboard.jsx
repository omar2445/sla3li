import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Clock, CheckCircle, XCircle, Heart, Trash2, Plus, Minus, ShoppingCart, MapPin } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const statusBadge = (s) => {
  const map = { pending: 'badge-yellow', confirmed: 'badge-blue', processing: 'badge-orange', shipped: 'badge-blue', delivered: 'badge-green', cancelled: 'badge-red' };
  return <span className={map[s] || 'badge-gray'}>{s}</span>;
};

const TABS = ['overview', 'orders', 'cart', 'favorites'];

export default function RetailerDashboard() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const { cart, removeFromCart, updateQty, total, clearCart } = useCart();
  const [tab, setTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState(user?.address || '');

  useEffect(() => {
    Promise.all([
      api.get('/orders'),
      api.get('/products/my/favorites'),
    ]).then(([ord, fav]) => {
      setOrders(ord.data);
      setFavorites(fav.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const placeOrder = async () => {
    if (!cart.length) return;
    if (!address) { toast.error(lang === 'ar' ? 'أدخل عنوان التوصيل' : 'Enter delivery address'); return; }
    setPlacing(true);
    try {
      const items = cart.map(i => ({ product_id: i.product_id, quantity: i.quantity }));
      await api.post('/orders', { items, delivery_address: address });
      toast.success(lang === 'ar' ? 'تم تأكيد الطلب بنجاح!' : 'Order placed successfully!');
      clearCart();
      const ord = await api.get('/orders');
      setOrders(ord.data);
      setTab('orders');
    } catch (err) { toast.error(err.response?.data?.message || t.error); }
    finally { setPlacing(false); }
  };

  const cancelOrder = async (id) => {
    try {
      await api.patch(`/orders/${id}/cancel`);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
      toast.success(lang === 'ar' ? 'تم إلغاء الطلب' : 'Order cancelled');
    } catch (err) { toast.error(err.response?.data?.message || t.error); }
  };

  const stats = { total: orders.length, pending: orders.filter(o => o.status === 'pending').length, delivered: orders.filter(o => o.status === 'delivered').length, spent: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total_amount, 0) };

  const tabLabel = { overview: lang === 'ar' ? 'نظرة عامة' : 'Overview', orders: t.myOrders, cart: t.cart, favorites: t.favorites };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{lang === 'ar' ? 'لوحة التاجر' : 'Retailer Dashboard'}</h1>
          <p className="text-slate-500 text-sm">{lang === 'ar' ? 'أهلاً' : 'Welcome'}, {user?.name}</p>
        </div>
        <Link to="/catalog" className="btn-primary text-sm">{t.browseProducts || 'Browse Products'}</Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-2xl w-fit">
        {TABS.map(tab_name => (
          <button key={tab_name} onClick={() => setTab(tab_name)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === tab_name ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {tabLabel[tab_name]} {tab_name === 'cart' && cart.length > 0 && <span className="ml-1.5 bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded-full">{cart.length}</span>}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShoppingBag, label: lang === 'ar' ? 'إجمالي الطلبات' : 'Total Orders', value: stats.total, color: 'text-blue-600 bg-blue-50' },
              { icon: Clock, label: lang === 'ar' ? 'قيد الانتظار' : 'Pending', value: stats.pending, color: 'text-yellow-600 bg-yellow-50' },
              { icon: CheckCircle, label: lang === 'ar' ? 'تم التوصيل' : 'Delivered', value: stats.delivered, color: 'text-green-600 bg-green-50' },
              { icon: ShoppingCart, label: lang === 'ar' ? 'إجمالي الإنفاق' : 'Total Spent', value: `${stats.spent.toLocaleString()} DZD`, color: 'text-primary-600 bg-primary-50' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="card">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}><Icon size={20} /></div>
                <div className="text-2xl font-bold text-slate-800 mb-0.5">{value}</div>
                <div className="text-sm text-slate-500">{label}</div>
              </div>
            ))}
          </div>

          {orders.slice(0, 3).length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700">{lang === 'ar' ? 'آخر الطلبات' : 'Recent Orders'}</h3>
                <button onClick={() => setTab('orders')} className="text-sm text-primary-600 hover:underline">{t.viewAll}</button>
              </div>
              <div className="space-y-3">
                {orders.slice(0, 3).map(o => (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div><p className="font-medium text-sm text-slate-800">#{o.id} — {o.wholesaler_name}</p><p className="text-xs text-slate-400">{new Date(o.created_at).toLocaleDateString()}</p></div>
                    <div className="flex items-center gap-3">{statusBadge(o.status)}<span className="font-semibold text-sm">{o.total_amount.toLocaleString()} DZD</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Orders tab */}
      {tab === 'orders' && (
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-4">{t.orderHistory}</h3>
          {loading ? <div className="text-center py-8 text-slate-400">{t.loading}</div> : orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400"><ShoppingBag size={40} className="mx-auto mb-2 opacity-40" /><p>{t.noData}</p></div>
          ) : (
            <div className="space-y-4">
              {orders.map(o => (
                <div key={o.id} className="border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-800">#{o.id} — {o.wholesaler_name || o.business_name}</p>
                      <p className="text-xs text-slate-400">{new Date(o.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusBadge(o.status)}
                      {o.status === 'pending' && (
                        <button onClick={() => cancelOrder(o.id)} className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50">
                          {t.cancelOrder}
                        </button>
                      )}
                    </div>
                  </div>
                  {o.items?.map(i => (
                    <div key={i.id} className="flex justify-between text-sm text-slate-600 py-1">
                      <span>{i.product_name} × {i.quantity}</span>
                      <span className="font-medium">{i.subtotal?.toLocaleString()} DZD</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-100 mt-2 pt-2 flex justify-between font-semibold">
                    <span>{t.total}</span>
                    <span className="text-primary-700">{o.total_amount?.toLocaleString()} DZD</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cart tab */}
      {tab === 'cart' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 card">
            <h3 className="font-semibold text-slate-700 mb-4">{t.cart}</h3>
            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <ShoppingCart size={40} className="mx-auto mb-2 opacity-40" />
                <p>{t.cartEmpty}</p>
                <Link to="/catalog" className="mt-3 inline-block btn-primary text-sm">{t.browseProducts || 'Browse'}</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.product_id} className="flex items-center gap-4 py-3 border-b border-slate-100">
                    <div className="flex-1"><p className="font-medium text-sm text-slate-800">{lang === 'ar' ? item.name_ar : item.name}</p><p className="text-xs text-slate-400">{item.price?.toLocaleString()} DZD / {item.unit}</p></div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.product_id, item.quantity - 1)} className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"><Minus size={12} /></button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product_id, item.quantity + 1)} className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"><Plus size={12} /></button>
                    </div>
                    <span className="text-sm font-semibold w-24 text-right">{(item.price * item.quantity).toLocaleString()} DZD</span>
                    <button onClick={() => removeFromCart(item.product_id)} className="text-slate-300 hover:text-red-400"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="card h-fit">
              <h3 className="font-semibold text-slate-700 mb-4">{lang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h3>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">{lang === 'ar' ? 'عدد العناصر' : 'Items'}</span><span>{cart.length}</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-2"><span>{t.total}</span><span className="text-primary-700">{total.toLocaleString()} DZD</span></div>
              </div>
              <div className="mb-4">
                <label className="label text-xs">{t.deliveryAddress} *</label>
                <input className="input text-sm" value={address} onChange={e => setAddress(e.target.value)} placeholder={lang === 'ar' ? 'عنوان التوصيل' : 'Your delivery address...'} />
              </div>
              <button onClick={placeOrder} disabled={placing || !address} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40">
                {placing ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                {t.placeOrder}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Favorites tab */}
      {tab === 'favorites' && (
        <div>
          <h3 className="font-semibold text-slate-700 mb-4">{t.favorites}</h3>
          {favorites.length === 0 ? (
            <div className="text-center py-12 text-slate-400 card"><Heart size={40} className="mx-auto mb-2 opacity-40" /><p>{t.noData}</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {favorites.map(p => (
                <div key={p.id} className="card-hover">
                  <Link to={`/product/${p.id}`} className="block">
                    <div className="aspect-video bg-slate-100 rounded-xl mb-3 flex items-center justify-center"><span className="text-4xl">📦</span></div>
                    <p className="font-medium text-sm text-slate-800 mb-1">{lang === 'ar' ? p.name_ar : p.name}</p>
                    <p className="text-primary-700 font-bold">{p.price?.toLocaleString()} DZD</p>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
