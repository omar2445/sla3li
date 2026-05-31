import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, LayoutDashboard, Languages, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LangContext';

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
              {lang === 'en' ? 'عربي' : 'EN'}
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

                <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-white/8 border border-white/10 rounded-xl">
                  <div className="w-7 h-7 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <User size={14} className="text-primary-400" />
                  </div>
                  <span className="text-sm font-medium text-white/80 max-w-24 truncate">{user.name}</span>
                  <ChevronDown size={13} className="text-white/40" />
                </div>

                <button onClick={handleLogout} className="p-2.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                  <LogOut size={17} />
                </button>
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
            <Languages size={16} /> {lang === 'en' ? 'العربية' : 'English'}
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
