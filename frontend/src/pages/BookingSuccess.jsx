import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, MapPin, Calendar, Car, ArrowRight, Home } from 'lucide-react';
import { bookingService } from '../services';
import { Loader } from '../components';

export default function BookingSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService.getById(id)
      .then(res => setBooking(res?.data || res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullPage />;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
          {/* Success icon */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-500 mb-8">
            Your booking has been confirmed. Booking ID: <span className="font-bold text-primary-700">#{id}</span>
          </p>

          {booking && (
            <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-3 mb-8 text-sm">
              <div className="flex items-center gap-3">
                <Car className="w-4 h-4 text-primary-500 shrink-0" />
                <span className="text-gray-700"><strong>{booking.vehicleInfo || `${booking.vehicle?.make || ''} ${booking.vehicle?.model || ''}`}</strong>{(booking.vehicleType || booking.vehicle?.vehicleType) && ` — ${booking.vehicleType || booking.vehicle.vehicleType}`}
                  {booking.vehicleRegistration && ` · ${booking.vehicleRegistration}`}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-green-500 shrink-0" />
                <span className="text-gray-700">{booking.pickupLocation}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-gray-700">{booking.dropLocation}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-primary-500 shrink-0" />
                <span className="text-gray-700">
                  {new Date(booking.pickupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {booking.returnDate && ` → ${new Date(booking.returnDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                </span>
              </div>
              {booking.estimatedPrice && (
                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900">
                  <span>Total Paid</span>
                  <span className="text-primary-700">₹{booking.estimatedPrice}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/dashboard/bookings" className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition shadow">
              View My Bookings <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/" className="flex-1 flex items-center justify-center gap-2 py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition">
              <Home className="w-4 h-4" /> Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
