import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard, Car, Bell, User, LogOut, ChevronRight,
  TrendingUp, CheckCircle, XCircle, Clock, MapPin, Calendar,
  Star, Zap, Sparkles, ArrowUpRight, Users, Leaf
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { bookingService, carpoolService } from '../services';
import { Badge, Loader, EmptyState, StarRating, DashShell } from '../components';

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar() {
  const { user, logout, unreadCount } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const links = [
    { to: '/dashboard',               label: 'Overview',          icon: LayoutDashboard },
    { to: '/dashboard/bookings',       label: 'My Bookings',       icon: Car },
    { to: '/dashboard/carpool',        label: 'Carpool Rides',     icon: Users },
    { to: '/dashboard/notifications',  label: 'Notifications',     icon: Bell, badge: unreadCount },
    { to: '/profile',                  label: 'Profile',           icon: User },
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
        <p className="font-bold text-gray-900 text-sm">{b.vehicleInfo || `${b.vehicle?.make || ''} ${b.vehicle?.model || ''}`.trim() || 'Vehicle'}</p>
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

// ─── Ride Tracker ─────────────────────────────────────────────────────────────
function RideTracker({ bookings }) {
  const navigate = useNavigate();
  const active = bookings.filter(b =>
    ['Pending','Confirmed','DriverAssigned','InProgress'].includes(b.status)
  );
  if (active.length === 0) return null;

  const STATUS_INFO = {
    Pending:        { label: 'Waiting for driver',  color: 'bg-amber-500',   icon: '⏳', progress: 10 },
    Confirmed:      { label: 'Driver confirmed',     color: 'bg-blue-500',    icon: '✓',  progress: 30 },
    DriverAssigned: { label: 'Driver on the way',    color: 'bg-violet-500',  icon: '🚗', progress: 60 },
    InProgress:     { label: 'Ride in progress',     color: 'bg-emerald-500', icon: '🟢', progress: 85 },
  };

  return (
    <div className="space-y-4">
      {active.map(b => {
        const info = STATUS_INFO[b.status] || STATUS_INFO.Pending;
        return (
          <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={`${info.color} px-5 py-3 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white font-black text-sm">{info.icon} {info.label}</span>
              </div>
              <span className="text-white/70 text-xs font-semibold">Ride #{b.id}</span>
            </div>

            <div className="px-5 pt-4 pb-2">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${info.color} rounded-full transition-all duration-700`}
                  style={{ width: `${info.progress}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-medium">
                <span>Booked</span><span>Assigned</span><span>On Way</span><span>Arrived</span>
              </div>
            </div>

            <div className="px-5 py-3 space-y-2">
              {[{loc: b.pickupLocation, color:'bg-emerald-500'},{loc: b.dropLocation, color:'bg-rose-500'}].map((r,i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full ${r.color} mt-1.5 shrink-0`} />
                  <span className="text-sm text-gray-700 font-medium">{r.loc}</span>
                </div>
              ))}
            </div>

            {(b.driverName || b.driverPhone) && (
              <div className="mx-5 mb-4 p-3.5 bg-gray-50 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow">
                  {(b.driverName||'D').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{b.driverName}</p>
                  {b.driverPhone && <p className="text-xs text-gray-500">📞 {b.driverPhone}</p>}
                  {b.vehicleInfo && <p className="text-xs text-gray-500">🚗 {b.vehicleInfo}</p>}
                </div>
                {b.driverPhone && (
                  <a href={`tel:${b.driverPhone}`}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-lg transition">
                    Call
                  </a>
                )}
              </div>
            )}

            <div className="px-5 pb-4 flex items-center justify-between">
              <span className="text-lg font-black text-primary-700">₹{b.estimatedPrice}</span>
              <button onClick={() => navigate(`/dashboard/bookings/${b.id}`)}
                className="text-xs text-primary-600 font-bold hover:text-primary-800 flex items-center gap-1">
                View Details <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Overview page ────────────────────────────────────────────────────────────
function Overview() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    if (!user?.customerId) { setLoading(false); return; }
    try {
      const r = await bookingService.getByCustomer(user.customerId, { pageSize: 100 });
      setBookings(r?.data?.items || r?.data || r?.items || r || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [user?.customerId]);

  useEffect(() => {
    loadBookings();
    // Poll every 10s so ride tracker updates in near real-time
    const t = setInterval(loadBookings, 10000);
    return () => clearInterval(t);
  }, [loadBookings]);

  const total     = bookings.length;
  const active    = bookings.filter(b => ['Confirmed','DriverAssigned','InProgress'].includes(b.status)).length;
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

      {/* Active ride tracker */}
      {bookings.some(b => ['Pending','Confirmed','DriverAssigned','InProgress'].includes(b.status)) && (
        <div>
          <h2 className="font-black text-gray-900 text-lg mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live Ride Tracker
          </h2>
          <RideTracker bookings={bookings} />
        </div>
      )}

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
          { icon: Car,      label: 'Vehicle',     value: booking.vehicleInfo ? `${booking.vehicleInfo}${booking.vehicleRegistration ? ' · ' + booking.vehicleRegistration : ''}` : '—' },
          { icon: MapPin,   label: 'Pickup',      value: booking.pickupLocation },
          { icon: MapPin,   label: 'Drop',        value: booking.dropLocation },
          { icon: Calendar, label: 'Pickup Date', value: new Date(booking.pickupDate).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) },
          ...(booking.returnDate ? [{ icon: Calendar, label: 'Return Date', value: new Date(booking.returnDate).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) }] : []),
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

        {/* Driver card — shown once a driver is assigned */}
        {booking.driverName && (
          <div className="px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Driver Details</p>
            <div className="flex items-center gap-4 bg-gradient-to-r from-primary-50 to-violet-50 rounded-2xl p-4 border border-primary-100">
              <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0">
                {booking.driverName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900">{booking.driverName}</p>
                {booking.driverPhone && (
                  <a href={`tel:${booking.driverPhone}`}
                    className="text-sm text-primary-600 font-semibold hover:text-primary-800 transition-colors flex items-center gap-1.5 mt-0.5">
                    📞 {booking.driverPhone}
                  </a>
                )}
                {booking.vehicleRegistration && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                    🚗 {booking.vehicleInfo} &nbsp;·&nbsp;
                    <span className="font-black text-gray-700 tracking-widest">{booking.vehicleRegistration}</span>
                  </p>
                )}
              </div>
              <div className="shrink-0">
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full">
                  ✓ Assigned
                </span>
              </div>
            </div>
          </div>
        )}

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

// ─── My Carpool Bookings ──────────────────────────────────────────────────────
function MyCarpoolBookings() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');
  const [cancelling, setCancelling] = useState(null);

  const TABS = ['All', 'Confirmed', 'Pending', 'Cancelled'];

  const STATUS_COLOR = {
    Confirmed: 'badge-success',
    Pending:   'badge-warning',
    Cancelled: 'badge-error',
  };

  const load = useCallback(async () => {
    if (!user?.customerId) { setLoading(false); return; }
    try {
      const res = await carpoolService.getMyBookings();
      const list = res?.data?.items || res?.data || res?.items || res || [];
      setBookings(Array.isArray(list) ? list : []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [user?.customerId]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this carpool booking?')) return;
    setCancelling(id);
    try {
      await carpoolService.cancelBooking(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
    } catch (err) {
      const msg = err?.message || 'Could not cancel. Try again.';
      alert(msg);
    } finally { setCancelling(null); }
  };

  const filtered = tab === 'All' ? bookings : bookings.filter(b => b.status === tab);

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Carpool Rides</h1>
          <p className="text-gray-500 text-sm mt-0.5">All your shared ride bookings</p>
        </div>
        <button onClick={() => navigate('/rides')}
          className="btn-primary px-5 py-2.5 text-sm rounded-xl flex items-center gap-2">
          <Users className="w-4 h-4" /> Find a Ride
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200
              ${tab === t
                ? 'gradient-brand text-white shadow-lg'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-700'}`}>
            {t}
            {t !== 'All' && (
              <span className="ml-1.5 opacity-60">
                ({bookings.filter(b => b.status === t).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading
        ? <Loader />
        : filtered.length === 0
          ? (
            <EmptyState
              icon={Users}
              title="No carpool bookings yet"
              description="Search for rides and book your first shared seat"
              actionLabel="Find a Ride"
              onAction={() => navigate('/rides')}
            />
          )
          : (
            <div className="space-y-4">
              {filtered.map(b => (
                <div key={b.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">

                  {/* Status bar */}
                  <div className={`h-1.5 w-full ${
                    b.status === 'Confirmed' ? 'bg-emerald-400'
                    : b.status === 'Pending' ? 'bg-amber-400'
                    : 'bg-gray-200'
                  }`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      {/* Route + details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-black text-gray-900 text-base">
                            {b.originCity} → {b.destinationCity}
                          </span>
                          <span className={`badge ${STATUS_COLOR[b.status] || 'badge-gray'}`}>
                            {b.status}
                          </span>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                            {new Date(b.departureTime).toLocaleDateString('en-IN', {
                              weekday: 'short', day: 'numeric', month: 'short',
                            })} at {new Date(b.departureTime).toLocaleTimeString('en-IN', {
                              hour: '2-digit', minute: '2-digit', hour12: false,
                            })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Car className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                            {b.driverName}
                            {b.driverRating > 0 && (
                              <span className="flex items-center gap-0.5 text-amber-500">
                                <Star className="w-2.5 h-2.5 fill-amber-400" />
                                {b.driverRating?.toFixed(1)}
                              </span>
                            )}
                          </span>
                          {b.vehicleInfo && (
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                              {b.vehicleInfo}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                            {b.seatsBooked} seat{b.seatsBooked > 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* CO2 hint */}
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600">
                          <Leaf className="w-3 h-3" />
                          <span>Eco-friendly shared ride</span>
                        </div>
                      </div>

                      {/* Price + actions */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-2xl font-black text-primary-700">
                          ₹{Math.round(b.totalPrice)}
                        </span>
                        {b.paymentStatus && (
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            b.paymentStatus === 'Completed'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {b.paymentStatus}
                          </span>
                        )}
                        {['Confirmed', 'Pending'].includes(b.status) && (
                          <button
                            disabled={cancelling === b.id}
                            onClick={() => handleCancel(b.id)}
                            className="text-xs font-bold text-rose-500 hover:text-rose-700 border border-rose-200 hover:border-rose-300 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
                            {cancelling === b.id ? '…' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
    <DashShell sidebar={Sidebar}>
      <Routes>
        <Route index                 element={<Overview />} />
        <Route path="bookings"       element={<MyBookings />} />
        <Route path="bookings/:id"   element={<BookingDetail />} />
        <Route path="carpool"        element={<MyCarpoolBookings />} />
        <Route path="notifications"  element={<Notifications />} />
        <Route path="profile"        element={<Profile />} />
      </Routes>
    </DashShell>
  );
}
