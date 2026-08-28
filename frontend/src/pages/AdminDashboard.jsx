import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Car, Users, ClipboardList, ShieldPlus, LogOut,
  TrendingUp, ChevronRight, ChevronDown, Search, RefreshCw, CheckCircle,
  XCircle, Clock, Zap, Star, AlertCircle, UserCog, Truck,
  DollarSign, BarChart2, Activity, MapPin, Calendar,
  MoreVertical, Filter, Eye, Settings, Bell,
  ArrowUpRight, ArrowDownRight, Sparkles, Route as RouteIcon
} from 'lucide-react';
import { bookingService, driverService, vehicleService, userService, carpoolService } from '../services';
import { useApp } from '../context/AppContext';
import { Badge, Loader, EmptyState, DashShell } from '../components';
import CreateAdmin from './CreateAdmin';
import { getVehiclePrimaryImage } from '../utils/carImages';
import toast from 'react-hot-toast';

const listFrom = r => r?.data?.items || r?.data || r?.items || r || [];

// ─── Shared: status colour map ─────────────────────────────────────────────
const STATUS_DOT = {
  Pending:   'bg-amber-400',
  Confirmed: 'bg-blue-400',
  InProgress:'bg-violet-400',
  Completed: 'bg-emerald-400',
  Cancelled: 'bg-rose-400',
  Available: 'bg-emerald-400',
  Busy:      'bg-amber-400',
  Offline:   'bg-gray-400',
};

// ─── Mini sparkline (pure CSS bars) ───────────────────────────────────────────
function Sparkline({ values = [], color = '#3b82f6' }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm opacity-80 transition-all duration-500"
          style={{ height: `${(v / max) * 100}%`, background: color }} />
      ))}
    </div>
  );
}

