import { useState, useEffect, useRef } from 'react';
import { Users, Package, ShoppingBag, TrendingUp, CheckCircle, XCircle, AlertCircle, Trash2, Plus, FileText, X, ImagePlus, Camera, MessageSquare } from 'lucide-react';
import { useLang } from '../context/LangContext';
import api, { imgUrl } from '../api/axios';
import toast from 'react-hot-toast';

const roleBadge = (r) => {
  const map = { admin: 'badge-gray', wholesaler: 'badge-blue', retailer: 'badge-green', driver: 'badge-orange' };
  return <span className={map[r] || 'badge-gray'}>{r}</span>;
};

const statusBadge = (s) => {
  const map = { pending: 'badge-yellow', confirmed: 'badge-blue', processing: 'badge-orange', shipped: 'badge-blue', delivered: 'badge-green', cancelled: 'badge-red' };
  return <span className={map[s] || 'badge-gray'}>{s}</span>;
};

export default function AdminDashboard() {
  const { t, lang } = useLang();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [newCat, setNewCat] = useState({ name: '', name_ar: '', icon: '📦', parent_id: null });
  const [expandedCats, setExpandedCats] = useState({});
  const [filterRole, setFilterRole] = useState('');
  const [filterApproved, setFilterApproved] = useState('');
  const [search, setSearch] = useState('');
  const [docsUser, setDocsUser] = useState(null);
  const [imgProduct, setImgProduct] = useState(null);
  const [imgExisting, setImgExisting] = useState([]);
  const [imgNewFiles, setImgNewFiles] = useState([]);
  const [imgSaving, setImgSaving] = useState(false);
  const imgFileRef = useRef(null);
  const [editProd, setEditProd] = useState(null);
  const [prodForm, setProdForm] = useState({});
  const [prodKeepImages, setProdKeepImages] = useState([]);
  const [prodNewFiles, setProdNewFiles] = useState([]);
  const [prodSaving, setProdSaving] = useState(false);
  const prodFileRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { role: filterRole || undefined, is_approved: filterApproved !== '' ? filterApproved : undefined, search: search || undefined };
      const [s, u, p, o, c, sg] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users', { params }),
        api.get('/admin/products'),
        api.get('/admin/orders'),
        api.get('/categories'),
        api.get('/suggestions'),
      ]);
      setStats(s.data); setUsers(u.data.users); setProducts(p.data); setOrders(o.data); setCategories(c.data); setSuggestions(sg.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || t.error;
      toast.error(msg);
      console.error('Admin fetch error:', msg, err.response?.config?.url);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filterRole, filterApproved, search]);

  const approveUser = async (id) => { try { await api.patch(`/admin/users/${id}/approve`); setUsers(prev => prev.map(u => u.id === id ? { ...u, is_approved: 1 } : u)); toast.success('Approved'); } catch { toast.error(t.error); } };
  const suspendUser = async (id) => { try { await api.patch(`/admin/users/${id}/suspend`); setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: 0 } : u)); toast.success('Suspended'); } catch { toast.error(t.error); } };
  const activateUser = async (id) => { try { await api.patch(`/admin/users/${id}/activate`); setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: 1 } : u)); toast.success('Activated'); } catch { toast.error(t.error); } };
  const deleteUser = async (id) => { if (!confirm('Delete this user?')) return; try { await api.delete(`/admin/users/${id}`); setUsers(prev => prev.filter(u => u.id !== id)); toast.success('Deleted'); } catch { toast.error(t.error); } };
  const toggleProduct = async (id) => { try { await api.patch(`/admin/products/${id}/toggle`); setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: p.is_active ? 0 : 1 } : p)); } catch { toast.error(t.error); } };

  const openImgModal = (p) => { setImgProduct(p); setImgExisting(Array.isArray(p.images) ? [...p.images] : []); setImgNewFiles([]); };
  const handleImgPick = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - imgExisting.length - imgNewFiles.length;
    setImgNewFiles(prev => [...prev, ...files.slice(0, remaining)]);
    e.target.value = '';
  };
  const saveImages = async () => {
    if (!imgProduct) return;
    setImgSaving(true);
    try {
      const fd = new FormData();
      // required fields for the PUT route
      fd.append('name', imgProduct.name);
      fd.append('name_ar', imgProduct.name_ar || '');
      fd.append('price', imgProduct.price);
      fd.append('min_order_qty', imgProduct.min_order_qty || 1);
      fd.append('unit', imgProduct.unit || 'piece');
      fd.append('unit_ar', imgProduct.unit_ar || '');
      fd.append('stock_qty', imgProduct.stock_qty || 0);
      fd.append('category_id', imgProduct.category_id || '');
      fd.append('is_active', imgProduct.is_active ?? 1);
      fd.append('keep_images', JSON.stringify(imgExisting));
      imgNewFiles.forEach(f => fd.append('images', f));
      await api.put(`/products/${imgProduct.id}`, fd);
      const allImages = [...imgExisting, ...imgNewFiles.map(() => '')]; // placeholder; refetch for real URLs
      const refreshed = await api.get('/admin/products');
      setProducts(refreshed.data);
      toast.success(lang === 'ar' ? 'تم حفظ الصور' : 'Images saved');
      setImgProduct(null);
    } catch (err) { toast.error(err.response?.data?.message || t.error); }
    finally { setImgSaving(false); }
  };
  const openAddProd = () => {
    const firstWholesaler = users.find(u => u.role === 'wholesaler');
    setProdForm({ wholesaler_id: firstWholesaler?.id || '', name: '', name_ar: '', description: '', description_ar: '', price: '', min_order_qty: 1, unit: 'piece', unit_ar: 'قطعة', stock_qty: 0, category_id: '', is_active: 1 });
    setProdKeepImages([]);
    setProdNewFiles([]);
    setEditProd('new');
  };
  const openEditProd = (p) => {
    setProdForm({ name: p.name || '', name_ar: p.name_ar || '', description: p.description || '', description_ar: p.description_ar || '', price: p.price ?? '', min_order_qty: p.min_order_qty ?? 1, unit: p.unit || 'piece', unit_ar: p.unit_ar || 'قطعة', stock_qty: p.stock_qty ?? 0, category_id: p.category_id || '', is_active: p.is_active ?? 1 });
    setProdKeepImages(Array.isArray(p.images) ? [...p.images] : []);
    setProdNewFiles([]);
    setEditProd(p);
  };
  const saveProd = async () => {
    if (!prodForm.name || !String(prodForm.price)) return;
    setProdSaving(true);
    try {
      const fd = new FormData();
      Object.entries(prodForm).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== '') fd.append(k, v); });
      prodNewFiles.forEach(f => fd.append('images', f));
      if (editProd === 'new') {
        await api.post('/products', fd);
        toast.success('Product added');
      } else {
        fd.append('keep_images', JSON.stringify(prodKeepImages));
        await api.put(`/products/${editProd.id}`, fd);
        toast.success('Product updated');
      }
      const refreshed = await api.get('/admin/products');
      setProducts(refreshed.data);
      setEditProd(null);
    } catch (err) { toast.error(err.response?.data?.message || t.error); }
    finally { setProdSaving(false); }
  };

  const addCategory = async () => { if (!newCat.name || !newCat.name_ar) return; try { await api.post('/categories', newCat); await api.get('/categories').then(r => setCategories(r.data)); setNewCat({ name: '', name_ar: '', icon: '📦', parent_id: null }); toast.success('Category added'); } catch { toast.error(t.error); } };
  const deleteCategory = async (id) => { try { await api.delete(`/categories/${id}`); setCategories(prev => prev.filter(c => c.id !== id)); toast.success('Deleted'); } catch { toast.error(t.error); } };

  const markSuggestionRead = async (id) => { try { await api.patch(`/suggestions/${id}/read`); setSuggestions(prev => prev.map(s => s.id === id ? { ...s, is_read: 1 } : s)); } catch { toast.error(t.error); } };
  const deleteSuggestion = async (id) => { try { await api.delete(`/suggestions/${id}`); setSuggestions(prev => prev.filter(s => s.id !== id)); toast.success('Deleted'); } catch { toast.error(t.error); } };

  const unreadSuggestions = suggestions.filter(s => !s.is_read).length;

  const tabs = [
    { key: 'overview', label: lang === 'ar' ? 'نظرة عامة' : 'Overview' },
    { key: 'users', label: t.users },
    { key: 'products', label: t.products },
    { key: 'orders', label: t.orders },
    { key: 'categories', label: t.categories },
    { key: 'suggestions', label: t.suggestions, badge: unreadSuggestions },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Product images modal */}
      {imgProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setImgProduct(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-800">{lang === 'ar' ? 'صور المنتج' : 'Product Images'}</h3>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{imgProduct.name}</p>
              </div>
              <button onClick={() => setImgProduct(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>

            <div className="flex flex-wrap gap-3 min-h-[5rem]">
              {/* Existing images */}
              {imgExisting.map((url, i) => (
                <div key={url} className="relative group w-24 h-24 shrink-0">
                  <img src={imgUrl(url)} alt="" className="w-full h-full object-cover rounded-2xl border border-slate-200" />
                  <button
                    onClick={() => setImgExisting(prev => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  ><X size={11} /></button>
                </div>
              ))}
              {/* New file previews */}
              {imgNewFiles.map((file, i) => (
                <div key={i} className="relative group w-24 h-24 shrink-0">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover rounded-2xl border-2 border-primary-300" />
                  <button
                    onClick={() => setImgNewFiles(prev => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  ><X size={11} /></button>
                </div>
              ))}
              {/* Add button */}
              {imgExisting.length + imgNewFiles.length < 5 && (
                <label className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors shrink-0">
                  <ImagePlus size={20} className="text-slate-400" />
                  <span className="text-xs text-slate-400 mt-1">{lang === 'ar' ? 'إضافة' : 'Add'}</span>
                  <input ref={imgFileRef} type="file" className="hidden" multiple accept="image/*" onChange={handleImgPick} />
                </label>
              )}
              {imgExisting.length + imgNewFiles.length === 0 && (
                <p className="text-slate-400 text-sm self-center w-full text-center py-2">
                  {lang === 'ar' ? 'لا توجد صور — انقر + لإضافة' : 'No images yet — click + to add'}
                </p>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-3 mb-5">{imgExisting.length + imgNewFiles.length}/5 {lang === 'ar' ? 'صور' : 'images'}</p>

            <div className="flex gap-3">
              <button onClick={() => setImgProduct(null)} className="btn-secondary flex-1">{t.cancel}</button>
              <button onClick={saveImages} disabled={imgSaving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {imgSaving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {lang === 'ar' ? 'حفظ الصور' : 'Save Images'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit product modal */}
      {editProd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditProd(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800">{editProd === 'new' ? (lang === 'ar' ? 'إضافة منتج' : 'Add Product') : (lang === 'ar' ? 'تعديل المنتج' : `Edit: ${editProd.name}`)}</h3>
              <button onClick={() => setEditProd(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>

            <div className="space-y-3">
              {/* Wholesaler — only for new products */}
              {editProd === 'new' && (
                <div>
                  <label className="label text-xs">{lang === 'ar' ? 'المورد (تاجر الجملة)' : 'Wholesaler'}</label>
                  <select className="input text-sm" value={prodForm.wholesaler_id} onChange={e => setProdForm(f => ({ ...f, wholesaler_id: e.target.value }))}>
                    {users.filter(u => u.role === 'wholesaler').map(u => <option key={u.id} value={u.id}>{u.business_name || u.name}</option>)}
                    {users.filter(u => u.role === 'wholesaler').length === 0 && <option value="">No wholesalers found</option>}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div><label className="label text-xs">{lang === 'ar' ? 'الاسم (EN)' : 'Name (EN)'} *</label><input className="input text-sm" value={prodForm.name} onChange={e => setProdForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div><label className="label text-xs">{lang === 'ar' ? 'الاسم (AR)' : 'Name (AR)'}</label><input className="input text-sm" dir="rtl" value={prodForm.name_ar} onChange={e => setProdForm(f => ({ ...f, name_ar: e.target.value }))} /></div>
                <div><label className="label text-xs">{lang === 'ar' ? 'السعر (DZD)' : 'Price (DZD)'} *</label><input className="input text-sm" type="number" min="0" value={prodForm.price} onChange={e => setProdForm(f => ({ ...f, price: e.target.value }))} /></div>
                <div><label className="label text-xs">{lang === 'ar' ? 'المخزون' : 'Stock Qty'}</label><input className="input text-sm" type="number" min="0" value={prodForm.stock_qty} onChange={e => setProdForm(f => ({ ...f, stock_qty: e.target.value }))} /></div>
                <div><label className="label text-xs">{lang === 'ar' ? 'الحد الأدنى للطلب' : 'Min Order'}</label><input className="input text-sm" type="number" min="1" value={prodForm.min_order_qty} onChange={e => setProdForm(f => ({ ...f, min_order_qty: e.target.value }))} /></div>
                <div>
                  <label className="label text-xs">{lang === 'ar' ? 'الفئة' : 'Category'}</label>
                  <select className="input text-sm" value={prodForm.category_id} onChange={e => setProdForm(f => ({ ...f, category_id: e.target.value }))}>
                    <option value="">— {lang === 'ar' ? 'بدون فئة' : 'No category'} —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div><label className="label text-xs">{lang === 'ar' ? 'الوحدة (EN)' : 'Unit (EN)'}</label><input className="input text-sm" value={prodForm.unit} onChange={e => setProdForm(f => ({ ...f, unit: e.target.value }))} /></div>
                <div><label className="label text-xs">{lang === 'ar' ? 'الوحدة (AR)' : 'Unit (AR)'}</label><input className="input text-sm" dir="rtl" value={prodForm.unit_ar} onChange={e => setProdForm(f => ({ ...f, unit_ar: e.target.value }))} /></div>
              </div>

              <div><label className="label text-xs">{lang === 'ar' ? 'الوصف (EN)' : 'Description (EN)'}</label><textarea className="input text-sm h-16 resize-none" value={prodForm.description} onChange={e => setProdForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div><label className="label text-xs">{lang === 'ar' ? 'الوصف (AR)' : 'Description (AR)'}</label><textarea className="input text-sm h-16 resize-none" dir="rtl" value={prodForm.description_ar} onChange={e => setProdForm(f => ({ ...f, description_ar: e.target.value }))} /></div>

              {/* Images */}
              <div>
                <label className="label text-xs mb-2 block">{lang === 'ar' ? 'الصور' : 'Images'} ({prodKeepImages.length + prodNewFiles.length}/5)</label>
                <div className="flex flex-wrap gap-3">
                  {prodKeepImages.map((url, i) => (
                    <div key={url} className="relative group w-20 h-20 shrink-0">
                      <img src={imgUrl(url)} alt="" className="w-full h-full object-cover rounded-xl border border-slate-200" />
                      <button onClick={() => setProdKeepImages(prev => prev.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                    </div>
                  ))}
                  {prodNewFiles.map((file, i) => (
                    <div key={i} className="relative group w-20 h-20 shrink-0">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover rounded-xl border-2 border-primary-300" />
                      <button onClick={() => setProdNewFiles(prev => prev.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                    </div>
                  ))}
                  {prodKeepImages.length + prodNewFiles.length < 5 && (
                    <label className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors shrink-0">
                      <ImagePlus size={18} className="text-slate-400" />
                      <input ref={prodFileRef} type="file" className="hidden" multiple accept="image/*" onChange={e => { const files = Array.from(e.target.files || []); const rem = 5 - prodKeepImages.length - prodNewFiles.length; setProdNewFiles(prev => [...prev, ...files.slice(0, rem)]); e.target.value = ''; }} />
                    </label>
                  )}
                </div>
              </div>

              {/* Active toggle for edit */}
              {editProd !== 'new' && (
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" className="w-4 h-4 rounded" checked={!!prodForm.is_active} onChange={e => setProdForm(f => ({ ...f, is_active: e.target.checked ? 1 : 0 }))} />
                  <span className="text-sm text-slate-600">{lang === 'ar' ? 'منتج نشط' : 'Active'}</span>
                </label>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditProd(null)} className="btn-secondary flex-1">{t.cancel}</button>
              <button onClick={saveProd} disabled={prodSaving || !prodForm.name || prodForm.price === ''} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {prodSaving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {lang === 'ar' ? 'حفظ' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Docs modal */}
      {docsUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDocsUser(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-800">{docsUser.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{docsUser.role} · {docsUser.email}</p>
              </div>
              <button onClick={() => setDocsUser(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'id_image', labelEn: 'National ID', labelAr: 'بطاقة الهوية' },
                { key: 'license_image', labelEn: 'Business License', labelAr: 'السجل التجاري' },
                { key: 'gray_card_image', labelEn: 'Gray Card', labelAr: 'البطاقة الرمادية' },
              ].filter(d => docsUser[d.key]).map(d => (
                <div key={d.key}>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{lang === 'ar' ? d.labelAr : d.labelEn}</p>
                  <a href={imgUrl(docsUser[d.key])} target="_blank" rel="noopener noreferrer">
                    <img src={imgUrl(docsUser[d.key])} alt={d.labelEn} className="w-full rounded-2xl border border-slate-200 hover:opacity-90 transition-opacity cursor-pointer" />
                  </a>
                </div>
              ))}
              {!docsUser.id_image && !docsUser.license_image && !docsUser.gray_card_image && (
                <p className="text-slate-400 text-sm text-center py-6">{lang === 'ar' ? 'لا توجد مستندات مرفوعة' : 'No documents uploaded'}</p>
              )}
            </div>
            {!docsUser.is_approved && docsUser.role !== 'admin' && (
              <button onClick={() => { approveUser(docsUser.id); setDocsUser(null); }} className="btn-primary w-full mt-5 flex items-center justify-center gap-2">
                <CheckCircle size={16} /> {t.approve}
              </button>
            )}
          </div>
        </div>
      )}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{lang === 'ar' ? 'لوحة الإدارة' : 'Admin Dashboard'}</h1>
        <p className="text-slate-500 text-sm">{lang === 'ar' ? 'إدارة كاملة للمنصة' : 'Full platform management'}</p>
      </div>

      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-2xl w-fit overflow-x-auto">
        {tabs.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)} className={`relative px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${tab === tb.key ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {tb.label}
            {tb.badge > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{tb.badge}</span>}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: lang === 'ar' ? 'إجمالي المستخدمين' : 'Total Users', value: stats.users?.total, sub: `${stats.users?.pending || 0} pending`, color: 'text-blue-600 bg-blue-50' },
              { icon: Package, label: lang === 'ar' ? 'المنتجات' : 'Products', value: stats.products?.total, sub: `${stats.products?.active || 0} active`, color: 'text-primary-600 bg-primary-50' },
              { icon: ShoppingBag, label: lang === 'ar' ? 'الطلبات' : 'Orders', value: stats.orders?.total, sub: `${stats.orders?.pending || 0} pending`, color: 'text-orange-600 bg-orange-50' },
              { icon: TrendingUp, label: lang === 'ar' ? 'الإيرادات' : 'Revenue', value: `${(stats.orders?.revenue || 0).toLocaleString()} DZD`, sub: lang === 'ar' ? 'إجمالي' : 'total', color: 'text-green-600 bg-green-50' },
            ].map(({ icon: Icon, label, value, sub, color }) => (
              <div key={label} className="card">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}><Icon size={20} /></div>
                <div className="text-2xl font-bold text-slate-800">{value}</div>
                <div className="text-sm text-slate-500">{label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
              </div>
            ))}
          </div>

          {/* Pending users */}
          {users.filter(u => !u.is_approved && u.role !== 'admin').length > 0 && (
            <div className="card border-l-4 border-amber-400">
              <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><AlertCircle size={18} className="text-amber-500" />{lang === 'ar' ? 'مستخدمون بانتظار الموافقة' : 'Users Pending Approval'}</h3>
              <div className="space-y-2">
                {users.filter(u => !u.is_approved && u.role !== 'admin').slice(0, 5).map(u => (
                  <div key={u.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div><p className="font-medium text-sm text-slate-800">{u.name}</p><p className="text-xs text-slate-400">{u.email} · {roleBadge(u.role)}</p></div>
                    <div className="flex items-center gap-2">
                      {(u.id_image || u.license_image || u.gray_card_image) && (
                        <button onClick={() => setDocsUser(u)} className="text-xs border border-slate-200 text-slate-500 px-2 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1">
                          <FileText size={12} /> Docs
                        </button>
                      )}
                      <button onClick={() => approveUser(u.id)} className="btn-primary text-xs py-1.5 px-3">{t.approve}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="card">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <input className="input text-sm max-w-xs" placeholder={lang === 'ar' ? 'بحث...' : 'Search...'} value={search} onChange={e => setSearch(e.target.value)} />
            <select className="input text-sm w-40" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="">{lang === 'ar' ? 'الكل' : 'All Roles'}</option>
              <option value="wholesaler">Wholesaler</option>
              <option value="retailer">Retailer</option>
              <option value="driver">Driver</option>
            </select>
            <select className="input text-sm w-44" value={filterApproved} onChange={e => setFilterApproved(e.target.value)}>
              <option value="">{lang === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
              <option value="0">{lang === 'ar' ? 'بانتظار الموافقة' : 'Pending'}</option>
              <option value="1">{lang === 'ar' ? 'موافق عليه' : 'Approved'}</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50"><th className="text-left px-4 py-3 text-slate-500 font-medium">{t.name}</th><th className="text-left px-4 py-3 text-slate-500 font-medium">{t.email}</th><th className="px-4 py-3 text-slate-500 font-medium">{lang === 'ar' ? 'الدور' : 'Role'}</th><th className="px-4 py-3 text-slate-500 font-medium">{t.wilaya}</th><th className="px-4 py-3 text-slate-500 font-medium">{t.status}</th><th className="px-4 py-3 text-slate-500 font-medium">{t.actions}</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="table-row">
                    <td className="px-4 py-3 font-medium text-slate-800">{u.name}<br/><span className="text-xs text-slate-400">{u.business_name}</span></td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3 text-center">{roleBadge(u.role)}</td>
                    <td className="px-4 py-3 text-slate-500 text-center">{u.wilaya || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      {u.is_active ? (u.is_approved ? <span className="badge-green">Active</span> : <span className="badge-yellow">Pending</span>) : <span className="badge-red">Suspended</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {u.role !== 'admin' && (u.id_image || u.license_image || u.gray_card_image) && (
                          <button onClick={() => setDocsUser(u)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="View documents"><FileText size={14} /></button>
                        )}
                        {!u.is_approved && u.role !== 'admin' && <button onClick={() => approveUser(u.id)} className="text-xs bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600">{t.approve}</button>}
                        {u.is_active && u.role !== 'admin' && <button onClick={() => suspendUser(u.id)} className="text-xs bg-amber-500 text-white px-2 py-1 rounded-lg hover:bg-amber-600">{t.suspend}</button>}
                        {!u.is_active && <button onClick={() => activateUser(u.id)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600">{t.activate}</button>}
                        {u.role !== 'admin' && <button onClick={() => deleteUser(u.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products */}
      {tab === 'products' && (
        <div className="card overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-slate-500">{products.length} {lang === 'ar' ? 'منتج' : 'products'}</span>
            <button onClick={openAddProd} className="btn-primary flex items-center gap-2 text-sm py-2 px-4"><Plus size={15} />{lang === 'ar' ? 'إضافة منتج' : 'Add Product'}</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-3 py-3 w-12" />
                <th className="text-left px-4 py-3 text-slate-500 font-medium">{t.name}</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">{t.supplier}</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">{t.category}</th>
                <th className="px-4 py-3 text-slate-500 font-medium">{t.price}</th>
                <th className="px-4 py-3 text-slate-500 font-medium">{t.status}</th>
                <th className="px-4 py-3 text-slate-500 font-medium">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="px-3 py-2">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                      {Array.isArray(p.images) && p.images[0]
                        ? <img src={imgUrl(p.images[0])} alt="" className="w-full h-full object-cover" />
                        : <Package size={15} className="text-slate-300" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3 text-slate-500">{p.business_name || p.wholesaler_name}</td>
                  <td className="px-4 py-3 text-slate-500">{p.category_name || '—'}</td>
                  <td className="px-4 py-3 text-center font-semibold">{p.price?.toLocaleString()} DZD</td>
                  <td className="px-4 py-3 text-center">{p.is_active ? <span className="badge-green">Active</span> : <span className="badge-gray">Inactive</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => openEditProd(p)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium transition-colors" title="Edit product">Edit</button>
                      <button
                        onClick={() => openImgModal(p)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 font-medium transition-colors"
                        title="Edit images"
                      >
                        <Camera size={13} />
                        {Array.isArray(p.images) && p.images.length > 0 ? p.images.length : lang === 'ar' ? 'صور' : 'imgs'}
                      </button>
                      <button onClick={() => toggleProduct(p.id)} className={`text-xs px-2.5 py-1.5 rounded-lg ${p.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                        {p.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Orders */}
      {tab === 'orders' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50"><th className="text-left px-4 py-3 text-slate-500 font-medium">#</th><th className="text-left px-4 py-3 text-slate-500 font-medium">{lang === 'ar' ? 'التاجر' : 'Retailer'}</th><th className="text-left px-4 py-3 text-slate-500 font-medium">{lang === 'ar' ? 'المورد' : 'Wholesaler'}</th><th className="px-4 py-3 text-slate-500 font-medium">{t.status}</th><th className="px-4 py-3 text-slate-500 font-medium">{t.total}</th><th className="px-4 py-3 text-slate-500 font-medium">{t.date}</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="table-row">
                  <td className="px-4 py-3 font-mono text-slate-500">#{o.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{o.retailer_name}</td>
                  <td className="px-4 py-3 text-slate-500">{o.business_name || o.wholesaler_name}</td>
                  <td className="px-4 py-3 text-center">{statusBadge(o.status)}</td>
                  <td className="px-4 py-3 text-center font-semibold">{o.total_amount?.toLocaleString()} DZD</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Categories */}
      {tab === 'categories' && (() => {
        const topLevel = categories.filter(c => !c.parent_id);
        const subs = categories.filter(c => c.parent_id);
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="card">
              <h3 className="font-semibold text-slate-700 mb-4">{lang === 'ar' ? 'إضافة فئة جديدة' : 'Add Category'}</h3>
              <div className="space-y-3">
                <div><label className="label text-xs">{lang === 'ar' ? 'الاسم (EN)' : 'Name (EN)'}</label><input className="input text-sm" value={newCat.name} onChange={e => setNewCat(c => ({ ...c, name: e.target.value }))} /></div>
                <div><label className="label text-xs">{lang === 'ar' ? 'الاسم (AR)' : 'Name (AR)'}</label><input className="input text-sm" dir="rtl" value={newCat.name_ar} onChange={e => setNewCat(c => ({ ...c, name_ar: e.target.value }))} /></div>
                <div><label className="label text-xs">{lang === 'ar' ? 'الأيقونة' : 'Icon (emoji)'}</label><input className="input text-sm" value={newCat.icon} onChange={e => setNewCat(c => ({ ...c, icon: e.target.value }))} /></div>
                <div>
                  <label className="label text-xs">{lang === 'ar' ? 'الفئة الأم (اختياري)' : 'Parent Category (optional)'}</label>
                  <select className="input text-sm" value={newCat.parent_id ?? ''} onChange={e => setNewCat(c => ({ ...c, parent_id: e.target.value ? Number(e.target.value) : null }))}>
                    <option value="">{lang === 'ar' ? '— فئة رئيسية —' : '— Top-level category —'}</option>
                    {topLevel.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
                  </select>
                </div>
                <button onClick={addCategory} className="btn-primary w-full flex items-center justify-center gap-2"><Plus size={16} />{lang === 'ar' ? 'إضافة' : 'Add'}</button>
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold text-slate-700 mb-4">{lang === 'ar' ? 'الفئات الحالية' : 'Existing Categories'} ({categories.length})</h3>
              <div className="space-y-0">
                {topLevel.map(p => {
                  const children = subs.filter(s => s.parent_id === p.id);
                  const expanded = !!expandedCats[p.id];
                  return (
                    <div key={p.id}>
                      <div
                        className={`flex items-center justify-between py-2 border-b border-slate-100 ${children.length > 0 ? 'cursor-pointer hover:bg-slate-50 rounded-lg px-1 -mx-1' : ''}`}
                        onClick={() => children.length > 0 && setExpandedCats(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                      >
                        <span className="flex items-center gap-2">
                          <span>{p.icon}</span>
                          <span className="font-medium text-sm">{p.name}</span>
                          <span className="text-slate-400 text-xs">/ {p.name_ar}</span>
                          {children.length > 0 && (
                            <span className="text-xs text-primary-500 bg-primary-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              {children.length}
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform ${expanded ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6"/></svg>
                            </span>
                          )}
                        </span>
                        <button onClick={e => { e.stopPropagation(); deleteCategory(p.id); }} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                      {expanded && children.map(s => (
                        <div key={s.id} className="flex items-center justify-between py-1.5 pl-7 border-b border-slate-50 bg-slate-50/50">
                          <span className="flex items-center gap-2 text-slate-500"><span className="text-slate-300 text-xs">└</span><span>{s.icon}</span><span className="text-sm">{s.name}</span><span className="text-slate-400 text-xs">/ {s.name_ar}</span></span>
                          <button onClick={() => deleteCategory(s.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                  );
                })}
                {subs.filter(s => !categories.find(p => p.id === s.parent_id)).map(s => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="flex items-center gap-2"><span>{s.icon}</span><span className="font-medium text-sm">{s.name}</span><span className="text-slate-400 text-xs">/ {s.name_ar}</span></span>
                    <button onClick={() => deleteCategory(s.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Suggestions */}
      {tab === 'suggestions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">{t.suggestions}</h2>
              <p className="text-sm text-slate-500">{suggestions.length} total · {unreadSuggestions} unread</p>
            </div>
          </div>
          {suggestions.length === 0 ? (
            <div className="card p-12 text-center text-slate-400">{t.noData}</div>
          ) : (
            <div className="space-y-3">
              {suggestions.map(s => (
                <div key={s.id} className={`card p-4 border-l-4 ${s.is_read ? 'border-slate-200' : 'border-primary-400'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {!s.is_read && <span className="text-xs bg-primary-100 text-primary-700 font-semibold px-2 py-0.5 rounded-full">New</span>}
                        <span className="text-sm font-semibold text-slate-800">{s.name || (lang === 'ar' ? 'مجهول' : lang === 'fr' ? 'Anonyme' : 'Anonymous')}</span>
                        {s.email && <span className="text-xs text-slate-400">{s.email}</span>}
                        <span className="text-xs text-slate-400 ml-auto">{new Date(s.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{s.message}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!s.is_read && (
                        <button onClick={() => markSuggestionRead(s.id)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="Mark as read">
                          <CheckCircle size={15} />
                        </button>
                      )}
                      <button onClick={() => deleteSuggestion(s.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
