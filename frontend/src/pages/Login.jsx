import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import api from '../api/axios';

const ROLE_ROUTES = {
  wholesaler: '/dashboard/wholesaler',
  retailer:   '/dashboard/retailer',
  admin:      '/dashboard/admin',
  driver:     '/dashboard/delivery',
};

const DEMO_ACCOUNTS = [
  { label: 'Admin',      email: 'admin@sla3li.dz',      password: 'admin123', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { label: 'Wholesaler', email: 'wholesaler1@sla3li.dz', password: 'pass123', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'Retailer',   email: 'retailer1@sla3li.dz',   password: 'pass123', color: 'bg-green-50 text-green-700 border-green-200' },
  { label: 'Driver',     email: 'driver1@sla3li.dz',     password: 'pass123', color: 'bg-orange-50 text-orange-700 border-orange-200' },
];

export default function Login() {
  const { login } = useAuth();
  const { t } = useLang();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking' | 'ok' | 'error'

  // Check API connectivity on mount
  useEffect(() => {
    api.get('/health')
      .then(() => setApiStatus('ok'))
      .catch(() => setApiStatus('error'));
  }, []);

  const set = (k, v) => { setError(''); setForm(f => ({ ...f, [k]: v })); };

  const doLogin = async (email, password) => {
    if (apiStatus === 'error') {
      setError('Cannot reach server. Make sure the backend is running on port 5000.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      // Store manually then redirect
      localStorage.setItem('sla3li_token', data.token);
      localStorage.setItem('sla3li_user', JSON.stringify(data.user));
      // Hard redirect so all state is read fresh from localStorage
      window.location.href = ROLE_ROUTES[data.user.role] || '/';
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Check your credentials.';
      setError(msg);
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doLogin(form.email, form.password);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <LogIn size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{t.login}</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {t.dontHaveAccount}{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">{t.registerHere}</Link>
          </p>
        </div>

        {/* API status banner */}
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium mb-5 ${
          apiStatus === 'ok'       ? 'bg-green-50 text-green-700 border border-green-200' :
          apiStatus === 'error'    ? 'bg-red-50 text-red-700 border border-red-200' :
                                    'bg-slate-50 text-slate-500 border border-slate-200'
        }`}>
          {apiStatus === 'ok'    && <><Wifi size={16}/> Server connected — ready to login</>}
          {apiStatus === 'error' && <><WifiOff size={16}/> Cannot reach server on port 5000 — start the backend first</>}
          {apiStatus === 'checking' && <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block"/>&nbsp;Checking connection...</>}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4 font-medium">
            {error}
          </div>
        )}

        {/* Quick demo login */}
        <div className="card mb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Demo Login</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.label}
                type="button"
                disabled={loading || apiStatus !== 'ok'}
                onClick={() => doLogin(acc.email, acc.password)}
                className={`text-xs font-semibold py-2.5 px-3 rounded-xl border ${acc.color} hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Manual form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{t.email}</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">{t.password}</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-11"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || apiStatus !== 'ok'}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                : <LogIn size={18}/>
              }
              {t.login}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
