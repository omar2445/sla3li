import { useState, useEffect } from 'react';
import { Users, Package, ShoppingBag, TrendingUp, CheckCircle, XCircle, AlertCircle, Trash2, Plus } from 'lucide-react';
import { useLang } from '../context/LangContext';
import api from '../api/axios';
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
  const [newCat, setNewCat] = useState({ name: '', name_ar: '', icon: '📦' });
  const [filterRole, setFilterRole] = useState('');
  const [filterApproved, setFilterApproved] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { role: filterRole || undefined, is_approved: filterApproved !== '' ? filterApproved : undefined, search: search || undefined };
      const [s, u, p, o, c] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users', { params }),
        api.get('/admin/products'),
        api.get('/admin/orders'),
        api.get('/categories'),
      ]);
      setStats(s.data); setUsers(u.data.users); setProducts(p.data); setOrders(o.data); setCategories(c.data);
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
  const addCategory = async () => { if (!newCat.name || !newCat.name_ar) return; try { await api.post('/categories', newCat); await api.get('/categories').then(r => setCategories(r.data)); setNewCat({ name: '', name_ar: '', icon: '📦' }); toast.success('Category added'); } catch { toast.error(t.error); } };
  const deleteCategory = async (id) => { try { await api.delete(`/categories/${id}`); setCategories(prev => prev.filter(c => c.id !== id)); toast.success('Deleted'); } catch { toast.error(t.error); } };

  const tabs = [
    { key: 'overview', label: lang === 'ar' ? 'نظرة عامة' : 'Overview' },
    { key: 'users', label: t.users },
    { key: 'products', label: t.products },
    { key: 'orders', label: t.orders },
    { key: 'categories', label: t.categories },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{lang === 'ar' ? 'لوحة الإدارة' : 'Admin Dashboard'}</h1>
        <p className="text-slate-500 text-sm">{lang === 'ar' ? 'إدارة كاملة للمنصة' : 'Full platform management'}</p>
      </div>

      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-2xl w-fit overflow-x-auto">
        {tabs.map(tb => <button key={tb.key} onClick={() => setTab(tb.key)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${tab === tb.key ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{tb.label}</button>)}
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
                    <button onClick={() => approveUser(u.id)} className="btn-primary text-xs py-1.5 px-3">{t.approve}</button>
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
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50"><th className="text-left px-4 py-3 text-slate-500 font-medium">{t.name}</th><th className="text-left px-4 py-3 text-slate-500 font-medium">{t.supplier}</th><th className="text-left px-4 py-3 text-slate-500 font-medium">{t.category}</th><th className="px-4 py-3 text-slate-500 font-medium">{t.price}</th><th className="px-4 py-3 text-slate-500 font-medium">{t.status}</th><th className="px-4 py-3 text-slate-500 font-medium">{t.actions}</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3 text-slate-500">{p.business_name || p.wholesaler_name}</td>
                  <td className="px-4 py-3 text-slate-500">{p.category_name || '—'}</td>
                  <td className="px-4 py-3 text-center font-semibold">{p.price?.toLocaleString()} DZD</td>
                  <td className="px-4 py-3 text-center">{p.is_active ? <span className="badge-green">Active</span> : <span className="badge-gray">Inactive</span>}</td>
                  <td className="px-4 py-3 text-center"><button onClick={() => toggleProduct(p.id)} className={`text-xs px-3 py-1 rounded-lg ${p.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>{p.is_active ? 'Disable' : 'Enable'}</button></td>
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
      {tab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card">
            <h3 className="font-semibold text-slate-700 mb-4">{lang === 'ar' ? 'إضافة فئة جديدة' : 'Add Category'}</h3>
            <div className="space-y-3">
              <div><label className="label text-xs">{lang === 'ar' ? 'الاسم (EN)' : 'Name (EN)'}</label><input className="input text-sm" value={newCat.name} onChange={e => setNewCat(c => ({ ...c, name: e.target.value }))} /></div>
              <div><label className="label text-xs">{lang === 'ar' ? 'الاسم (AR)' : 'Name (AR)'}</label><input className="input text-sm" dir="rtl" value={newCat.name_ar} onChange={e => setNewCat(c => ({ ...c, name_ar: e.target.value }))} /></div>
              <div><label className="label text-xs">{lang === 'ar' ? 'الأيقونة' : 'Icon (emoji)'}</label><input className="input text-sm" value={newCat.icon} onChange={e => setNewCat(c => ({ ...c, icon: e.target.value }))} /></div>
              <button onClick={addCategory} className="btn-primary w-full flex items-center justify-center gap-2"><Plus size={16} />{lang === 'ar' ? 'إضافة' : 'Add'}</button>
            </div>
          </div>
          <div className="card">
            <h3 className="font-semibold text-slate-700 mb-4">{lang === 'ar' ? 'الفئات الحالية' : 'Existing Categories'} ({categories.length})</h3>
            <div className="space-y-2">
              {categories.map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="flex items-center gap-2"><span>{c.icon}</span><span className="font-medium text-sm">{c.name}</span><span className="text-slate-400 text-xs">/ {c.name_ar}</span></span>
                  <button onClick={() => deleteCategory(c.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
