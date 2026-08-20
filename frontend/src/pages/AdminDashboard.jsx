import { useEffect, useState, useCallback } from 'react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Car, Users, ClipboardList, ShieldPlus, LogOut,
  TrendingUp, ChevronRight, Search, RefreshCw, CheckCircle,
  XCircle, Clock, Zap, Star, AlertCircle, UserCog, Truck,
  DollarSign, BarChart2, Activity, MapPin, Calendar,
  MoreVertical, ChevronDown, Filter, Eye, Settings, Bell,
  ArrowUpRight, ArrowDownRight, Sparkles
} from 'lucide-react';
import { bookingService, driverService, vehicleService, userService } from '../services';
import { useApp } from '../context/AppContext';
import { Badge, Loader, EmptyState } from '../components';
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
    { to: '/admin',         label: 'Overview',       icon: LayoutDashboard, exact: true },
    { to: '/admin/rides',   label: 'Ride Operations',icon: ClipboardList },
    { to: '/admin/users',   label: 'All Users',      icon: Users },
    { to: '/admin/vehicles',label: 'Vehicles',       icon: Car },
    { to: '/admin/drivers', label: 'Drivers',        icon: Truck },
    { to: '/admin/create-admin', label: 'Create Admin', icon: ShieldPlus },
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
function RideOps({ data, refresh }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assigning, setAssigning] = useState(null);

  const statuses = ['All','Pending','Confirmed','InProgress','Completed','Cancelled'];

  const drivers = data.drivers.filter(d => d.isActive);

  const allBookings = data.bookings;
  const filtered = allBookings.filter(b => {
    const matchStatus = statusFilter === 'All' || b.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchSearch = !q || `${b.id} ${b.pickupLocation} ${b.dropLocation} ${b.customerName||''} ${b.driverName||''}`.toLowerCase().includes(q);
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

  return (
    <div className="page-enter space-y-6">
      <PageHeader
        title="Ride Operations"
        subtitle={`${filtered.length} rides · Assign drivers, track status, manage fleet.`}
        action={
          <button onClick={refresh} className="btn-ghost flex items-center gap-2 text-sm px-4 py-2 rounded-xl">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search rides, customers, drivers…"
            className="input-field pl-10 rounded-xl py-2.5 text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${statusFilter === s ? 'gradient-brand text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0
          ? <EmptyState icon={ClipboardList} title="No rides found" description="Try a different filter." />
          : <div className="overflow-x-auto">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Ride</th>
                    <th>Route</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Driver</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full ${STATUS_DOT[b.status]||'bg-gray-300'}`} />
                          <span className="font-black text-gray-900 text-sm">#{b.id}</span>
                        </div>
                      </td>
                      <td>
                        <p className="text-sm font-semibold text-gray-800 max-w-48 truncate">{b.pickupLocation}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{b.dropLocation}</p>
                      </td>
                      <td><span className="text-sm text-gray-700 font-medium">{b.customerName || '—'}</span></td>
                      <td><Badge status={b.status} /></td>
                      <td><span className="font-black text-gray-900">₹{b.estimatedPrice||0}</span></td>
                      <td>
                        {canAssign(b.status)
                          ? <select disabled={assigning === b.id} value={b.driverId||''}
                              onChange={e => assign(b.id, e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white min-w-36 font-medium">
                              <option value="">Assign driver</option>
                              {drivers.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName} · {d.status}</option>)}
                            </select>
                          : <span className="text-xs text-gray-500 font-medium">{b.driverName || '—'}</span>}
                        {assigning === b.id && <span className="ml-2 w-3 h-3 border border-primary-400 border-t-transparent rounded-full animate-spin inline-block" />}
                      </td>
                      <td><span className="text-xs text-gray-400">{new Date(b.createdAt||b.pickupDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span></td>
                    </tr>
                  ))}
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
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [bookings, drivers, vehicles, userResp] = await Promise.all([
        bookingService.getAll({ pageSize: 200 }),
        driverService.getAll({ pageSize: 200 }),
        vehicleService.getAll({ pageSize: 200 }),
        userService.getDirectory({ pageSize: 200 }),
      ]);

      // Try ride requests (may not exist)
      let rideRequests = [];
      try { rideRequests = listFrom(await bookingService.getAllRideRequests?.()); } catch { /* optional */ }

      setData({
        bookings:      listFrom(bookings),
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
  }, [user, load, navigate]);

  if (loading) return <Loader fullPage />;
  if (!data)   return <Loader fullPage />;

  return (
    <div className="flex min-h-screen pt-16">
      {/* Fixed sidebar */}
      <div className="hidden lg:block w-64 fixed left-0 top-16 bottom-0 z-20">
        <AdminSidebar />
      </div>

      {/* Scrollable main */}
      <main className="flex-1 lg:ml-64 min-h-screen bg-slate-50">
        {/* Top alert bar if rejected ride requests */}
        {data.rideRequests.some(r => r.status === 'Rejected' || r.status === 2) && (
          <div className="bg-linear-to-r from-rose-600 to-rose-700 text-white px-6 py-3 flex items-center gap-3 text-sm font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            A driver rejected a ride request. Go to{' '}
            <button onClick={() => navigate('/admin/rides')} className="underline underline-offset-2 font-black">
              Ride Operations
            </button>{' '}
            to assign another driver.
          </div>
        )}

        <div className="p-6 sm:p-8">
          <Routes>
            <Route index          element={<Overview    data={data}                    />} />
            <Route path="rides"   element={<RideOps     data={data} refresh={load}     />} />
            <Route path="users"   element={<UsersPage   directory={data.userDirectory} />} />
            <Route path="vehicles"element={<VehiclesPage vehicles={data.vehicles}      />} />
            <Route path="drivers" element={<DriversPage drivers={data.drivers}         />} />
            <Route path="create-admin" element={<CreateAdminPage />} />
            {/* Legacy alias */}
            <Route path="status"  element={<RideOps     data={data} refresh={load}     />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
