import { useState, useEffect } from 'react';
import { X, Truck, User, Phone, MapPin, Package, CheckCircle, Clock, Navigation, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import { useLang } from '../context/LangContext';

const STEPS = [
  {
    key: 'placed',
    labelEn: 'Order Placed',    labelAr: 'تم تقديم الطلب',
    descEn: 'Order received by supplier', descAr: 'استلم المورد الطلب',
    icon: Package,
  },
  {
    key: 'confirmed',
    labelEn: 'Confirmed',       labelAr: 'مؤكد',
    descEn: 'Supplier confirmed your order', descAr: 'أكّد المورد طلبك',
    icon: CheckCircle,
  },
  {
    key: 'preparing',
    labelEn: 'Preparing',       labelAr: 'جاري التحضير',
    descEn: 'Order is being packed', descAr: 'يتم تجهيز الطلب',
    icon: Package,
  },
  {
    key: 'picked_up',
    labelEn: 'Picked Up',       labelAr: 'تم الاستلام من المورد',
    descEn: 'Driver picked up the order', descAr: 'استلم السائق الطلب من المورد',
    icon: Navigation,
  },
  {
    key: 'in_transit',
    labelEn: 'In Transit',      labelAr: 'في الطريق إليك',
    descEn: 'On the way to you', descAr: 'الطلب في الطريق إليك',
    icon: Truck,
  },
  {
    key: 'delivered',
    labelEn: 'Delivered',       labelAr: 'تم التوصيل',
    descEn: 'Order delivered successfully', descAr: 'تم توصيل الطلبية بنجاح',
    icon: CheckCircle,
  },
];

function getActiveStep(orderStatus, deliveryStatus) {
  if (deliveryStatus === 'delivered' || orderStatus === 'delivered') return 5;
  if (deliveryStatus === 'in_transit') return 4;
  if (deliveryStatus === 'picked_up') return 3;
  if (deliveryStatus === 'assigned' || orderStatus === 'processing' || orderStatus === 'shipped') return 2;
  if (orderStatus === 'confirmed') return 1;
  return 0;
}

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed:  'bg-blue-100 text-blue-700 border-blue-200',
  processing: 'bg-orange-100 text-orange-700 border-orange-200',
  shipped:    'bg-indigo-100 text-indigo-700 border-indigo-200',
  delivered:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled:  'bg-red-100 text-red-700 border-red-200',
  assigned:   'bg-blue-100 text-blue-700 border-blue-200',
  picked_up:  'bg-orange-100 text-orange-700 border-orange-200',
  in_transit: 'bg-primary-100 text-primary-700 border-primary-200',
  failed:     'bg-red-100 text-red-700 border-red-200',
};

