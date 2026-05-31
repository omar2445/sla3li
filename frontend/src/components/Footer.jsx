import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const { t, lang } = useLang();
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-5 h-5 fill-white"><polygon points="18,4 32,28 4,28" opacity="0.9"/><circle cx="18" cy="20" r="5" fill="white" opacity="0.7"/></svg>
              </div>
              <span className="font-bold text-white text-lg">Sla3Li | سلاعلي</span>
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

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-slate-500">
          <p>© 2024 Sla3Li. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
          <p>{lang === 'ar' ? 'صُنع في الجزائر 🇩🇿' : 'Made in Algeria 🇩🇿'}</p>
        </div>
      </div>
    </footer>
  );
}