// ─── Admin Sidebar ─────────────────────────────────────────────────────────────
function AdminSidebar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const NAV = [
    { to: '/admin',              label: 'Overview',        icon: LayoutDashboard, exact: true },
    { to: '/admin/rides',        label: 'Ride Operations', icon: ClipboardList },
    { to: '/admin/carpool',      label: 'Carpool Rides',   icon: RouteIcon },
    { to: '/admin/users',        label: 'All Users',       icon: Users },
    { to: '/admin/vehicles',     label: 'Vehicles',        icon: Car },
    { to: '/admin/drivers',      label: 'Drivers',         icon: Truck },
    { to: '/admin/create-admin', label: 'Create Admin',    icon: ShieldPlus },
  ];

  const active = ({ to, exact }) => exact ? pathname === to : pathname.startsWith(to) && to !== '/admin';
  const isOverview = pathname === '/admin';

  return (
    <aside className="h-full flex flex-col" style={{ background: 'linear-gradient(180deg,#020617 0%,#0f172a 40%,#1e1b4b 100%)' }}>

      {/* ── Brand logo (favicon aligned) ── */}
      {/* <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg shrink-0">
          <Car className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-black text-sm leading-none">RideRental</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-400 mt-0.5">Admin Console</p>
        </div>
      </div> */}

      {/* Nav */}
      <nav className="flex-1 px-3 mt-4 space-y-0.5">
        <p className="px-3 mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/25">Navigation</p>
        {NAV.map(item => {
          const isActive = item.exact ? isOverview : active(item);
          return (
            <Link key={item.to} to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                  : 'text-white/50 hover:text-white hover:bg-white/6'
              }`}>
              <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary-400' : ''}`} />
              {item.label}
              {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-5 mt-3 border-t border-white/5 pt-4 space-y-0.5">
        <Link to="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white hover:bg-white/6 transition-all">
          <UserCog className="w-4 h-4" />My Profile
        </Link>
        <button onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-all">
          <LogOut className="w-4 h-4" />Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── Top header bar (inside main) ─────────────────────────────────────────────
function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── KPI stat card ─────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, gradient, change, trend, spark }) {
  const up = trend === 'up';
  return (
    <div className={`card-stat text-white shadow-2xl bg-linear-to-br ${gradient} relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-x-4 -translate-y-8" />
      <div className="absolute bottom-0 right-4 w-16 h-16 bg-white/5 rounded-full translate-y-6" />

      <div className="relative flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${up ? 'bg-white/20 text-white' : 'bg-white/20 text-white'}`}>
            {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {change}
          </div>
        )}
      </div>

      <p className="relative text-4xl font-black mb-0.5">{value}</p>
      <p className="relative text-white/65 text-xs font-bold uppercase tracking-wider mb-3">{label}</p>

      {spark && <div className="relative opacity-70"><Sparkline values={spark} color="rgba(255,255,255,0.9)" /></div>}
    </div>
  );
}

// ─── OVERVIEW PAGE ─────────────────────────────────────────────────────────────
function Overview({ data }) {
  const navigate = useNavigate();
  const bookings = data.bookings;
  const total    = bookings.length;
  const pending  = bookings.filter(b => b.status === 'Pending').length;
  const active   = bookings.filter(b => ['Confirmed','InProgress'].includes(b.status)).length;
  const done     = bookings.filter(b => b.status === 'Completed').length;
  const revenue  = bookings.filter(b => b.status === 'Completed').reduce((s, b) => s + (b.actualPrice || b.estimatedPrice || 0), 0);
  const vehicles = data.vehicles.length;
  const drivers  = data.drivers.length;
  const customers = data.userDirectory?.customerCount || 0;

  // Simple sparkline mock (last 7 days pattern)
  const spark7 = [3,5,2,8,4,11,done || 6];

  const recentBookings = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 7);
  const availDrivers   = data.drivers.filter(d => d.status === 'Available').length;
  const busyDrivers    = data.drivers.filter(d => d.status === 'Busy').length;

  return (
    <div className="page-enter space-y-8">
      <PageHeader
        title="Command Center"
        subtitle="Real-time overview of operations, revenue, and fleet status."
        action={
          <button onClick={() => window.location.reload()} className="btn-ghost flex items-center gap-2 text-sm px-4 py-2 rounded-xl">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        }
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Total Revenue"     value={`₹${(revenue/1000).toFixed(1)}K`} icon={DollarSign}   gradient="from-emerald-500 to-teal-600"    trend="up"   change="+12%" spark={spark7} />
        <KpiCard label="Total Bookings"    value={total}      icon={ClipboardList}  gradient="from-blue-600 to-blue-700"       trend="up"   change="+8%"  spark={[2,4,3,7,5,9,total||4]} />
        <KpiCard label="Active Rides"      value={active}     icon={Activity}       gradient="from-violet-600 to-violet-700"   trend="up"   change="+3"   spark={[1,2,1,3,2,4,active||1]} />
        <KpiCard label="Pending"           value={pending}    icon={AlertCircle}    gradient="from-amber-500 to-orange-500"    trend="down" change={`-${pending}`} />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Customers"         value={customers}  icon={Users}          gradient="from-pink-500 to-rose-500"       />
        <KpiCard label="Vehicles"          value={vehicles}   icon={Car}            gradient="from-cyan-500 to-blue-500"       />
        <KpiCard label="Total Drivers"     value={drivers}    icon={Truck}          gradient="from-indigo-500 to-violet-600"   />
        <KpiCard label="Completed"         value={done}       icon={CheckCircle}    gradient="from-emerald-600 to-green-600"   />
      </div>

      {/* Two-column lower section */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Recent bookings — wide */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="font-black text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-500" />Recent Bookings
            </h2>
            <Link to="/admin/rides"
              className="text-xs font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1">
              All rides <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentBookings.length === 0
            ? <EmptyState icon={ClipboardList} title="No bookings yet" description="Customer bookings will appear here." />
            : <div className="divide-y divide-gray-50">
                {recentBookings.map(b => (
                  <div key={b.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/60 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/rides')}>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[b.status] || 'bg-gray-300'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">#{b.id} · {b.pickupLocation} → {b.dropLocation}</p>
                      <p className="text-xs text-gray-400">{b.customerName || 'Customer'} · {new Date(b.createdAt || b.pickupDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-black text-gray-900">₹{b.estimatedPrice || 0}</span>
                      <Badge status={b.status} />
                    </div>
                  </div>
                ))}
              </div>}
        </div>

        {/* Fleet status — narrow */}
        <div className="space-y-5">
          {/* Driver availability */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-black text-gray-900 text-sm mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-violet-500" />Driver Fleet
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Available', count: availDrivers, total: drivers, color: 'bg-emerald-500' },
                { label: 'On a Ride',  count: busyDrivers,  total: drivers, color: 'bg-amber-500' },
                { label: 'Offline',    count: Math.max(0, drivers - availDrivers - busyDrivers), total: drivers, color: 'bg-gray-300' },
              ].map(({ label, count, total: t, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                    <span>{label}</span><span>{count}/{t}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`}
                      style={{ width: t > 0 ? `${(count/t)*100}%` : '0%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-black text-gray-900 text-sm mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-500" />Booking Breakdown
            </h3>
            <div className="space-y-2.5">
              {[
                { label: 'Completed', count: done,    color: 'bg-emerald-500' },
                { label: 'Active',    count: active,  color: 'bg-blue-500' },
                { label: 'Pending',   count: pending, color: 'bg-amber-500' },
                { label: 'Cancelled', count: bookings.filter(b=>b.status==='Cancelled').length, color: 'bg-rose-500' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
                  <span className="text-xs text-gray-600 flex-1">{label}</span>
                  <span className="text-xs font-black text-gray-900">{count}</span>
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: total > 0 ? `${(count/total)*100}%` : '0%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── RIDE OPERATIONS PAGE ──────────────────────────────────────────────────────
// ─── RIDE STATUS META ─────────────────────────────────────────────────────────
const RIDE_STATUS_META = {
  Pending:        { color: 'bg-amber-400',   row: 'bg-amber-50/60',   text: 'text-amber-800',   border: 'border-l-amber-400',   icon: '⏳', label: 'Awaiting driver',    progress: 10 },
  Confirmed:      { color: 'bg-blue-500',    row: 'bg-blue-50/50',    text: 'text-blue-800',    border: 'border-l-blue-400',    icon: '✓',  label: 'Driver confirmed',   progress: 30 },
  DriverAssigned: { color: 'bg-violet-500',  row: 'bg-violet-50/50',  text: 'text-violet-800',  border: 'border-l-violet-400',  icon: '🚗', label: 'Driver on the way',  progress: 55 },
  InProgress:     { color: 'bg-emerald-500', row: 'bg-emerald-50/50', text: 'text-emerald-800', border: 'border-l-emerald-400', icon: '🟢', label: 'Ride in progress',   progress: 80 },
  Completed:      { color: 'bg-gray-400',    row: '',                 text: 'text-gray-600',    border: 'border-l-gray-300',    icon: '✅', label: 'Completed',          progress: 100 },
  Cancelled:      { color: 'bg-rose-400',    row: 'bg-rose-50/30',    text: 'text-rose-700',    border: 'border-l-rose-300',    icon: '✕',  label: 'Cancelled',          progress: 0 },
};

// Timeline steps
const TIMELINE_STEPS = [
  { key: 'Pending',        label: 'Booked',          icon: '📋' },
  { key: 'Confirmed',      label: 'Confirmed',        icon: '✓' },
  { key: 'DriverAssigned', label: 'Driver Assigned',  icon: '👤' },
  { key: 'InProgress',     label: 'On the Way',       icon: '🚗' },
  { key: 'Completed',      label: 'Completed',        icon: '🏁' },
];
const STEP_ORDER = { Pending: 0, Confirmed: 1, DriverAssigned: 2, InProgress: 3, Completed: 4, Cancelled: -1 };

function RideTimeline({ booking }) {
  const currentStep = STEP_ORDER[booking.status] ?? 0;
  const isCancelled = booking.status === 'Cancelled';
  return (
    <div className="px-4 pb-4 pt-2">
      {isCancelled ? (
        <div className="flex items-center gap-2 text-rose-600 text-xs font-bold bg-rose-50 rounded-xl px-3 py-2 border border-rose-200">
          ✕ Ride cancelled {booking.cancellationReason ? `· ${booking.cancellationReason}` : ''}
        </div>
      ) : (
        <div className="relative">
          {/* Track line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100" />
          <div
            className="absolute top-4 left-4 h-0.5 bg-primary-500 transition-all duration-700"
            style={{ width: `${currentStep > 0 ? (currentStep / (TIMELINE_STEPS.length - 1)) * (100 - 0) : 0}%` }}
          />
          <div className="relative flex justify-between">
            {TIMELINE_STEPS.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <div key={step.key} className="flex flex-col items-center gap-1" style={{ minWidth: 44 }}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-all
                    ${active ? 'border-primary-500 bg-primary-500 text-white shadow-lg shadow-primary-200 scale-110'
                      : done  ? 'border-primary-400 bg-primary-100 text-primary-600'
                      : 'border-gray-200 bg-white text-gray-300'}`}>
                    {active ? <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> : step.icon}
                  </div>
                  <p className={`text-[9px] font-bold text-center leading-tight max-w-10 ${active ? 'text-primary-700' : done ? 'text-gray-600' : 'text-gray-300'}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function RideOps({ data, refresh }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assigning, setAssigning] = useState(null);
  const [expanded, setExpanded] = useState(null);  // booking id with open timeline

  const statuses = ['All','Pending','Confirmed','DriverAssigned','InProgress','Completed','Cancelled'];
  const activeCount = data.bookings.filter(b => ['Pending','Confirmed','DriverAssigned','InProgress'].includes(b.status)).length;

  const drivers = data.drivers.filter(d => d.isActive);

  const allBookings = data.bookings;
  const filtered = allBookings
    .sort((a, b) => {
      // Active rides first, then by date desc
      const aLive = ['Pending','Confirmed','DriverAssigned','InProgress'].includes(a.status);
      const bLive = ['Pending','Confirmed','DriverAssigned','InProgress'].includes(b.status);
      if (aLive !== bLive) return aLive ? -1 : 1;
      return new Date(b.createdAt || b.pickupDate) - new Date(a.createdAt || a.pickupDate);
    })
    .filter(b => {
      const matchStatus = statusFilter === 'All' || b.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchSearch = !q || `${b.id} ${b.pickupLocation} ${b.dropLocation} ${b.customerName||''} ${b.driverName||''} ${b.vehicleInfo||''}`.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });

  const assign = async (bookingId, driverId) => {
    if (!driverId) return;
    setAssigning(bookingId);
    try {
      await bookingService.assignDriver(bookingId, Number(driverId));
      toast.success('Driver assigned!');
      await refresh();
    } catch { toast.error('Assignment failed'); }
    finally { setAssigning(null); }
  };

  const canAssign = s => ['Pending','Confirmed','DriverAssigned','InProgress'].includes(s);
  const isLive    = s => ['Pending','Confirmed','DriverAssigned','InProgress'].includes(s);

  return (
    <div className="page-enter space-y-6">
      <PageHeader
        title="Ride Operations"
        subtitle={`${filtered.length} rides · ${activeCount} live right now`}
        action={
          <button onClick={refresh} className="btn-ghost flex items-center gap-2 text-sm px-4 py-2 rounded-xl">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        }
      />

      {/* Live rides banner */}
      {activeCount > 0 && (
        <div className="gradient-brand rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-lg">
          <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shrink-0" />
          <span className="text-white font-bold text-sm flex-1">
            {activeCount} active ride{activeCount !== 1 ? 's' : ''} in progress — auto-refreshing every 30s
          </span>
          <span className="text-white/60 text-xs">Live</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search rides, customers, drivers, vehicles…"
            className="input-field pl-10 rounded-xl py-2.5 text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => {
            const meta = RIDE_STATUS_META[s];
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  statusFilter === s ? 'gradient-brand text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {meta && <span className={`w-2 h-2 rounded-full ${meta.color}`} />}
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0
          ? <EmptyState icon={ClipboardList} title="No rides found" description="Try a different filter." />
          : <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['', 'Ride', 'Route', 'Customer', 'Vehicle', 'Status', 'Amount', 'Driver', 'Date', ''].map((h, i) => (
                      <th key={i} className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(b => {
                    const meta = RIDE_STATUS_META[b.status] || RIDE_STATUS_META.Pending;
                    const live = isLive(b.status);
                    const isExpanded = expanded === b.id;
                    return (
                      <>
                        <tr key={b.id}
                          className={`border-l-4 transition-colors ${meta.border} ${meta.row} hover:brightness-95`}>
                          {/* Live pulse */}
                          <td className="pl-3 pr-1 py-3.5">
                            {live && (
                              <span className="relative flex w-3 h-3">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${meta.color}`} />
                                <span className={`relative inline-flex rounded-full w-3 h-3 ${meta.color}`} />
                              </span>
                            )}
                          </td>
                          {/* ID */}
                          <td className="px-3 py-3.5">
                            <span className="font-black text-gray-900">#{b.id}</span>
                          </td>
                          {/* Route */}
                          <td className="px-3 py-3.5">
                            <p className="text-sm font-semibold text-gray-800 max-w-40 truncate">{b.pickupLocation}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 shrink-0" />{b.dropLocation}
                            </p>
                          </td>
                          {/* Customer */}
                          <td className="px-3 py-3.5">
                            <p className="text-sm font-semibold text-gray-700">{b.customerName || '—'}</p>
                            {b.customerPhone && <p className="text-xs text-gray-400">{b.customerPhone}</p>}
                          </td>
                          {/* Vehicle */}
                          <td className="px-3 py-3.5">
                            {b.vehicleInfo ? (
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{b.vehicleInfo}</p>
                                {b.vehicleRegistration && (
                                  <p className="text-[10px] font-black text-gray-400 tracking-widest mt-0.5">{b.vehicleRegistration}</p>
                                )}
                              </div>
                            ) : <span className="text-xs text-gray-400">—</span>}
                          </td>
                          {/* Status */}
                          <td className="px-3 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black ${meta.row} ${meta.text} border border-current/20`}>
                              <span>{meta.icon}</span> {b.status}
                            </span>
                          </td>
                          {/* Amount */}
                          <td className="px-3 py-3.5">
                            <span className="font-black text-gray-900">₹{b.estimatedPrice || 0}</span>
                          </td>
                          {/* Driver */}
                          <td className="px-3 py-3.5">
                            {canAssign(b.status)
                              ? (
                                <div className="flex items-center gap-2">
                                  <select disabled={assigning === b.id} value={b.driverId || ''}
                                    onChange={e => assign(b.id, e.target.value)}
                                    className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white min-w-36 font-medium">
                                    <option value="">Assign driver</option>
                                    {drivers.map(d => (
                                      <option key={d.id} value={d.id}>{d.firstName} {d.lastName} · {d.status}</option>
                                    ))}
                                  </select>
                                  {assigning === b.id && (
                                    <span className="w-3 h-3 border border-primary-400 border-t-transparent rounded-full animate-spin" />
                                  )}
                                </div>
                              )
                              : (
                                <div>
                                  {b.driverName ? (
                                    <>
                                      <p className="text-sm font-semibold text-gray-700">{b.driverName}</p>
                                      {b.driverPhone && <p className="text-xs text-gray-400">{b.driverPhone}</p>}
                                    </>
                                  ) : <span className="text-xs text-gray-400">Not assigned</span>}
                                </div>
                              )}
                          </td>
                          {/* Date */}
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <p className="text-xs font-semibold text-gray-600">
                              {new Date(b.pickupDate || b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {new Date(b.pickupDate || b.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </p>
                          </td>
                          {/* Expand toggle */}
                          <td className="pr-4 pl-1 py-3.5">
                            <button
                              onClick={() => setExpanded(isExpanded ? null : b.id)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all text-xs ${isExpanded ? 'bg-primary-100 text-primary-600 rotate-180' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                              <ChevronDown className="w-4 h-4 transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
                            </button>
                          </td>
                        </tr>
                        {/* Expandable timeline row */}
                        {isExpanded && (
                          <tr key={`${b.id}-timeline`} className={meta.row}>
                            <td colSpan={10} className="px-4 pb-4 pt-0">
                              <div className="bg-white/80 rounded-2xl border border-gray-100 overflow-hidden">
                                <div className="px-4 pt-3 pb-1 border-b border-gray-50 flex items-center justify-between">
                                  <p className="text-xs font-black uppercase tracking-widest text-gray-500">Live Ride Tracking</p>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.text} ${meta.row}`}>
                                    {meta.icon} {meta.label}
                                  </span>
                                </div>
                                <RideTimeline booking={b} />
                                {/* Extra details */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 pb-4">
                                  {[
                                    { l: 'Customer',   v: b.customerName || '—' },
                                    { l: 'Driver',     v: b.driverName || 'Not assigned' },
                                    { l: 'Vehicle',    v: b.vehicleInfo ? `${b.vehicleInfo}${b.vehicleRegistration ? ' · ' + b.vehicleRegistration : ''}` : '—' },
                                    { l: 'Amount',     v: `₹${b.estimatedPrice || 0}` },
                                  ].map(({ l, v }) => (
                                    <div key={l} className="bg-gray-50 rounded-xl px-3 py-2.5">
                                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{l}</p>
                                      <p className="text-sm font-bold text-gray-900 truncate">{v}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>}
      </div>
    </div>
  );
}

// ─── USERS PAGE ────────────────────────────────────────────────────────────────
function UsersPage({ directory }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const users = directory?.users?.items || [];

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    const q = search.trim().toLowerCase();
    const matchSearch = !q || `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  return (
    <div className="page-enter space-y-6">
      <PageHeader
        title="User Management"
        subtitle={`${users.length} registered accounts across all roles.`}
      />

      {/* Stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:'Total Users', value: directory?.totalUsers||0, gradient:'from-blue-600 to-blue-700', icon: Users },
          { label:'Admins',      value: directory?.adminCount||0,    gradient:'from-violet-600 to-violet-700', icon: ShieldPlus },
          { label:'Customers',   value: directory?.customerCount||0, gradient:'from-pink-500 to-rose-500', icon: Users },
          { label:'Drivers',     value: directory?.driverCount||0,   gradient:'from-emerald-500 to-teal-600', icon: Truck },
        ].map(({ label, value, gradient, icon: Icon }) => (
          <div key={label} className={`card-stat text-white bg-linear-to-br ${gradient} shadow-xl`}>
            <Icon className="w-5 h-5 mb-3 opacity-80" />
            <p className="text-3xl font-black">{value}</p>
            <p className="text-white/70 text-xs font-bold uppercase tracking-wide mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, role…"
            className="input-field pl-10 rounded-xl py-2.5 text-sm" />
        </div>
        <div className="flex gap-2">
          {['All','Admin','Customer','Driver'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${roleFilter === r ? 'gradient-brand text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0
          ? <EmptyState icon={Users} title="No users found" description="Try adjusting search or filter." />
          : <div className="overflow-x-auto">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white font-black text-xs shadow shrink-0">
                            {(u.name||'?')[0]}
                          </div>
                          <span className="font-bold text-gray-900 text-sm">{u.name}</span>
                        </div>
                      </td>
                      <td><span className="text-sm text-gray-600">{u.email}</span></td>
                      <td>
                        <span className={`badge text-xs ${u.role==='Admin'?'badge-purple':u.role==='Driver'?'badge-info':'badge-success'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${u.isActive?'bg-emerald-500':'bg-rose-400'}`} />
                          <span className={`text-xs font-semibold ${u.isActive?'text-emerald-700':'text-rose-600'}`}>{u.isActive?'Active':'Inactive'}</span>
                        </div>
                      </td>
                      <td><span className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>}
      </div>
    </div>
  );
}

// ── Vehicle image with fallback ───────────────────────────────────────────────
function VehicleImg({ vehicle: v }) {
  const [src, setSrc] = useState(() => getVehiclePrimaryImage(v));
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && <div className="absolute inset-0 flex items-center justify-center"><Car className="w-10 h-10 text-gray-300 animate-pulse" /></div>}
      <img
        src={src}
        alt={`${v.make} ${v.model}`}
        onLoad={() => setLoaded(true)}
        onError={() => { setSrc(null); setLoaded(true); }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded && src ? 'opacity-100' : 'opacity-0'}`}
      />
      {loaded && !src && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Car className="w-10 h-10 text-gray-300" />
        </div>
      )}
    </>
  );
}

// ─── VEHICLES PAGE ─────────────────────────────────────────────────────────────
function VehiclesPage({ vehicles }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const types = ['All', ...new Set(vehicles.map(v => v.vehicleType).filter(Boolean))];

  const filtered = vehicles.filter(v => {
    const matchType = typeFilter === 'All' || v.vehicleType === typeFilter;
    const q = search.trim().toLowerCase();
    const matchSearch = !q || `${v.make} ${v.model} ${v.registrationNumber}`.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  return (
    <div className="page-enter space-y-6">
      <PageHeader
        title="Vehicle Fleet"
        subtitle={`${vehicles.length} vehicles registered · ${vehicles.filter(v=>v.isAvailable).length} available`}
      />

      {/* Summary pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:'Total Vehicles', value: vehicles.length,                                  gradient:'from-blue-600 to-blue-700',     icon:Car },
          { label:'Available',      value: vehicles.filter(v=>v.isAvailable).length,         gradient:'from-emerald-500 to-teal-600',  icon:CheckCircle },
          { label:'On a Ride',      value: vehicles.filter(v=>!v.isAvailable).length,        gradient:'from-amber-500 to-orange-500',  icon:Activity },
          { label:'Categories',     value: new Set(vehicles.map(v=>v.vehicleCategoryId)).size, gradient:'from-violet-600 to-violet-700', icon:BarChart2 },
        ].map(({ label, value, gradient, icon: Icon }) => (
          <div key={label} className={`card-stat text-white bg-linear-to-br ${gradient} shadow-xl`}>
            <Icon className="w-5 h-5 mb-3 opacity-80" />
            <p className="text-3xl font-black">{value}</p>
            <p className="text-white/70 text-xs font-bold uppercase tracking-wide mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search make, model, plate…"
            className="input-field pl-10 rounded-xl py-2.5 text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${typeFilter===t?'gradient-brand text-white shadow':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0
        ? <EmptyState icon={Car} title="No vehicles found" />
        : <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(v => (
              <div key={v.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                {/* Image */}
                <div className="h-36 bg-linear-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  <VehicleImg vehicle={v} />
                  <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${v.isAvailable?'bg-emerald-500/90 text-white':'bg-amber-500/90 text-white'}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    {v.isAvailable?'Available':'Unavailable'}
                  </div>
                  <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm font-semibold">
                    {v.vehicleType}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-black text-gray-900">{v.make} {v.model}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{v.year} · {v.registrationNumber} · {v.fuelType}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <span className="text-xl font-black text-primary-700">₹{v.pricePerDay}<span className="text-xs text-gray-400 font-normal">/day</span></span>
                    <span className="text-xs text-gray-500">{v.seatingCapacity} seats</span>
                  </div>
                </div>
              </div>
            ))}
          </div>}
    </div>
  );
}

// ─── DRIVERS PAGE ──────────────────────────────────────────────────────────────
function DriversPage({ drivers }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const statuses = ['All','Available','Busy','Offline'];
  const filtered = drivers.filter(d => {
    const matchStatus = statusFilter==='All' || d.status===statusFilter;
    const q = search.trim().toLowerCase();
    const matchSearch = !q || `${d.firstName} ${d.lastName} ${d.email} ${d.phoneNumber}`.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="page-enter space-y-6">
      <PageHeader
        title="Driver Management"
        subtitle={`${drivers.length} drivers registered · ${drivers.filter(d=>d.status==='Available').length} available`}
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:'Total Drivers',  value: drivers.length,                                    gradient:'from-violet-600 to-violet-700', icon:Truck },
          { label:'Available',      value: drivers.filter(d=>d.status==='Available').length,  gradient:'from-emerald-500 to-teal-600',  icon:CheckCircle },
          { label:'On a Ride',      value: drivers.filter(d=>d.status==='Busy').length,       gradient:'from-blue-600 to-blue-700',     icon:Activity },
          { label:'Verified',       value: drivers.filter(d=>d.isVerified).length,            gradient:'from-amber-500 to-orange-500',  icon:Star },
        ].map(({ label, value, gradient, icon: Icon }) => (
          <div key={label} className={`card-stat text-white bg-linear-to-br ${gradient} shadow-xl`}>
            <Icon className="w-5 h-5 mb-3 opacity-80" />
            <p className="text-3xl font-black">{value}</p>
            <p className="text-white/70 text-xs font-bold uppercase tracking-wide mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, phone…"
            className="input-field pl-10 rounded-xl py-2.5 text-sm" />
        </div>
        <div className="flex gap-2">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter===s?'gradient-brand text-white shadow':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0
          ? <EmptyState icon={Truck} title="No drivers found" />
          : <div className="overflow-x-auto">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Rating</th>
                    <th>Trips</th>
                    <th>Verified</th>
                    <th>License Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white font-black text-xs shadow shrink-0">
                            {d.firstName?.[0]}{d.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{d.firstName} {d.lastName}</p>
                            <p className="text-xs text-gray-400">{d.licenseNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="text-sm text-gray-700">{d.email}</p>
                        <p className="text-xs text-gray-400">{d.phoneNumber}</p>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${STATUS_DOT[d.status]||'bg-gray-300'}`} />
                          <span className="text-xs font-semibold text-gray-700">{d.status}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-black text-sm text-gray-900">{Number(d.rating||0).toFixed(1)}</span>
                        </div>
                      </td>
                      <td><span className="font-black text-gray-900">{d.totalTrips||0}</span></td>
                      <td>
                        <span className={`badge text-xs ${d.isVerified?'badge-success':'badge-warning'}`}>
                          {d.isVerified?'Verified':'Pending'}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-gray-500">
                          {d.licenseExpiryDate ? new Date(d.licenseExpiryDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>}
      </div>
    </div>
  );
}

// ─── CARPOOL RIDES PAGE (Admin) ────────────────────────────────────────────────
function CarpoolRidesPage() {
  const [offers, setOffers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('All');     // All | Active | Full | Completed | Cancelled
  const [query, setQuery]     = useState('');
  const [acting, setActing]   = useState(null);       // id of offer being acted on

  const load = useCallback(async () => {
    try {
      const res = await carpoolService.getAllRideOffers({ pageSize: 200 });
      const list = res?.data?.items || res?.data || res?.items || res || [];
      setOffers(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load carpool rides');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = offers.filter(o => {
    if (filter !== 'All' && o.status !== filter) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        o.originCity?.toLowerCase().includes(q) ||
        o.destinationCity?.toLowerCase().includes(q) ||
        o.driverName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this ride offer? All passenger bookings will also be cancelled.')) return;
    setActing(id);
    try {
      await carpoolService.cancelRide(id);
      toast.success('Ride offer cancelled');
      setOffers(prev => prev.map(o => o.id === id ? { ...o, status: 'Cancelled' } : o));
    } catch (err) {
      toast.error(err?.message || 'Could not cancel');
    } finally { setActing(null); }
  };

  const handleComplete = async (id) => {
    if (!window.confirm('Mark this ride as completed?')) return;
    setActing(id);
    try {
      await carpoolService.completeRide(id);
      toast.success('Ride marked as completed');
      setOffers(prev => prev.map(o => o.id === id ? { ...o, status: 'Completed' } : o));
    } catch (err) {
      toast.error(err?.message || 'Could not complete');
    } finally { setActing(null); }
  };

  const STATUS_STYLE = {
    Active:    { dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    Full:      { dot: 'bg-blue-400',    badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    Completed: { dot: 'bg-gray-400',    badge: 'bg-gray-50 text-gray-600 border-gray-200' },
    Cancelled: { dot: 'bg-rose-400',    badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  };

  const counts = {
    All:       offers.length,
    Active:    offers.filter(o => o.status === 'Active').length,
    Full:      offers.filter(o => o.status === 'Full').length,
    Completed: offers.filter(o => o.status === 'Completed').length,
    Cancelled: offers.filter(o => o.status === 'Cancelled').length,
  };

  return (
    <div className="page-enter space-y-6">
      <PageHeader
        title="Carpool Rides"
        subtitle="All ride offers posted by drivers — monitor, cancel or mark complete."
        action={
          <button onClick={load} className="btn-ghost flex items-center gap-2 text-sm px-4 py-2 rounded-xl">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        }
      />

      {/* Summary pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(counts).map(([s, n]) => {
          const st = STATUS_STYLE[s] || { dot: 'bg-primary-400', badge: 'bg-primary-50 text-primary-700 border-primary-200' };
          return (
            <button key={s} onClick={() => setFilter(s)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border font-bold text-sm transition-all ${
                filter === s ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'
              }`}>
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${st.dot}`} />
              <span className="flex-1 text-left">{s}</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${filter === s ? 'bg-white/20 text-white border-white/20' : st.badge}`}>{n}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search driver, route..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all" />
      </div>

      {loading
        ? <Loader />
        : filtered.length === 0
          ? <EmptyState icon={RouteIcon} title="No carpool rides found" description="No rides match the current filter." />
          : (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['ID', 'Route', 'Driver', 'Departure', 'Seats', 'Price/seat', 'Status', 'Passengers', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-gray-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(offer => {
                      const st = STATUS_STYLE[offer.status] || STATUS_STYLE.Active;
                      const dep = new Date(offer.departureTime);
                      const depStr = dep.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
                      const depTime = dep.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
                      const bookedSeats = (offer.totalSeats || 0) - (offer.availableSeats || 0);
                      const isActing = acting === offer.id;
                      return (
                        <tr key={offer.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-4 py-3.5">
                            <span className="text-xs font-black text-gray-400">#{offer.id}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                              <span className="font-bold text-gray-900 whitespace-nowrap">
                                {offer.originCity} → {offer.destinationCity}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center text-white font-black text-[10px] shrink-0">
                                {offer.driverName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                              </div>
                              <span className="font-semibold text-gray-700 whitespace-nowrap">{offer.driverName || '—'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <p className="font-semibold text-gray-900">{depStr}</p>
                            <p className="text-xs text-gray-400">{depTime}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-500 rounded-full transition-all"
                                  style={{ width: offer.totalSeats ? `${(bookedSeats / offer.totalSeats) * 100}%` : '0%' }} />
                              </div>
                              <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">
                                {bookedSeats}/{offer.totalSeats}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-black text-gray-900">₹{Math.round(offer.pricePerSeat)}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${st.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                              {offer.status}
                            </span>
                            {offer.instantBooking && (
                              <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] font-black text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-full">
                                <Zap className="w-2.5 h-2.5" /> Instant
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            {offer.passengers && offer.passengers.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-40">
                                {offer.passengers.map((p, pi) => (
                                  <span key={pi} className="text-[10px] font-bold bg-primary-50 text-primary-700 border border-primary-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                    {p.customerName?.split(' ')[0]} · {p.seatsBooked}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">No passengers</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              {offer.status === 'Active' || offer.status === 'Full' ? (
                                <>
                                  <button disabled={isActing}
                                    onClick={() => handleComplete(offer.id)}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50 whitespace-nowrap">
                                    {isActing ? '…' : '✓ Complete'}
                                  </button>
                                  <button disabled={isActing}
                                    onClick={() => handleCancel(offer.id)}
                                    className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50 whitespace-nowrap">
                                    {isActing ? '…' : '✕ Cancel'}
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-gray-400 italic">{offer.status}</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between text-xs text-gray-400">
                <span>Showing {filtered.length} of {offers.length} ride offers</span>
                <span>Auto-refreshes every 30s</span>
              </div>
            </div>
          )}
    </div>
  );
}

// ─── CREATE ADMIN wrapper (styled) ─────────────────────────────────────────────
function CreateAdminPage() {
  return (
    <div className="page-enter space-y-6">
      <PageHeader
        title="Create Admin Account"
        subtitle="Grant super-admin access to a trusted operator."
      />
      <div className="max-w-xl">
        <CreateAdmin />
      </div>
    </div>
  );
}

// ─── MAIN SHELL ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useApp();
  const navigate  = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [newRideAlert, setNewRideAlert]         = useState(false);
  const [newCarpoolAlert, setNewCarpoolAlert]   = useState(false);
  const [rejectedAlert, setRejectedAlert]       = useState(false);
  const lastCountRef = useRef(null);
  const lastCarpoolRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [bookings, drivers, vehicles, userResp] = await Promise.all([
        bookingService.getAll({ pageSize: 200 }),
        driverService.getAll({ pageSize: 200 }),
        vehicleService.getAll({ pageSize: 200 }),
        userService.getDirectory({ pageSize: 200 }),
      ]);

      let rideRequests = [];
      try { rideRequests = listFrom(await bookingService.getAllRideRequests?.()); } catch { /* optional */ }

      // Carpool ride offers count for new-offer alert
      let carpoolOffers = [];
      try {
        const cr = await carpoolService.getAllRideOffers({ pageSize: 200 });
        carpoolOffers = listFrom(cr);
      } catch { /* optional */ }

      if (lastCarpoolRef.current !== null && carpoolOffers.length > lastCarpoolRef.current) {
        setNewCarpoolAlert(true);
      }
      lastCarpoolRef.current = carpoolOffers.length;

      const bList = listFrom(bookings);

      // Alert: new ride since last poll
      if (lastCountRef.current !== null && bList.length > lastCountRef.current) {
        setNewRideAlert(true);
      }
      lastCountRef.current = bList.length;

      // Alert: any rejected ride request
      setRejectedAlert(rideRequests.some(r => r.status === 'Rejected' || r.status === 2));

      setData({
        bookings:      bList,
        drivers:       listFrom(drivers),
        vehicles:      listFrom(vehicles),
        rideRequests,
        userDirectory: userResp?.data || userResp,
      });
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [user, navigate]); // eslint-disable-line

  if (loading) return <Loader fullPage />;
  if (!data)   return <Loader fullPage />;

  return (
    <DashShell sidebar={AdminSidebar}>

      {/* ── New ride alert ── */}
      {newRideAlert && (
        <div className="mb-5 bg-linear-to-r from-primary-600 to-violet-600 text-white px-5 py-3.5 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-xl animate-slide-down">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse shrink-0" />
          <span className="flex-1">🚗 New ride request received! A customer just placed a booking.</span>
          <button onClick={() => { setNewRideAlert(false); navigate('/admin/rides'); }}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-black transition whitespace-nowrap">
            View Rides
          </button>
          <button onClick={() => setNewRideAlert(false)} className="text-white/60 hover:text-white text-lg leading-none ml-1">×</button>
        </div>
      )}

      {/* ── New carpool ride offer alert ── */}
      {newCarpoolAlert && (
        <div className="mb-5 bg-linear-to-r from-violet-600 to-purple-600 text-white px-5 py-3.5 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-xl animate-slide-down">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse shrink-0" />
          <span className="flex-1">🚗 A driver just posted a new carpool ride offer!</span>
          <button onClick={() => { setNewCarpoolAlert(false); navigate('/admin/carpool'); }}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-black transition whitespace-nowrap">
            View Rides
          </button>
          <button onClick={() => setNewCarpoolAlert(false)} className="text-white/60 hover:text-white text-lg leading-none ml-1">×</button>
        </div>
      )}

      {/* ── Driver rejected alert ── */}
      {rejectedAlert && (
        <div className="mb-5 bg-linear-to-r from-rose-600 to-rose-700 text-white px-5 py-3.5 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">A driver rejected a ride request. Please assign another driver.</span>
          <button onClick={() => { setRejectedAlert(false); navigate('/admin/rides'); }}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-black transition whitespace-nowrap">
            Fix Now
          </button>
          <button onClick={() => setRejectedAlert(false)} className="text-white/60 hover:text-white text-lg leading-none ml-1">×</button>
        </div>
      )}

      <Routes>
        <Route index               element={<Overview    data={data}                    />} />
        <Route path="rides"        element={<RideOps     data={data} refresh={load}     />} />
        <Route path="carpool"      element={<CarpoolRidesPage />} />
        <Route path="users"        element={<UsersPage   directory={data.userDirectory} />} />
        <Route path="vehicles"     element={<VehiclesPage vehicles={data.vehicles}      />} />
        <Route path="drivers"      element={<DriversPage drivers={data.drivers}         />} />
        <Route path="create-admin" element={<CreateAdminPage />} />
        <Route path="status"       element={<RideOps     data={data} refresh={load}     />} />
      </Routes>
    </DashShell>
  );
}
