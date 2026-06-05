import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Store, Truck, ChevronRight, ChevronLeft, UserPlus, Upload, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import toast from 'react-hot-toast';

const WILAYAS = ['Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem','M\'Sila','Mascara','Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent','Ghardaïa','Relizane'];

const roles = [
  { value: 'wholesaler', icon: Package, titleEn: 'Wholesaler', titleAr: 'تاجر جملة', descEn: 'Publish and sell products in bulk', descAr: 'انشر وبع المنتجات بالجملة', color: 'blue' },
  { value: 'retailer',   icon: Store,   titleEn: 'Retailer',   titleAr: 'تاجر تجزئة', descEn: 'Browse and order from suppliers',   descAr: 'تصفح واطلب من الموردين', color: 'green' },
  { value: 'driver',     icon: Truck,   titleEn: 'Delivery Driver', titleAr: 'سائق توصيل', descEn: 'Accept and fulfill delivery tasks', descAr: 'اقبل ونفذ مهام التوصيل', color: 'orange' },
];

function DocUpload({ label, labelAr, hint, hintAr, field, file, onChange, lang, required }) {
  const preview = file ? URL.createObjectURL(file) : null;
  return (
    <div>
      <label className="label text-sm">
        {lang === 'ar' ? labelAr : label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <label className="block cursor-pointer group">
        <div className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-all ${
          file ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-primary-400 hover:bg-primary-50/50'
        }`}>
          {preview ? (
            <div className="relative h-36">
              <img src={preview} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload size={20} className="text-white" />
                <span className="text-white text-xs font-medium">{lang === 'ar' ? 'انقر لتغيير' : 'Click to change'}</span>
              </div>
              <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow">
                <CheckCircle size={14} className="text-white" />
              </div>
            </div>
          ) : (
            <div className="h-36 flex flex-col items-center justify-center gap-2 text-slate-400 px-4 text-center">
              <Upload size={26} className="group-hover:text-primary-500 transition-colors" />
              <span className="text-sm font-medium group-hover:text-primary-600 transition-colors">
                {lang === 'ar' ? 'انقر لرفع صورة' : 'Click to upload'}
              </span>
              <span className="text-xs text-slate-300">{lang === 'ar' ? hintAr : hint}</span>
            </div>
          )}
        </div>
        <input type="file" className="hidden" accept="image/*" onChange={e => onChange(e.target.files[0] || null)} />
      </label>
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    role: '', name: '', email: '', password: '', phone: '', wilaya: '', address: '', business_name: '',
  });
  const [docs, setDocs] = useState({ id_image: null, license_image: null, gray_card_image: null });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setDoc = (k, v) => setDocs(d => ({ ...d, [k]: v }));

  const docsRequired = form.role === 'wholesaler' || form.role === 'retailer'
    ? ['id_image', 'license_image']
    : ['id_image', 'gray_card_image'];

  const docsComplete = docsRequired.every(k => docs[k]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''));
      Object.entries(docs).forEach(([k, v]) => { if (v) fd.append(k, v); });
      const user = await register(fd);
      toast.success(t.registerSuccess);
      if (!user.is_approved) {
        toast(t.pendingApprovalMsg, { icon: '⏳', duration: 5000 });
        navigate('/login');
      } else {
        navigate('/dashboard/retailer');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t.error);
    } finally { setLoading(false); }
  };

  const colorMap = {
    blue:   'border-blue-300 bg-blue-50 text-blue-700',
    green:  'border-primary-300 bg-primary-50 text-primary-700',
    orange: 'border-orange-300 bg-orange-50 text-orange-700',
  };

  const STEPS = 4;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <UserPlus size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{t.register}</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {t.alreadyHaveAccount}{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">{t.loginHere}</Link>
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {Array.from({ length: STEPS }, (_, i) => i + 1).map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > s ? 'bg-primary-600 text-white' :
                step === s ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                'bg-slate-200 text-slate-500'
              }`}>
                {step > s ? <CheckCircle size={16} /> : s}
              </div>
              {s < STEPS && <div className={`w-10 h-0.5 ${step > s ? 'bg-primary-600' : 'bg-slate-200'}`} />}
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
                  <button key={r.value} onClick={() => set('role', r.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${selected ? colorMap[r.color] : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                    <Icon size={24} className={selected ? '' : 'text-slate-400'} />
                    <div className="text-left">
                      <div className="font-semibold">{lang === 'ar' ? r.titleAr : r.titleEn}</div>
                      <div className="text-xs opacity-70">{lang === 'ar' ? r.descAr : r.descEn}</div>
                    </div>
                    {selected && <CheckCircle size={18} className="ml-auto opacity-70" />}
                  </button>
                );
              })}
              <button onClick={() => form.role && setStep(2)} disabled={!form.role}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-40">
                {t.next} <ChevronRight size={18} className={lang === 'ar' ? 'rotate-180' : ''} />
              </button>
            </div>
          )}

          {/* Step 2: Personal info */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-700 mb-2">{lang === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">{t.name} *</label>
                  <input className="input" value={form.name} onChange={e => set('name', e.target.value)} />
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
                <button onClick={() => form.name && setStep(3)} disabled={!form.name}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40">
                  {t.next} <ChevronRight size={18} className={lang === 'ar' ? 'rotate-180' : ''} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-semibold text-slate-700">{lang === 'ar' ? 'المستندات المطلوبة' : 'Required Documents'}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'ar'
                    ? 'ستُراجع مستنداتك من قبل الإدارة قبل تفعيل حسابك.'
                    : 'Your documents will be reviewed by the admin before your account is activated.'}
                </p>
              </div>

              <DocUpload
                label="National ID Card"
                labelAr="بطاقة الهوية الوطنية"
                hint="Photo of your national ID (front)"
                hintAr="صورة بطاقة هويتك الوطنية (الوجه الأمامي)"
                file={docs.id_image}
                onChange={v => setDoc('id_image', v)}
                lang={lang}
                required
              />

              {(form.role === 'wholesaler' || form.role === 'retailer') && (
                <DocUpload
                  label="Business License"
                  labelAr="السجل التجاري"
                  hint="Photo of your business registration certificate"
                  hintAr="صورة السجل التجاري أو شهادة التسجيل"
                  file={docs.license_image}
                  onChange={v => setDoc('license_image', v)}
                  lang={lang}
                  required
                />
              )}

              {form.role === 'driver' && (
                <DocUpload
                  label="Gray Card (Vehicle Registration)"
                  labelAr="البطاقة الرمادية"
                  hint="Photo of your vehicle's gray card"
                  hintAr="صورة البطاقة الرمادية للمركبة"
                  file={docs.gray_card_image}
                  onChange={v => setDoc('gray_card_image', v)}
                  lang={lang}
                  required
                />
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setStep(2)} className="btn-secondary flex items-center gap-2">
                  <ChevronLeft size={18} className={lang === 'ar' ? 'rotate-180' : ''} /> {t.back}
                </button>
                <button onClick={() => docsComplete && setStep(4)} disabled={!docsComplete}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40">
                  {t.next} <ChevronRight size={18} className={lang === 'ar' ? 'rotate-180' : ''} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Credentials */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-700 mb-2">{lang === 'ar' ? 'بيانات الحساب' : 'Account Credentials'}</h2>
              <div>
                <label className="label">{t.email} *</label>
                <input type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                <label className="label">{t.password} *</label>
                <input type="password" className="input" value={form.password} onChange={e => set('password', e.target.value)} minLength={6} />
                <p className="text-xs text-slate-400 mt-1">{lang === 'ar' ? 'على الأقل 6 أحرف' : 'At least 6 characters'}</p>
              </div>
              {form.role !== 'retailer' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                  {t.pendingApprovalMsg}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="btn-secondary flex items-center gap-2">
                  <ChevronLeft size={18} className={lang === 'ar' ? 'rotate-180' : ''} /> {t.back}
                </button>
                <button onClick={handleSubmit} disabled={loading || !form.email || !form.password}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40">
                  {loading
                    ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <UserPlus size={18} />}
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
