import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons broken by Vite's asset hashing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

async function geocode(text) {
  try {
    const q = text.includes('Algeria') || text.includes('Algérie') ? text : `${text}, Algeria`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=dz`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    if (data.length) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {}
  return null;
}

function divIcon(emoji, bg, glow) {
  return L.divIcon({
    html: `<div style="
      background:${bg};width:38px;height:38px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      border:3px solid white;box-shadow:0 2px 12px ${glow};
      font-size:18px;line-height:1;">
      ${emoji}
    </div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22],
    className: '',
  });
}

// Simulated driver position: fractional position (0=pickup, 1=delivery)
function lerpPos(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function driverFraction(deliveryStatus) {
  const map = { assigned: 0.05, picked_up: 0.15, in_transit: 0.55, delivered: 1 };
  return map[deliveryStatus] ?? null;
}

export default function MapTracker({ deliveryAddress, pickupAddress, deliveryStatus, driverName, lang }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ok | fallback

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Default: Algeria center
    const map = L.map(containerRef.current, {
      center: [28.0, 2.5],
      zoom: 5,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    (async () => {
      const [destCoords, pickupCoords] = await Promise.all([
        deliveryAddress ? geocode(deliveryAddress) : Promise.resolve(null),
        pickupAddress   ? geocode(pickupAddress)   : Promise.resolve(null),
      ]);

      if (!destCoords && !pickupCoords) {
        setStatus('fallback');
        return;
      }

      setStatus('ok');

      // Destination marker
      if (destCoords) {
        L.marker(destCoords, { icon: divIcon('🏠', '#10b981', 'rgba(16,185,129,0.4)') })
          .bindPopup(`<b>${lang === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}</b><br><span style="font-size:12px">${deliveryAddress}</span>`)
          .addTo(map);
      }

      // Pickup/origin marker
      if (pickupCoords) {
        L.marker(pickupCoords, { icon: divIcon('🏭', '#1a338a', 'rgba(26,51,138,0.4)') })
          .bindPopup(`<b>${lang === 'ar' ? 'نقطة الانطلاق' : 'Pickup Point'}</b><br><span style="font-size:12px">${pickupAddress}</span>`)
          .addTo(map);
      }

      // Dashed route line between pickup and delivery
      if (destCoords && pickupCoords) {
        L.polyline([pickupCoords, destCoords], {
          color: '#10b981',
          weight: 3,
          dashArray: '10, 8',
          opacity: 0.6,
        }).addTo(map);

        // Driver position along the route
        const frac = driverFraction(deliveryStatus);
        if (frac !== null) {
          const pos = lerpPos(pickupCoords, destCoords, frac);
          const isMoving = deliveryStatus === 'in_transit';
          const truckHtml = `<div style="
            background:#f59e0b;width:42px;height:42px;border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            border:3px solid white;
            box-shadow:0 2px 16px rgba(245,158,11,0.6);
            font-size:20px;line-height:1;
            ${isMoving ? 'animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;' : ''}
          ">🚛</div>`;

          L.marker(pos, {
            icon: L.divIcon({ html: truckHtml, iconSize: [42, 42], iconAnchor: [21, 21], popupAnchor: [0, -24], className: '' }),
            zIndexOffset: 1000,
          })
            .bindPopup(`<b>${driverName || (lang === 'ar' ? 'السائق' : 'Driver')}</b><br><span style="font-size:12px">${deliveryStatus?.replace('_', ' ')}</span>`)
            .addTo(map);
        }

        // Fit map to show all markers
        const bounds = L.latLngBounds([pickupCoords, destCoords]);
        map.fitBounds(bounds, { padding: [55, 55] });
      } else if (destCoords) {
        map.setView(destCoords, 13);
      } else if (pickupCoords) {
        map.setView(pickupCoords, 13);
      }
    })();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200" style={{ height: '280px' }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />

      {status === 'loading' && (
        <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center gap-2">
          <span className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">{lang === 'ar' ? 'جاري تحميل الخريطة...' : 'Loading map…'}</p>
        </div>
      )}

      {status === 'fallback' && (
        <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center gap-2 text-slate-400">
          <span className="text-3xl">🗺️</span>
          <p className="text-sm font-medium">{lang === 'ar' ? 'تعذّر تحديد الموقع على الخريطة' : 'Could not locate address on map'}</p>
        </div>
      )}

      {/* Legend */}
      {status === 'ok' && (
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-3 text-xs text-slate-600 shadow-sm border border-white/50">
          <span>🏭 {lang === 'ar' ? 'المورد' : 'Supplier'}</span>
          <span>🚛 {lang === 'ar' ? 'السائق' : 'Driver'}</span>
          <span>🏠 {lang === 'ar' ? 'وجهتك' : 'Your address'}</span>
        </div>
      )}
    </div>
  );
}
