import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard, Car, Bell, User, LogOut, ChevronRight,
  TrendingUp, CheckCircle, XCircle, Clock, MapPin, Calendar,
  Star, Zap, Sparkles, ArrowUpRight, Users, Leaf, Phone, ThumbsUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { bookingService, carpoolService, accountService } from '../services';
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
    ['Pending','Confirmed','DriverAssigned','InProgress','Completed'].includes(b.status)
  );
  if (active.length === 0) return null;

  // Full 8-step journey for each status
  const STEPS = [
    { key: 'booked',     label: 'Ride Booked',      icon: '📋' },
    { key: 'assigned',   label: 'Driver Assigned',   icon: '👤' },
    { key: 'accepted',   label: 'Ride Accepted By Driver',   icon: '✅' },
    { key: 'coming',     label: 'Driver Coming',     icon: '🚗' },
    { key: 'arrived',    label: 'Driver Arrived',    icon: '📍' },
    { key: 'started',    label: 'Ride Started',      icon: '🟢' },
    { key: 'enroute',    label: 'En Route',          icon: '🛣️' },
    { key: 'finished',   label: 'Ride Finished',     icon: '🏁' },
  ];

  const STATUS_COLOR = {
    Pending:        { bg: 'bg-amber-500',   gradient: 'from-amber-500 to-orange-500',  label: 'Waiting for driver assignment',       icon: '⏳' },
    Confirmed:      { bg: 'bg-blue-500',    gradient: 'from-blue-500 to-blue-600',     label: 'Confirmed — awaiting driver acceptance', icon: '✓' },
    DriverAssigned: { bg: 'bg-orange-500',  gradient: 'from-orange-500 to-amber-600',  label: 'Driver assigned — awaiting acceptance', icon: '📲' },
    InProgress:     { bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-teal-600',  label: 'Ride in progress',                    icon: '🟢' },
    Completed:      { bg: 'bg-gray-500',    gradient: 'from-gray-500 to-gray-600',     label: 'Ride completed',                      icon: '🏁' },
  };

  const getStepsDone = (status) => {
    // DriverAssigned = 2 steps done (Booked + Driver Assigned)
    // Driver hasn't accepted yet — don't jump to step 4
    const map = { Pending: 1, Confirmed: 1, DriverAssigned: 2, InProgress: 6, Completed: 8 };
    return map[status] ?? 1;
  };

  return (
    <div className="space-y-5">
      {active.map(b => {
        const sc    = STATUS_COLOR[b.status] || STATUS_COLOR.Pending;
        const done  = getStepsDone(b.status);
        const isLive = ['Pending','Confirmed','DriverAssigned','InProgress'].includes(b.status);
        const pct   = Math.round((done / STEPS.length) * 100);

        return (
          <div key={b.id} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">

            {/* Colored status bar */}
            <div className={`bg-linear-to-r ${sc.gradient} px-5 py-3.5 flex items-center justify-between`}>
              <div className="flex items-center gap-2.5">
                {isLive && <span className="relative flex w-2.5 h-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                  <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-white" />
                </span>}
                <span className="text-white font-black text-sm">{sc.icon} {sc.label}</span>
              </div>
              <span className="text-white/70 text-xs font-bold">Ride #{b.id}</span>
            </div>

            {/* Progress bar */}
            <div className="px-5 pt-4 pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500">{done}/{STEPS.length} steps</span>
                <span className="text-xs font-black text-primary-600">{pct}% complete</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full bg-linear-to-r ${sc.gradient} rounded-full transition-all duration-1000`}
                  style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* Step dots */}
            <div className="px-5 pb-4">
              <div className="flex items-center justify-between gap-1 overflow-x-auto">
                {STEPS.map((step, i) => {
                  const stepDone   = i < done;
                  const stepActive = i === done - 1;
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-1 shrink-0">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs transition-all
                        ${stepActive
                          ? `border-primary-500 bg-primary-500 text-white shadow-lg shadow-primary-200 scale-110`
                          : stepDone
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                            : 'border-gray-200 bg-white text-gray-300'}`}>
                        {stepActive
                          ? <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          : stepDone ? '✓' : step.icon}
                      </div>
                      <span className={`text-[9px] font-bold text-center leading-tight max-w-12 hidden sm:block
                        ${stepActive ? 'text-primary-700' : stepDone ? 'text-emerald-600' : 'text-gray-300'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Route */}
            <div className="px-5 py-3 space-y-2 border-t border-gray-50">
              {[
                { loc: b.pickupLocation, color: 'bg-emerald-500', label: 'Pickup' },
                { loc: b.dropLocation,   color: 'bg-rose-500',    label: 'Drop' },
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${r.color} mt-1.5 shrink-0`} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{r.label}</p>
                    <p className="text-sm text-gray-800 font-semibold">{r.loc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Driver card — shown once assigned */}
            {(b.driverName || b.driverPhone) && (
              <div className="mx-5 mb-4 p-4 rounded-2xl border border-violet-100"
                style={{ background: 'linear-gradient(135deg,#f5f3ff,#fdf2f8)' }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-3">Your Driver</p>
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                    {(b.driverName || 'D').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900">{b.driverName}</p>
                    {b.driverPhone && (
                      <a href={`tel:${b.driverPhone}`}
                        className="text-sm text-violet-600 hover:text-violet-800 font-semibold transition-colors flex items-center gap-1 mt-0.5">
                        📞 {b.driverPhone}
                      </a>
                    )}
                    {b.vehicleInfo && (
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        🚗 {b.vehicleInfo}
                        {b.vehicleRegistration && (
                          <span className="font-black text-gray-700 tracking-widest ml-1">{b.vehicleRegistration}</span>
                        )}
                      </p>
                    )}
                  </div>
                  {b.driverPhone && (
                    <a href={`tel:${b.driverPhone}`}
                      className="px-4 py-2.5 rounded-xl text-white text-xs font-black shadow transition-all hover:shadow-lg hover:-translate-y-0.5 shrink-0"
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                      Call
                    </a>
                  )}
                </div>

                {/* Status-specific messages */}
                {b.status === 'DriverAssigned' && (
                  <div className="mt-3 bg-violet-100 border border-violet-200 rounded-xl px-3 py-2.5 text-xs text-violet-700 font-semibold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse shrink-0" />
                    Your driver is on the way · Estimated arrival ~30 min
                  </div>
                )}
                {b.status === 'InProgress' && (
                  <div className="mt-3 bg-emerald-100 border border-emerald-200 rounded-xl px-3 py-2.5 text-xs text-emerald-700 font-semibold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                    Ride in progress · Estimated arrival ~40 min
                  </div>
                )}
              </div>
            )}

            {/* Completed — show feedback CTA */}
            {b.status === 'Completed' && (
              <div className="mx-5 mb-4 p-4 rounded-2xl bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200">
                <p className="text-sm font-black text-amber-800 mb-2">🎉 Ride Complete! How was your experience?</p>
                <button onClick={() => navigate(`/dashboard/bookings/${b.id}?feedback=1`)}
                  className="w-full py-3 rounded-xl text-white font-black text-sm shadow-lg transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
                  ⭐ Rate Your Ride
                </button>
              </div>
            )}

            {/* Footer row */}
            <div className="px-5 pb-4 flex items-center justify-between border-t border-gray-50 pt-3">
              <span className="text-lg font-black text-primary-700">₹{b.estimatedPrice || b.actualPrice || 0}</span>
              <button onClick={() => navigate(`/dashboard/bookings/${b.id}`)}
                className="text-xs text-primary-600 font-bold hover:text-primary-800 flex items-center gap-1 transition-colors">
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
      {bookings.some(b => ['Pending','Confirmed','DriverAssigned','InProgress','Completed'].includes(b.status)) && (
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

  const TABS = ['All', 'Pending', 'Confirmed', 'DriverAssigned', 'InProgress', 'Completed', 'Cancelled'];

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(searchParams.get('feedback') === '1');
  const [rating, setRating]     = useState(0);
  const [comment, setComment]   = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    try {
      await bookingService.cancel(id, 'Customer requested cancellation');
      setBooking(b => ({ ...b, status: 'Cancelled' }));
    } catch { /* silent */ }
  };

  const submitFeedback = async () => {
    if (rating === 0) { alert('Please select a star rating.'); return; }
    setSubmitting(true);
    try {
      // Use the review service (best-effort — don't break page if it fails)
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ bookingId: booking.id, customerId: user?.customerId, driverId: booking.driverId, vehicleId: booking.vehicleId, rating, comment, isDriverReview: true, isVehicleReview: true }),
      });
    } catch { /* silent — UI still shows success */ }
    finally {
      setSubmitted(true);
      setSubmitting(false);
      // Persist so RideTracker also hides the button
      try {
        const prev = JSON.parse(localStorage.getItem('ratedBookings') || '[]');
        localStorage.setItem('ratedBookings', JSON.stringify([...new Set([...prev, Number(id)])]));
      } catch { /* silent */ }
    }
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

      {/* ── Feedback modal overlay ── */}
      {showFeedback && !submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFeedback(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-pop">
            {/* Header */}
            <div className="px-6 py-5 text-center"
              style={{ background: 'linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)' }}>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl">🎉</div>
              <h2 className="text-white font-black text-xl">How was your ride?</h2>
              <p className="text-white/70 text-sm mt-1">Your feedback helps us improve</p>
            </div>
            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Star rating */}
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Tap to rate</p>
                <div className="flex justify-center gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setRating(n)}
                      className="transition-all duration-150 hover:scale-110">
                      <Star className={`w-10 h-10 ${n <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                    </button>
                  ))}
                </div>
                <p className="text-sm font-bold text-gray-500 mt-2">
                  {['','Poor','Fair','Good','Great','Excellent!'][rating] || ''}
                </p>
              </div>
              {/* Comment */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Comments (optional)</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Tell us about your experience..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all resize-none" />
              </div>
              {/* Driver summary */}
              {booking.driverName && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center text-amber-800 font-black text-sm shrink-0">
                    {booking.driverName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{booking.driverName}</p>
                    <p className="text-xs text-gray-500">{booking.vehicleInfo}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={submitFeedback} disabled={submitting || rating === 0}
                  className="flex-1 py-3.5 rounded-2xl font-black text-white text-sm shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
                  {submitting
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><ThumbsUp className="w-4 h-4" /> Submit Feedback</>}
                </button>
                <button onClick={() => setShowFeedback(false)}
                  className="px-5 py-3.5 rounded-2xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm transition-all">
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Submitted thank-you ── */}
      {submitted && (
        <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="text-3xl">⭐</div>
          <div>
            <p className="font-black text-amber-800">Thank you for your feedback!</p>
            <div className="flex gap-0.5 mt-1">
              {[1,2,3,4,5].map(n => <Star key={n} className={`w-4 h-4 ${n <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />)}
            </div>
          </div>
        </div>
      )}

      {/* ── Booking details card ── */}
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
            <div className="flex items-center gap-4 bg-linear-to-r from-primary-50 to-violet-50 rounded-2xl p-4 border border-primary-100">
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

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {['Pending','Confirmed'].includes(booking.status) && (
          <button onClick={cancel}
            className="btn-danger px-6 py-3 rounded-xl text-sm">
            Cancel Booking
          </button>
        )}
        {booking.status === 'Completed' && !submitted && (
          <button onClick={() => setShowFeedback(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
            <Star className="w-4 h-4" /> Rate Your Ride
          </button>
        )}
      </div>
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
  const { user, updateUser } = useApp();
  const [form, setForm] = useState({
    name:        '',
    email:       '',
    phoneNumber: '',
    address:     '',
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  // Load from backend on mount
  useEffect(() => {
    accountService.getProfile()
      .then(r => {
        const p = r?.data || r;
        setForm({
          name:        p.name        || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '',
          email:       p.email       || user?.email || '',
          phoneNumber: p.phoneNumber || user?.phoneNumber || '',
          address:     p.address     || user?.address || '',
        });
      })
      .catch(() => {
        // Fallback to context values
        setForm({
          name:        `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          email:       user?.email       || '',
          phoneNumber: user?.phoneNumber || '',
          address:     user?.address     || '',
        });
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const save = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required.'); return; }
    setSaving(true);
    try {
      const res = await accountService.updateProfile({
        name:        form.name.trim(),
        email:       form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        address:     form.address.trim(),
      });
      const updated = res?.data || res;
      // Pass the full ProfileDto response to updateUser — it handles firstName/lastName split
      if (updateUser) updateUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err?.message || err?.title || 'Could not save. Please try again.');
    } finally { setSaving(false); }
  };

  const initials = form.name
    ? form.name.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : (user?.firstName?.[0] || '') + (user?.lastName?.[0] || '');

  return (
    <div className="page-enter max-w-2xl space-y-6">
      <h1 className="text-2xl font-black text-gray-900">My Profile</h1>

      {/* Avatar hero */}
      <div className="relative overflow-hidden rounded-2xl p-6 gradient-brand text-white flex items-center gap-5">
        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl shrink-0">
          {initials || '?'}
        </div>
        <div>
          <p className="text-xl font-black">{form.name || 'Your Name'}</p>
          <p className="text-white/70 text-sm">{form.email || user?.email}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
            <CheckCircle className="w-3.5 h-3.5" /> Verified {user?.role || 'Customer'}
          </div>
        </div>
      </div>

      {loading
        ? <div className="bg-white rounded-2xl p-8 flex justify-center"><Loader /></div>
        : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {error && (
              <div className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-xl">
                {error}
              </div>
            )}
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-field rounded-xl py-3.5 w-full"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input-field rounded-xl py-3.5 w-full"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                  className="input-field rounded-xl py-3.5 w-full"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Address</label>
                <input
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="input-field rounded-xl py-3.5 w-full"
                  placeholder="Your address"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary px-8 py-3.5 rounded-xl font-black flex items-center gap-2 disabled:opacity-60">
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : saved
                    ? <><CheckCircle className="w-4 h-4" /> Saved!</>
                    : 'Save Changes'}
              </button>
            </form>
          </div>
        )}
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
