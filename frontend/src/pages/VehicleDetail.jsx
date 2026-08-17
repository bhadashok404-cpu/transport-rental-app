import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Car, Users, Fuel, MapPin, Calendar, Tag,
  CheckCircle, ChevronLeft, ChevronRight, X, Maximize2,
  Shield, Zap, Star
} from 'lucide-react';
import { vehicleService, reviewService, couponService } from '../services';
import { useApp } from '../context/AppContext';
import { Loader, Badge, StarRating } from '../components';
import { getVehicleImages } from '../utils/carImages';
import toast from 'react-hot-toast';

// ── Image Gallery ─────────────────────────────────────────────────────────────
function ImageGallery({ vehicle }) {
  const images = getVehicleImages(vehicle);
  const labels = ['Exterior Front', 'Side View', 'Rear View', 'Interior', 'Engine Bay'];

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [loaded, setLoaded] = useState({});

  const prev = () => setActive(i => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActive(i => (i === images.length - 1 ? 0 : i + 1));

  // keyboard in lightbox
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape')     setLightbox(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox]);

  return (
    <>
      {/* ── Main image ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-xl" style={{ height: 420 }}>
        {!loaded[active] && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Car className="w-24 h-24 text-gray-300 animate-pulse" />
          </div>
        )}
        <img
          key={active}
          src={images[active]}
          alt={`${vehicle.make} ${vehicle.model} — ${labels[active]}`}
          onLoad={() => setLoaded(l => ({ ...l, [active]: true }))}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900&q=85&fit=crop';
          }}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded[active] ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Label */}
        <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
          {labels[active]}
        </div>

        {/* Counter */}
        <div className="absolute bottom-4 right-16 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
          {active + 1} / {images.length}
        </div>

        {/* Expand */}
        <button
          onClick={() => setLightbox(true)}
          className="absolute bottom-4 right-4 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Nav arrows */}
        <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ── Thumbnails ── */}
      <div className="grid grid-cols-5 gap-2 mt-3">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all duration-200 ${
              i === active ? 'border-primary-500 shadow-lg scale-[1.02]' : 'border-transparent hover:border-gray-300'
            }`}
          >
            <img
              src={src}
              alt={labels[i]}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&h=120&fit=crop'; }}
            />
            {i === active && <div className="absolute inset-0 bg-primary-600/20" />}
            <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] font-medium text-center py-0.5 truncate px-1">
              {labels[i]}
            </div>
          </button>
        ))}
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center">
          <button onClick={() => setLightbox(false)} className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition">
            <X className="w-5 h-5" />
          </button>

          <div className="relative w-full max-w-5xl px-16">
            <img
              src={images[active]}
              alt={labels[active]}
              className="w-full max-h-[75vh] object-contain rounded-xl"
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&h=700&fit=crop'; }}
            />
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox thumbnails */}
          <div className="flex gap-2 mt-5 px-4">
            {images.map((src, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`w-16 h-10 rounded-lg overflow-hidden border-2 transition ${i === active ? 'border-primary-400' : 'border-white/20 hover:border-white/50'}`}>
                <img src={src} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&h=120&fit=crop'; }} />
              </button>
            ))}
          </div>

          <p className="mt-3 text-white/60 text-sm">{labels[active]} &nbsp;·&nbsp; {active + 1}/{images.length} &nbsp;·&nbsp; <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs">←→</kbd> navigate &nbsp; <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs">Esc</kbd> close</p>
        </div>
      )}
    </>
  );
}

// ── Main VehicleDetail page ───────────────────────────────────────────────────
export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, startBooking } = useApp();

  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    pickupLocation: '', dropLocation: '',
    pickupDate: today, returnDate: '',
    specialInstructions: '',
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      vehicleService.getById(id),
      reviewService.getByVehicle(id).catch(() => ({ items: [] })),
    ]).then(([vRes, rRes]) => {
      setVehicle(vRes?.data || vRes);
      const items = rRes?.data?.items || rRes?.data || rRes?.items || rRes || [];
      setReviews(Array.isArray(items) ? items.slice(0, 6) : []);
    }).finally(() => setLoading(false));
  }, [id]);

  const nights = form.pickupDate && form.returnDate
    ? Math.max(1, Math.ceil((new Date(form.returnDate) - new Date(form.pickupDate)) / 86400000))
    : 0;
  const subtotal = vehicle ? nights * vehicle.pricePerDay : 0;
  const discount = couponDiscount
    ? Math.min(couponDiscount.maxDiscountAmount || Infinity, subtotal * (couponDiscount.discountPercentage / 100))
    : 0;
  const total = subtotal - discount;

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await couponService.validate(couponCode.trim(), subtotal);
      const data = res?.data || res;
      if (data?.isValid) {
        setCouponDiscount(data.coupon || data);
        toast.success('Coupon applied!');
      } else {
        toast.error(data?.message || 'Invalid coupon code');
      }
    } catch {
      toast.error('Could not validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!user) { toast.error('Please sign in to book'); navigate('/login'); return; }
    if (!form.pickupLocation || !form.dropLocation || !form.pickupDate || !form.returnDate) {
      toast.error('Please fill all required fields'); return;
    }
    startBooking(vehicle, { ...form, nights, subtotal, discount, total, coupon: couponDiscount });
    navigate('/booking/confirm');
  };

  if (loading) return <div className="pt-24"><Loader fullPage /></div>;
  if (!vehicle) return <div className="pt-24 text-center text-gray-500 py-20">Vehicle not found.</div>;

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-primary-600 font-medium mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to vehicles
      </button>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Gallery */}
          <ImageGallery vehicle={vehicle} />

          {/* Title + specs card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">{vehicle.make} {vehicle.model}</h1>
                <p className="text-gray-500 mt-1">{vehicle.year} · {vehicle.registrationNumber} · {vehicle.fuelType}</p>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating rating={avgRating} size="sm" />
                    <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-primary-700">
                  ₹{vehicle.pricePerDay}<span className="text-lg text-gray-400 font-normal">/day</span>
                </p>
                <p className="text-sm text-gray-400 mt-0.5">₹{vehicle.pricePerKm}/km</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              <Badge status={vehicle.isAvailable ? 'Available' : 'Busy'} />
              {vehicle.vehicleCategory && <Badge text={vehicle.vehicleCategory.name} variant="info" />}
              <Badge text={vehicle.vehicleType} variant="purple" />
            </div>

            {/* Key specs grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {[
                { icon: Users, label: 'Seating', value: `${vehicle.seatingCapacity} seats` },
                { icon: Fuel, label: 'Fuel', value: vehicle.fuelType },
                { icon: Car, label: 'Type', value: vehicle.vehicleType },
                { icon: Shield, label: 'Insured', value: 'Yes' },
                { icon: Zap, label: 'AC', value: 'Yes' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                    <Icon className="w-4 h-4 text-primary-600" />
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
                  <p className="text-xs font-bold text-gray-800 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Why Book This Vehicle?</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'GPS-enabled tracking for complete safety',
                'Sanitized & cleaned before every trip',
                'Verified, trained professional driver',
                'Free cancellation up to 2 hours before',
                'Real-time trip updates via notifications',
                '24/7 roadside assistance included',
              ].map(item => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Customer Reviews</h2>
                <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-xl">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-yellow-700">{avgRating.toFixed(1)}</span>
                  <span className="text-yellow-600 text-xs">/ 5</span>
                </div>
              </div>
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="flex gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div className="w-9 h-9 bg-linear-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {r.customer?.firstName?.[0] || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 text-sm">
                          {r.customer?.firstName} {r.customer?.lastName}
                        </span>
                        <StarRating rating={r.rating} size="sm" />
                      </div>
                      {r.comment && <p className="text-gray-500 text-sm leading-relaxed">{r.comment}</p>}
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column: booking form ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-linear-to-r from-primary-600 to-primary-700 px-6 py-4">
              <h2 className="text-white font-bold text-xl">Book This Vehicle</h2>
              <p className="text-primary-200 text-sm mt-0.5">Fill details for instant confirmation</p>
            </div>

            <div className="p-5 space-y-4">
              {/* Pickup location */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Pickup Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  <input value={form.pickupLocation} onChange={e => setForm(f => ({ ...f, pickupLocation: e.target.value }))}
                    placeholder="Enter pickup address"
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              </div>

              {/* Drop location */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Drop Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  <input value={form.dropLocation} onChange={e => setForm(f => ({ ...f, dropLocation: e.target.value }))}
                    placeholder="Enter drop address"
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Pickup Date *', key: 'pickupDate', min: today },
                  { label: 'Return Date *', key: 'returnDate', min: form.pickupDate || today },
                ].map(({ label, key, min }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">{label}</label>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input type="date" min={min} value={form[key]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full pl-8 pr-2 py-3 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Special instructions */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Special Instructions</label>
                <textarea value={form.specialInstructions} onChange={e => setForm(f => ({ ...f, specialInstructions: e.target.value }))}
                  rows={2} placeholder="Any special requirements..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
              </div>

              {/* Coupon */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Coupon Code</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. WELCOME10"
                      className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <button onClick={handleCoupon} disabled={couponLoading}
                    className="px-3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition disabled:opacity-50 whitespace-nowrap">
                    {couponLoading ? '…' : 'Apply'}
                  </button>
                </div>
                {couponDiscount && (
                  <div className="mt-2 flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2 text-xs font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {couponDiscount.discountPercentage}% off (max ₹{couponDiscount.maxDiscountAmount})
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              {nights > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm border border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>₹{vehicle.pricePerDay} × {nights} day{nights > 1 ? 's' : ''}</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Coupon discount</span>
                      <span>-₹{discount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-gray-900 text-base border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span className="text-primary-700">₹{total.toFixed(0)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBookNow}
                disabled={!vehicle.isAvailable}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-40 disabled:cursor-not-allowed text-base"
              >
                {vehicle.isAvailable ? '🚗 Proceed to Book' : 'Currently Unavailable'}
              </button>

              <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400" />Free cancellation</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400" />Instant confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
