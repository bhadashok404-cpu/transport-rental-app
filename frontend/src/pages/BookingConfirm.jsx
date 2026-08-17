import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Car, CreditCard, Smartphone, Building2, CheckCircle, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { bookingService, paymentService } from '../services';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
  { id: 'Card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
  { id: 'NetBanking', label: 'Net Banking', icon: Building2, desc: 'All major banks' },
  { id: 'Cash', label: 'Pay at Pickup', icon: Car, desc: 'Pay driver directly' },
];

export default function BookingConfirm() {
  const navigate = useNavigate();
  const { user, bookingCart, clearBookingCart } = useApp();
  const [payMethod, setPayMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);

  if (!bookingCart || !user) {
    navigate('/vehicles');
    return null;
  }

  const { vehicle, pickupLocation, dropLocation, pickupDate, returnDate, nights, subtotal, discount, total, specialInstructions } = bookingCart;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const bookingPayload = {
        customerId: user.id,
        vehicleId: vehicle.id,
        pickupLocation,
        dropLocation,
        pickupDate: `${pickupDate}T00:00:00`,
        returnDate: `${returnDate}T00:00:00`,
        estimatedPrice: total,
        specialInstructions: specialInstructions || '',
      };
      const bookRes = await bookingService.create(bookingPayload);
      const booking = bookRes?.data || bookRes;

      const payPayload = {
        bookingId: booking.id,
        customerId: user.id,
        amount: total,
        paymentMethod: payMethod,
      };
      const payRes = await paymentService.create(payPayload);
      const payment = payRes?.data || payRes;

      if (payMethod !== 'Cash') {
        await paymentService.process(payment.id, { transactionId: `TXN${Date.now()}` });
      }

      clearBookingCart();
      toast.success('Booking confirmed!');
      navigate(`/booking/success/${booking.id}`);
    } catch (err) {
      toast.error(err?.message || err?.title || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-primary-600 font-medium mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Confirm Booking</h1>
      <p className="text-gray-500 mb-8">Review your details before finalising payment.</p>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Summary */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-5">Trip Summary</h2>
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
              <div className="w-20 h-16 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                <Car className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{vehicle.make} {vehicle.model}</p>
                <p className="text-gray-500 text-sm">{vehicle.year} · {vehicle.vehicleType} · {vehicle.fuelType}</p>
                <p className="text-primary-700 font-semibold text-sm mt-1">₹{vehicle.pricePerDay}/day</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <div><p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Pickup</p><p className="text-gray-800 font-medium">{pickupLocation}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <div><p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Drop</p><p className="text-gray-800 font-medium">{dropLocation}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                <div><p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Dates</p><p className="text-gray-800 font-medium">{pickupDate} → {returnDate} ({nights} day{nights > 1 ? 's' : ''})</p></div>
              </div>
            </div>
          </div>

          {/* Payment methods */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-5">Payment Method</h2>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map(({ id, label, icon: Icon, desc }) => (
                <button
                  key={id}
                  onClick={() => setPayMethod(id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${payMethod === id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${payMethod === id ? 'text-primary-600' : 'text-gray-400'}`} />
                  <p className={`font-semibold text-sm ${payMethod === id ? 'text-primary-700' : 'text-gray-700'}`}>{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
              <h3 className="text-white font-bold text-lg">Price Breakdown</h3>
            </div>
            <div className="p-6 space-y-3 text-sm">
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
              <div className="flex justify-between text-gray-600">
                <span>Service fee</span>
                <span>₹0</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-extrabold text-lg text-gray-900">
                <span>Total</span>
                <span className="text-primary-700">₹{total.toFixed(0)}</span>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-3">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                  <><CheckCircle className="w-5 h-5" /> Confirm & Pay ₹{total.toFixed(0)}</>
                )}
              </button>
              <p className="text-center text-xs text-gray-400">🔒 Secured by 256-bit SSL encryption</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
