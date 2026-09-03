import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Car, User, LogOut, Bell, TrendingUp,
  CheckCircle, MapPin, Sparkles, DollarSign,
  Clock, ChevronRight, X, Plus, Users, Calendar,
  Zap, Star, PawPrint, Wind, AlertCircle, Leaf
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { bookingService, carpoolService, vehicleService, accountService } from '../services';
import { Badge, Loader, EmptyState, DashShell } from '../components';
import toast from 'react-hot-toast';

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function DriverSidebar() {
  const { logout } = useApp();
  const navigate   = useNavigate();
  const { pathname } = useLocation();

  const links = [
    { to: '/driver',               label: 'Overview',      icon: LayoutDashboard },
    { to: '/driver/rides',         label: 'My Rides',      icon: Users },
    { to: '/driver/trips',         label: 'My Trips',      icon: Car },
    { to: '/driver/notifications', label: 'Notifications', icon: Bell },
    { to: '/driver/earnings',      label: 'Earnings',      icon: TrendingUp },
    { to: '/driver/profile',       label: 'Profile',       icon: User },
  ];

  const isActive = t => t === '/driver' ? pathname === t : pathname.startsWith(t);

  return (
    <aside className="h-full flex flex-col"
      style={{ background: 'linear-gradient(180deg,#0f172a 0%,#1c1917 50%,#14532d 100%)' }}>
      <nav className="flex-1 p-3 pt-12 space-y-0.5">
        <p className="px-3 mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/25">Menu</p>
        {links.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to}
            className="sidebar-link"
            style={isActive(to)
              ? { background: 'rgba(16,185,129,0.15)', boxShadow: 'inset 3px 0 0 #10b981', color: '#6ee7b7' }
              : {}}>
            <Icon className="w-4 h-4 shrink-0" />{label}
          </Link>
        ))}
      </nav>
      <div className="px-3 pb-4 pt-3 border-t border-white/10">
        <button onClick={() => { logout(); navigate('/login'); }}
          className="sidebar-link w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function DStat({ label, value, icon: Icon, gradient }) {
  return (
    <div className={`card-stat text-white shadow-xl bg-linear-to-br ${gradient}`}>
      <Icon className="w-5 h-5 mb-3 opacity-80" />
      <p className="text-3xl font-black">{value}</p>
      <p className="text-white/70 text-xs font-bold uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}

// ─── Ride Detail Modal ────────────────────────────────────────────────────────
function RideDetailModal({ req, onClose, onRespond, responding }) {
  if (!req) return null;
  return (
    /* Centered fixed overlay — independent of page layout, footer can't affect it */
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-20">
      {/* No background — clean transparent */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl animate-pop">

        {/* Header */}
        <div className="relative overflow-hidden px-5 py-4"
          style={{ background: 'linear-gradient(135deg,#2563eb 0%,#7c3aed 60%,#db2777 100%)' }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px,white 1px,transparent 0)', backgroundSize: '20px 20px' }} />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest">New Ride Request</p>
              <h2 className="text-white font-black text-xl mt-0.5">Ride #{req.bookingId}</h2>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Route */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pickup</p>
                <p className="text-gray-900 font-bold text-sm mt-0.5">{req.pickupLocation}</p>
              </div>
            </div>
            <div className="ml-1 w-px h-4 bg-gray-200" />
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Drop</p>
                <p className="text-gray-900 font-bold text-sm mt-0.5">{req.dropLocation}</p>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Date',     value: new Date(req.pickupDate).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'}) },
              { label: 'Fare',     value: `₹${req.estimatedPrice}` },
              { label: 'Vehicle',  value: req.vehicleInfo || '—' },
              { label: 'Customer', value: req.customerName || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
                <p className="text-gray-900 font-bold text-sm mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Customer phone */}
          {req.customerPhone && (
            <a href={`tel:${req.customerPhone}`}
              className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3 hover:bg-blue-100 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-blue-600 text-base">📞</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Customer Phone</p>
                <p className="text-blue-700 font-bold text-sm">{req.customerPhone}</p>
              </div>
              <span className="ml-auto text-xs font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">Call</span>
            </a>
          )}

          <p className="text-center text-xs text-gray-400">
            Once accepted, the customer and admin will be notified immediately.
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button disabled={!!responding} onClick={() => onRespond(true)}
              className="flex-1 py-4 rounded-2xl font-black text-white text-sm shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
              {responding === 'accept'
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : '🚗 Accept & Pickup Customer'}
            </button>
            <button disabled={!!responding} onClick={() => onRespond(false)}
              className="px-5 py-4 rounded-2xl font-bold text-rose-600 bg-rose-50 border-2 border-rose-200 hover:bg-rose-100 transition-all disabled:opacity-60 text-sm whitespace-nowrap">
              {responding === 'reject'
                ? <span className="w-4 h-4 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin inline-block" />
                : '✕ Reject'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

}

// ─── Overview ─────────────────────────────────────────────────────────────────
function DriverOverview() {
  const { user } = useApp();
  const [bookings,   setBookings]   = useState([]);
  const [requests,   setRequests]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [openReq,    setOpenReq]    = useState(null);  // the request whose modal is open
  const [responding, setResponding] = useState(null);  // 'accept' | 'reject' | null

  const loadBookings = useCallback(async () => {
    if (!user?.driverId) { setLoading(false); return; }
    try {
      const r = await bookingService.getByDriver(user.driverId, { pageSize: 100 });
      setBookings(r?.data?.items || r?.data || r?.items || r || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [user?.driverId]);

  const loadRequests = useCallback(async () => {
    if (!user?.driverId) return;
    try {
      const r = await bookingService.getDriverRequests(user.driverId);
      const list = r?.data || r?.items || r || [];
      setRequests(Array.isArray(list) ? list : []);
    } catch { setRequests([]); }
  }, [user?.driverId]);

  useEffect(() => {
    loadBookings();
    loadRequests();
    const t = setInterval(() => { loadBookings(); loadRequests(); }, 10000);
    return () => clearInterval(t);
  }, [loadBookings, loadRequests]);

  const handleRespond = async (accept) => {
    if (!openReq) return;
    setResponding(accept ? 'accept' : 'reject');
    try {
      // First try the ride-request respond endpoint (works when there's a pending RideRequest row)
      // If that fails, fall back to direct booking status update
      try {
        await bookingService.respondToRequest(openReq.id, user.driverId, accept);
      } catch {
        // Fallback: if accept, start the trip; if reject, cancel with reason
        if (accept) {
          await bookingService.startTrip(openReq.bookingId);
        } else {
          await bookingService.cancel(openReq.bookingId, 'Driver declined this ride');
        }
      }
      toast.success(accept ? '🚗 Ride accepted! Head to pickup.' : 'Ride declined.');
      setOpenReq(null);
      await Promise.all([loadBookings(), loadRequests()]);
    } catch (err) {
      const msg = err?.message || err?.title || (typeof err === 'string' ? err : 'Could not respond. Try again.');
      toast.error(msg);
    } finally { setResponding(null); }
  };

  const completed = bookings.filter(b => b.status === 'Completed').length;
  const upcoming  = bookings.filter(b => ['Confirmed', 'DriverAssigned'].includes(b.status)).length;
  const earnings  = bookings
    .filter(b => b.status === 'Completed')
    .reduce((s, b) => s + (b.actualPrice || b.estimatedPrice || 0), 0);

  return (
    <div className="page-enter space-y-6">

      {/* Ride Detail Modal */}
      <RideDetailModal
        req={openReq}
        onClose={() => setOpenReq(null)}
        onRespond={handleRespond}
        responding={responding}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Driver Overview</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, {user?.firstName || user?.name || 'Driver'}!
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-700 text-sm font-bold">Online</span>
        </div>
      </div>

      {/* ── New ride assignments — shows "Open Ride" button only ── */}
      {requests.length > 0 && (
        <div className="rounded-2xl overflow-hidden shadow-xl"
          style={{ background: 'linear-gradient(135deg,#2563eb 0%,#7c3aed 60%,#db2777 100%)' }}>
          <div className="px-5 py-3 flex items-center gap-2 bg-black/10">
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shrink-0" />
            <p className="text-white font-black text-sm">
              {requests.length} New Ride Request{requests.length > 1 ? 's' : ''} — Action Required
            </p>
          </div>
          <div className="p-4 space-y-3">
            {requests.map(req => (
              <div key={req.id}
                className="bg-white/15 backdrop-blur rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-sm">Ride #{req.bookingId}</p>
                  <p className="text-white/75 text-xs mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {req.pickupLocation} → {req.dropLocation}
                  </p>
                  <p className="text-white/60 text-xs mt-0.5">
                    {new Date(req.pickupDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {' · '}₹{req.estimatedPrice}
                    {req.vehicleInfo && <span className="ml-2 opacity-80">· {req.vehicleInfo}</span>}
                  </p>
                </div>
                {/* Single "Open Ride" button */}
                <button
                  onClick={() => setOpenReq(req)}
                  className="px-6 py-3 bg-white text-primary-700 text-sm font-black rounded-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 shrink-0 flex items-center gap-2">
                  <Car className="w-4 h-4" /> Open Ride
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DStat label="Total Trips"  value={bookings.length} icon={Car}         gradient="from-emerald-500 to-teal-600" />
        <DStat label="Upcoming"     value={upcoming}        icon={Clock}       gradient="from-blue-500 to-blue-600" />
        <DStat label="Completed"    value={completed}       icon={CheckCircle} gradient="from-violet-500 to-violet-600" />
        <DStat label="Earnings ₹"   value={`₹${earnings.toLocaleString()}`}
          icon={TrendingUp} gradient="from-amber-500 to-orange-500" />
      </div>

      {/* Recent trips */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-black text-gray-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />All Trips
          </h2>
          <Link to="/driver/trips"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? <div className="p-8"><Loader /></div>
          : bookings.length === 0
            ? <EmptyState icon={Car} title="No trips yet" description="Assigned trips appear here" />
            : (
              <div className="divide-y divide-gray-50">
                {bookings.slice(0, 5).map(b => {
                  const isNewRide = b.status === 'DriverAssigned';
                  // Build a request-like object from booking so the modal works even without a requests entry
                  const reqFromBooking = {
                    id:              requests.find(r => r.bookingId === b.id)?.id ?? b.id,
                    bookingId:       b.id,
                    pickupLocation:  b.pickupLocation,
                    dropLocation:    b.dropLocation,
                    pickupDate:      b.pickupDate,
                    estimatedPrice:  b.estimatedPrice,
                    vehicleInfo:     b.vehicleInfo,
                    customerName:    b.customerName,
                    customerPhone:   b.customerPhone,
                  };
                  return (
                    <div key={b.id}
                      className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                        isNewRide
                          ? 'bg-linear-to-r from-violet-50 to-purple-50 border-l-4 border-violet-400'
                          : 'hover:bg-emerald-50/30'
                      }`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isNewRide
                          ? 'bg-linear-to-br from-violet-500 to-purple-600'
                          : 'bg-linear-to-br from-emerald-500 to-teal-600'
                      }`}>
                        <Car className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">
                          {b.pickupLocation} → {b.dropLocation}
                        </p>
                        {isNewRide ? (
                          <p className="text-xs font-black text-violet-600 flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse shrink-0" />
                            You have a new ride — action required!
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400">
                            {new Date(b.pickupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-black text-emerald-700 text-sm">₹{b.estimatedPrice || 0}</span>
                        {isNewRide ? (
                          <button
                            onClick={() => setOpenReq(reqFromBooking)}
                            className="px-4 py-2 text-xs font-black text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-1.5 whitespace-nowrap"
                            style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                            <Car className="w-3.5 h-3.5" /> View Ride
                          </button>
                        ) : (
                          <Badge status={b.status} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
      </div>
    </div>
  );
}

// ─── My Trips (with Start/Complete Trip actions) ──────────────────────────────
function DriverTrips() {
  const { user } = useApp();
  const [bookings,   setBookings]   = useState([]);
  const [requests,   setRequests]   = useState([]);   // pending ride requests
  const [loading,    setLoading]    = useState(true);
  const [acting,     setActing]     = useState(null);
  const [openReq,    setOpenReq]    = useState(null);
  const [responding, setResponding] = useState(null);

  const load = useCallback(async () => {
    if (!user?.driverId) { setLoading(false); return; }
    try {
      const [bRes, rRes] = await Promise.all([
        bookingService.getByDriver(user.driverId, { pageSize: 200 }),
        bookingService.getDriverRequests(user.driverId).catch(() => []),
      ]);
      setBookings(bRes?.data?.items || bRes?.data || bRes?.items || bRes || []);
      const rList = rRes?.data || rRes?.items || rRes || [];
      setRequests(Array.isArray(rList) ? rList : []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [user?.driverId]);

  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, [load]);

  const doAction = async (bookingId, action) => {
    setActing(bookingId + action);
    try {
      if (action === 'start')    await bookingService.startTrip(bookingId);
      if (action === 'complete') await bookingService.complete(bookingId, 0);
      toast.success(action === 'start' ? '🚗 Trip started!' : '✅ Trip completed!');
      await load();
    } catch (err) {
      toast.error(err?.message || err?.title || 'Action failed. Try again.');
    } finally { setActing(null); }
  };

  const handleRespond = async (accept) => {
    if (!openReq) return;
    setResponding(accept ? 'accept' : 'reject');
    try {
      try {
        await bookingService.respondToRequest(openReq.id, user.driverId, accept);
      } catch {
        // Fallback when no RideRequest row exists:
        // Accept = set status to InProgress (driver is starting the trip)
        // Reject = cancel the booking
        if (accept) {
          await bookingService.startTrip(openReq.bookingId);
        } else {
          await bookingService.cancel(openReq.bookingId, 'Driver declined this ride');
        }
      }
      toast.success(accept ? '🚗 Ride accepted! Head to pickup.' : 'Ride declined.');
      setOpenReq(null);
      await load();
    } catch (err) {
      toast.error(err?.message || err?.title || 'Could not respond. Try again.');
    } finally { setResponding(null); }
  };

  const STATUS_ACTIONS = {
    // DriverAssigned: only "View Ride" button shows — no Start Trip until driver accepts
    Confirmed:      { label: 'Start Trip',    action: 'start',    color: 'bg-blue-500 hover:bg-blue-600' },
    InProgress:     { label: 'Complete Trip', action: 'complete', color: 'bg-emerald-500 hover:bg-emerald-600' },
  };

  // Color coding per status
  const ROW_STYLE = {
    DriverAssigned: { border: 'border-l-violet-400', bg: 'bg-violet-50/40' },
    Confirmed:      { border: 'border-l-blue-400',   bg: 'bg-blue-50/40' },
    InProgress:     { border: 'border-l-emerald-400',bg: 'bg-emerald-50/40' },
    Completed:      { border: 'border-l-gray-200',   bg: '' },
    Cancelled:      { border: 'border-l-rose-300',   bg: 'bg-rose-50/20' },
  };

  return (
    <div className="page-enter space-y-6">
      {/* Modal */}
      <RideDetailModal
        req={openReq}
        onClose={() => setOpenReq(null)}
        onRespond={handleRespond}
        responding={responding}
      />

      <h1 className="text-2xl font-black text-gray-900">My Trips</h1>

      {loading ? <Loader />
        : bookings.length === 0
          ? <EmptyState icon={Car} title="No trips assigned" description="Your assigned trips will appear here." />
          : (
            <div className="space-y-4">
              {bookings.map(b => {
                const act  = STATUS_ACTIONS[b.status];
                const sty  = ROW_STYLE[b.status] || {};
                const req  = requests.find(r => r.bookingId === b.id);
                // Show "new ride" UI for ALL DriverAssigned bookings — don't require a pending request entry
                const isNew = b.status === 'DriverAssigned';
                const reqForModal = {
                  id:             req?.id ?? b.id,
                  bookingId:      b.id,
                  pickupLocation: b.pickupLocation,
                  dropLocation:   b.dropLocation,
                  pickupDate:     b.pickupDate,
                  estimatedPrice: b.estimatedPrice,
                  vehicleInfo:    b.vehicleInfo,
                  customerName:   b.customerName,
                  customerPhone:  b.customerPhone,
                };

                return (
                  <div key={b.id}
                    className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 overflow-hidden ${sty.border || 'border-l-gray-100'} ${sty.bg || ''}`}>

                    {/* NEW badge pulse strip */}
                    {isNew && (
                      <div className="bg-linear-to-r from-violet-600 to-purple-600 px-4 py-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse shrink-0" />
                        <span className="text-white text-xs font-black">New ride assigned — Action required!</span>
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="font-black text-gray-900 text-sm">Trip #{b.id}</span>
                            <Badge status={b.status} />
                          </div>
                          <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                            <MapPin className="w-3 h-3 shrink-0 text-emerald-500" />
                            <span className="font-semibold">{b.pickupLocation}</span>
                            <span className="text-gray-400 mx-1">→</span>
                            <span className="font-semibold text-gray-600">{b.dropLocation}</span>
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(b.pickupDate).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}
                          </p>

                          {/* Customer info */}
                          {b.customerName && (
                            <div className="mt-3 flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                              <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white font-black text-xs shrink-0">
                                {b.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900">{b.customerName}</p>
                                {b.customerPhone && (
                                  <a href={`tel:${b.customerPhone}`}
                                    className="text-xs text-primary-600 hover:text-primary-800 font-semibold flex items-center gap-1">
                                    📞 {b.customerPhone}
                                  </a>
                                )}
                              </div>
                              {b.vehicleInfo && (
                                <p className="text-xs text-gray-400 shrink-0">🚗 {b.vehicleInfo}</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="font-black text-emerald-700 text-lg">₹{b.estimatedPrice || 0}</span>
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            {/* "View Ride" opens the modal for DriverAssigned trips */}
                            {isNew && (
                              <button onClick={() => setOpenReq(reqForModal)}
                                className="px-4 py-2 text-white text-xs font-black rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-1.5"
                                style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                                <Car className="w-3.5 h-3.5" /> View Ride
                              </button>
                            )}
                            {/* Start / Complete action */}
                            {act && (
                              <button
                                disabled={!!acting}
                                onClick={() => doAction(b.id, act.action)}
                                className={`px-4 py-2 text-white text-xs font-black rounded-xl transition shadow-lg disabled:opacity-60 flex items-center gap-1.5 ${act.color}`}>
                                {acting === b.id + act.action
                                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  : act.label}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* InProgress progress bar */}
                      {b.status === 'InProgress' && (
                        <div className="mt-4 pt-4 border-t border-gray-50">
                          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                              Ride in progress
                            </span>
                            <span>Mark complete when done</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-linear-to-r from-emerald-500 to-teal-500 rounded-full w-3/5 animate-pulse" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
    </div>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────
function DriverNotifications() {
  const { notifications, markNotificationRead, loadNotifications } = useApp();
  useEffect(() => { loadNotifications(); }, []);

  return (
    <div className="page-enter space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Notifications</h1>
      {notifications.length === 0
        ? <EmptyState icon={Bell} title="All caught up!" description="No notifications right now." />
        : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {notifications.map(n => (
              <div key={n.id}
                onClick={() => !n.isRead && markNotificationRead(n.id)}
                className={`flex items-start gap-4 p-5 cursor-pointer transition-all ${!n.isRead ? 'bg-emerald-50/40 hover:bg-emerald-50' : 'hover:bg-gray-50'}`}>
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.isRead ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ─── Earnings ─────────────────────────────────────────────────────────────────
function DriverEarnings() {
  const { user } = useApp();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user?.driverId) { setLoading(false); return; }
    bookingService.getByDriver(user.driverId, { pageSize: 200 })
      .then(r => setBookings(r?.data?.items || r?.data || r?.items || r || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.driverId]);

  const completed = bookings.filter(b => b.status === 'Completed');
  const total     = completed.reduce((s, b) => s + (b.actualPrice || b.estimatedPrice || 0), 0);
  const thisMonth = completed
    .filter(b => new Date(b.pickupDate).getMonth() === new Date().getMonth())
    .reduce((s, b) => s + (b.actualPrice || b.estimatedPrice || 0), 0);

  return (
    <div className="page-enter space-y-6">
      <h1 className="text-2xl font-black text-gray-900">My Earnings</h1>
      <div className="grid sm:grid-cols-3 gap-5">
        <DStat label="Total Earnings"  value={`₹${total.toLocaleString()}`}      gradient="from-emerald-500 to-teal-600"  icon={DollarSign} />
        <DStat label="This Month"      value={`₹${thisMonth.toLocaleString()}`}  gradient="from-blue-500 to-blue-600"     icon={TrendingUp} />
        <DStat label="Trips Completed" value={completed.length}                   gradient="from-violet-500 to-violet-600" icon={CheckCircle} />
      </div>
      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 font-black text-gray-900">
            Earnings History
          </div>
          {completed.length === 0
            ? <EmptyState icon={DollarSign} title="No earnings yet" description="Complete trips to see earnings here." />
            : (
              <div className="divide-y divide-gray-50">
                {completed.map(b => (
                  <div key={b.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Trip #{b.id}</p>
                      <p className="text-xs text-gray-400">{b.pickupLocation} → {b.dropLocation}</p>
                    </div>
                    <span className="font-black text-emerald-700 text-lg">
                      ₹{b.actualPrice || b.estimatedPrice || 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
function DriverProfile() {
  const { user, updateUser } = useApp();
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    accountService.getProfile()
      .then(r => {
        const p = r?.data || r;
        setForm({
          name:        p.name        || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          email:       p.email       || user?.email || '',
          phoneNumber: p.phoneNumber || user?.phoneNumber || '',
          address:     p.address     || user?.address || '',
        });
      })
      .catch(() => {
        setForm({
          name:        `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          email:       user?.email       || '',
          phoneNumber: user?.phoneNumber || '',
          address:     user?.address     || '',
        });
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const save = async e => {
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
      if (updateUser) updateUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err?.message || err?.title || 'Could not save. Please try again.');
    } finally { setSaving(false); }
  };

  const initials = form.name
    ? form.name.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : ((user?.firstName || 'D')[0] + (user?.lastName || '')[0]).toUpperCase();

  return (
    <div className="page-enter max-w-2xl space-y-6">
      <h1 className="text-2xl font-black text-gray-900">My Profile</h1>

      {/* Hero card */}
      <div className="relative overflow-hidden rounded-2xl p-7 text-white flex flex-col sm:flex-row items-start sm:items-center gap-5"
        style={{ background: 'linear-gradient(135deg,#064e3b 0%,#059669 50%,#0d9488 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px,white 1px,transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl shrink-0 relative">
          {initials || 'D'}
        </div>
        <div className="relative">
          <p className="text-2xl font-black">{form.name || user?.firstName}</p>
          <p className="text-white/65 text-sm">{form.email || user?.email}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">⭐ {user?.rating || '4.5'} Rating</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">🚗 {user?.totalTrips || 0} Trips</span>
            <span className="bg-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-200">✓ Verified Driver</span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom,#059669,#0d9488)' }} />
          <h2 className="font-black text-gray-900">Edit Information</h2>
        </div>
        {loading
          ? <div className="p-8 flex justify-center"><Loader /></div>
          : (
            <form onSubmit={save} className="p-6 space-y-4">
              {error && (
                <div className="px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-xl">{error}</div>
              )}
              {[
                { k: 'name',        l: 'Full Name',      t: 'text',  ph: 'Your full name',       req: true },
                { k: 'email',       l: 'Email',          t: 'email', ph: 'your@email.com',        req: true },
                { k: 'phoneNumber', l: 'Phone',          t: 'tel',   ph: '+91 98765 43210' },
                { k: 'address',     l: 'Address',        t: 'text',  ph: 'Your address' },
              ].map(({ k, l, t, ph, req }) => (
                <div key={k}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{l}</label>
                  <input
                    type={t} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                    placeholder={ph} required={!!req}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                  />
                </div>
              ))}
              {user?.licenseNumber && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">License Number</label>
                  <input value={user.licenseNumber} readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400 cursor-not-allowed" />
                </div>
              )}
              <button type="submit" disabled={saving}
                className="w-full py-4 rounded-xl font-black text-white transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : saved ? '✓ Profile Saved!' : 'Save Changes'}
              </button>
            </form>
          )}
      </div>
    </div>
  );
}

// ─── Driver Rides (Post Offer + My Offers) ───────────────────────────────────
const todayStr = () => new Date().toISOString().slice(0, 16); // datetime-local

function DriverRides() {
  const { user } = useApp();
  const navigate = useNavigate();
  const driverId = user?.driverId;

  // ── Post ride form state ───────────────────────────────────────────────────
  const [tab, setTab] = useState('offers');       // 'offers' | 'post'
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    vehicleId: '',
    originCity: '',
    destinationCity: '',
    originAddress: '',
    destinationAddress: '',
    departureTime: '',
    estimatedDurationMinutes: '',
    estimatedDistanceKm: '',
    totalSeats: 1,
    pricePerSeat: '',
    description: '',
    instantBooking: true,
    smokingAllowed: false,
    petsAllowed: false,
  });

  // ── My offers state ────────────────────────────────────────────────────────
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const ff = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Load driver's vehicles
  useEffect(() => {
    vehicleService.getAll({ pageSize: 50 })
      .then(r => {
        const all = r?.data?.items || r?.data || r?.items || [];
        // Only vehicles assigned to this driver
        const mine = all.filter(v => v.currentDriverId === driverId || !v.currentDriverId);
        setVehicles(Array.isArray(mine) ? mine : []);
      })
      .catch(() => setVehicles([]))
      .finally(() => setLoadingVehicles(false));
  }, [driverId]);

  // Load driver's ride offers
  const loadOffers = useCallback(async () => {
    if (!driverId) { setLoadingOffers(false); return; }
    setLoadingOffers(true);
    try {
      const r = await carpoolService.getDriverRides(driverId);
      const list = r?.data?.items || r?.data || r?.items || r || [];
      setOffers(Array.isArray(list) ? list : []);
    } catch { setOffers([]); }
    finally { setLoadingOffers(false); }
  }, [driverId]);

  useEffect(() => { loadOffers(); }, [loadOffers]);

  // Post new offer
  const handlePost = async (e) => {
    e.preventDefault();
    if (!form.vehicleId)     { toast.error('Select a vehicle'); return; }
    if (!form.originCity)    { toast.error('Enter origin city'); return; }
    if (!form.destinationCity) { toast.error('Enter destination city'); return; }
    if (!form.departureTime) { toast.error('Enter departure time'); return; }
    if (!form.pricePerSeat || Number(form.pricePerSeat) <= 0) { toast.error('Enter price per seat'); return; }

    setSubmitting(true);
    try {
      await carpoolService.createRide({
        ...form,
        vehicleId:               Number(form.vehicleId),
        totalSeats:              Number(form.totalSeats),
        pricePerSeat:            Number(form.pricePerSeat),
        estimatedDurationMinutes: form.estimatedDurationMinutes ? Number(form.estimatedDurationMinutes) : null,
        estimatedDistanceKm:     form.estimatedDistanceKm ? Number(form.estimatedDistanceKm) : null,
        departureTime:           new Date(form.departureTime).toISOString(),
      });
      toast.success('Ride offer posted! 🎉');
      setForm({
        vehicleId: '', originCity: '', destinationCity: '',
        originAddress: '', destinationAddress: '', departureTime: '',
        estimatedDurationMinutes: '', estimatedDistanceKm: '',
        totalSeats: 1, pricePerSeat: '', description: '',
        instantBooking: true, smokingAllowed: false, petsAllowed: false,
      });
      setTab('offers');
      loadOffers();
    } catch (err) {
      toast.error(err?.message || err?.title || 'Failed to post ride');
    } finally { setSubmitting(false); }
  };

  const handleCancel = async (offerId) => {
    if (!window.confirm('Cancel this ride offer? All passenger bookings will be cancelled.')) return;
    setCancelling(offerId);
    try {
      await carpoolService.cancelRide(offerId);
      toast.success('Ride offer cancelled');
      setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'Cancelled' } : o));
    } catch (err) {
      toast.error(err?.message || 'Could not cancel');
    } finally { setCancelling(null); }
  };

  const STATUS_COLOR = { Active: 'badge-success', Full: 'badge-info', Cancelled: 'badge-error', Completed: 'badge-gray' };

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Ride Offers</h1>
          <p className="text-gray-500 text-sm mt-0.5">Post shared rides and manage your passengers</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab('offers')}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all
              ${tab === 'offers' ? 'gradient-brand text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
            <Users className="w-4 h-4 inline mr-1.5" />My Offers ({offers.filter(o => o.status === 'Active').length} active)
          </button>
          <button onClick={() => setTab('post')}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2
              ${tab === 'post' ? 'gradient-brand text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
            <Plus className="w-4 h-4" /> Post a Ride
          </button>
        </div>
      </div>

      {/* ── POST RIDE TAB ─────────────────────────────────────────────────── */}
      {tab === 'post' && (
        <form onSubmit={handlePost} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg,#064e3b,#059669)' }}>
            <Plus className="w-4 h-4 text-white" />
            <h2 className="font-black text-white">Post a New Ride Offer</h2>
          </div>

          <div className="p-6 space-y-5">
            {/* Vehicle select */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                Vehicle <span className="text-rose-500">*</span>
              </label>
              {loadingVehicles
                ? <p className="text-sm text-gray-400">Loading vehicles…</p>
                : vehicles.length === 0
                  ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 font-semibold">
                      No vehicles found. Ask your admin to assign a vehicle to your account.
                    </div>
                  )
                  : (
                    <select value={form.vehicleId} onChange={e => ff('vehicleId', e.target.value)} required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-400 transition-all">
                      <option value="">Select vehicle</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.make} {v.model} — {v.registrationNumber} ({v.seatingCapacity} seats)
                        </option>
                      ))}
                    </select>
                  )}
            </div>

            {/* Route */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* From City — autocomplete */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                  From (City) <span className="text-rose-500">*</span>
                </label>
                <LocationAutocomplete
                  value={form.originCity}
                  onChange={v => ff('originCity', v)}
                  placeholder="e.g. Pune"
                  pinColor="#10b981"
                />
              </div>

              {/* To City — autocomplete */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                  To (City) <span className="text-rose-500">*</span>
                </label>
                <LocationAutocomplete
                  value={form.destinationCity}
                  onChange={v => ff('destinationCity', v)}
                  placeholder="e.g. Mumbai"
                  pinColor="#ef4444"
                />
              </div>

              {/* Pickup Address — plain input */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                  Pickup Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-emerald-500" />
                  <input value={form.originAddress} onChange={e => ff('originAddress', e.target.value)}
                    placeholder="Detailed pickup point"
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-400 transition-all" />
                </div>
              </div>

              {/* Drop Address — plain input */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                  Drop Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-rose-500" />
                  <input value={form.destinationAddress} onChange={e => ff('destinationAddress', e.target.value)}
                    placeholder="Detailed drop point"
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-400 transition-all" />
                </div>
              </div>
            </div>

            {/* Departure + duration + distance */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                  Departure Time <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-500 pointer-events-none" />
                  <input type="datetime-local" value={form.departureTime}
                    onChange={e => ff('departureTime', e.target.value)}
                    min={todayStr()} required
                    className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-400 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Duration (mins)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <input type="number" min="1" value={form.estimatedDurationMinutes}
                    onChange={e => ff('estimatedDurationMinutes', e.target.value)}
                    placeholder="e.g. 180"
                    className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-400 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Distance (km)</label>
                <div className="relative">
                  <Leaf className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400 pointer-events-none" />
                  <input type="number" min="1" value={form.estimatedDistanceKm}
                    onChange={e => ff('estimatedDistanceKm', e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-400 transition-all" />
                </div>
              </div>
            </div>

            {/* Seats + price */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                  Seats to offer <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-500 pointer-events-none" />
                  <select value={form.totalSeats} onChange={e => ff('totalSeats', Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-400 transition-all appearance-none">
                    {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} seat{n>1?'s':''}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                  Price per seat (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-500 pointer-events-none" />
                  <input type="number" min="1" value={form.pricePerSeat}
                    onChange={e => ff('pricePerSeat', e.target.value)}
                    placeholder="e.g. 400" required
                    className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-400 transition-all" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Notes for passengers</label>
              <textarea value={form.description} onChange={e => ff('description', e.target.value)}
                rows={2} placeholder="e.g. I can drop at Dadar, Thane. No music."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-400 transition-all resize-none" />
            </div>

            {/* Preferences */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Preferences</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { k: 'instantBooking',  label: '⚡ Instant booking',   desc: 'Seats confirmed automatically' },
                  { k: 'smokingAllowed',  label: '🚬 Smoking allowed',   desc: 'Passengers can smoke' },
                  { k: 'petsAllowed',     label: '🐾 Pets allowed',      desc: 'Pets welcome in vehicle' },
                ].map(({ k, label, desc }) => (
                  <label key={k} className="flex items-center gap-3 cursor-pointer group bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 hover:border-emerald-300 transition-all">
                    <div onClick={() => ff(k, !form[k])}
                      className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${form[k] ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${form[k] ? 'left-5' : 'left-1'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting}
                className="flex-1 py-4 rounded-2xl font-black text-white text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
                {submitting
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Plus className="w-5 h-5" /> Post Ride Offer</>}
              </button>
              <button type="button" onClick={() => setTab('offers')}
                className="px-6 py-4 rounded-2xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── MY OFFERS TAB ──────────────────────────────────────────────── */}
      {tab === 'offers' && (
        loadingOffers
          ? <Loader />
          : offers.length === 0
            ? (
              <EmptyState
                icon={Users}
                title="No ride offers yet"
                description="Post your first ride and start earning back your fuel costs"
                actionLabel="Post a Ride"
                onAction={() => setTab('post')}
              />
            )
            : (
              <div className="space-y-4">
                {offers.map(offer => {
                  const dep = new Date(offer.departureTime);
                  const depStr = dep.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
                  const passengers = offer.passengers || [];
                  const confirmed = passengers.filter(p => p.status === 'Confirmed').length;

                  return (
                    <div key={offer.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                      <div className={`h-1.5 ${offer.status === 'Active' ? 'bg-emerald-400' : offer.status === 'Full' ? 'bg-blue-400' : offer.status === 'Completed' ? 'bg-gray-300' : 'bg-rose-300'}`} />
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0 space-y-2">
                            {/* Route */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-gray-900 text-lg">
                                {offer.originCity} → {offer.destinationCity}
                              </span>
                              <span className={`badge ${STATUS_COLOR[offer.status] || 'badge-gray'}`}>
                                {offer.status}
                              </span>
                            </div>
                            {/* Details row */}
                            <div className="grid sm:grid-cols-3 gap-x-4 gap-y-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-primary-400 shrink-0" /> {depStr}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                {offer.availableSeats}/{offer.totalSeats} seats available
                              </span>
                              <span className="flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                ₹{Math.round(offer.pricePerSeat)} / seat
                              </span>
                            </div>
                            {/* Vehicle */}
                            {offer.vehicleInfo && (
                              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                <Car className="w-3 h-3" /> {offer.vehicleInfo}
                              </p>
                            )}
                            {/* Passenger chips */}
                            {passengers.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-1">
                                {passengers.map(p => (
                                  <span key={p.carpoolBookingId}
                                    className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border
                                      ${p.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                    {p.customerName?.split(' ')[0]} · {p.seatsBooked} seat
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Actions */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className="text-xl font-black text-emerald-700">
                              ₹{Math.round(offer.pricePerSeat * (offer.totalSeats - offer.availableSeats))} earned
                            </span>
                            <p className="text-xs text-gray-400">{confirmed} confirmed passenger{confirmed !== 1 ? 's' : ''}</p>
                            {offer.status === 'Active' && (
                              <button disabled={cancelling === offer.id}
                                onClick={() => handleCancel(offer.id)}
                                className="text-xs font-bold text-rose-500 hover:text-rose-700 border border-rose-200 hover:border-rose-300 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
                                {cancelling === offer.id ? '…' : 'Cancel Ride'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
      )}
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
export default function DriverDashboard() {
  const { user } = useApp();
  const navigate  = useNavigate();

  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);
  if (!user) return null;

  return (
    <DashShell sidebar={DriverSidebar}>
      <Routes>
        <Route index                element={<DriverOverview />} />
        <Route path="rides"         element={<DriverRides />} />
        <Route path="trips"         element={<DriverTrips />} />
        <Route path="notifications" element={<DriverNotifications />} />
        <Route path="earnings"      element={<DriverEarnings />} />
        <Route path="profile"       element={<DriverProfile />} />
      </Routes>
    </DashShell>
  );
}