export default function TrackingModal({ order, onClose }) {
  const { lang } = useLang();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/delivery/track/${order.id}`)
      .then(r => setDelivery(r.data))
      .catch(() => setDelivery(null))
      .finally(() => setLoading(false));
  }, [order.id]);

  const cancelled = order.status === 'cancelled';
  const activeStep = cancelled ? -1 : getActiveStep(order.status, delivery?.status);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-br from-navy-900 to-navy-700 rounded-t-3xl px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">{lang === 'ar' ? 'تتبع الطلب' : 'Delivery Tracking'}</p>
              <h2 className="text-white font-bold text-lg">#{order.id}</h2>
            </div>
            <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors"><X size={18} /></button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
              {order.status}
            </span>
            {delivery?.status && delivery.status !== order.status && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[delivery.status] || 'bg-gray-100 text-gray-600'}`}>
                Delivery: {delivery.status.replace('_', ' ')}
              </span>
            )}
            <span className="text-white/40 text-xs ml-auto">{new Date(order.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Cancelled state */}
          {cancelled && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
              <AlertTriangle size={20} className="shrink-0" />
              <p className="font-medium text-sm">{lang === 'ar' ? 'تم إلغاء هذا الطلب' : 'This order has been cancelled'}</p>
            </div>
          )}

          {/* Timeline */}
          {!cancelled && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{lang === 'ar' ? 'حالة التوصيل' : 'Delivery Progress'}</p>
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-slate-100" />
                <div
                  className="absolute left-5 top-5 w-0.5 bg-primary-400 transition-all duration-700"
                  style={{ height: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
                />

                <div className="space-y-1">
                  {STEPS.map((step, i) => {
                    const done = i < activeStep;
                    const active = i === activeStep;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className={`flex items-start gap-4 py-3 px-1 rounded-2xl transition-colors ${active ? 'bg-primary-50' : ''}`}>
                        {/* Node */}
                        <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all ${
                          done   ? 'bg-primary-500 border-primary-500 shadow-md shadow-primary-200' :
                          active ? 'bg-white border-primary-500 shadow-md shadow-primary-200' :
                                   'bg-white border-slate-200'
                        }`}>
                          {active && (
                            <span className="absolute inset-0 rounded-xl bg-primary-100 animate-ping opacity-40" />
                          )}
                          <Icon size={16} className={done ? 'text-white' : active ? 'text-primary-600' : 'text-slate-300'} />
                        </div>
                        {/* Label */}
                        <div className="pt-1.5 min-w-0">
                          <p className={`text-sm font-semibold ${done || active ? 'text-slate-800' : 'text-slate-400'}`}>
                            {lang === 'ar' ? step.labelAr : step.labelEn}
                          </p>
                          <p className={`text-xs mt-0.5 ${active ? 'text-primary-600 font-medium' : 'text-slate-400'}`}>
                            {lang === 'ar' ? step.descAr : step.descEn}
                          </p>
                        </div>
                        {done && <CheckCircle size={16} className="text-primary-500 shrink-0 mt-2 ml-auto" />}
                        {active && <span className="text-xs font-semibold text-primary-600 shrink-0 mt-2 ml-auto animate-pulse">{lang === 'ar' ? 'الآن' : 'Now'}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Driver info */}
          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              {lang === 'ar' ? 'جاري التحميل...' : 'Loading delivery info...'}
            </div>
          ) : delivery?.driver_name ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{lang === 'ar' ? 'معلومات السائق' : 'Driver'}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy-800 rounded-xl flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{delivery.driver_name}</p>
                  {delivery.driver_phone && (
                    <a href={`tel:${delivery.driver_phone}`} className="flex items-center gap-1 text-xs text-primary-600 hover:underline font-medium mt-0.5">
                      <Phone size={11} /> {delivery.driver_phone}
                    </a>
                  )}
                </div>
                <div className={`ml-auto px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS_COLORS[delivery.status] || 'bg-gray-100 text-gray-600'}`}>
                  {delivery.status?.replace('_', ' ')}
                </div>
              </div>
            </div>
          ) : !cancelled && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-amber-700">
              <Clock size={18} className="shrink-0" />
              <p className="text-sm">{lang === 'ar' ? 'لم يتم تعيين سائق بعد' : 'No driver assigned yet — waiting for a driver to accept'}</p>
            </div>
          )}

          {/* Addresses */}
          <div className="grid grid-cols-1 gap-3">
            {order.delivery_address && (
              <div className="flex gap-3 items-start p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">{lang === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}</p>
                  <p className="text-sm text-slate-700 font-medium mt-0.5">{order.delivery_address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order items summary */}
          {order.items?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{lang === 'ar' ? 'محتوى الطلب' : 'Order Items'}</p>
              <div className="space-y-2">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0">
                    <span className="text-slate-700">{item.product_name} <span className="text-slate-400">× {item.quantity}</span></span>
                    <span className="font-semibold text-slate-800">{item.subtotal?.toLocaleString()} DZD</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-1">
                  <span className="text-slate-700">{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-primary-700">{order.total_amount?.toLocaleString()} DZD</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
