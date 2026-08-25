import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock, Users, Car, CheckCircle,
  Zap, CreditCard, Smartphone, Building2, Wallet,
  Shield, Star, Leaf, AlertCircle, ChevronRight
} from 'lucide-react';
import { carpoolService } from '../services';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

function formatTime(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}
function formatDate(dt) {
  return new Date(dt).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}
function formatDuration(mins) {
  if (!mins) return null;
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
}

const PAYMENT_METHODS = [
  { id: 'UPI',        label: 'UPI',           icon: Smartphone,  desc: 'Pay via any UPI app instantly',     color: 'text-violet-600 bg-violet-50 border-violet-200' },
  { id: 'Card',       label: 'Card',           icon: CreditCard,  desc: 'Debit or credit card',              color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'NetBanking', label: 'Net Banking',    icon: Building2,   desc: 'All major banks supported',         color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'Cash',       label: 'Cash',           icon: Wallet,      desc: 'Pay the driver on the day',         color: 'text-amber-600 bg-amber-50 border-amber-200' },
];

// ── Success screen ─────────────────────────────────────────────────────────────
function SuccessScreen({ booking, ride, navigate }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center animate-pop">

        {/* Big checkmark */}
        <div className="w-24 h-24 rounded-3xl gradient-brand flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">
          {ride?.instantBooking ? 'Seat confirmed! 🎉' : 'Request sent! 🎉'}
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          {ride?.instantBooking
            ? 'Your seat is booked. Have a great trip!'
            : 'The driver will review and confirm your request shortly.'}
        </p>

        {/* Booking summary card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 text-left mb-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white font-black text-sm shadow shrink-0">
              {booking?.id}
            </div>
            <div>
              <p className="font-black text-gray-900">Booking #{booking?.id}</p>
              <p className="text-xs text-gray-400">
                {booking?.status === 'Confirmed' ? '✅ Confirmed' : '⏳ Pending approval'}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-gray-700 font-medium">
                {booking?.originCity || ride?.originCity} → {booking?.destinationCity || ride?.destinationCity}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-primary-500 shrink-0" />
              <span className="text-gray-700 font-medium">
                {ride?.departureTime ? `${formatDate(ride.departureTime)} at ${formatTime(ride.departureTime)}` : '—'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Car className="w-4 h-4 text-violet-500 shrink-0" />
              <span className="text-gray-700 font-medium">
                {booking?.driverName || ride?.driverName} · {booking?.vehicleInfo || ride?.vehicleInfo || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
              <span className="font-black text-gray-900">Total paid</span>
              <span className="text-xl font-black text-primary-700">₹{Math.round(booking?.totalPrice || 0)}</span>
            </div>
          </div>
        </div>

        {/* CO2 badge */}
        {ride?.estimatedDistanceKm && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 mb-6 text-left">
            <Leaf className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm text-emerald-700">
              You saved ~{Math.round(ride.estimatedDistanceKm * 0.12)} kg CO₂ by sharing this ride!
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/dashboard/carpool')}
            className="flex-1 btn-primary py-4 rounded-2xl font-black flex items-center justify-center gap-2">
            View My Bookings <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 btn-ghost py-4 rounded-2xl font-bold">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main payment page ──────────────────────────────────────────────────────────
export default function CarpoolPayment() {
  const navigate = useNavigate();
  const { user, carpoolCart, clearCarpoolCart } = useApp();

  const [payMethod, setPayMethod] = useState(carpoolCart?.paymentMethod || 'UPI');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [booking, setBooking] = useState(null);

  // Guard — redirect if no cart or not a customer
  useEffect(() => {
    if (!carpoolCart) { navigate('/rides', { replace: true }); return; }
    if (!user)        { navigate('/login', { replace: true }); return; }
    if (user.role !== 'Customer') { navigate('/', { replace: true }); return; }
  }, [carpoolCart, user, navigate]);

  if (!carpoolCart) return null;

  const { ride, seatsBooked } = carpoolCart;
  const total = seatsBooked * ride.pricePerSeat;
  const depTime = formatTime(ride.departureTime);
  const dur = formatDuration(ride.estimatedDurationMinutes);
  const arrTime = ride.estimatedDurationMinutes
    ? formatTime(new Date(new Date(ride.departureTime).getTime() + ride.estimatedDurationMinutes * 60000))
    : null;

  if (done) return <SuccessScreen booking={booking} ride={ride} navigate={navigate} />;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await carpoolService.bookSeat({
        rideOfferId:   ride.id,
        seatsBooked,
        paymentMethod: payMethod,
      });
      const created = res?.data || res;
      setBooking(created);
      clearCarpoolCart();
      setDone(true);
    } catch (err) {
      const msg = err?.message || err?.title || 'Booking failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-3xl font-black text-gray-900 mb-8">Confirm your booking</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── LEFT — details ──────────────────────────────── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Trip summary */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full gradient-brand" />
                <h2 className="font-black text-gray-900">Trip Summary</h2>
              </div>
              <div className="p-5 space-y-4">
                {/* Route timeline */}
                <div className="flex items-center gap-4">
                  <div className="text-center w-14 shrink-0">
                    <p className="text-xl font-black text-gray-900 leading-none">{depTime}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{ride.originCity}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <p className="text-[10px] text-gray-400 font-bold mb-0.5">{dur || '—'}</p>
                    <div className="h-px bg-gray-200 w-full" />
                  </div>
                  <div className="text-center w-14 shrink-0">
                    {arrTime && <p className="text-xl font-black text-gray-900 leading-none">{arrTime}</p>}
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{ride.destinationCity}</p>
                  </div>
                </div>
                {/* Date + seats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Date</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(ride.departureTime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Seats</p>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-primary-500" /> {seatsBooked} passenger{seatsBooked > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver + vehicle */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                {ride.driverName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900">{ride.driverName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-semibold text-gray-600">{ride.driverRating?.toFixed(1)}</span>
                  {ride.driverIsVerified && (
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
                      ✓ Verified
                    </span>
                  )}
                </div>
                {ride.vehicleInfo && (
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Car className="w-3 h-3" /> {ride.vehicleInfo}
                  </p>
                )}
              </div>
              {ride.instantBooking && (
                <div className="flex items-center gap-1.5 text-xs font-black text-primary-600 bg-primary-50 border border-primary-100 px-3 py-1.5 rounded-xl shrink-0">
                  <Zap className="w-3.5 h-3.5" /> Instant
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full gradient-brand" />
                <h2 className="font-black text-gray-900">Payment Method</h2>
              </div>
              <div className="p-5 grid sm:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(({ id, label, icon: Icon, desc, color }) => (
                  <label key={id}
                    className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                      ${payMethod === id ? `border-primary-500 bg-primary-50` : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                    <input type="radio" name="pay" value={id} checked={payMethod === id}
                      onChange={() => setPayMethod(id)} className="sr-only" />
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 text-sm">{label}</p>
                      <p className="text-xs text-gray-400 truncate">{desc}</p>
                    </div>
                    {payMethod === id && (
                      <div className="w-5 h-5 rounded-full gradient-brand flex items-center justify-center shrink-0">
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: 'Secure payment',   color: 'text-blue-600 bg-blue-50' },
                { icon: Zap,    label: 'Instant confirm',   color: 'text-violet-600 bg-violet-50' },
                { icon: Leaf,   label: 'Eco-friendly',     color: 'text-emerald-600 bg-emerald-50' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-gray-100 py-4 px-3 text-center">
                  <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-bold text-gray-600 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT — order summary + CTA ─────────────────── */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
              style={{ boxShadow: '0 25px 60px rgba(37,99,235,0.12),0 4px 12px rgba(0,0,0,0.08)' }}>

              {/* Header */}
              <div className="relative overflow-hidden gradient-brand px-6 py-5">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle at 2px 2px,white 1px,transparent 0)', backgroundSize: '20px 20px' }} />
                <p className="relative text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Order Summary</p>
                <p className="relative text-white font-black text-lg">
                  {ride.originCity} → {ride.destinationCity}
                </p>
                <p className="relative text-white/60 text-sm mt-0.5">
                  {new Date(ride.departureTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at {depTime}
                </p>
              </div>

              <div className="p-5 space-y-4">
                {/* Line items */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Price per seat</span>
                    <span className="font-bold text-gray-900">₹{Math.round(ride.pricePerSeat)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Seats</span>
                    <span className="font-bold text-gray-900">× {seatsBooked}</span>
                  </div>
                  <div className="h-px bg-gray-100" />
                  <div className="flex items-center justify-between">
                    <span className="font-black text-gray-900">Total</span>
                    <span className="text-2xl font-black text-primary-700">₹{Math.round(total)}</span>
                  </div>
                </div>

                {/* Passenger info */}
                <div className="bg-gray-50 rounded-2xl p-3.5 space-y-1.5 text-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Booking for</p>
                  <p className="font-bold text-gray-900">{user?.name}</p>
                  <p className="text-gray-500 text-xs">{user?.email}</p>
                </div>

                {/* Confirm button */}
                <button
                  disabled={loading}
                  onClick={handleConfirm}
                  className="w-full py-4 rounded-2xl font-black text-white text-base gradient-brand shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><CheckCircle className="w-5 h-5" /> Confirm & Pay ₹{Math.round(total)}</>}
                </button>

                <p className="text-center text-xs text-gray-400 leading-relaxed">
                  By confirming you agree to the cancellation policy. Free cancellation up to 24 hours before departure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
