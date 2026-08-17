import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, User, LogOut, ChevronRight, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { driverService, bookingService } from '../services';
import { Badge, Loader, EmptyState } from '../components';

const DEMO_DRIVER = { id: 1, firstName: 'Suresh', lastName: 'Singh', email: 'suresh.singh@example.com', rating: 4.5, totalTrips: 150, status: 'Available' };

function DriverSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const links = [
    { to: '/driver', label: 'Overview', icon: LayoutDashboard },
    { to: '/driver/trips', label: 'My Trips', icon: Car },
    { to: '/driver/profile', label: 'Profile', icon: User },
  ];
  return (
    <aside className="w-64 bg-gray-900 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold">D</div>
          <div>
            <p className="text-white font-bold text-sm">Driver Portal</p>
            <p className="text-gray-400 text-xs">RideRental</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== '/driver' && pathname.startsWith(to));
          return (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${active ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button onClick={() => navigate('/')}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-gray-800 w-full transition">
          <LogOut className="w-4 h-4" /> Exit Portal
        </button>
      </div>
    </aside>
  );
}

function DriverOverview() {
  const driver = DEMO_DRIVER;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService.getByDriver(driver.id, { pageSize: 50 })
      .then(res => setBookings(res?.data?.items || res?.data || res?.items || res || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Trips', value: driver.totalTrips, icon: Car, color: 'text-primary-600 bg-primary-50' },
    { label: 'Rating', value: `${driver.rating} ★`, icon: TrendingUp, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Completed', value: bookings.filter(b => b.status === 'Completed').length, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Upcoming', value: bookings.filter(b => b.status === 'Confirmed').length, icon: Clock, color: 'text-blue-600 bg-blue-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Welcome, {driver.firstName}! 🚗</h1>
          <p className="text-gray-500 mt-1">Here's your driving activity overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${driver.status === 'Available' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-sm font-semibold text-gray-700">{driver.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Assigned Trips</h2>
          <Link to="/driver/trips" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? <Loader /> : bookings.length === 0 ? (
          <EmptyState icon={Car} title="No trips assigned" description="New trips will appear here" />
        ) : (
          <div className="divide-y divide-gray-50">
            {bookings.slice(0, 5).map(b => (
              <div key={b.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <Car className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{b.pickupLocation} → {b.dropLocation}</p>
                    <p className="text-xs text-gray-400">{new Date(b.pickupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary-700">₹{b.estimatedPrice || 0}</span>
                  <Badge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DriverTrips() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService.getByDriver(DEMO_DRIVER.id, { pageSize: 100 })
      .then(res => setBookings(res?.data?.items || res?.data || res?.items || res || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">My Trips</h1>
      {loading ? <Loader /> : bookings.length === 0 ? (
        <EmptyState icon={Car} title="No trips found" description="Your assigned trips will appear here." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {bookings.map(b => (
              <div key={b.id} className="px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Trip #{b.id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{b.pickupLocation} → {b.dropLocation}</p>
                    <p className="text-xs text-gray-400">{new Date(b.pickupDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="text-base font-extrabold text-primary-700">₹{b.estimatedPrice || 0}</span>
                    <Badge status={b.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DriverProfile() {
  const d = DEMO_DRIVER;
  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-extrabold text-gray-900">Driver Profile</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg">
            {d.firstName[0]}{d.lastName[0]}
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{d.firstName} {d.lastName}</p>
            <p className="text-gray-500 text-sm">{d.email}</p>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="text-yellow-600 font-bold">⭐ {d.rating}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-600">{d.totalTrips} trips</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {[['Status', d.status], ['Total Trips', d.totalTrips], ['Average Rating', `${d.rating} / 5.0`]].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">{k}</span>
              <span className="text-sm font-semibold text-gray-900">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DriverDashboard() {
  return (
    <div className="flex min-h-screen pt-16 bg-gray-50">
      <DriverSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Routes>
          <Route index element={<DriverOverview />} />
          <Route path="trips" element={<DriverTrips />} />
          <Route path="profile" element={<DriverProfile />} />
        </Routes>
      </main>
    </div>
  );
}
