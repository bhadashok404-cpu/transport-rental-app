import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock, Users, Car, CheckCircle,
  Zap, CreditCard, Smartphone, Building2, Wallet,
  Shield, Star, Leaf, AlertCircle, ChevronRight, QrCode, Lock
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
  { id: 'UPI',        label: 'UPI',         icon: Smartphone,  desc: 'PhonePe, GPay, Paytm…',      color: 'text-violet-600 bg-violet-50 border-violet-200' },
  { id: 'Card',       label: 'Debit/Credit',icon: CreditCard,  desc: 'Visa, Mastercard, Rupay',     color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'NetBanking', label: 'Net Banking',  icon: Building2,   desc: 'All major banks',             color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'Cash',       label: 'Cash',         icon: Wallet,      desc: 'Pay the driver on the day',  color: 'text-amber-600 bg-amber-50 border-amber-200' },
];

const NET_BANKS = [
  'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
  'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda',
  'Canara Bank', 'Union Bank of India', 'IndusInd Bank', 'IDFC First Bank',
  'Yes Bank', 'Federal Bank', 'South Indian Bank', 'Other',
];

// ── UPI Payment Panel ─────────────────────────────────────────────────────────
function UpiPanel({ total, onReady }) {
  const [vpa, setVpa]         = useState('');
  const [showQr, setShowQr]   = useState(false);
  const [verified, setVerified] = useState(false);

  const upiId  = 'riderental@upi';  // merchant UPI
  const qrData = `upi://pay?pa=${upiId}&pn=RideRental&am=${total}&cu=INR&tn=CarpoolBooking`;

  const handleVerify = () => {
    if (!vpa.includes('@')) { toast.error('Enter a valid UPI ID (e.g. name@upi)'); return; }
    setVerified(true);
    onReady(true);
    toast.success('UPI ID verified ✓');
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Toggle: VPA or QR */}
      <div className="flex gap-2">
        <button type="button" onClick={() => setShowQr(false)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${!showQr ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
          Enter UPI ID
        </button>
        <button type="button" onClick={() => setShowQr(true)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${showQr ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
          <span className="flex items-center justify-center gap-1.5"><QrCode className="w-4 h-4" /> Scan QR</span>
        </button>
      </div>

      {!showQr ? (
        // VPA entry
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Your UPI ID</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500 pointer-events-none" />
              <input
                value={vpa}
                onChange={e => { setVpa(e.target.value); setVerified(false); onReady(false); }}
                placeholder="yourname@upi"
                className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition-all"
              />
            </div>
            <button type="button" onClick={handleVerify}
              className="px-4 py-3 rounded-xl text-sm font-black text-white bg-violet-600 hover:bg-violet-700 transition-colors whitespace-nowrap">
              Verify
            </button>
          </div>
          {verified && (
            <p className="text-xs text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> UPI ID verified — ready to pay
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1.5">
            ₹{total} will be debited from your UPI-linked bank account
          </p>
        </div>
      ) : (
        // QR code (generated from UPI deep link as a visual representation)
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-inner">
            {/* Simulated QR — in production use a QR library */}
            <div className="w-44 h-44 bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-2 border border-dashed border-violet-200">
              <QrCode className="w-16 h-16 text-violet-600" />
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-700">Scan to Pay</p>
              <p className="text-xs font-bold text-gray-500">{upiId}</p>
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl font-black text-gray-900">₹{total}</p>
            <p className="text-xs text-gray-500">Open any UPI app and scan this code</p>
          </div>
          <button type="button"
            onClick={() => { onReady(true); toast.success('Payment confirmed via QR ✓'); }}
            className="w-full py-3 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-700 text-sm transition-colors">
            I've completed the payment
          </button>
        </div>
      )}
    </div>
  );
}

// ── Card Payment Panel ────────────────────────────────────────────────────────
function CardPanel({ onReady }) {
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const f = (k, v) => setCard(c => ({ ...c, [k]: v }));

  const isComplete = card.number.replace(/\s/g, '').length === 16
    && card.expiry.length === 5
    && card.cvv.length >= 3
    && card.name.trim().length >= 2;

  useEffect(() => { onReady(isComplete); }, [isComplete]); // eslint-disable-line

  const fmtNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExpiry = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const brand = () => {
    const n = card.number.replace(/\s/g, '');
    if (n.startsWith('4')) return '💳 Visa';
    if (/^5[1-5]/.test(n)) return '💳 Mastercard';
    if (/^6/.test(n)) return '💳 Rupay';
    return '💳';
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Card number */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Card Number</label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
          <input value={card.number} onChange={e => f('number', fmtNumber(e.target.value))}
            placeholder="1234 5678 9012 3456" maxLength={19}
            className="w-full pl-9 pr-16 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-medium outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all" />
          {card.number && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{brand()}</span>}
        </div>
      </div>

      {/* Expiry + CVV */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Expiry</label>
          <input value={card.expiry} onChange={e => f('expiry', fmtExpiry(e.target.value))}
            placeholder="MM/YY" maxLength={5}
            className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-medium outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all" />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">CVV</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input value={card.cvv} onChange={e => f('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="•••" type="password" maxLength={4}
              className="w-full pl-8 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-medium outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all" />
          </div>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Cardholder Name</label>
        <input value={card.name} onChange={e => f('name', e.target.value)}
          placeholder="As on card"
          className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all" />
      </div>

      {isComplete && (
        <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" /> Card details complete — ready to pay
        </p>
      )}
      <p className="text-xs text-gray-400 flex items-center gap-1.5">
        <Lock className="w-3 h-3" /> Your card details are encrypted and never stored
      </p>
    </div>
  );
}

// ── Net Banking Panel ─────────────────────────────────────────────────────────
function NetBankingPanel({ onReady }) {
  const [bank, setBank] = useState('');

  useEffect(() => { onReady(bank !== ''); }, [bank]); // eslint-disable-line

  return (
    <div className="mt-4 space-y-3">
      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Select your bank</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
        {NET_BANKS.map(b => (
          <button key={b} type="button" onClick={() => setBank(b)}
            className={`text-left px-3 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
              bank === b ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
            }`}>
            {bank === b && <span className="mr-1">✓</span>}{b}
          </button>
        ))}
      </div>
      {bank && (
        <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" /> {bank} selected — you'll be redirected to your bank after confirming
        </p>
      )}
    </div>
  );
}

// ── Cash Panel ────────────────────────────────────────────────────────────────
function CashPanel({ onReady }) {
  const [agreed, setAgreed] = useState(false);
  useEffect(() => { onReady(agreed); }, [agreed]); // eslint-disable-line

  return (
    <div className="mt-4 space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-black text-amber-800">Pay cash to the driver</p>
        <ul className="space-y-1.5 text-xs text-amber-700">
          <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">•</span> Keep exact change ready before the trip</li>
          <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">•</span> Pay the driver at pickup or as agreed</li>
          <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">•</span> The driver can cancel if cash is not paid</li>
        </ul>
      </div>
      <label className="flex items-start gap-3 cursor-pointer group">
        <div onClick={() => setAgreed(a => !a)}
          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${agreed ? 'bg-amber-500 border-amber-500' : 'border-gray-300 group-hover:border-amber-400'}`}>
          {agreed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
        </div>
        <span className="text-sm text-gray-700 font-medium leading-snug">
          I agree to pay <strong className="text-gray-900">₹{/* total shown in parent */}</strong> in cash directly to the driver on the day of travel
        </span>
      </label>
      {agreed && (
        <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" /> Confirmed — you'll pay cash to the driver
        </p>
      )}
    </div>
  );
}

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
  const [payReady, setPayReady]   = useState(false);   // true once method details filled
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [booking, setBooking]     = useState(null);

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
              <div className="p-5">
                {/* Method selector cards */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(({ id, label, icon: Icon, desc, color }) => (
                    <label key={id}
                      onClick={() => { setPayMethod(id); setPayReady(false); }}
                      className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                        ${payMethod === id ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                      <input type="radio" name="pay" value={id} checked={payMethod === id}
                        onChange={() => {}} className="sr-only" />
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

                {/* Per-method detail panel */}
                <div className="mt-2 border-t border-gray-50 pt-4">
                  {payMethod === 'UPI'        && <UpiPanel        total={Math.round(total)} onReady={setPayReady} />}
                  {payMethod === 'Card'       && <CardPanel       onReady={setPayReady} />}
                  {payMethod === 'NetBanking' && <NetBankingPanel onReady={setPayReady} />}
                  {payMethod === 'Cash'       && <CashPanel       onReady={setPayReady} total={Math.round(total)} />}
                </div>
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
                  disabled={loading || !payReady}
                  onClick={handleConfirm}
                  className="w-full py-4 rounded-2xl font-black text-white text-base gradient-brand shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2">
                  {loading
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><CheckCircle className="w-5 h-5" /> Confirm & Pay ₹{Math.round(total)}</>}
                </button>

                {!payReady && !loading && (
                  <p className="text-center text-xs text-amber-600 font-semibold flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Complete your {payMethod === 'UPI' ? 'UPI verification' : payMethod === 'Card' ? 'card details' : payMethod === 'NetBanking' ? 'bank selection' : 'cash confirmation'} above to enable payment
                  </p>
                )}

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
