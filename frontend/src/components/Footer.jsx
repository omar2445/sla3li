import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { MapPin, Phone, Mail, Send, CheckCircle, X, MessageSquarePlus } from 'lucide-react';
import logoMark from '../logo/Selaali-LeafBag-mark.svg';
import api from '../api/axios';

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

          <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-slate-500">
            <p>© 2024 SELAALI. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
            <button
              onClick={() => { setOpen(true); setSent(false); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-primary-500 hover:bg-primary-500/10 transition-all text-sm font-medium"
            >
              <MessageSquarePlus size={15} />
              {t.suggestionsTitle}
            </button>
            <p>{lang === 'ar' ? 'صُنع في الجزائر 🇩🇿' : 'Made in Algeria 🇩🇿'}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
