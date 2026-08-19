import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Car, Bell, User, LogOut,
  ChevronRight, TrendingUp, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { bookingService } from '../services';
import { Badge, Loader, EmptyState } from '../components';

// ── Sidebar ──────────────────────────────────────────────
function Sidebar() {
  const { logout } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const links = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
    { to: '/dashboard/bookings', label: 'My Bookings', icon: Car },
    { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    { to: '/dashboard/profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Customer Portal</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to) && to !== '/dashboard';
          const isOverview = to === '/dashboard' && pathname === '/dashboard';
          const isActive = isOverview || (!exact && pathname.startsWith(to));
          return (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />{label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full transition">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}

// ── Overview ─────────────────────────────────────────────
function Overview() {
  const { user } = useApp();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    bookingService.getByCustomer(user.customerId, { pageSize: 50 })
      .then(res => setBookings(res?.data?.items || res?.data || res?.items || res || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [user?.customerId]);

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: Car, color: 'primary' },
    { label: 'Active', value: bookings.filter(b => ['Confirmed', 'InProgress'].includes(b.status)).length, icon: TrendingUp, color: 'blue' },
    { label: 'Completed', value: bookings.filter(b => b.status === 'Completed').length, icon: CheckCircle, color: 'green' },
    { label: 'Cancelled', value: bookings.filter(b => b.status === 'Cancelled').length, icon: XCircle, color: 'red' },
  ];

  const colorMap = { primary: 'bg-primary-50 text-primary-600', blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', red: 'bg-red-50 text-red-600' };

  const recent = bookings.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Welcome back, {user?.firstName}! 👋</h1>
        <p className="text-gray-500 mt-1">Here's a summary of your activity.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Recent Bookings</h2>
          <Link to="/dashboard/bookings" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? <Loader /> : recent.length === 0 ? (
          <EmptyState icon={Car} title="No bookings yet" description="Start by browsing vehicles" actionLabel="Browse Vehicles" onAction={() => window.location.href = '/vehicles'} />
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map(b => <BookingRow key={b.id} booking={b} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bookings list ─────────────────────────────────────────
function BookingRow({ booking: b }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/dashboard/bookings/${b.id}`)}
      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 cursor-pointer transition">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
          <Car className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{b.vehicle?.make} {b.vehicle?.model}</p>
          <p className="text-xs text-gray-400">{new Date(b.pickupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold text-primary-700">₹{b.estimatedPrice || b.actualPrice || 0}</span>
        <Badge status={b.status} />
        <ChevronRight className="w-4 h-4 text-gray-300" />
      </div>
    </div>
  );
}

// ── Bookings page ─────────────────────────────────────────
function MyBookings() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const statuses = ['All', 'Pending', 'Confirmed', 'InProgress', 'Completed', 'Cancelled'];

  useEffect(() => {
    if (!user?.id) return;
    bookingService.getByCustomer(user.customerId, { pageSize: 100 })
      .then(res => setBookings(res?.data?.items || res?.data || res?.items || res || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [user?.customerId]);

  const filtered = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">My Bookings</h1>

      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filter === s ? 'bg-primary-600 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : filtered.length === 0 ? (
        <EmptyState icon={Car} title="No bookings found" description="You haven't made any bookings yet." actionLabel="Book a Vehicle" onAction={() => navigate('/vehicles')} />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map(b => <BookingRow key={b.id} booking={b} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Booking Detail ────────────────────────────────────────
function BookingDetail() {
  const { id } = window.location.pathname.match(/bookings\/(\d+)/) ? { id: window.location.pathname.split('/').pop() } : { id: null };
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    bookingService.getById(id)
      .then(res => setBooking(res?.data || res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingService.cancel(id, 'Customer requested cancellation');
      setBooking(b => ({ ...b, status: 'Cancelled' }));
    } catch { /* silent */ }
  };

  if (loading) return <Loader />;
  if (!booking) return <p className="text-gray-500">Booking not found.</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Booking #{booking.id}</h1>
        <Badge status={booking.status} />
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 text-sm">
        <Row label="Vehicle" value={`${booking.vehicleInfo || `${booking.vehicle?.make || ''} ${booking.vehicle?.model || ''}`} (${booking.vehicleType || booking.vehicle?.vehicleType || 'Car'})`} />
        {booking.vehicleRegistration && <Row label="Registration" value={booking.vehicleRegistration} />}
        <Row label="Pickup" value={booking.pickupLocation} />
        <Row label="Drop" value={booking.dropLocation} />
        <Row label="Pickup Date" value={new Date(booking.pickupDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
        {booking.returnDate && <Row label="Return Date" value={new Date(booking.returnDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />}
        {booking.driverName && <Row label="Driver" value={`${booking.driverName}${booking.driverPhone ? ` · ${booking.driverPhone}` : ''}`} />}
        <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-base text-gray-900">
          <span>Total Amount</span>
          <span className="text-primary-700">₹{booking.actualPrice || booking.estimatedPrice}</span>
        </div>
      </div>
      {['Pending', 'Confirmed'].includes(booking.status) && (
        <button onClick={handleCancel} className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl text-sm transition border border-red-200">
          Cancel Booking
        </button>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-4">
      <span className="text-gray-400 w-28 shrink-0">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}

// ── Notifications ─────────────────────────────────────────
function Notifications() {
  const { notifications, markNotificationRead, loadNotifications } = useApp();
  useEffect(() => { loadNotifications(); }, []);

  if (notifications.length === 0)
    return <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Notifications</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {notifications.map(n => (
          <div key={n.id} onClick={() => !n.isRead && markNotificationRead(n.id)}
            className={`flex items-start gap-4 px-6 py-4 border-b border-gray-50 last:border-0 cursor-pointer transition ${!n.isRead ? 'bg-primary-50/50 hover:bg-primary-50' : 'hover:bg-gray-50'}`}>
            <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${!n.isRead ? 'bg-primary-500' : 'bg-gray-200'}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{n.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Profile ───────────────────────────────────────────────
function Profile() {
  const { user } = useApp();
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '', phoneNumber: user?.phoneNumber || '', address: user?.address || '' });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-gray-900">My Profile</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-5 mb-8 pb-6 border-b border-gray-100">
          <div className="w-20 h-20 bg-linear-to-br from-primary-400 to-primary-700 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              {user?.isVerified ? (
                <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              ) : (
                <span className="text-xs text-yellow-700 bg-yellow-50 px-2.5 py-1 rounded-full font-medium">Unverified</span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[['firstName', 'First Name'], ['lastName', 'Last Name']].map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            ))}
          </div>
          {[['email', 'Email', 'email'], ['phoneNumber', 'Phone Number', 'tel'], ['address', 'Address', 'text']].map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          ))}
          <button type="submit" className="px-7 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow transition">
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Dashboard shell ───────────────────────────────────────
export default function Dashboard() {
  const { user } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen pt-16 bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="bookings/:id" element={<BookingDetail />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}
