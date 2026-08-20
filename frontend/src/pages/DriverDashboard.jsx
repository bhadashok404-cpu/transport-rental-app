import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Car, User, LogOut, Bell, TrendingUp,
  CheckCircle, MapPin, Sparkles, Activity, DollarSign, Clock, ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { bookingService } from '../services';
import { Badge, Loader, EmptyState } from '../components';

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function DriverSidebar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const links = [
    { to: '/driver',               label: 'Overview',       icon: LayoutDashboard },
    { to: '/driver/trips',         label: 'My Trips',       icon: Car },
    { to: '/driver/notifications', label: 'Notifications',  icon: Bell },
    { to: '/driver/earnings',      label: 'Earnings',       icon: TrendingUp },
    { to: '/driver/profile',       label: 'Profile',        icon: User },
  ];

  const isActive = t => t === '/driver' ? pathname === t : pathname.startsWith(t);

  return (
    <aside className="h-full flex flex-col py-0 px-0" style={{ background: 'linear-gradient(180deg,#0f172a,#1c1917 50%,#14532d 100%)' }}>

      <nav className="flex-1 p-3 pt-4 space-y-0.5">
        <p className="px-3 mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/25">Menu</p>
        {links.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to}
            className={`sidebar-link ${isActive(to) ? 'active' : ''}`}
            style={isActive(to) ? { background: 'rgba(16,185,129,0.15)', boxShadow: 'inset 3px 0 0 #10b981', color: '#6ee7b7' } : {}}>
            <Icon className="w-4 h-4 shrink-0" />{label}
          </Link>
        ))}
      </nav>

      <div className="px-1 pt-4 border-t border-white/10">
        <button onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-rose-400 hover:bg-rose-500/10 transition-all">
          <LogOut className="w-4 h-4" />Exit Portal
        </button>
      </div>
    </aside>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function DriverStat({ label, value, icon: Icon, gradient }) {
  return (
    <div className={`card-stat text-white shadow-xl ${gradient}`}>
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 shadow">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-3xl font-black">{value}</p>
      <p className="text-white/70 text-xs font-bold uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}

// ─── Overview ────────────────────────────────────────────────────────────────
function DriverOverview() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.driverId) { setLoading(false); return; }
    bookingService.getByDriver(user.driverId, { pageSize: 50 })
      .then(r => setBookings(r?.data?.items || r?.data || r?.items || r || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.driverId]);

  const completed = bookings.filter(b => b.status === 'Completed').length;
  const upcoming  = bookings.filter(b => b.status === 'Confirmed').length;
  const active    = bookings.filter(b => b.status === 'InProgress').length;
  const earnings  = bookings.filter(b => b.status === 'Completed').reduce((s, b) => s + (b.actualPrice || b.estimatedPrice || 0), 0);

  return (
    <div className="page-enter space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Driver Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.firstName || 'Driver'}!</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-700 text-sm font-bold">Online</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DriverStat label="Total Trips"   value={bookings.length} icon={Car}         gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <DriverStat label="Upcoming"      value={upcoming}        icon={Clock}       gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
        <DriverStat label="Completed"     value={completed}       icon={CheckCircle} gradient="bg-gradient-to-br from-violet-500 to-violet-600" />
        <DriverStat label="Earnings ₹"   value={`₹${earnings.toLocaleString()}`} icon={TrendingUp} gradient="bg-gradient-to-br from-amber-500 to-orange-500" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-black text-gray-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />Assigned Trips
          </h2>
          <Link to="/driver/trips" className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? <div className="p-8"><Loader /></div>
          : bookings.length === 0
            ? <EmptyState icon={Car} title="No trips yet" description="New trips will appear here" />
            : <div className="divide-y divide-gray-50">
                {bookings.slice(0,5).map(b => (
                  <div key={b.id} className="flex items-center gap-4 px-6 py-4 hover:bg-emerald-50/30 transition-colors">
                    <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shrink-0">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{b.pickupLocation} → {b.dropLocation}</p>
                      <p className="text-xs text-gray-400">{new Date(b.pickupDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-black text-emerald-700 text-sm">₹{b.estimatedPrice||0}</span>
                      <Badge status={b.status} />
                    </div>
                  </div>
                ))}
              </div>}
      </div>
    </div>
  );
}

// ─── Trips list ───────────────────────────────────────────────────────────────
function DriverTrips() {
  const { user } = useApp();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.driverId) { setLoading(false); return; }
    bookingService.getByDriver(user.driverId, { pageSize: 100 })
      .then(r => setBookings(r?.data?.items || r?.data || r?.items || r || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.driverId]);

  return (
    <div className="page-enter space-y-6">
      <h1 className="text-2xl font-black text-gray-900">My Trips</h1>
      {loading ? <Loader />
        : bookings.length === 0
          ? <EmptyState icon={Car} title="No trips assigned" description="New trips will appear here." />
          : <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-50">
                {bookings.map(b => (
                  <div key={b.id} className="px-6 py-4 hover:bg-emerald-50/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Trip #{b.id}</p>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{b.pickupLocation} → {b.dropLocation}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(b.pickupDate).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-lg font-black text-emerald-700">₹{b.estimatedPrice||0}</span>
                        <Badge status={b.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>}
    </div>
  );
}

// ─── Driver Notifications ─────────────────────────────────────────────────────
function DriverNotifications() {
  const { notifications, markNotificationRead, loadNotifications } = useApp();
  useEffect(() => { loadNotifications(); }, []);
  return (
    <div className="page-enter space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Notifications</h1>
      {notifications.length === 0
        ? <EmptyState icon={Bell} title="All caught up!" description="No notifications right now." />
        : <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {notifications.map(n => (
              <div key={n.id} onClick={() => !n.isRead && markNotificationRead(n.id)}
                className={`flex items-start gap-4 p-5 cursor-pointer transition-all duration-200 ${!n.isRead ? 'bg-emerald-50/40 hover:bg-emerald-50' : 'hover:bg-gray-50'}`}>
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.isRead ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>}
    </div>
  );
}

// ─── Driver Earnings ──────────────────────────────────────────────────────────
function DriverEarnings() {
  const { user } = useApp();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user?.driverId) { setLoading(false); return; }
    bookingService.getByDriver(user.driverId, { pageSize: 100 })
      .then(r => setBookings(r?.data?.items || r?.data || r?.items || r || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, [user?.driverId]);
  const completed = bookings.filter(b => b.status === 'Completed');
  const total     = completed.reduce((s, b) => s + (b.actualPrice || b.estimatedPrice || 0), 0);
  const thisMonth = completed.filter(b => new Date(b.pickupDate).getMonth() === new Date().getMonth()).reduce((s, b) => s + (b.actualPrice || b.estimatedPrice || 0), 0);
  return (
    <div className="page-enter space-y-6">
      <h1 className="text-2xl font-black text-gray-900">My Earnings</h1>
      <div className="grid sm:grid-cols-3 gap-5">
        {[
          { label:'Total Earnings',   value:`₹${total.toLocaleString()}`,      gradient:'from-emerald-500 to-teal-600',  icon:DollarSign },
          { label:'This Month',       value:`₹${thisMonth.toLocaleString()}`,   gradient:'from-blue-500 to-blue-600',     icon:TrendingUp },
          { label:'Trips Completed',  value:completed.length,                   gradient:'from-violet-500 to-violet-600', icon:CheckCircle },
        ].map(({ label, value, gradient, icon: Icon }) => (
          <div key={label} className={`card-stat text-white bg-linear-to-br ${gradient} shadow-xl`}>
            <Icon className="w-6 h-6 mb-3 opacity-80" />
            <p className="text-3xl font-black">{value}</p>
            <p className="text-white/70 text-xs font-bold uppercase tracking-wide mt-1">{label}</p>
          </div>
        ))}
      </div>
      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 font-black text-gray-900">Earnings History</div>
          {completed.length === 0
            ? <EmptyState icon={DollarSign} title="No earnings yet" description="Complete trips to see your earnings here." />
            : <div className="divide-y divide-gray-50">
                {completed.map(b => (
                  <div key={b.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Trip #{b.id}</p>
                      <p className="text-xs text-gray-400">{b.pickupLocation} → {b.dropLocation}</p>
                    </div>
                    <span className="font-black text-emerald-700 text-lg">₹{b.actualPrice || b.estimatedPrice || 0}</span>
                  </div>
                ))}
              </div>}
        </div>
      )}
    </div>
  );
}

// ─── Driver profile ───────────────────────────────────────────────────────────
function DriverProfile() {
  const { user } = useApp();
  const [form, setForm] = useState({ firstName: user?.firstName||'', lastName: user?.lastName||'', email: user?.email||'', phoneNumber: user?.phoneNumber||'', address: user?.address||'' });
  const [saved, setSaved] = useState(false);
  const save = e => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="page-enter max-w-2xl space-y-6">
      <h1 className="text-2xl font-black text-gray-900">My Profile</h1>

      {/* Hero card */}
      <div className="relative overflow-hidden rounded-2xl p-7 text-white flex flex-col sm:flex-row items-start sm:items-center gap-5"
        style={{ background: 'linear-gradient(135deg,#064e3b 0%,#059669 50%,#0d9488 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl shrink-0 relative">
          {(user?.firstName||'D')[0]}{(user?.lastName||'')[0]}
        </div>
        <div className="relative">
          <p className="text-2xl font-black">{user?.firstName} {user?.lastName}</p>
          <p className="text-white/65 text-sm">{user?.email}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
              ⭐ {user?.rating || '4.5'} Rating
            </span>
            <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
              🚗 {user?.totalTrips || 0} Trips
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-200">
              ✓ Verified Driver
            </span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full bg-linear-to-b from-emerald-500 to-teal-600" />
          <h2 className="font-black text-gray-900">Edit Information</h2>
        </div>
        <form onSubmit={save} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[['firstName','First Name'],['lastName','Last Name']].map(([k,l]) => (
              <div key={k}>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{l}</label>
                <input value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} className="input-field rounded-xl py-3.5" />
              </div>
            ))}
          </div>
          {[['email','Email','email'],['phoneNumber','Phone','tel'],['address','Address','text']].map(([k,l,t]) => (
            <div key={k}>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{l}</label>
              <input type={t} value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} className="input-field rounded-xl py-3.5" />
            </div>
          ))}
          {user?.licenseNumber && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">License Number</label>
              <input value={user.licenseNumber} readOnly className="input-field rounded-xl py-3.5 bg-gray-50 cursor-not-allowed text-gray-400" />
            </div>
          )}
          <button type="submit"
            className="w-full py-4 rounded-xl font-black text-white transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
            {saved ? '✓ Profile Saved!' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
export default function DriverDashboard() {
  const { user } = useApp();
  const navigate = useNavigate();
  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);
  if (!user) return null;

  return (
    <div className="flex min-h-screen pt-16">
      <div className="hidden lg:block w-64 fixed left-0 top-16 bottom-0 z-20">
        <DriverSidebar />
      </div>
      <main className="flex-1 lg:ml-64 p-6 sm:p-8 bg-slate-50 min-h-screen">
        <Routes>
          <Route index           element={<DriverOverview />} />
          <Route path="trips"    element={<DriverTrips />} />
          <Route path="notifications" element={<DriverNotifications />} />
          <Route path="earnings" element={<DriverEarnings />} />
          <Route path="profile"  element={<DriverProfile />} />
        </Routes>
      </main>
    </div>
  );
}
