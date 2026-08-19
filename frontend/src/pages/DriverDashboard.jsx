import { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, CheckCircle, ClipboardList, Clock3, Inbox, LogOut, MapPin, Play, Route as RouteIcon } from 'lucide-react';
import { bookingService } from '../services';
import { useApp } from '../context/AppContext';
import { Badge, EmptyState, Loader } from '../components';

const listFrom = (response) => response?.data?.items || response?.data || response?.items || response || [];

function DriverSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useApp();
  const [counts, setCounts] = useState({ requests: 0, assigned: 0, todo: 0, ongoing: 0, completed: 0 });
  const driverId = user?.driverId;
  useEffect(() => {
    if (!driverId) return undefined;
    const loadCounts = async () => {
      const [requestResponse, rideResponse] = await Promise.allSettled([bookingService.getDriverRequests(driverId), bookingService.getByDriver(driverId, { pageSize: 100 })]);
      const requests = requestResponse.status === 'fulfilled' ? listFrom(requestResponse.value) : [];
      const rides = rideResponse.status === 'fulfilled' ? listFrom(rideResponse.value) : [];
      const pending = requests.filter(request => request.status === 'Pending' || request.status === 0).length;
      const count = status => rides.filter(ride => ride.status === status).length;
      setCounts({ requests: pending, assigned: count('DriverAssigned'), todo: rides.filter(ride => ['Confirmed', 'DriverAssigned'].includes(ride.status)).length, ongoing: count('InProgress'), completed: count('Completed') });
    };
    loadCounts();
    const timer = window.setInterval(loadCounts, 5000);
    return () => window.clearInterval(timer);
  }, [driverId]);
  const items = [
    ['/driver/requests', 'New requests', Inbox, counts.requests],
    ['/driver/assigned', 'Assigned by admin', ClipboardList, counts.assigned],
    ['/driver/todo', 'To do rides', Clock3, counts.todo],
    ['/driver/ongoing', 'Ongoing ride', RouteIcon, counts.ongoing],
    ['/driver/completed', 'Completed', CheckCircle, counts.completed],
  ];
  return <aside className="w-64 bg-gray-900 min-h-screen flex flex-col"><div className="p-6 border-b border-gray-700"><p className="text-white font-bold">Driver Portal</p><p className="text-gray-400 text-xs mt-1">Ride operations</p></div><nav className="flex-1 p-4 space-y-2">{items.map(([to, label, Icon, count]) => <Link key={to} to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${pathname === to ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}><Icon className="w-4 h-4" /><span className="flex-1">{label}</span>{count > 0 && <span className="min-w-5 h-5 px-1.5 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">{count}</span>}</Link>)}</nav><div className="p-4 border-t border-gray-700"><button onClick={() => navigate('/login')} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-gray-800 w-full"><LogOut className="w-4 h-4" />Sign Out</button></div></aside>;
}

