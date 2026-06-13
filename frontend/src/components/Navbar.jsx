import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, LayoutDashboard, Languages, ChevronDown, MapPin, Mail, Briefcase, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LangContext';
import { imgUrl } from '../api/axios';

import logoMark from '../logo/Selaali-LeafBag-mark.svg';

const Logo = () => (
  <Link to="/" className="flex items-center gap-2.5 group">
    <img src={logoMark} alt="" className="h-10 w-10" />
    <span className="font-bold text-xl tracking-widest leading-none">
      <span className="text-[#22C57A]">S</span>
      <span className="text-white">ELAALI</span>
    </span>
  </Link>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); setMobileOpen(false); };

  const dashPath = user
    ? { wholesaler: '/dashboard/wholesaler', retailer: '/dashboard/retailer', admin: '/dashboard/admin', driver: '/dashboard/delivery' }[user.role]
    : null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-navy-950/90 backdrop-blur-xl shadow-lg shadow-navy-950/20 border-b border-white/5'
        : 'bg-navy-950/80 backdrop-blur-lg border-b border-white/5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive('/') ? 'text-primary-400 bg-primary-500/10' : 'text-white/70 hover:text-white hover:bg-white/8'}`}>
              {t.home}
            </Link>
            <Link to="/catalog" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive('/catalog') ? 'text-primary-400 bg-primary-500/10' : 'text-white/70 hover:text-white hover:bg-white/8'}`}>
              {t.catalog}
            </Link>
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-sm text-white/70 hover:text-white hover:bg-white/8 transition-all font-medium"
            >
              <Languages size={14} />
              {lang === 'en' ? 'FR' : lang === 'fr' ? 'عربي' : 'EN'}
            </button>

            {user ? (
              <>
                <Link to="/catalog" className="relative p-2.5 text-white/60 hover:text-primary-400 hover:bg-white/8 rounded-xl transition-all">
                  <ShoppingCart size={19} />
                  {count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                      {count}
                    </span>
                  )}
                </Link>

                {dashPath && (
                  <Link to={dashPath} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/8 transition-all font-medium">
                    <LayoutDashboard size={15} />
                    {t.dashboard}
                  </Link>
                )}

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(o => !o)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-white/8 border border-white/10 rounded-xl hover:bg-white/12 transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg overflow-hidden bg-primary-500/20 flex items-center justify-center shrink-0">
                      {user.avatar
                        ? <img src={imgUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
                        : <span className="text-xs font-bold text-primary-300">{user.name?.[0]?.toUpperCase()}</span>
                      }
                    </div>
                    <span className="text-sm font-medium text-white/80 max-w-24 truncate">{user.name}</span>
                    <ChevronDown size={13} className={`text-white/40 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-fade-in">
                      {/* Header */}
                      <div className="bg-gradient-to-br from-navy-900 to-navy-700 px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-primary-500/20 flex items-center justify-center border border-primary-500/30 shrink-0">
                            {user.avatar
                              ? <img src={imgUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
                              : <span className="text-lg font-bold text-primary-300">{user.name?.[0]?.toUpperCase()}</span>
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{user.name}</p>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              user.role === 'admin' ? 'bg-purple-500/30 text-purple-200' :
                              user.role === 'wholesaler' ? 'bg-blue-500/30 text-blue-200' :
                              user.role === 'retailer' ? 'bg-primary-500/30 text-primary-200' :
                              'bg-orange-500/30 text-orange-200'
                            }`}>{user.role}</span>
                          </div>
                        </div>
                      </div>

                      {/* Info rows */}
                      <div className="px-4 py-3 space-y-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 text-sm text-slate-600">
                          <Mail size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.business_name && (
                          <div className="flex items-center gap-2.5 text-sm text-slate-600">
                            <Briefcase size={14} className="text-slate-400 shrink-0" />
                            <span className="truncate">{user.business_name}</span>
                          </div>
                        )}
                        {user.wilaya && (
                          <div className="flex items-center gap-2.5 text-sm text-slate-600">
                            <MapPin size={14} className="text-slate-400 shrink-0" />
                            <span>{user.wilaya}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="p-2">
                        {dashPath && (
                          <Link to={dashPath} onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 font-medium transition-colors w-full">
                            <LayoutDashboard size={15} className="text-primary-500" />
                            {t.dashboard}
                          </Link>
                        )}
                        <Link to="/profile" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 font-medium transition-colors w-full">
                          <Settings size={15} className="text-slate-400" />
                          {lang === 'ar' ? 'الملف الشخصي' : 'Profile & Settings'}
                        </Link>
                        <button onClick={() => { handleLogout(); setProfileOpen(false); }}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 font-medium transition-colors w-full">
                          <LogOut size={15} />
                          {t.logout}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/8 font-medium transition-all">
                  {t.login}
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">
                  {t.register}
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white hover:bg-white/8 rounded-xl transition-all"
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/8 bg-navy-950/95 backdrop-blur-xl px-4 pb-4 pt-2 space-y-1 animate-fade-in">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/8 font-medium transition-all">{t.home}</Link>
          <Link to="/catalog" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/8 font-medium transition-all">{t.catalog}</Link>
          {user && dashPath && (
            <Link to={dashPath} onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/8 font-medium transition-all">
              {t.dashboard}
            </Link>
          )}
          <button onClick={toggleLang} className="w-full text-left px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/8 font-medium flex items-center gap-2 transition-all">
            <Languages size={16} /> {lang === 'en' ? 'Français' : lang === 'fr' ? 'العربية' : 'English'}
          </button>
          {user ? (
            <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 font-medium flex items-center gap-2 transition-all">
              <LogOut size={16} /> {t.logout}
            </button>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 rounded-xl border border-white/20 text-white/80 text-sm font-medium hover:bg-white/8 transition-all">{t.login}</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center btn-primary text-sm py-2.5">{t.register}</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
