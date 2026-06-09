import { useState, useEffect, useRef } from 'react';
import { Package, TrendingUp, Clock, CheckCircle, Plus, Edit2, Trash2, Eye, EyeOff, AlertTriangle, BarChart2, ShoppingBag, ImagePlus, X, Navigation } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';
import api, { imgUrl } from '../api/axios';
import toast from 'react-hot-toast';
import TrackingModal from '../components/TrackingModal';

const statusBadge = (s) => {
  const map = { pending: 'badge-yellow', confirmed: 'badge-blue', processing: 'badge-orange', shipped: 'badge-blue', delivered: 'badge-green', cancelled: 'badge-red' };
  return <span className={map[s] || 'badge-gray'}>{s}</span>;
};

const EMPTY_FORM = { name: '', name_ar: '', description: '', description_ar: '', price: '', min_order_qty: 1, unit: 'piece', unit_ar: 'قطعة', stock_qty: '', category_id: '' };

const MOCK_REVENUE = [
  { month: 'Jan', revenue: 120000 }, { month: 'Feb', revenue: 185000 },
  { month: 'Mar', revenue: 143000 }, { month: 'Apr', revenue: 210000 },
  { month: 'May', revenue: 178000 }, { month: 'Jun', revenue: 265000 },
];

export default function WholesalerDashboard() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const [trackingOrder, setTrackingOrder] = useState(null);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    Promise.all([api.get('/products/my/list'), api.get('/orders'), api.get('/categories')])
      .then(([p, o, c]) => { setProducts(p.data); setOrders(o.data); setCategories(c.data); })
      .finally(() => setLoading(false));
  }, []);

  const openEdit = (p) => {
    setForm({ name: p.name, name_ar: p.name_ar || '', description: p.description || '', description_ar: p.description_ar || '', price: p.price, min_order_qty: p.min_order_qty, unit: p.unit, unit_ar: p.unit_ar, stock_qty: p.stock_qty, category_id: p.category_id || '' });
    setExistingImages(Array.isArray(p.images) ? p.images : []);
    setImageFiles([]);
    setEditId(p.id);
    setShowForm(true);
  };
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setExistingImages([]);
    setImageFiles([]);
    setEditId(null);
    setShowForm(true);
  };

  const handleImagePick = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - existingImages.length - imageFiles.length;
    setImageFiles(prev => [...prev, ...files.slice(0, remaining)]);
    e.target.value = '';
  };

  const saveProduct = async () => {
    if (!form.name || !form.price) { toast.error(lang === 'ar' ? 'اسم المنتج والسعر مطلوبان' : 'Name and price required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''));
      imageFiles.forEach(f => fd.append('images', f));

      if (editId) {
        fd.append('keep_images', JSON.stringify(existingImages));
        fd.append('is_active', '1');
        await api.put(`/products/${editId}`, fd);
        const updatedImages = [...existingImages, ...imageFiles.map(f => URL.createObjectURL(f))];
        setProducts(prev => prev.map(p => p.id === editId ? { ...p, ...form, images: updatedImages } : p));
        toast.success(lang === 'ar' ? 'تم تحديث المنتج' : 'Product updated');
      } else {
        await api.post('/products', fd);
        const newProd = await api.get('/products/my/list');
        setProducts(newProd.data);
        toast.success(lang === 'ar' ? 'تم إضافة المنتج' : 'Product added');
      }
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || t.error); }
    finally { setSaving(false); }
  };

  const deleteProduct = async (id) => {
    if (!confirm(lang === 'ar' ? 'حذف المنتج؟' : 'Delete this product?')) return;
    try { await api.delete(`/products/${id}`); setProducts(prev => prev.filter(p => p.id !== id)); toast.success('Deleted'); }
    catch { toast.error(t.error); }
  };

  const toggleActive = async (p) => {
    try {
      await api.put(`/products/${p.id}`, { ...p, is_active: p.is_active ? 0 : 1, category_id: p.category_id });
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_active: x.is_active ? 0 : 1 } : x));
    } catch { toast.error(t.error); }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast.success('Status updated');
    } catch { toast.error(t.error); }
  };

  const stats = {
    products: products.length,
    active: products.filter(p => p.is_active).length,
    orders: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total_amount, 0),
    lowStock: products.filter(p => p.stock_qty < 10 && p.stock_qty > 0).length,
  };

  const orderBarData = [
    { name: 'Pending',    count: orders.filter(o => o.status === 'pending').length },
    { name: 'Confirmed',  count: orders.filter(o => o.status === 'confirmed').length },
    { name: 'Processing', count: orders.filter(o => o.status === 'processing').length },
    { name: 'Shipped',    count: orders.filter(o => o.status === 'shipped').length },
    { name: 'Delivered',  count: orders.filter(o => o.status === 'delivered').length },
  ];

  const sidebarItems = [
    { key: 'overview',  icon: BarChart2,   labelEn: 'Overview',  labelAr: 'نظرة عامة', onClick: () => setTab('overview')  },
    { key: 'products',  icon: Package,     labelEn: 'Products',  labelAr: 'المنتجات',  onClick: () => setTab('products')  },
    { key: 'orders',    icon: ShoppingBag, labelEn: 'Orders',    labelAr: 'الطلبات',   onClick: () => setTab('orders')    },
  ];

  if (!user?.is_approved) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Clock size={32} className="text-amber-600" /></div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">{lang === 'ar' ? 'في انتظار الموافقة' : 'Pending Approval'}</h2>
      <p className="text-slate-500">{t.pendingApprovalMsg}</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <DashboardSidebar
        items={sidebarItems}
        title="Wholesaler"
        titleAr="تاجر الجملة"
        activeTab={tab}
      />

      {trackingOrder && <TrackingModal order={trackingOrder} onClose={() => setTrackingOrder(null)} />}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{lang === 'ar' ? 'لوحة تاجر الجملة' : 'Wholesaler Dashboard'}</h1>
              <p className="text-slate-500 text-sm mt-0.5">{user?.business_name || user?.name}</p>
            </div>
            {tab === 'products' && (
              <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
                <Plus size={16} />{t.addProduct}
              </button>
            )}
          </div>

          {/* Low stock alert */}
          {stats.lowStock > 0 && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-amber-700 text-sm">
              <AlertTriangle size={18} className="shrink-0" />
              <span>{stats.lowStock} {lang === 'ar' ? 'منتجات بمخزون منخفض' : 'products with low stock — check your inventory'}</span>
            </div>
          )}

          {/* ── Overview ── */}
          {tab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Package,     label: t.activeProducts, value: `${stats.active}/${stats.products}`, color: 'text-navy-600 bg-navy-50',     border: 'border-navy-100' },
                  { icon: Clock,       label: t.pendingOrders,  value: stats.pending,                        color: 'text-amber-600 bg-amber-50',    border: 'border-amber-100' },
                  { icon: TrendingUp,  label: t.totalRevenue,   value: `${(stats.revenue/1000).toFixed(0)}K DZD`, color: 'text-primary-600 bg-primary-50', border: 'border-primary-100' },
                  { icon: CheckCircle, label: t.totalOrders,    value: stats.orders,                         color: 'text-blue-600 bg-blue-50',      border: 'border-blue-100' },
                ].map(({ icon: Icon, label, value, color, border }) => (
                  <div key={label} className={`bg-white rounded-2xl p-5 border ${border} shadow-sm hover:shadow-md transition-shadow`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}><Icon size={19} /></div>
                    <div className="text-2xl font-bold text-slate-800 mb-0.5">{value}</div>
                    <div className="text-xs text-slate-500 font-medium">{label}</div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Revenue area chart */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-semibold text-slate-800">{lang === 'ar' ? 'اتجاه الإيرادات' : 'Revenue Trend'}</h3>
                    <span className="text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg font-medium">2024</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={MOCK_REVENUE} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}K`} />
                      <Tooltip formatter={(v) => [`${v.toLocaleString()} DZD`, 'Revenue']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 3, fill: '#059669' }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Orders by status bar chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-semibold text-slate-800 mb-5">{lang === 'ar' ? 'الطلبات حسب الحالة' : 'Orders by Status'}</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={orderBarData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                      <Bar dataKey="count" fill="#1a338a" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent orders */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-semibold text-slate-800 mb-4">{lang === 'ar' ? 'آخر الطلبات' : 'Recent Orders'}</h3>
                {orders.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-6">{t.noData}</p>
                ) : orders.slice(0, 5).map(o => (
                  <div key={o.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="font-medium text-sm text-slate-800">#{o.id} — {o.retailer_name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{new Date(o.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {statusBadge(o.status)}
                      <span className="font-semibold text-sm text-slate-700">{o.total_amount?.toLocaleString()} DZD</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Products ── */}
          {tab === 'products' && (
            <div className="animate-fade-in">
              {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-7">
                    <h3 className="font-bold text-slate-800 text-lg mb-5">{editId ? t.editProduct : t.addProduct}</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="label text-xs">{lang === 'ar' ? 'الاسم (EN)' : 'Name (EN)'} *</label><input className="input text-sm" value={form.name} onChange={e => setF('name', e.target.value)} /></div>
                        <div><label className="label text-xs">{lang === 'ar' ? 'الاسم (AR)' : 'Name (AR)'}</label><input className="input text-sm" dir="rtl" value={form.name_ar} onChange={e => setF('name_ar', e.target.value)} /></div>
                      </div>
                      <div><label className="label text-xs">{t.category}</label><select className="input text-sm" value={form.category_id} onChange={e => setF('category_id', e.target.value)}><option value="">—</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                      <div className="grid grid-cols-3 gap-3">
                        <div><label className="label text-xs">{t.price} (DZD) *</label><input type="number" className="input text-sm" value={form.price} onChange={e => setF('price', e.target.value)} /></div>
                        <div><label className="label text-xs">{t.minOrder}</label><input type="number" className="input text-sm" value={form.min_order_qty} onChange={e => setF('min_order_qty', e.target.value)} /></div>
                        <div><label className="label text-xs">{t.stock}</label><input type="number" className="input text-sm" value={form.stock_qty} onChange={e => setF('stock_qty', e.target.value)} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="label text-xs">Unit (EN)</label><input className="input text-sm" value={form.unit} onChange={e => setF('unit', e.target.value)} /></div>
                        <div><label className="label text-xs">Unit (AR)</label><input className="input text-sm" dir="rtl" value={form.unit_ar} onChange={e => setF('unit_ar', e.target.value)} /></div>
                      </div>
                      <div><label className="label text-xs">Description</label><textarea className="input text-sm h-20 resize-none" value={form.description} onChange={e => setF('description', e.target.value)} /></div>

                      {/* Image picker */}
                      <div>
                        <label className="label text-xs">{lang === 'ar' ? 'الصور (حد أقصى 5)' : 'Images (max 5)'}</label>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {/* Existing images */}
                          {existingImages.map((url, i) => (
                            <div key={url} className="relative group w-20 h-20 shrink-0">
                              <img src={imgUrl(url)} alt="" className="w-full h-full object-cover rounded-xl border border-slate-200" />
                              <button
                                type="button"
                                onClick={() => setExistingImages(prev => prev.filter((_, j) => j !== i))}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow opacity-0 group-hover:opacity-100 transition-opacity"
                              ><X size={10} /></button>
                            </div>
                          ))}
                          {/* New file previews */}
                          {imageFiles.map((file, i) => (
                            <div key={i} className="relative group w-20 h-20 shrink-0">
                              <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover rounded-xl border-2 border-primary-300" />
                              <button
                                type="button"
                                onClick={() => setImageFiles(prev => prev.filter((_, j) => j !== i))}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow opacity-0 group-hover:opacity-100 transition-opacity"
                              ><X size={10} /></button>
                            </div>
                          ))}
                          {/* Add button */}
                          {existingImages.length + imageFiles.length < 5 && (
                            <label className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors shrink-0">
                              <ImagePlus size={18} className="text-slate-400" />
                              <span className="text-xs text-slate-400 mt-1">{lang === 'ar' ? 'إضافة' : 'Add'}</span>
                              <input ref={fileInputRef} type="file" className="hidden" multiple accept="image/*" onChange={handleImagePick} />
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">{t.cancel}</button>
                        <button onClick={saveProduct} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                          {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}{t.save}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-4 py-3.5 w-14" />
                        <th className="text-left px-5 py-3.5 text-slate-500 font-semibold text-xs uppercase tracking-wider">{t.name}</th>
                        <th className="text-left px-5 py-3.5 text-slate-500 font-semibold text-xs uppercase tracking-wider">{t.price}</th>
                        <th className="text-left px-5 py-3.5 text-slate-500 font-semibold text-xs uppercase tracking-wider">{t.stock}</th>
                        <th className="px-5 py-3.5 text-slate-500 font-semibold text-xs uppercase tracking-wider">{t.status}</th>
                        <th className="px-5 py-3.5 text-slate-500 font-semibold text-xs uppercase tracking-wider">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                              {Array.isArray(p.images) && p.images[0]
                                ? <img src={imgUrl(p.images[0])} alt="" className="w-full h-full object-cover" />
                                : <Package size={16} className="text-slate-300" />}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-800">{lang === 'ar' ? p.name_ar : p.name}</td>
                          <td className="px-5 py-3.5 text-slate-600 font-mono text-sm">{p.price?.toLocaleString()} DZD</td>
                          <td className="px-5 py-3.5">
                            <span className={`font-semibold ${p.stock_qty < 10 ? 'text-red-600' : 'text-slate-600'}`}>{p.stock_qty}</span>
                            {p.stock_qty < 10 && p.stock_qty > 0 && <span className="ml-2 text-xs text-red-500">Low</span>}
                          </td>
                          <td className="px-5 py-3.5 text-center">{p.is_active ? <span className="badge-green">Active</span> : <span className="badge-gray">Inactive</span>}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-center gap-1.5">
                              <button onClick={() => openEdit(p)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                              <button onClick={() => toggleActive(p)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">{p.is_active ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                              <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {products.length === 0 && (
                    <div className="text-center py-14 text-slate-400">
                      <Package size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="font-medium">{t.noData}</p>
                      <button onClick={openAdd} className="mt-4 btn-primary text-sm">{t.addProduct}</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Orders ── */}
          {tab === 'orders' && (
            <div className="space-y-4 animate-fade-in">
              {orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-14 text-slate-400">
                  <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
                  <p>{t.noData}</p>
                </div>
              ) : orders.map(o => (
                <div key={o.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-semibold text-slate-800">Order #{o.id}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{o.retailer_name} · {new Date(o.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {statusBadge(o.status)}
                      {['confirmed','processing','shipped','delivered'].includes(o.status) && (
                        <button
                          onClick={() => setTrackingOrder(o)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 border border-primary-200 transition-colors"
                        >
                          <Navigation size={12} />
                          {lang === 'ar' ? 'تتبع' : 'Track'}
                        </button>
                      )}
                      {o.status === 'pending' && (
                        <>
                          <button onClick={() => updateOrderStatus(o.id, 'confirmed')} className="text-xs bg-navy-700 text-white px-3 py-1.5 rounded-lg hover:bg-navy-600 font-medium">{t.confirm}</button>
                          <button onClick={() => updateOrderStatus(o.id, 'cancelled')} className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 font-medium">{t.cancel}</button>
                        </>
                      )}
                      {o.status === 'confirmed' && <button onClick={() => updateOrderStatus(o.id, 'processing')} className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 font-medium">Start Processing</button>}
                      {o.status === 'processing' && <button onClick={() => updateOrderStatus(o.id, 'shipped')} className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 font-medium">Mark Shipped</button>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <span className="text-xs text-slate-400">{o.retailer_phone || '—'}</span>
                    <span className="font-bold text-primary-700">{o.total_amount?.toLocaleString()} DZD</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
