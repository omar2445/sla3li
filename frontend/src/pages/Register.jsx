import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Store, Truck, ChevronRight, ChevronLeft, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import toast from 'react-hot-toast';

const WILAYAS = ['Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem','M\'Sila','Mascara','Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent','Ghardaïa','Relizane'];

const roles = [
  { value: 'wholesaler', icon: Package, titleEn: 'Wholesaler', titleAr: 'تاجر جملة', descEn: 'Publish and sell products in bulk', descAr: 'انشر وبع المنتجات بالجملة', color: 'blue' },
  { value: 'retailer', icon: Store, titleEn: 'Retailer', titleAr: 'تاجر تجزئة', descEn: 'Browse and order from suppliers', descAr: 'تصفح واطلب من الموردين', color: 'green' },
  { value: 'driver', icon: Truck, titleEn: 'Delivery Driver', titleAr: 'سائق توصيل', descEn: 'Accept and fulfill delivery tasks', descAr: 'اقبل ونفذ مهام التوصيل', color: 'orange' },
];

export default function Register() {
  const { register } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ role: '', name: '', email: '', password: '', phone: '', wilaya: '', address: '', business_name: '' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(t.registerSuccess);
      if (!user.is_approved) { toast(t.pendingApprovalMsg, { icon: '⏳', duration: 5000 }); navigate('/login'); }
      else {
        const routes = { retailer: '/dashboard/retailer' };
        navigate(routes[user.role] || '/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t.error);
    } finally { setLoading(false); }
  };

  const colorMap = { blue: 'border-blue-300 bg-blue-50 text-blue-700', green: 'border-primary-300 bg-primary-50 text-primary-700', orange: 'border-orange-300 bg-orange-50 text-orange-700' };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <UserPlus size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{t.register}</h1>
          <p className="text-slate-500 mt-1 text-sm">{t.alreadyHaveAccount} <Link to="/login" className="text-primary-600 font-medium hover:underline">{t.loginHere}</Link></p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{s}</div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-primary-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <div className="card">
          {/* Step 1: Role */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-700 mb-4">{t.selectRole}</h2>
              {roles.map(r => {
                const Icon = r.icon;
                const selected = form.role === r.value;
                return (
                  <button key={r.value} onClick={() => set('role', r.value)} className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${selected ? colorMap[r.color] : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                    <Icon size={24} className={selected ? '' : 'text-slate-400'} />
                    <div className="text-left">
                      <div className="font-semibold">{lang === 'ar' ? r.titleAr : r.titleEn}</div>
                      <div className="text-xs opacity-70">{lang === 'ar' ? r.descAr : r.descEn}</div>
                    </div>
                    {selected && <div className="ml-auto w-5 h-5 bg-current rounded-full flex items-center justify-center opacity-40">✓</div>}
                  </button>
                );
              })}
              <button onClick={() => form.role && setStep(2)} disabled={!form.role} className="btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-40">
                {t.next} <ChevronRight size={18} className={lang === 'ar' ? 'rotate-180' : ''} />
              </button>
            </div>
          )}

          {/* Step 2: Info */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-700 mb-2">{lang === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">{t.name} *</label>
                  <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
                <div>
                  <label className="label">{t.phone}</label>
                  <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="05XXXXXXXX" />
                </div>
              </div>
              {(form.role === 'wholesaler' || form.role === 'retailer') && (
                <div>
                  <label className="label">{t.businessName}</label>
                  <input className="input" value={form.business_name} onChange={e => set('business_name', e.target.value)} />
                </div>
              )}
              <div>
                <label className="label">{t.wilaya}</label>
                <select className="input" value={form.wilaya} onChange={e => set('wilaya', e.target.value)}>
                  <option value="">{lang === 'ar' ? 'اختر الولاية' : 'Select wilaya'}</option>
                  {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="label">{t.address}</label>
                <input className="input" value={form.address} onChange={e => set('address', e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2">
                  <ChevronLeft size={18} className={lang === 'ar' ? 'rotate-180' : ''} /> {t.back}
                </button>
                <button onClick={() => form.name && setStep(3)} disabled={!form.name} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40">
                  {t.next} <ChevronRight size={18} className={lang === 'ar' ? 'rotate-180' : ''} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Credentials */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-700 mb-2">{lang === 'ar' ? 'بيانات الحساب' : 'Account Credentials'}</h2>
              <div>
                <label className="label">{t.email} *</label>
                <input type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div>
                <label className="label">{t.password} *</label>
                <input type="password" className="input" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
                <p className="text-xs text-slate-400 mt-1">{lang === 'ar' ? 'على الأقل 6 أحرف' : 'At least 6 characters'}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                {t.pendingApprovalMsg}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex items-center gap-2">
                  <ChevronLeft size={18} className={lang === 'ar' ? 'rotate-180' : ''} /> {t.back}
                </button>
                <button onClick={handleSubmit} disabled={loading || !form.email || !form.password} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40">
                  {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <UserPlus size={18} />}
                  {t.register}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