function RideCard({ booking, onAction, busy }) {
  const canStart = ['Confirmed', 'DriverAssigned'].includes(booking.status);
  const canFinish = booking.status === 'InProgress';
  return <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4"><div className="flex justify-between gap-4"><div><p className="font-bold text-gray-900">Ride #{booking.id}</p><p className="text-sm text-gray-600 mt-1 flex items-start gap-2"><MapPin className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />{booking.pickupLocation} to {booking.dropLocation}</p><p className="text-xs text-gray-400 mt-2">{new Date(booking.pickupDate).toLocaleString('en-IN')}</p><p className="text-sm text-gray-700 mt-2">Customer: <strong>{booking.customerName || 'Customer'}</strong>{booking.customerPhone ? ` · ${booking.customerPhone}` : ''}</p><p className="text-sm text-gray-700">Vehicle: <strong>{booking.vehicleInfo || 'Assigned vehicle'}</strong></p></div><Badge status={booking.status} /></div><div className="flex gap-2">{canStart && <button disabled={busy} onClick={() => onAction(booking, 'start')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold disabled:opacity-50"><Play className="w-4 h-4" />Start pickup</button>}{canFinish && <button disabled={busy} onClick={() => onAction(booking, 'finish')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold disabled:opacity-50"><CheckCircle className="w-4 h-4" />Finish ride</button>}</div></div>;
}

function DriverRideList({ filter }) {
  const { user } = useApp();
  const [rides, setRides] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const driverId = user?.driverId;
  const load = () => {
    if (!driverId) return Promise.resolve().finally(() => setLoading(false));
    const assigned = bookingService.getByDriver(driverId, { pageSize: 100 }).then(response => setRides(listFrom(response))).catch(() => setRides([]));
    const incoming = bookingService.getDriverRequests(driverId).then(response => setRequests(listFrom(response))).catch(() => setRequests([]));
    return Promise.all([assigned, incoming]).finally(() => setLoading(false));
  };
  useEffect(() => { setLoading(true); load(); }, [driverId]);

  const action = async (booking, type) => {
    setBusy(booking.id);
    try {
      if (type === 'start') await bookingService.startTrip(booking.id);
      else {
        const actualDistance = window.prompt('Enter the actual distance in km', booking.distanceInKm || '');
        if (actualDistance === null) return;
        await bookingService.complete(booking.id, Number(actualDistance));
      }
      await load();
    } finally { setBusy(null); }
  };

  const respond = async (request, accept) => {
    setBusy(`request-${request.id}`);
    try { await bookingService.respondToRequest(request.id, driverId, accept); await load(); } finally { setBusy(null); }
  };

  if (!driverId) return <EmptyState icon={Car} title="Driver profile unavailable" description="Sign in again after your driver registration is complete." />;
  const titles = { requests: ['New Requests', 'Review customer requests and accept the rides you can take.'], assigned: ['Assigned by Admin', 'Rides assigned to you by the admin.'], todo: ['To Do Rides', 'Confirmed and assigned rides ready for pickup.'], ongoing: ['Ongoing Ride', 'Rides currently in progress.'], completed: ['Completed Rides', 'Your completed customer rides.'] };
  const [title, description] = titles[filter];
  const visibleRides = rides.filter(booking => filter === 'assigned' ? booking.status === 'DriverAssigned' : filter === 'todo' ? ['Confirmed', 'DriverAssigned'].includes(booking.status) : filter === 'ongoing' ? booking.status === 'InProgress' : filter === 'completed' ? booking.status === 'Completed' : false);
  return <div className="space-y-6"><div><h1 className="text-2xl font-extrabold text-gray-900">{title}</h1><p className="text-gray-500 mt-1">{description}</p></div>{loading ? <Loader /> : filter === 'requests' ? requests.length === 0 ? <EmptyState icon={Inbox} title="No new requests" description="New customer requests will appear here." /> : <div className="grid gap-4">{requests.filter(request => request.status === 'Pending' || request.status === 0).map(request => <div key={request.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"><div className="flex justify-between gap-4"><div><p className="font-bold">Ride #{request.bookingId}</p><p className="text-sm text-gray-600 mt-1">{request.pickupLocation} to {request.dropLocation}</p><p className="text-xs text-gray-400 mt-2">{new Date(request.pickupDate).toLocaleString('en-IN')}</p><p className="text-sm text-gray-700 mt-2">Customer: <strong>{request.customerName || 'Customer'}</strong></p></div><Badge status={request.status} /></div><div className="flex gap-2 mt-4"><button disabled={busy === `request-${request.id}`} onClick={() => respond(request, true)} className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold disabled:opacity-50">Accept request</button><button disabled={busy === `request-${request.id}`} onClick={() => respond(request, false)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold disabled:opacity-50">Reject</button></div></div>)}</div> : visibleRides.length === 0 ? <EmptyState icon={Car} title="No rides in this section" description="Rides will appear here as their status changes." /> : <div className="grid gap-4">{visibleRides.map(booking => <RideCard key={booking.id} booking={booking} onAction={action} busy={busy === booking.id} />)}</div>}</div>;
}

export default function DriverDashboard() {
  return <div className="flex min-h-screen pt-16 bg-gray-50"><DriverSidebar /><main className="flex-1 p-8 overflow-auto"><Routes><Route index element={<DriverRideList filter="assigned" />} /><Route path="requests" element={<DriverRideList filter="requests" />} /><Route path="assigned" element={<DriverRideList filter="assigned" />} /><Route path="todo" element={<DriverRideList filter="todo" />} /><Route path="ongoing" element={<DriverRideList filter="ongoing" />} /><Route path="completed" element={<DriverRideList filter="completed" />} /></Routes></main></div>;
}
