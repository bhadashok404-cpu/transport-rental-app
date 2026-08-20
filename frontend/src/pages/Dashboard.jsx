import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard, Car, Bell, User, LogOut, ChevronRight,
  TrendingUp, CheckCircle, XCircle, Clock, MapPin, Calendar,
  Star, Zap, Sparkles, ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { bookingService } from '../services';
import { Badge, Loader, EmptyState, StarRating } from '../components';

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar() {
  const { user, logout, unreadCount } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const links = [
    { to: '/dashboard',               label: 'Overview',       icon: LayoutDashboard },
    { to: '/dashboard/bookings',       label: 'My Bookings',    icon: Car },
    { to: '/dashboard/notifications',  label: 'Notifications',  icon: Bell, badge: unreadCount },
    { to: '/profile',                  label: 'Profile',        icon: User },
  ];

  const isActive = (to) => to === '/dashboard' ? pathname === to : pathname.startsWith(to);

  return (
    <aside className="sidebar-premium w-64 flex flex-col py-0 px-0">

      {/* Navigation */}
      <nav className="flex-1 p-3 pt-4 space-y-0.5">
        <p className="px-3 mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/25">Menu</p>
        {links.map(({ to, label, icon: Icon, badge }) => (
          <Link key={to} to={to}
            className={`sidebar-link ${isActive(to) ? 'active' : ''}`}>
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {badge > 0 && (
              <span className="w-5 h-5 gradient-brand rounded-full flex items-center justify-center text-[10px] font-black text-white">{badge > 9 ? '9+' : badge}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-1 mt-4 pt-4 border-t border-white/10">
        <button onClick={() => { logout(); navigate('/login'); }}
          className="sidebar-link w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, from, to, change }) {
  return (
    <div className={`card-stat bg-linear-to-br ${from} ${to} text-white shadow-xl`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow">
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change !== undefined && (
          <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />{change}
          </span>
        )}
      </div>
      <p className="text-3xl font-black">{value}</p>
      <p className="text-white/70 text-xs font-semibold mt-1 uppercase tracking-wide">{label}</p>
    </div>
  );
}

// ─── Booking row ──────────────────────────────────────────────────────────────
function BookingRow({ booking: b, onClick }) {
  const statusColor = { Pending:'warning', Confirmed:'info', InProgress:'info', Completed:'success', Cancelled:'error' };
  return (
    <div onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-primary-50/50 cursor-pointer transition-all duration-200 group border border-transparent hover:border-primary-100">
      <div className="w-12 h-12 gradient-brand rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
        <Car className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm">{b.vehicle?.make} {b.vehicle?.model}</p>
        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(b.pickupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-black text-primary-700">₹{b.estimatedPrice || b.actualPrice || 0}</span>
        <Badge status={b.status} />
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-400 transition-colors" />
      </div>
    </div>
  );
}

// ─── Overview page ────────────────────────────────────────────────────────────
function Overview() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.customerId) { setLoading(false); return; }
    bookingService.getByCustomer(user.customerId, { pageSize: 50 })
      .then(r => setBookings(r?.data?.items || r?.data || r?.items || r || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.customerId]);

  const total     = bookings.length;
  const active    = bookings.filter(b => ['Confirmed','InProgress'].includes(b.status)).length;
  const completed = bookings.filter(b => b.status === 'Completed').length;
  const cancelled = bookings.filter(b => b.status === 'Cancelled').length;

  return (
    <div className="page-enter space-y-8">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Good day, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Here's your travel overview</p>
        </div>
        <button onClick={() => navigate('/vehicles')} className="btn-primary px-5 py-2.5 text-sm rounded-xl hidden sm:flex">
          <Car className="w-4 h-4" /> Book a Ride
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Trips"  value={total}     icon={Car}         from="from-blue-500"    to="to-blue-600" />
        <StatCard label="Active"       value={active}    icon={Zap}         from="from-violet-500"  to="to-violet-600" />
        <StatCard label="Completed"    value={completed} icon={CheckCircle} from="from-emerald-500" to="to-emerald-600" />
        <StatCard label="Cancelled"    value={cancelled} icon={XCircle}     from="from-rose-500"    to="to-rose-600" />
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-black text-gray-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-500" /> Recent Bookings
          </h2>
          <Link to="/dashboard/bookings"
            className="text-xs font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? <div className="p-8"><Loader /></div>
          : bookings.length === 0
            ? <EmptyState icon={Car} title="No bookings yet" description="Start by browsing available vehicles"
                actionLabel="Browse Vehicles" onAction={() => navigate('/vehicles')} />
            : <div className="p-3 space-y-1">
                {bookings.slice(0, 5).map(b => <BookingRow key={b.id} booking={b} onClick={() => navigate(`/dashboard/bookings/${b.id}`)} />)}
              </div>}
      </div>
    </div>
  );
}

// ─── Bookings list ────────────────────────────────────────────────────────────
function MyBookings() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');

  const TABS = ['All', 'Pending', 'Confirmed', 'InProgress', 'Completed', 'Cancelled'];

  useEffect(() => {
    if (!user?.customerId) { setLoading(false); return; }
    bookingService.getByCustomer(user.customerId, { pageSize: 100 })
      .then(r => setAll(r?.data?.items || r?.data || r?.items || r || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.customerId]);

  const filtered = tab === 'All' ? all : all.filter(b => b.status === tab);

  return (
    <div className="page-enter space-y-6">
      <h1 className="text-2xl font-black text-gray-900">My Bookings</h1>

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${tab === t ? 'gradient-brand text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-700'}`}>
            {t}
            {t !== 'All' && <span className="ml-1.5 opacity-60">({all.filter(b => b.status === t).length})</span>}
          </button>
        ))}
      </div>

      {loading ? <Loader />
        : filtered.length === 0
          ? <EmptyState icon={Car} title="No bookings found" description="Try a different filter or book a new ride"
              actionLabel="Book a Vehicle" onAction={() => navigate('/vehicles')} />
          : <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 space-y-1">
              {filtered.map(b => <BookingRow key={b.id} booking={b} onClick={() => navigate(`/dashboard/bookings/${b.id}`)} />)}
            </div>}
    </div>
  );
}

// ─── Booking detail ───────────────────────────────────────────────────────────
function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    bookingService.getById(id)
      .then(r => setBooking(r?.data || r))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8"><Loader /></div>;
  if (!booking) return <p className="text-gray-500 p-6">Booking not found.</p>;

  const cancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    try { await bookingService.cancel(id, 'Customer requested cancellation'); setBooking(b => ({ ...b, status: 'Cancelled' })); }
    catch { /* silent */ }
  };

  return (
    <div className="page-enter max-w-2xl space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary-600 transition">
        ← Back to bookings
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Booking #{booking.id}</h1>
        <Badge status={booking.status} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
        {[
          { icon: Car,      label: 'Vehicle',     value: `${booking.vehicle?.make} ${booking.vehicle?.model} (${booking.vehicle?.vehicleType})` },
          { icon: MapPin,   label: 'Pickup',      value: booking.pickupLocation },
          { icon: MapPin,   label: 'Drop',        value: booking.dropLocation },
          { icon: Calendar, label: 'Pickup Date', value: new Date(booking.pickupDate).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) },
          ...(booking.returnDate ? [{ icon: Calendar, label: 'Return Date', value: new Date(booking.returnDate).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) }] : []),
          ...(booking.driver ? [{ icon: Star, label: 'Driver', value: `${booking.driver.firstName} ${booking.driver.lastName} · ⭐ ${booking.driver.rating}` }] : []),
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-4 px-6 py-4">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
              <p className="text-gray-900 font-semibold text-sm mt-0.5">{value}</p>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between px-6 py-5">
          <span className="font-black text-lg text-gray-900">Total Amount</span>
          <span className="text-2xl font-black text-primary-700">₹{booking.actualPrice || booking.estimatedPrice}</span>
        </div>
      </div>

      {['Pending','Confirmed'].includes(booking.status) && (
        <button onClick={cancel}
          className="btn-danger px-6 py-3 rounded-xl text-sm">
          Cancel Booking
        </button>
      )}
    </div>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────
function Notifications() {
  const { notifications, markNotificationRead, loadNotifications } = useApp();
  useEffect(() => { loadNotifications(); }, []);

  if (notifications.length === 0)
    return <div className="page-enter"><EmptyState icon={Bell} title="All caught up!" description="No notifications right now." /></div>;

  return (
    <div className="page-enter space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Notifications</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
        {notifications.map(n => (
          <div key={n.id} onClick={() => !n.isRead && markNotificationRead(n.id)}
            className={`flex items-start gap-4 p-5 cursor-pointer transition-all duration-200 ${!n.isRead ? 'bg-primary-50/50 hover:bg-primary-50' : 'hover:bg-gray-50'}`}>
            <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${!n.isRead ? 'gradient-brand' : 'bg-gray-200'}`}
              style={!n.isRead ? { background: 'linear-gradient(135deg,#2563eb,#7c3aed)' } : {}} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${!n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{n.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Profile (inline) ─────────────────────────────────────────────────────────
function Profile() {
  const { user } = useApp();
  const [form, setForm] = useState({ firstName: user?.firstName||'', lastName: user?.lastName||'', email: user?.email||'', phoneNumber: user?.phoneNumber||'', address: user?.address||'' });
  const [saved, setSaved] = useState(false);

  const save = (e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="page-enter max-w-2xl space-y-6">
      <h1 className="text-2xl font-black text-gray-900">My Profile</h1>

      {/* Avatar hero */}
      <div className="relative overflow-hidden rounded-2xl p-6 gradient-brand text-white flex items-center gap-5">
        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl shrink-0">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <p className="text-xl font-black">{user?.firstName} {user?.lastName}</p>
          <p className="text-white/70 text-sm">{user?.email}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
            <CheckCircle className="w-3.5 h-3.5" /> Verified Customer
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[['firstName','First Name'],['lastName','Last Name']].map(([k,l]) => (
              <div key={k}>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{l}</label>
                <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="input-field rounded-xl py-3.5" />
              </div>
            ))}
          </div>
          {[['email','Email','email'],['phoneNumber','Phone','tel'],['address','Address','text']].map(([k,l,t]) => (
            <div key={k}>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{l}</label>
              <input type={t} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="input-field rounded-xl py-3.5" />
            </div>
          ))}
          <button type="submit" className="btn-primary px-8 py-3.5 rounded-xl font-black">
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useApp();
  const navigate = useNavigate();

  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);
  if (!user) return null;

  return (
    <div className="flex min-h-screen pt-16">
      {/* Sidebar */}
      <div className="hidden lg:block w-64 fixed left-0 top-16 bottom-0 z-20">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 p-6 sm:p-8 bg-slate-50 min-h-screen">
        <Routes>
          <Route index        element={<Overview />} />
          <Route path="bookings"        element={<MyBookings />} />
          <Route path="bookings/:id"    element={<BookingDetail />} />
          <Route path="notifications"   element={<Notifications />} />
          <Route path="profile"         element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}
