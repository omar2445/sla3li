import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Lock, FileText, CheckCircle, Upload, Edit2, Save, X, ShieldCheck, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import api, { imgUrl } from '../api/axios';
import toast from 'react-hot-toast';

const WILAYAS = ['Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem','M\'Sila','Mascara','Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent','Ghardaïa','Relizane'];

const ROLE_COLOR = {
  admin:      'bg-purple-100 text-purple-700 border-purple-200',
  wholesaler: 'bg-blue-100 text-blue-700 border-blue-200',
  retailer:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  driver:     'bg-orange-100 text-orange-700 border-orange-200',
};

function DocSlot({ label, labelAr, field, current, lang, onSave }) {
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const preview = file ? URL.createObjectURL(file) : null;

  const handleSave = async () => {
    if (!file) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append(field, file);
      await api.put('/auth/documents', fd);
      toast.success(lang === 'ar' ? 'تم تحديث المستند' : 'Document updated');
      onSave();
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally { setSaving(false); }
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-slate-700 text-sm">{lang === 'ar' ? labelAr : label}</p>
        {current && !file && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <CheckCircle size={12} /> {lang === 'ar' ? 'مرفوع' : 'Uploaded'}
          </span>
        )}
      </div>

      {/* Current doc */}
      {current && !file && (
        <a href={imgUrl(current)} target="_blank" rel="noopener noreferrer">
          <img src={imgUrl(current)} alt={label} className="w-full h-36 object-cover rounded-xl border border-slate-200 hover:opacity-90 transition-opacity cursor-zoom-in" />
        </a>
      )}

      {/* New file preview */}
      {file && (
        <div className="relative">
          <img src={preview} alt="new" className="w-full h-36 object-cover rounded-xl border-2 border-primary-300" />
          <button onClick={() => setFile(null)} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow">
            <X size={12} />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <label className="flex-1 cursor-pointer">
          <div className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-primary-400 hover:bg-primary-50 rounded-xl py-2.5 text-sm text-slate-500 hover:text-primary-600 transition-all font-medium">
            <Upload size={15} />
            {lang === 'ar' ? (current ? 'استبدال' : 'رفع') : (current ? 'Replace' : 'Upload')}
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={e => setFile(e.target.files[0] || null)} />
        </label>
        {file && (
          <button onClick={handleSave} disabled={saving} className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5 disabled:opacity-60">
            {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
            {lang === 'ar' ? 'حفظ' : 'Save'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const { lang } = useLang();
  const [tab, setTab] = useState('info');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [pwdSaving, setPwdSaving] = useState(false);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setPwd = (k, v) => setPwdForm(f => ({ ...f, [k]: v }));

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setProfile(data);
      setForm({ name: data.name, name_ar: data.name_ar || '', phone: data.phone || '', wilaya: data.wilaya || '', address: data.address || '', business_name: data.business_name || '', business_name_ar: data.business_name_ar || '' });
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const uploadAvatar = async (file) => {
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      await api.put('/auth/avatar', fd);
      await fetchProfile();
      toast.success(lang === 'ar' ? 'تم تحديث الصورة الشخصية' : 'Profile photo updated');
    } catch { toast.error('Error uploading photo'); }
    finally { setAvatarUploading(false); }
  };

  const saveInfo = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', form);
      await fetchProfile();
      setEditing(false);
      toast.success(lang === 'ar' ? 'تم تحديث الملف الشخصي' : 'Profile updated');
    } catch { toast.error('Error'); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (!pwdForm.current_password || !pwdForm.new_password) { toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Fill all fields'); return; }
    if (pwdForm.new_password !== pwdForm.confirm) { toast.error(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'); return; }
    if (pwdForm.new_password.length < 6) { toast.error(lang === 'ar' ? 'كلمة المرور قصيرة جداً' : 'Password too short (min 6)'); return; }
    setPwdSaving(true);
    try {
      await api.put('/auth/password', { current_password: pwdForm.current_password, new_password: pwdForm.new_password });
      toast.success(lang === 'ar' ? 'تم تغيير كلمة المرور' : 'Password changed');
      setPwdForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setPwdSaving(false); }
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <span className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin inline-block" />
    </div>
  );

  if (!profile) return null;

  const tabs = [
    { key: 'info', icon: User, labelEn: 'Personal Info', labelAr: 'المعلومات الشخصية' },
    { key: 'password', icon: Lock, labelEn: 'Password', labelAr: 'كلمة المرور' },
    { key: 'documents', icon: FileText, labelEn: 'Documents', labelAr: 'المستندات' },
  ];

  const showDocs = profile.role === 'wholesaler' || profile.role === 'retailer' || profile.role === 'driver';

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Profile header card */}
      <div className="bg-gradient-to-br from-navy-900 to-navy-700 rounded-3xl p-6 mb-6 text-white">
        <div className="flex items-center gap-4">
          <label className="relative group cursor-pointer shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary-500/20 border-2 border-primary-500/30 flex items-center justify-center">
              {profile.avatar
                ? <img src={imgUrl(profile.avatar)} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold text-primary-300">{profile.name?.[0]?.toUpperCase()}</span>
              }
            </div>
            {/* Camera overlay */}
            <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {avatarUploading
                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Camera size={18} className="text-white" />
              }
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={e => uploadAvatar(e.target.files[0])}
            />
          </label>
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">{profile.name}</h1>
            {profile.business_name && <p className="text-white/60 text-sm truncate">{profile.business_name}</p>}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${ROLE_COLOR[profile.role]}`}>{profile.role}</span>
              {profile.is_approved
                ? <span className="flex items-center gap-1 text-xs text-emerald-300 font-medium"><ShieldCheck size={12} /> {lang === 'ar' ? 'موثق' : 'Verified'}</span>
                : <span className="text-xs text-amber-300 font-medium">⏳ {lang === 'ar' ? 'بانتظار الموافقة' : 'Pending approval'}</span>
              }
            </div>
          </div>
          <div className="ml-auto text-right shrink-0">
            <p className="text-white/40 text-xs">{lang === 'ar' ? 'عضو منذ' : 'Member since'}</p>
            <p className="text-white/70 text-sm font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-6">
        {tabs.filter(tb => tb.key !== 'documents' || showDocs).map(tb => {
          const Icon = tb.icon;
          return (
            <button key={tb.key} onClick={() => setTab(tb.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === tb.key ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Icon size={15} />
              <span className="hidden sm:inline">{lang === 'ar' ? tb.labelAr : tb.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* ── Personal Info ── */}
      {tab === 'info' && (
        <div className="card space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800">{lang === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}</h2>
            {!editing
              ? <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"><Edit2 size={14} />{lang === 'ar' ? 'تعديل' : 'Edit'}</button>
              : <button onClick={() => { setEditing(false); setForm({ name: profile.name, name_ar: profile.name_ar || '', phone: profile.phone || '', wilaya: profile.wilaya || '', address: profile.address || '', business_name: profile.business_name || '', business_name_ar: profile.business_name_ar || '' }); }} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 font-medium"><X size={14} />{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
            }
          </div>

          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label text-xs">Name (EN)</label><input className="input text-sm" value={form.name} onChange={e => setF('name', e.target.value)} /></div>
                <div><label className="label text-xs">Name (AR)</label><input className="input text-sm" dir="rtl" value={form.name_ar} onChange={e => setF('name_ar', e.target.value)} /></div>
              </div>
              <div><label className="label text-xs">{lang === 'ar' ? 'الهاتف' : 'Phone'}</label><input className="input text-sm" value={form.phone} onChange={e => setF('phone', e.target.value)} placeholder="05XXXXXXXX" /></div>
              <div><label className="label text-xs">{lang === 'ar' ? 'الولاية' : 'Wilaya'}</label>
                <select className="input text-sm" value={form.wilaya} onChange={e => setF('wilaya', e.target.value)}>
                  <option value="">{lang === 'ar' ? 'اختر الولاية' : 'Select wilaya'}</option>
                  {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div><label className="label text-xs">{lang === 'ar' ? 'العنوان' : 'Address'}</label><input className="input text-sm" value={form.address} onChange={e => setF('address', e.target.value)} /></div>
              {(profile.role === 'wholesaler' || profile.role === 'retailer') && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label text-xs">Business Name (EN)</label><input className="input text-sm" value={form.business_name} onChange={e => setF('business_name', e.target.value)} /></div>
                  <div><label className="label text-xs">Business Name (AR)</label><input className="input text-sm" dir="rtl" value={form.business_name_ar} onChange={e => setF('business_name_ar', e.target.value)} /></div>
                </div>
              )}
              <button onClick={saveInfo} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                {lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { icon: User,     value: profile.name,          label: 'Name' },
                { icon: Mail,     value: profile.email,         label: 'Email' },
                { icon: Phone,    value: profile.phone,         label: 'Phone' },
                { icon: MapPin,   value: profile.wilaya,        label: 'Wilaya' },
                { icon: MapPin,   value: profile.address,       label: 'Address' },
                { icon: Briefcase,value: profile.business_name, label: 'Business Name' },
              ].filter(r => r.value).map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                  <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">{label}</p>
                    <p className="text-sm text-slate-800 font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Password ── */}
      {tab === 'password' && (
        <div className="card space-y-5">
          <h2 className="font-bold text-slate-800">{lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}</h2>
          <div className="space-y-4">
            <div>
              <label className="label">{lang === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}</label>
              <input type="password" className="input" value={pwdForm.current_password} onChange={e => setPwd('current_password', e.target.value)} placeholder="••••••••" />
            </div>
            <div>
              <label className="label">{lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</label>
              <input type="password" className="input" value={pwdForm.new_password} onChange={e => setPwd('new_password', e.target.value)} placeholder="••••••••" />
              <p className="text-xs text-slate-400 mt-1">{lang === 'ar' ? 'على الأقل 6 أحرف' : 'At least 6 characters'}</p>
            </div>
            <div>
              <label className="label">{lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm New Password'}</label>
              <input type="password" className="input" value={pwdForm.confirm} onChange={e => setPwd('confirm', e.target.value)} placeholder="••••••••" />
              {pwdForm.confirm && pwdForm.new_password && pwdForm.confirm !== pwdForm.new_password && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><X size={11} />{lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'}</p>
              )}
              {pwdForm.confirm && pwdForm.new_password && pwdForm.confirm === pwdForm.new_password && (
                <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><CheckCircle size={11} />{lang === 'ar' ? 'متطابقتان' : 'Passwords match'}</p>
              )}
            </div>
            <button onClick={changePassword} disabled={pwdSaving || !pwdForm.current_password || !pwdForm.new_password || pwdForm.new_password !== pwdForm.confirm}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {pwdSaving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock size={16} />}
              {lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
            </button>
          </div>
        </div>
      )}

      {/* ── Documents ── */}
      {tab === 'documents' && showDocs && (
        <div className="card space-y-5">
          <div>
            <h2 className="font-bold text-slate-800">{lang === 'ar' ? 'المستندات الرسمية' : 'Official Documents'}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {lang === 'ar'
                ? 'يمكنك تحديث مستنداتك في حال انتهاء صلاحيتها. ستُراجع من قبل الإدارة.'
                : 'Update your documents if they have expired. They will be reviewed by the admin.'}
            </p>
          </div>

          <DocSlot
            label="National ID Card"
            labelAr="بطاقة الهوية الوطنية"
            field="id_image"
            current={profile.id_image}
            lang={lang}
            onSave={fetchProfile}
          />

          {(profile.role === 'wholesaler' || profile.role === 'retailer') && (
            <DocSlot
              label="Business License"
              labelAr="السجل التجاري"
              field="license_image"
              current={profile.license_image}
              lang={lang}
              onSave={fetchProfile}
            />
          )}

          {profile.role === 'driver' && (
            <DocSlot
              label="Gray Card (Vehicle Registration)"
              labelAr="البطاقة الرمادية"
              field="gray_card_image"
              current={profile.gray_card_image}
              lang={lang}
              onSave={fetchProfile}
            />
          )}
        </div>
      )}
    </div>
  );
}
