import { useState, useEffect } from 'react';
import { Truck, MapPin, Phone, CheckCircle, Package, Clock, Navigation, Star } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const statusColor = { pending: 'badge-yellow', assigned: 'badge-navy', picked_up: 'badge-orange', in_transit: 'badge-orange', delivered: 'badge-green', failed: 'badge-red' };

const STEPS = ['assigned', 'picked_up', 'in_transit', 'delivered'];
const STEP_LABELS = { assigned: 'Assigned', picked_up: 'Picked Up', in_transit: 'In Transit', delivered: 'Delivered' };

function ProgressSteps({ status }) {
  const currentIdx = STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0 mb-5">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < currentIdx ? 'bg-primary-500 text-white' :
              i === currentIdx ? 'bg-navy-800 text-white ring-4 ring-navy-800/20' :
              'bg-slate-100 text-slate-400'
            }`}>
              {i < currentIdx ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className={`text-xs font-medium whitespace-nowrap ${i <= currentIdx ? 'text-slate-700' : 'text-slate-400'}`}>
              {STEP_LABELS[s]}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all ${i < currentIdx ? 'bg-primary-400' : 'bg-slate-100'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function DeliveryDashboard() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [tab, setTab] = useState('available');
  const [available, setAvailable] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [avail, mine] = await Promise.all([api.get('/delivery/available'), api.get('/delivery/my')]);
      setAvailable(avail.data);
      setMyDeliveries(mine.data);
    } catch { toast.error(t.error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const acceptDelivery = async (id) => {
    try { await api.patch(`/delivery/${id}/accept`); toast.success('Delivery accepted!'); fetchAll(); }
    catch (err) { toast.error(err.response?.data?.message || t.error); }
  };

  const updateStatus = async (id, status) => {
    try { await api.patch(`/delivery/${id}/status`, { status }); toast.success('Status updated'); fetchAll(); }
    catch { toast.error(t.error); }
  };

  const nextStep = {
    assigned:   { status: 'picked_up',  label: 'Mark Picked Up',      color: 'bg-amber-500 hover:bg-amber-600' },
    picked_up:  { status: 'in_transit', label: 'Start Transit',        color: 'bg-navy-700 hover:bg-navy-600' },
    in_transit: { status: 'delivered',  label: 'Mark as Delivered ✓',  color: 'bg-primary-600 hover:bg-primary-500' },
  };

  const stats = {
    available: available.length,
    active:    myDeliveries.filter(d => d.status !== 'delivered' && d.status !== 'failed').length,
    delivered: myDeliveries.filter(d => d.status === 'delivered').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Mobile hero header */}
      <div className="gradient-hero px-4 pt-6 pb-16">
        <div className="max-w-lg mx-auto">
          <p className="text-white/50 text-sm mb-1">{lang === 'ar' ? 'أهلاً' : 'Welcome back'}</p>
          <h1 className="text-2xl font-bold text-white mb-6">{user?.name}</h1>

          {/* Stat pills */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Package,     label: lang === 'ar' ? 'متاحة' : 'Available', value: stats.available, color: 'text-blue-300' },
              { icon: Truck,       label: lang === 'ar' ? 'نشطة'  : 'Active',    value: stats.active,    color: 'text-amber-300' },
              { icon: CheckCircle, label: lang === 'ar' ? 'مُوصّلة' : 'Done',     value: stats.delivered, color: 'text-primary-300' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-3 text-center">
                <Icon size={18} className={`${color} mx-auto mb-1`} />
                <div className="text-xl font-bold text-white">{value}</div>
                <div className="text-xs text-white/50">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content card lifted over hero */}
      <div className="max-w-lg mx-auto px-4 -mt-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

          {/* Tab bar inside card */}
          <div className="flex border-b border-slate-100">
            {[
              { key: 'available', label: lang === 'ar' ? 'متاحة' : 'Available' },
              { key: 'mine',      label: lang === 'ar' ? 'طلباتي' : 'My Deliveries' },
            ].map(tb => (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={`flex-1 py-4 text-sm font-semibold transition-all ${
                  tab === tb.key
                    ? 'text-primary-600 border-b-2 border-primary-500'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tb.label}
                {tb.key === 'available' && stats.available > 0 && (
                  <span className="ml-2 bg-primary-500 text-white text-xs w-5 h-5 rounded-full inline-flex items-center justify-center font-bold">
                    {stats.available}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading && (
            <div className="text-center py-16 text-slate-400">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              {t.loading}
            </div>
          )}

          {/* Available deliveries — card feed */}
          {!loading && tab === 'available' && (
            <div className="divide-y divide-slate-50">
              {available.length === 0 ? (
                <div className="text-center py-16 px-6 text-slate-400">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Truck size={28} className="opacity-40" />
                  </div>
                  <p className="font-semibold text-slate-600">{lang === 'ar' ? 'لا توجد توصيلات متاحة' : 'No deliveries available'}</p>
                  <p className="text-sm mt-1">{lang === 'ar' ? 'تحقق مجدداً قريباً' : 'Check back soon'}</p>
                </div>
              ) : available.map(d => (
                <div key={d.id} className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Order</span>
                      <p className="font-bold text-slate-800 text-lg leading-none mt-0.5">#{d.order_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Value</p>
                      <p className="font-bold text-primary-600">{d.total_amount?.toLocaleString()} DZD</p>
                    </div>
                  </div>

                  {/* Route visualization */}
                  <div className="bg-slate-50 rounded-2xl p-4 mb-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-primary-600 text-xs font-bold">A</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400 font-medium">{t.pickupAddress}</p>
                        <p className="text-sm font-semibold text-slate-700 truncate">{d.pickup_address_auto || d.pickup_address || '—'}</p>
                      </div>
                    </div>
                    <div className="w-px h-4 bg-slate-200 ml-4" />
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                        <MapPin size={14} className="text-red-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400 font-medium">{t.deliveryAddress}</p>
                        <p className="text-sm font-semibold text-slate-700 truncate">{d.delivery_address || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {d.retailer_phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                      <Phone size={12} />{d.retailer_phone}
                    </div>
                  )}

                  <button
                    onClick={() => acceptDelivery(d.id)}
                    className="w-full bg-navy-800 hover:bg-navy-700 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-navy-800/20"
                  >
                    <Truck size={17} /> {t.acceptDelivery}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* My deliveries — step-by-step itinerary */}
          {!loading && tab === 'mine' && (
            <div className="divide-y divide-slate-50">
              {myDeliveries.length === 0 ? (
                <div className="text-center py-16 px-6 text-slate-400">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Navigation size={28} className="opacity-40" />
                  </div>
                  <p className="font-semibold text-slate-600">{lang === 'ar' ? 'لا توجد توصيلات بعد' : 'No deliveries yet'}</p>
                </div>
              ) : myDeliveries.map(d => {
                const next = nextStep[d.status];
                return (
                  <div key={d.id} className="p-5">
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Order</p>
                        <p className="font-bold text-slate-800 text-lg">#{d.order_id}</p>
                      </div>
                      <span className={statusColor[d.status] || 'badge-gray'}>
                        {d.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Step progress */}
                    <ProgressSteps status={d.status} />

                    {/* Addresses */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400 mb-1 font-medium">Pickup</p>
                        <p className="text-xs font-semibold text-slate-700 leading-snug">{d.wholesaler_address || d.pickup_address || '—'}</p>
                        {d.wholesaler_phone && <p className="text-xs text-primary-600 mt-1.5 flex items-center gap-1"><Phone size={10} />{d.wholesaler_phone}</p>}
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400 mb-1 font-medium">Drop-off</p>
                        <p className="text-xs font-semibold text-slate-700 leading-snug">{d.delivery_address || d.retailer_address || '—'}</p>
                        {d.retailer_phone && <p className="text-xs text-primary-600 mt-1.5 flex items-center gap-1"><Phone size={10} />{d.retailer_phone}</p>}
                      </div>
                    </div>

                    {next ? (
                      <button
                        onClick={() => updateStatus(d.id, next.status)}
                        className={`w-full ${next.color} text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95`}
                      >
                        {next.label}
                      </button>
                    ) : d.status === 'delivered' && (
                      <div className="flex items-center justify-center gap-2 py-3 bg-primary-50 rounded-2xl text-primary-600 font-semibold">
                        <CheckCircle size={18} /> Delivered successfully!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation bar (mobile-first) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-3 flex justify-around max-w-lg mx-auto left-0 right-0 z-40">
        {[
          { key: 'available', icon: Package,     label: lang === 'ar' ? 'متاحة' : 'Available', badge: stats.available },
          { key: 'mine',      icon: Navigation,  label: lang === 'ar' ? 'طلباتي' : 'My Runs',  badge: stats.active },
        ].map(({ key, icon: Icon, label, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-col items-center gap-1 px-6 py-1 rounded-2xl transition-all ${tab === key ? 'text-navy-800' : 'text-slate-400'}`}
          >
            <div className="relative">
              <Icon size={22} />
              {badge > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                  {badge}
                </span>
              )}
            </div>
            <span className="text-xs font-semibold">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
