import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock, Users, Star, Zap, Car,
  Wind, PawPrint, Check, Shield, Leaf, Calendar,
  ChevronRight, AlertCircle, Minus, Plus
} from 'lucide-react';
import { carpoolService } from '../services';
import { useApp } from '../context/AppContext';
import { Loader } from '../components';
import AuthModal from './AuthModal';
import toast from 'react-hot-toast';

function formatTime(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}
function formatDate(dt) {
  return new Date(dt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function formatDuration(mins) {
  if (!mins) return null;
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
}

// ── Sticky booking sidebar ─────────────────────────────────────────────────────
function BookingSidebar({ ride, seats, setSeats, onBook, booking }) {
  const depTime = formatTime(ride.departureTime);
  const arrTime = ride.estimatedDurationMinutes
    ? formatTime(new Date(new Date(ride.departureTime).getTime() + ride.estimatedDurationMinutes * 60000))
    : null;
  const dur = formatDuration(ride.estimatedDurationMinutes);
  const total = seats * ride.pricePerSeat;
  const isFull = ride.availableSeats === 0;

  const PAYMENT_OPTS = ['UPI', 'Card', 'NetBanking', 'Cash'];
  const [payMethod, setPayMethod] = useState('UPI');

  return (
    <div className="sticky top-24 bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-2xl"
      style={{ boxShadow: '0 25px 60px rgba(37,99,235,0.12), 0 4px 12px rgba(0,0,0,0.08)' }}>

      {/* Header */}
      <div className="relative overflow-hidden px-6 py-5 gradient-brand">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px,white 1px,transparent 0)', backgroundSize: '20px 20px' }} />
        <div className="relative">
          <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">
            {formatDate(ride.departureTime)}
          </p>
          {/* Time line */}
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-2xl font-black text-white leading-none">{depTime}</p>
              <p className="text-white/60 text-xs mt-0.5 max-w-[70px] truncate">{ride.originCity}</p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              {dur && <p className="text-white/50 text-[10px] font-bold mb-0.5">{dur}</p>}
              <div className="h-px bg-white/30 w-full" />
            </div>
            <div className="text-center">
              {arrTime && <p className="text-2xl font-black text-white leading-none">{arrTime}</p>}
              <p className="text-white/60 text-xs mt-0.5 max-w-[70px] truncate">{ride.destinationCity}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            {/* Driver avatar + name */}
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white font-black text-xs shrink-0">
              {ride.driverName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <span className="text-white/80 text-sm font-bold">{ride.driverName}</span>
            <span className="text-white/40 text-xs">★ {ride.driverRating?.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">

        {/* Seat picker */}
        {!isFull && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Passengers</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setSeats(s => Math.max(1, s - 1))}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
                <Minus className="w-4 h-4 text-gray-700" />
              </button>
              <span className="text-2xl font-black text-gray-900 min-w-[2rem] text-center">{seats}</span>
              <button onClick={() => setSeats(s => Math.min(ride.availableSeats, s + 1))}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
                <Plus className="w-4 h-4 text-gray-700" />
              </button>
              <span className="text-sm text-gray-400 font-medium">{ride.availableSeats} max</span>
            </div>
          </div>
        )}

        {/* Payment method */}
        {!isFull && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Payment method</p>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_OPTS.map(m => (
                <button key={m} type="button"
                  onClick={() => setPayMethod(m)}
                  className={`py-2.5 rounded-xl text-xs font-black transition-all border-2 ${payMethod === m ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price summary */}
        {!isFull && (
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 font-medium">{seats} seat{seats > 1 ? 's' : ''} × ₹{Math.round(ride.pricePerSeat)}</span>
              <span className="font-black text-gray-900">₹{Math.round(total)}</span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex items-center justify-between">
              <span className="font-black text-gray-900">Total</span>
              <span className="text-2xl font-black text-primary-700">₹{Math.round(total)}</span>
            </div>
          </div>
        )}

        {/* CTA */}
        {isFull ? (
          <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-4 text-gray-500 font-bold text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> This ride is full
          </div>
        ) : (
          <button
            disabled={booking}
            onClick={() => onBook(payMethod)}
            className="w-full py-4 rounded-2xl font-black text-white text-base gradient-brand shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {booking
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Zap className="w-5 h-5" /> Book {seats} seat{seats > 1 ? 's' : ''}</>}
          </button>
        )}

        {!isFull && (
          <p className="text-center text-xs text-gray-400 leading-relaxed">
            {ride.instantBooking
              ? '⚡ Your seat is confirmed instantly upon booking.'
              : '📋 Driver will review and confirm your request.'}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RideDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, startCarpoolBooking, openAuthModal } = useApp();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState(1);
  const [booking, setBooking] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingPayMethod, setPendingPayMethod] = useState(null);

  useEffect(() => {
    carpoolService.getRideById(id)
      .then(r => setRide(r?.data || r))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = (payMethod) => {
    if (!user) {
      // Save intent then show auth modal
      setPendingPayMethod(payMethod);
      startCarpoolBooking(ride, seats, payMethod);
      setShowAuth(true);
      return;
    }
    if (user.role !== 'Customer') {
      toast.error('Only customers can book carpool seats.');
      return;
    }
    // Proceed to payment page
    startCarpoolBooking(ride, seats, payMethod);
    navigate('/carpool/payment');
  };

  // Called after successful login inside AuthModal
  const afterAuth = () => {
    setShowAuth(false);
    navigate('/carpool/payment');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader />
    </div>
  );

  if (!ride) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <AlertCircle className="w-12 h-12 text-gray-300" />
      <p className="text-gray-500 font-semibold">Ride not found.</p>
      <button onClick={() => navigate('/rides')} className="btn-primary px-6 py-3 rounded-xl">Back to search</button>
    </div>
  );

  const depTime = formatTime(ride.departureTime);
  const arrTime = ride.estimatedDurationMinutes
    ? formatTime(new Date(new Date(ride.departureTime).getTime() + ride.estimatedDurationMinutes * 60000))
    : null;
  const dur = formatDuration(ride.estimatedDurationMinutes);
  const co2 = ride.estimatedDistanceKm ? Math.round(ride.estimatedDistanceKm * 0.12) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Auth modal overlay */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={afterAuth}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to results
        </button>

        <h1 className="text-3xl font-black text-gray-900 mb-6">Ride details</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── LEFT (3 cols) ─────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Route card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 space-y-4">
                {/* Origin */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <div className="w-0.5 bg-gray-200 flex-1 my-1" style={{ minHeight: 32 }} />
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-2xl font-black text-gray-900 leading-none">{depTime}</p>
                    <p className="text-gray-500 text-sm mt-1">{ride.originAddress || ride.originCity}</p>
                    {dur && (
                      <div className="mt-3 flex items-center gap-2 text-gray-400">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs font-semibold">{dur}</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Destination */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                  </div>
                  <div className="flex-1">
                    {arrTime && <p className="text-2xl font-black text-gray-900 leading-none">{arrTime}</p>}
                    <p className="text-gray-500 text-sm mt-1">{ride.destinationAddress || ride.destinationCity}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between cursor-pointer group"
                onClick={() => {}}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                    {ride.driverName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-lg">{ride.driverName}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold text-gray-700">
                          {ride.driverRating?.toFixed(1) || '—'}/5
                        </span>
                        {ride.driverTotalTrips > 0 && (
                          <span className="text-xs text-gray-400">· {ride.driverTotalTrips} trips</span>
                        )}
                      </div>
                      {ride.driverIsVerified && (
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-400 transition-colors" />
              </div>

              {/* Driver description */}
              {ride.description && (
                <p className="mt-4 text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-4">
                  {ride.description}
                </p>
              )}

              {/* Preferences */}
              <div className="mt-4 pt-4 border-t border-gray-50 space-y-2.5">
                {[
                  { icon: Zap,       show: ride.instantBooking,  text: 'Your booking will be confirmed instantly',    color: 'text-primary-500' },
                  { icon: Wind,      show: !ride.smokingAllowed, text: 'No smoking in the vehicle',                   color: 'text-gray-500' },
                  { icon: PawPrint,  show: !ride.petsAllowed,    text: 'Pets not allowed',                            color: 'text-gray-500' },
                  { icon: PawPrint,  show:  ride.petsAllowed,    text: 'Pets welcome!',                               color: 'text-amber-600' },
                  { icon: Car,       show: !!ride.vehicleInfo,   text: `${ride.vehicleInfo}${ride.vehicleType ? ' · ' + ride.vehicleType : ''}`, color: 'text-gray-500' },
                  { icon: Users,     show: !!ride.maxPassengersInBack, text: `Max ${ride.maxPassengersInBack} passengers in back`, color: 'text-gray-500' },
                ].filter(p => p.show).map(({ icon: Icon, text, color }, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                    <span className="text-sm text-gray-600 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Passengers aboard */}
            {ride.passengers && ride.passengers.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <h2 className="font-black text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary-500" />
                    Passengers
                  </h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {ride.passengers.map(p => (
                    <div key={p.carpoolBookingId} className="flex items-center gap-4 px-6 py-4">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 font-black text-sm shrink-0">
                        {p.customerName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm">{p.customerName}</p>
                        <p className="text-xs text-gray-400 truncate">{p.pickupNote}</p>
                      </div>
                      <span className="text-xs font-bold text-gray-400">
                        {p.seatsBooked} seat{p.seatsBooked > 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CO2 impact */}
            {co2 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                <Leaf className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-700 leading-relaxed">
                  By choosing this trip you'll help avoid ~{co2} kg of CO₂.
                  Carpooling saves {Math.round(co2 * 0.71)}% more emissions compared to travelling alone.
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT (2 cols) ─────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            {/* Date header on mobile */}
            <p className="lg:hidden font-bold text-gray-500 text-sm mb-3">
              {formatDate(ride.departureTime)}
            </p>
            <BookingSidebar
              ride={ride}
              seats={seats}
              setSeats={setSeats}
              booking={booking}
              onBook={handleBook}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
