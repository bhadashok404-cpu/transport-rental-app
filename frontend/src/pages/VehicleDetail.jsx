import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Car, Users, Fuel, MapPin, Calendar, Tag, CheckCircle,
  ChevronLeft, ChevronRight, X, Maximize2, Shield, Zap, Star,
  Sparkles, Heart, Share2, Award, Clock, ThumbsUp
} from 'lucide-react';
import { vehicleService, reviewService, couponService } from '../services';
import { useApp } from '../context/AppContext';
import { Loader, StarRating } from '../components';
import { getVehicleImages } from '../utils/carImages';
import toast from 'react-hot-toast';

// ── Gradient palette by category ──────────────────────────────────────────────
const CAT_GRADIENT = {
  Economy:    'from-emerald-600 to-teal-700',
  Premium:    'from-blue-600 to-blue-800',
  Luxury:     'from-violet-700 to-purple-900',
  SUV:        'from-orange-500 to-amber-700',
  Commercial: 'from-rose-600 to-pink-800',
};

// ── Image Gallery ─────────────────────────────────────────────────────────────
function ImageGallery({ vehicle }) {
  const images    = getVehicleImages(vehicle);
  const labels    = ['Exterior', 'Side View', 'Rear View', 'Interior', 'Engine'];
  const catGrad   = CAT_GRADIENT[vehicle.vehicleCategory?.name] || 'from-primary-700 to-violet-800';

  const [active,   setActive]   = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [loaded,   setLoaded]   = useState({});
  const [error,    setError]    = useState({});

  const prev = () => setActive(i => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActive(i => (i === images.length - 1 ? 0 : i + 1));

  useEffect(() => {
    if (!lightbox) return;
    const h = e => { if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); if (e.key === 'Escape') setLightbox(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [lightbox]);

  const FALLBACK = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900&q=85&fit=crop';

  return (
    <>
      {/* ── Main image ── */}
      <div className={`relative rounded-3xl overflow-hidden shadow-2xl bg-linear-to-br ${catGrad}`} style={{ height: 420 }}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        {/* Floating blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />

        {/* Spinner while loading */}
        {!loaded[active] && !error[active] && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Fallback car icon */}
        {error[active] && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <Car className="w-28 h-28 text-white/30" />
            <p className="text-white/40 text-sm font-medium mt-3">Photo unavailable</p>
          </div>
        )}

        {/* Image */}
        <img
          key={active}
          src={images[active]}
          alt={`${vehicle.make} ${vehicle.model} — ${labels[active]}`}
          onLoad={() => setLoaded(l => ({ ...l, [active]: true }))}
          onError={() => { setError(e => ({ ...e, [active]: true })); }}
          className={`w-full h-full object-cover transition-all duration-500 ${loaded[active] ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-linear-to-b from-black/20 to-transparent pointer-events-none" />

        {/* Top-left badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black backdrop-blur-sm border ${vehicle.isAvailable ? 'bg-emerald-500/90 border-emerald-400/40 text-white' : 'bg-gray-800/80 border-gray-600/40 text-gray-200'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${vehicle.isAvailable ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
            {vehicle.isAvailable ? 'Available Now' : 'Unavailable'}
          </div>
        </div>

        {/* Top-right actions */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setLightbox(true)}
            className="w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-xl flex items-center justify-center transition border border-white/20"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom info bar */}
        <div className="absolute bottom-0 inset-x-0 px-5 py-4 flex items-end justify-between">
          <div>
            <h1 className="text-white font-black text-2xl sm:text-3xl leading-tight drop-shadow-lg">
              {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-white/70 text-sm font-medium mt-0.5">{vehicle.year} · {vehicle.fuelType} · {vehicle.vehicleType}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-white font-black text-3xl drop-shadow-lg">₹{vehicle.pricePerDay}</p>
            <p className="text-white/60 text-xs font-medium">/day</p>
          </div>
        </div>

        {/* Nav arrows */}
        <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition border border-white/10">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition border border-white/10">
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Image counter */}
        <div className="absolute bottom-4 right-5 bg-black/50 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20">
          {active + 1} / {images.length}
        </div>
      </div>

      {/* ── Thumbnails ── */}
      <div className="grid grid-cols-5 gap-2 mt-3">
        {images.map((src, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`relative rounded-2xl overflow-hidden transition-all duration-200 ${i === active ? 'ring-2 ring-primary-500 ring-offset-2 shadow-lg scale-[1.03]' : 'opacity-60 hover:opacity-90 hover:scale-[1.01]'}`}
            style={{ aspectRatio: '16/9' }}
          >
            <img src={src} alt={labels[i]} className="w-full h-full object-cover"
              onError={e => { e.currentTarget.src = FALLBACK; }} />
            <div className={`absolute inset-0 transition-all ${i === active ? 'bg-primary-500/10' : ''}`} />
            <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/70 to-transparent px-1.5 py-1">
              <p className="text-white text-[9px] font-bold truncate">{labels[i]}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/97 flex flex-col items-center justify-center">
          <button onClick={() => setLightbox(false)}
            className="absolute top-5 right-5 w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center justify-center transition border border-white/20">
            <X className="w-5 h-5" />
          </button>
          <p className="absolute top-6 left-1/2 -translate-x-1/2 text-white/60 text-sm font-semibold">
            {vehicle.make} {vehicle.model} — {labels[active]}
          </p>
          <div className="relative w-full max-w-5xl px-16 mt-10">
            <img src={images[active]} alt={labels[active]}
              className="w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl"
              onError={e => { e.currentTarget.src = FALLBACK; }} />
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          <div className="flex gap-2 mt-5">
            {images.map((src, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`w-16 h-10 rounded-xl overflow-hidden border-2 transition ${i === active ? 'border-primary-400 shadow-lg' : 'border-white/20 opacity-50 hover:opacity-80'}`}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <p className="mt-3 text-white/40 text-xs">
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded">←→</kbd> navigate &nbsp;·&nbsp; <kbd className="bg-white/10 px-1.5 py-0.5 rounded">Esc</kbd> close
          </p>
        </div>
      )}
    </>
  );
}

// ── Spec badge ────────────────────────────────────────────────────────────────
function SpecBadge({ icon: Icon, label, value, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 text-center bg-linear-to-br ${gradient}`}>
      <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2 shadow">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <p className="text-white/70 text-[9px] font-black uppercase tracking-wider">{label}</p>
      <p className="text-white font-black text-sm mt-0.5">{value}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, startBooking } = useApp();

  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ pickupLocation: '', dropLocation: '', pickupDate: today, returnDate: '', specialInstructions: '' });
  const [couponCode, setCouponCode]     = useState('');
  const [couponDiscount, setCouponDiscount] = useState(null);
  const [couponLoading, setCouponLoading]   = useState(false);

  useEffect(() => {
    Promise.all([
      vehicleService.getById(id),
      reviewService.getByVehicle(id).catch(() => ({})),
    ]).then(([vRes, rRes]) => {
      setVehicle(vRes?.data || vRes);
      const items = rRes?.data?.items || rRes?.data || rRes?.items || rRes || [];
      setReviews(Array.isArray(items) ? items.slice(0, 6) : []);
    }).finally(() => setLoading(false));
  }, [id]);

  const nights   = form.pickupDate && form.returnDate ? Math.max(1, Math.ceil((new Date(form.returnDate) - new Date(form.pickupDate)) / 86400000)) : 0;
  const subtotal = vehicle ? nights * vehicle.pricePerDay : 0;
  const discount = couponDiscount ? Math.min(couponDiscount.maxDiscountAmount || Infinity, subtotal * (couponDiscount.discountPercentage / 100)) : 0;
  const total    = subtotal - discount;

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res  = await couponService.validate(couponCode.trim(), subtotal);
      const data = res?.data || res;
      if (data?.isValid) { setCouponDiscount(data.coupon || data); toast.success('Coupon applied! 🎉'); }
      else toast.error(data?.message || 'Invalid coupon code');
    } catch { toast.error('Could not validate coupon'); }
    finally { setCouponLoading(false); }
  };

  const handleBookNow = () => {
    if (!user) { toast.error('Please sign in to book'); navigate('/login'); return; }
    if (!form.pickupLocation || !form.dropLocation || !form.pickupDate || !form.returnDate) { toast.error('Please fill all required fields'); return; }
    startBooking(vehicle, { ...form, nights, subtotal, discount, total, coupon: couponDiscount });
    navigate('/booking/confirm');
  };

  if (loading) return <Loader fullPage />;
  if (!vehicle) return <div className="pt-24 text-center text-gray-500 py-20">Vehicle not found.</div>;

  const avgRating   = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const catGrad     = CAT_GRADIENT[vehicle.vehicleCategory?.name] || 'from-primary-700 to-violet-800';
  const specGrads   = ['from-blue-500 to-blue-700', 'from-violet-500 to-violet-700', 'from-emerald-500 to-teal-700', 'from-orange-500 to-amber-700', 'from-rose-500 to-pink-700'];

  const PERKS = [
    { icon: Shield,   text: 'GPS-enabled tracking for safety' },
    { icon: Zap,      text: 'Sanitized & cleaned before every trip' },
    { icon: Award,    text: 'Verified, trained professional driver' },
    { icon: Clock,    text: 'Free cancellation up to 2 hours before' },
    { icon: ThumbsUp, text: 'Real-time trip updates via app' },
    { icon: Car,      text: '24/7 roadside assistance included' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Back ── */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-primary-600 font-semibold text-sm mb-6 transition group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to vehicles
        </button>

        <div className="grid lg:grid-cols-5 gap-8">

          {/* ══════════════ LEFT (3 cols) ══════════════ */}
          <div className="lg:col-span-3 space-y-5">

            {/* Gallery */}
            <ImageGallery vehicle={vehicle} />

            {/* Spec bar */}
            <div className="grid grid-cols-5 gap-3">
              {[
                { icon: Users, label: 'Seats',    value: `${vehicle.seatingCapacity}` },
                { icon: Fuel,  label: 'Fuel',     value: vehicle.fuelType },
                { icon: Car,   label: 'Type',     value: vehicle.vehicleType },
                { icon: Shield,label: 'Insured',  value: 'Yes' },
                { icon: Zap,   label: 'AC',       value: 'Yes' },
              ].map(({ icon, label, value }, i) => (
                <SpecBadge key={label} icon={icon} label={label} value={value} gradient={specGrads[i]} />
              ))}
            </div>

            {/* Why book */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className={`px-6 py-4 bg-linear-to-r ${catGrad}`}>
                <h2 className="text-white font-black flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Why Book This Vehicle?
                </h2>
                <p className="text-white/70 text-xs mt-0.5">Every trip is safe, comfortable & on time</p>
              </div>
              <div className="p-5 grid sm:grid-cols-2 gap-3">
                {PERKS.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3 group">
                    <div className="w-7 h-7 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary-100 transition">
                      <Icon className="w-3.5 h-3.5 text-primary-600" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium leading-snug">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                  <h2 className="font-black text-gray-900 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Customer Reviews
                  </h2>
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
                    <span className="font-black text-amber-700 text-sm">{avgRating.toFixed(1)}</span>
                    <span className="text-amber-400 text-xs">★</span>
                    <span className="text-amber-600 text-xs font-medium">/ 5</span>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="flex gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="w-10 h-10 rounded-2xl gradient-brand flex items-center justify-center text-white font-black text-sm shrink-0 shadow">
                        {r.customer?.firstName?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span className="font-bold text-gray-900 text-sm truncate">{r.customer?.firstName} {r.customer?.lastName}</span>
                          <StarRating rating={r.rating} size="sm" />
                        </div>
                        {r.comment && <p className="text-gray-500 text-sm leading-relaxed">{r.comment}</p>}
                        <p className="text-gray-400 text-xs mt-1">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ══════════════ RIGHT (2 cols) ══════════════ */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-3xl overflow-hidden shadow-2xl border border-gray-100"
              style={{ boxShadow: '0 25px 60px rgba(37,99,235,0.15), 0 4px 12px rgba(0,0,0,0.1)' }}>

              {/* Header */}
              <div className={`relative overflow-hidden bg-linear-to-b ${catGrad} px-6 py-5`}>
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
                <div className="relative">
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-0.5">Book This Vehicle</p>
                  <h2 className="text-white font-black text-xl leading-tight">{vehicle.make} {vehicle.model}</h2>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl font-black text-white">₹{vehicle.pricePerDay}</span>
                    <span className="text-white/60 text-sm font-medium">/day · ₹{vehicle.pricePerKm}/km</span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="bg-white p-5 space-y-4">

                {/* Pickup */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                    Pickup Location <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    <input value={form.pickupLocation} onChange={e => setForm(f => ({ ...f, pickupLocation: e.target.value }))}
                      placeholder="Enter pickup address"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 hover:border-gray-200 focus:border-primary-400 focus:bg-white rounded-2xl text-sm font-medium outline-none transition-all" />
                  </div>
                </div>

                {/* Drop */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                    Drop Location <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                    <input value={form.dropLocation} onChange={e => setForm(f => ({ ...f, dropLocation: e.target.value }))}
                      placeholder="Enter drop address"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 hover:border-gray-200 focus:border-primary-400 focus:bg-white rounded-2xl text-sm font-medium outline-none transition-all" />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Pickup Date', key: 'pickupDate', min: today },
                    { label: 'Return Date', key: 'returnDate', min: form.pickupDate || today },
                  ].map(({ label, key, min }) => (
                    <div key={key}>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                        {label} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-500 pointer-events-none" />
                        <input type="date" min={min} value={form[key]}
                          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                          className="w-full pl-8 pr-1 py-3 bg-gray-50 border-2 border-gray-100 hover:border-gray-200 focus:border-primary-400 focus:bg-white rounded-2xl text-xs font-semibold outline-none transition-all cursor-pointer" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Special instructions */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Special Instructions</label>
                  <textarea value={form.specialInstructions} onChange={e => setForm(f => ({ ...f, specialInstructions: e.target.value }))}
                    rows={2} placeholder="Any special requirements..."
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 hover:border-gray-200 focus:border-primary-400 focus:bg-white rounded-2xl text-sm font-medium outline-none transition-all resize-none" />
                </div>

                {/* Coupon */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Coupon Code</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500" />
                      <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g. WELCOME10"
                        className="w-full pl-10 pr-3 py-3 bg-gray-50 border-2 border-gray-100 hover:border-gray-200 focus:border-violet-400 focus:bg-white rounded-2xl text-sm font-semibold outline-none transition-all uppercase" />
                    </div>
                    <button onClick={handleCoupon} disabled={couponLoading || !couponCode}
                      className="px-4 py-3 rounded-2xl text-sm font-black text-white gradient-brand shadow hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
                      {couponLoading ? '…' : 'Apply'}
                    </button>
                  </div>
                  {couponDiscount && (
                    <div className="mt-2 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-3 py-2 text-xs font-bold">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      {couponDiscount.discountPercentage}% off applied (max ₹{couponDiscount.maxDiscountAmount})
                    </div>
                  )}
                </div>

                {/* Price breakdown */}
                {nights > 0 && (
                  <div className="bg-linear-to-br from-primary-50 to-violet-50 rounded-2xl p-4 border border-primary-100/50 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                      <span>₹{vehicle.pricePerDay} × {nights} day{nights > 1 ? 's' : ''}</span>
                      <span className="font-bold">₹{subtotal}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600 font-bold">
                        <span>Coupon discount</span>
                        <span>-₹{discount.toFixed(0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-black text-gray-900 border-t border-primary-200/50 pt-2 mt-1">
                      <span>Total Payable</span>
                      <span className="text-primary-700 text-xl">₹{total.toFixed(0)}</span>
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <button onClick={handleBookNow} disabled={!vehicle.isAvailable}
                  className="w-full py-4 rounded-2xl font-black text-white text-base transition-all duration-200 hover:-translate-y-0.5 shadow-xl hover:shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                  style={{ background: vehicle.isAvailable ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : '#9ca3af' }}>
                  {vehicle.isAvailable ? (
                    <><Car className="w-5 h-5" /> Proceed to Book</>
                  ) : (
                    'Currently Unavailable'
                  )}
                </button>

                {/* Trust badges */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: CheckCircle, text: 'Free cancellation', color: 'text-emerald-600' },
                    { icon: Zap,         text: 'Instant confirmation', color: 'text-primary-600' },
                    { icon: Shield,      text: 'Fully insured',     color: 'text-violet-600' },
                    { icon: Award,       text: 'Verified driver',   color: 'text-amber-600' },
                  ].map(({ icon: Icon, text, color }) => (
                    <div key={text} className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${color}`} />
                      {text}
                    </div>
                  ))}
                </div>

                <p className="text-center text-[11px] text-gray-400 font-medium">
                  🔒 Payment secured by 256-bit SSL encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
