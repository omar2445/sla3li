import { useState, useEffect } from 'react';
import { X, User, Phone, Package, CheckCircle, Clock, AlertTriangle, Navigation } from 'lucide-react';
import api from '../api/axios';
import { useLang } from '../context/LangContext';
import MapTracker from './MapTracker';

const STEPS = [
  { key: 'placed',     labelEn: 'Order Placed',   labelAr: 'تم الطلب',        icon: Package },
  { key: 'confirmed',  labelEn: 'Confirmed',       labelAr: 'مؤكد',            icon: CheckCircle },
  { key: 'preparing',  labelEn: 'Preparing',       labelAr: 'جاري التحضير',    icon: Package },
  { key: 'picked_up',  labelEn: 'Picked Up',       labelAr: 'تم الاستلام',     icon: Navigation },
  { key: 'in_transit', labelEn: 'In Transit',      labelAr: 'في الطريق',       icon: Navigation },
  { key: 'delivered',  labelEn: 'Delivered',       labelAr: 'تم التوصيل',      icon: CheckCircle },
];

function getActiveStep(orderStatus, deliveryStatus) {
  if (deliveryStatus === 'delivered' || orderStatus === 'delivered') return 5;
  if (deliveryStatus === 'in_transit') return 4;
  if (deliveryStatus === 'picked_up') return 3;
  if (deliveryStatus === 'assigned' || orderStatus === 'processing' || orderStatus === 'shipped') return 2;
  if (orderStatus === 'confirmed') return 1;
  return 0;
}

const BADGE = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-orange-100 text-orange-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-emerald-100 text-emerald-700',
  cancelled:  'bg-red-100 text-red-700',
  assigned:   'bg-blue-100 text-blue-700',
  picked_up:  'bg-orange-100 text-orange-700',
  in_transit: 'bg-primary-100 text-primary-700',
};

export default function TrackingModal({ order, onClose }) {
  const { lang } = useLang();
  const [delivery, setDelivery] = useState(null);
  const [loadingDel, setLoadingDel] = useState(true);

  useEffect(() => {
    api.get(`/delivery/track/${order.id}`)
      .then(r => setDelivery(r.data))
      .catch(() => setDelivery(null))
      .finally(() => setLoadingDel(false));
  }, [order.id]);

  const cancelled = order.status === 'cancelled';
  const activeStep = cancelled ? -1 : getActiveStep(order.status, delivery?.status);

  // Addresses for the map
  const deliveryAddr = delivery?.delivery_address || order.delivery_address || '';
  const pickupAddr   = delivery?.pickup_address || order.wholesaler_address || '';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[94vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-br from-navy-900 to-navy-700 rounded-t-3xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">{lang === 'ar' ? 'تتبع الطلب' : 'Live Tracking'}</p>
            <h2 className="text-white font-bold text-lg">Order #{order.id}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${BADGE[order.status] || 'bg-gray-100 text-gray-600'}`}>
              {order.status}
            </span>
            <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">

          {/* Cancelled */}
          {cancelled && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
              <AlertTriangle size={18} className="shrink-0" />
              <p className="font-medium text-sm">{lang === 'ar' ? 'تم إلغاء هذا الطلب' : 'This order has been cancelled'}</p>
            </div>
          )}

          {/* MAP — main focus */}
          {!cancelled && (
            <MapTracker
              deliveryAddress={deliveryAddr}
              pickupAddress={pickupAddr}
              deliveryStatus={delivery?.status}
              driverName={delivery?.driver_name}
              lang={lang}
            />
          )}

          {/* Horizontal step strip */}
          {!cancelled && (
            <div className="flex items-center gap-0">
              {STEPS.map((s, i) => {
                const done   = i < activeStep;
                const active = i === activeStep;
                const Icon   = s.icon;
                return (
                  <div key={s.key} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
                        done   ? 'bg-primary-500 border-primary-500' :
                        active ? 'bg-white border-primary-500 shadow ring-4 ring-primary-100' :
                                 'bg-white border-slate-200'
                      }`}>
                        {done
                          ? <CheckCircle size={13} className="text-white" />
                          : <Icon size={12} className={active ? 'text-primary-600' : 'text-slate-300'} />
                        }
                      </div>
                      <p className={`text-center mt-1 leading-tight px-0.5 ${active ? 'text-primary-600 font-semibold' : done ? 'text-slate-500' : 'text-slate-300'}`}
                         style={{ fontSize: '9px' }}>
                        {lang === 'ar' ? s.labelAr : s.labelEn}
                      </p>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-0.5 rounded -mt-4 ${i < activeStep ? 'bg-primary-400' : 'bg-slate-100'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Driver card */}
          {!loadingDel && delivery?.driver_name && (
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <div className="w-10 h-10 bg-navy-800 rounded-xl flex items-center justify-center shrink-0">
                <User size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 truncate">{delivery.driver_name}</p>
                {delivery.driver_phone && (
                  <a href={`tel:${delivery.driver_phone}`} className="flex items-center gap-1 text-xs text-primary-600 hover:underline font-medium mt-0.5">
                    <Phone size={11} /> {delivery.driver_phone}
                  </a>
                )}
              </div>
              <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0 ${BADGE[delivery.status] || 'bg-gray-100 text-gray-600'}`}>
                {delivery.status?.replace('_', ' ')}
              </span>
            </div>
          )}

          {!loadingDel && !delivery?.driver_name && !cancelled && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-amber-700">
              <Clock size={16} className="shrink-0" />
              <p className="text-sm">{lang === 'ar' ? 'في انتظار قبول سائق للطلب' : 'Waiting for a driver to accept this delivery'}</p>
            </div>
          )}

          {/* Order items */}
          {order.items?.length > 0 && (
            <div className="border border-slate-100 rounded-2xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{lang === 'ar' ? 'محتوى الطلب' : 'Order Items'}</p>
              </div>
              <div className="px-4 divide-y divide-slate-50">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm py-2.5">
                    <span className="text-slate-700">{item.product_name} <span className="text-slate-400">×{item.quantity}</span></span>
                    <span className="font-semibold text-slate-800">{item.subtotal?.toLocaleString()} DZD</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold py-2.5 text-sm">
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
