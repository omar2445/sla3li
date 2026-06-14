import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { MapPin, Phone, Mail, Send, CheckCircle } from 'lucide-react';
import logoMark from '../logo/Selaali-LeafBag-mark.svg';
import api from '../api/axios';

export default function Footer() {
  const { t, lang } = useLang();
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

  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
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

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-white mb-4">
              {lang === 'ar' ? 'روابط سريعة' : lang === 'fr' ? 'Liens rapides' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary-400 transition-colors">{t.home}</Link></li>
              <li><Link to="/catalog" className="hover:text-primary-400 transition-colors">{t.catalog}</Link></li>
              <li><Link to="/register" className="hover:text-primary-400 transition-colors">{t.register}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">
              {lang === 'ar' ? 'تواصل معنا' : lang === 'fr' ? 'Contact' : 'Contact'}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><MapPin size={14} className="text-primary-400 shrink-0" /><span>Alger, Algérie</span></li>
              <li className="flex items-center gap-2"><Phone size={14} className="text-primary-400 shrink-0" /><span>+213 550 000 000</span></li>
              <li className="flex items-center gap-2"><Mail size={14} className="text-primary-400 shrink-0" /><span>contact@sla3li.dz</span></li>
            </ul>
          </div>

          {/* Suggestion form */}
          <div>
            <h4 className="font-semibold text-white mb-1">{t.suggestionsTitle}</h4>
            <p className="text-xs text-slate-500 mb-3">{t.suggestionsSubtitle}</p>

            {sent ? (
              <div className="flex items-center gap-2 text-primary-400 text-sm py-2">
                <CheckCircle size={16} />
                <span>{t.suggestionSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2">
                <input
                  type="text"
                  placeholder={t.suggestionName}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <input
                  type="email"
                  placeholder={t.suggestionEmail}
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <textarea
                  placeholder={t.suggestionMessage}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                />
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={sending || !form.message.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  <Send size={14} />
                  {sending ? t.loading : t.suggestionSend}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-slate-500">
          <p>© 2024 SELAALI. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
          <p>{lang === 'ar' ? 'صُنع في الجزائر 🇩🇿' : 'Made in Algeria 🇩🇿'}</p>
        </div>
      </div>
    </footer>
  );
}
