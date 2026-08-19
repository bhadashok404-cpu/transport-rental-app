import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Car, CreditCard, Smartphone, Building2, CheckCircle, ArrowLeft, ExternalLink, QrCode } from 'lucide-react';
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
  const [paymentDetails, setPaymentDetails] = useState({ upiId: '', cardNumber: '', cardExpiry: '', cardCvv: '', bank: '' });
  const [loading, setLoading] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);

  if (!bookingCart || !user) {
    navigate('/vehicles');
    return null;
  }

  const { vehicle, pickupLocation, dropLocation, pickupDate, returnDate, nights, subtotal, discount, total, specialInstructions } = bookingCart;
  const upfrontAmount = Math.round(total * 0.8 * 100) / 100;

  const updatePaymentDetail = (key) => (event) => setPaymentDetails(details => ({ ...details, [key]: event.target.value }));

  const validatePaymentDetails = () => {
    if (payMethod === 'Cash') return true;
    if (payMethod === 'UPI') return /^[\w.-]+@[\w.-]+$/.test(paymentDetails.upiId.trim());
    if (payMethod === 'Card') return paymentDetails.cardNumber.replace(/\s/g, '').length >= 12 && paymentDetails.cardExpiry && paymentDetails.cardCvv.length >= 3;
    return Boolean(paymentDetails.bank);
  };

  const finishPayment = async (booking, payment) => {
    setLoading(true);
    try {
      await paymentService.process(payment.id, {
        transactionId: `TXN${Date.now()}`,
        paymentGatewayResponse: JSON.stringify({ method: payMethod, details: paymentDetails, amount: upfrontAmount }),
      });
      clearBookingCart();
      toast.success('Payment received. Booking confirmed!');
      navigate(`/booking/success/${booking.id}`);
    } catch (err) {
      try { await bookingService.cancel(booking.id, 'Payment was not completed'); } catch { /* preserve original payment error */ }
      setPendingPayment(null);
      toast.error(err?.message || err?.title || 'Payment could not be completed.');
    } finally { setLoading(false); }
  };

  const handleConfirm = async () => {
    if (!validatePaymentDetails()) {
      toast.error(payMethod === 'UPI' ? 'Enter a valid UPI ID' : payMethod === 'Card' ? 'Enter valid card details' : 'Select your bank');
      return;
    }
    setLoading(true);
    let createdBooking = null;
    try {
      const bookingPayload = {
        customerId: user.customerId,
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
      createdBooking = booking;

      const payPayload = {
        bookingId: booking.id,
        customerId: user.id,
        amount: upfrontAmount,
        paymentMethod: payMethod,
      };
      const payRes = await paymentService.create(payPayload);
      const payment = payRes?.data || payRes;

      if (payMethod === 'UPI') {
        setPendingPayment({ booking, payment });
        toast.success('Payment request created. Complete the UPI payment to confirm your booking.');
        return;
      }

      if (payMethod !== 'Cash') await paymentService.process(payment.id, {
        transactionId: `TXN${Date.now()}`,
        paymentGatewayResponse: JSON.stringify({ method: payMethod, details: paymentDetails, amount: upfrontAmount }),
      });

      clearBookingCart();
      toast.success('Booking confirmed!');
      navigate(`/booking/success/${booking.id}`);
    } catch (err) {
      if (createdBooking?.id) {
        try { await bookingService.cancel(createdBooking.id, 'Payment was not completed'); } catch { /* preserve original payment error */ }
      }
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
                  type="button"
                  onClick={() => setPayMethod(id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${payMethod === id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${payMethod === id ? 'text-primary-600' : 'text-gray-400'}`} />
                  <p className={`font-semibold text-sm ${payMethod === id ? 'text-primary-700' : 'text-gray-700'}`}>{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
            {payMethod === 'UPI' && <div className="mt-4"><label className="block text-sm font-semibold text-gray-700 mb-1.5">UPI ID</label><input value={paymentDetails.upiId} onChange={updatePaymentDetail('upiId')} placeholder="name@bank" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" /></div>}
            {payMethod === 'UPI' && pendingPayment && <div className="mt-5 border border-primary-100 bg-primary-50 rounded-xl p-4 text-center"><div className="flex items-center justify-center gap-2 text-primary-700 font-bold mb-3"><QrCode className="w-5 h-5" />Complete UPI payment</div><p className="text-sm text-gray-600 mb-3">Pay <strong>₹{upfrontAmount.toFixed(0)}</strong> using your UPI app or scan the QR code.</p><img className="w-48 h-48 mx-auto bg-white p-2 rounded-lg" alt={`UPI payment QR code for ₹${upfrontAmount.toFixed(0)}`} src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`upi://pay?pa=${paymentDetails.upiId.trim()}&pn=RideRental&am=${upfrontAmount.toFixed(2)}&cu=INR`)}`} /><a href={`upi://pay?pa=${paymentDetails.upiId.trim()}&pn=RideRental&am=${upfrontAmount.toFixed(2)}&cu=INR`} className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-primary-700"><ExternalLink className="w-4 h-4" />Open UPI app</a><p className="text-xs text-gray-500 mt-3">After the payment is complete, confirm below. The booking stays pending until payment is processed.</p></div>}
            {payMethod === 'Card' && <div className="mt-4 grid grid-cols-2 gap-3"><div className="col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-1.5">Card number</label><input value={paymentDetails.cardNumber} onChange={updatePaymentDetail('cardNumber')} inputMode="numeric" placeholder="1234 5678 9012 3456" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" /></div><div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Expiry</label><input value={paymentDetails.cardExpiry} onChange={updatePaymentDetail('cardExpiry')} placeholder="MM/YY" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" /></div><div><label className="block text-sm font-semibold text-gray-700 mb-1.5">CVV</label><input value={paymentDetails.cardCvv} onChange={updatePaymentDetail('cardCvv')} type="password" inputMode="numeric" placeholder="123" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" /></div></div>}
            {payMethod === 'NetBanking' && <div className="mt-4"><label className="block text-sm font-semibold text-gray-700 mb-1.5">Select bank</label><select value={paymentDetails.bank} onChange={updatePaymentDetail('bank')} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"><option value="">Choose your bank</option><option>State Bank of India</option><option>HDFC Bank</option><option>ICICI Bank</option><option>Axis Bank</option><option>Kotak Mahindra Bank</option></select></div>}
            {payMethod === 'Cash' && <p className="mt-4 text-sm text-gray-500">Pay the remaining amount at pickup. Online methods collect 80% now so the driver can accept the request.</p>}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-linear-to-r from-primary-600 to-primary-700 px-6 py-4">
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
                <span className="text-primary-700">₹{(payMethod === 'Cash' ? total : upfrontAmount).toFixed(0)}</span>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-3">
              <button
                onClick={() => pendingPayment ? finishPayment(pendingPayment.booking, pendingPayment.payment) : handleConfirm()}
                disabled={loading}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                  <><CheckCircle className="w-5 h-5" /> {pendingPayment ? `I have paid ₹${upfrontAmount.toFixed(0)}` : payMethod === 'Cash' ? `Confirm Booking ₹${total.toFixed(0)}` : `Create payment request ₹${upfrontAmount.toFixed(0)}`}</>
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
