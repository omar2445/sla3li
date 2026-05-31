import { useState } from 'react';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function DashboardSidebar({ items, title, titleAr, activeTab }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { lang } = useLang();

  const isActive = (key) => key === activeTab;

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-60'} shrink-0 transition-all duration-300 bg-navy-950 flex flex-col min-h-screen sticky top-16`}>
      {/* Header */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 py-5 border-b border-white/8`}>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-sm">{lang === 'ar' ? titleAr : title}</p>
            <p className="text-white/40 text-xs mt-0.5 truncate max-w-32">{user?.name}</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-7 h-7 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white transition-all shrink-0"
        >
          {collapsed
            ? <ChevronRight size={14} />
            : <ChevronLeft size={14} />
          }
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {items.map(({ key, icon: Icon, labelEn, labelAr, onClick }) => {
          const active = isActive(key);
          return (
            <button
              key={key}
              onClick={onClick}
              title={collapsed ? (lang === 'ar' ? labelAr : labelEn) : undefined}
              className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                active
                  ? 'bg-primary-500/15 text-primary-400'
                  : 'text-white/50 hover:text-white hover:bg-white/8'
              }`}
            >
              <Icon size={18} className={`shrink-0 ${active ? 'text-primary-400' : ''}`} />
              {!collapsed && (
                <span className={`text-sm font-medium truncate ${active ? 'text-primary-400 font-semibold' : ''}`}>
                  {lang === 'ar' ? labelAr : labelEn}
                </span>
              )}
              {!collapsed && active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-4 border-t border-white/8">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
            <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-primary-400 text-sm font-bold">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-white/30 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          title={collapsed ? 'Logout' : undefined}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all`}
        >
          <LogOut size={16} />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
