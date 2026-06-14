import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { MapPin, Phone, Mail, Send, CheckCircle, X, MessageSquarePlus } from 'lucide-react';
import logoMark from '../logo/Selaali-LeafBag-mark.svg';
import api from '../api/axios';

const socials = [
  {
    name: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
    color: 'hover:bg-blue-600',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
    color: 'hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500',
  },
  {
    name: 'TikTok',
    href: 'https://tiktok.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.78a4.85 4.85 0 0 1-1.01-.09z"/>
      </svg>
    ),
    color: 'hover:bg-black',
  },
  {
    name: 'WhatsApp',
    href: 'https://wa.me/213550000000',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.882a.5.5 0 0 0 .638.607l6.247-1.635A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0 0 1-5.073-1.384l-.361-.214-3.742.98.999-3.648-.235-.374A9.955 9.955 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
    ),
    color: 'hover:bg-green-600',
  },
];

export default function Footer() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setSending(true);
    setError('');
    try {
      await api.post('/suggestions', form);
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || t.error);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => { setOpen(false); setSent(false); setError(''); };

  return (
    <>
      {/* Suggestion modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={handleClose}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{t.suggestionsTitle}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{t.suggestionsSubtitle}</p>
              </div>
              <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                <X size={18} />
              </button>
            </div>

            {sent ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <CheckCircle size={48} className="text-primary-500" />
                <p className="font-semibold text-slate-800">{t.suggestionSuccess}</p>
                <button onClick={handleClose} className="mt-2 text-sm text-slate-500 hover:text-slate-700 underline">{t.cancel}</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder={t.suggestionName}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-400 transition-colors"
                />
                <input
                  type="email"
                  placeholder={t.suggestionEmail}
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-400 transition-colors"
                />
                <textarea
                  placeholder={t.suggestionMessage}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={4}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-400 transition-colors resize-none"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={handleClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 font-medium transition-colors">
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={sending || !form.message.trim()}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                  >
                    <Send size={14} />
                    {sending ? t.loading : t.suggestionSend}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <footer className="bg-slate-900 text-slate-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src={logoMark} alt="" className="h-9 w-9" />
                <span className="font-bold text-lg tracking-widest leading-none">
                  <span className="text-[#22C57A]">S</span>
                  <span className="text-white">ELAALI</span>
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{t.subtitle}</p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">{lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-primary-400 transition-colors">{t.home}</Link></li>
                <li><Link to="/catalog" className="hover:text-primary-400 transition-colors">{t.catalog}</Link></li>
                <li><Link to="/register" className="hover:text-primary-400 transition-colors">{t.register}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">{lang === 'ar' ? 'للموردين' : 'For Suppliers'}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="hover:text-primary-400 transition-colors">{lang === 'ar' ? 'سجّل كتاجر جملة' : 'Register as Wholesaler'}</Link></li>
                <li><Link to="/dashboard/wholesaler" className="hover:text-primary-400 transition-colors">{lang === 'ar' ? 'إدارة المنتجات' : 'Manage Products'}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">{lang === 'ar' ? 'تواصل معنا' : 'Contact'}</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2"><MapPin size={14} className="text-primary-400 shrink-0" /><span>Alger, Algérie</span></li>
                <li className="flex items-center gap-2"><Phone size={14} className="text-primary-400 shrink-0" /><span>+213 550 000 000</span></li>
                <li className="flex items-center gap-2"><Mail size={14} className="text-primary-400 shrink-0" /><span>contact@sla3li.dz</span></li>
              </ul>
            </div>
          </div>

          {/* Social media */}
          <div className="border-t border-slate-800 mt-8 pt-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm text-slate-500">{lang === 'ar' ? 'تابعنا على' : lang === 'fr' ? 'Suivez-nous sur' : 'Follow us on'}</p>
              <div className="flex items-center gap-2">
                {socials.map(s => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.name}
                    className={`w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all ${s.color}`}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
              <button
                onClick={() => { setOpen(true); setSent(false); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-primary-500 hover:bg-primary-500/10 transition-all text-sm font-medium"
              >
                <MessageSquarePlus size={15} />
                {t.suggestionsTitle}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-slate-600">
              <p>© 2024 SELAALI. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
              <p>{lang === 'ar' ? 'صُنع في الجزائر 🇩🇿' : 'Made in Algeria 🇩🇿'}</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
