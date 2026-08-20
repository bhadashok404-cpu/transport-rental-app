import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, Menu, X, Bell, User, LogOut, ChevronDown, LayoutDashboard, MapPin, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Dashboard routes that have a 256px (w-64) sidebar
const DASHBOARD_PREFIXES = ['/admin', '/driver', '/dashboard', '/profile'];

export default function Navbar() {
  const { user, logout, unreadCount } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  const isDashboard = DASHBOARD_PREFIXES.some(p => pathname.startsWith(p));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); setUserOpen(false); };

  const isCustomer = !user || user.role === 'Customer';
  const navLinks = isCustomer
    ? [{ label: 'Home', to: '/' }, { label: 'Vehicles', to: '/vehicles' }, { label: 'How It Works', to: '/#how-it-works' }]
    : [];
  const dashPath = user?.role === 'Admin' ? '/admin' : user?.role === 'Driver' ? '/driver' : '/dashboard';
  const activeLink = (to) => pathname === to || (to !== '/' && pathname.startsWith(to));

  // ── Right-side controls (shared) ──────────────────────────────────────────
  const RightControls = () => (
    <div className="flex items-center gap-2">
      {user ? (
        <>
          {/* Notification bell */}
          <Link
            to={isCustomer ? '/dashboard/notifications' : dashPath}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-0.5 gradient-brand text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* User dropdown */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setUserOpen(v => !v)}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-gray-100 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center text-white text-xs font-black shadow">
                {(user.firstName || user.name || user.role || '?')[0].toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-gray-900 leading-none">{user.firstName || user.name || user.role}</p>
                <p className="text-[10px] text-gray-400 leading-none mt-0.5">{user.role}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${userOpen ? 'rotate-180' : ''}`} />
            </button>

            {userOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 glass-card rounded-2xl shadow-2xl py-2 animate-slide-down z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-bold text-gray-900 text-sm">{user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{user.email}</p>
                  <span className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold gradient-brand text-white">
                    <Zap className="w-2.5 h-2.5" />{user.role}
                  </span>
                </div>
                {[
                  { to: dashPath, icon: LayoutDashboard, label: user.role === 'Admin' ? 'Admin Panel' : user.role === 'Driver' ? 'Driver Portal' : 'Dashboard' },
                  ...(isCustomer ? [{ to: '/dashboard/bookings', icon: MapPin, label: 'My Bookings' }, { to: '/profile', icon: User, label: 'Profile' }] : []),
                  ...(!isCustomer ? [{ to: '/profile', icon: User, label: 'My Profile' }] : []),
                ].map(item => (
                  <Link key={item.to} to={item.to} onClick={() => setUserOpen(false)}
                    className="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-150 font-medium">
                    <item.icon className="w-4 h-4 text-gray-400" />{item.label}
                  </Link>
                ))}
                <div className="border-t border-gray-100 mt-2 pt-1 mx-2">
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition-all duration-150 font-medium">
                    <LogOut className="w-4 h-4" />Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50">
            Sign In
          </Link>
          <Link to="/register" className="btn-primary px-5 py-2 text-sm rounded-xl">
            Get Started
          </Link>
        </div>
      )}

      <button
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 transition"
        onClick={() => setMobileOpen(v => !v)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
    </div>
  );

  // ── Dashboard layout navbar (logo aligned to sidebar width) ───────────────
  if (isDashboard && user) {
    return (
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="flex items-center h-full">
          {/* Logo zone — exactly 256px wide to match the sidebar */}
          <Link
            to={dashPath}
            className="flex items-center gap-3 px-5 shrink-0 group"
            style={{ width: '256px' }}
          >
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform shrink-0">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="font-black text-gray-900 text-sm leading-none block">RideRental</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary-500 mt-0.5 block">
                {user.role === 'Admin' ? 'Admin Console' : user.role === 'Driver' ? 'Driver Portal' : 'Customer Portal'}
              </span>
            </div>
          </Link>

          {/* Right side — fills remaining space */}
          <div className="flex-1 flex items-center justify-end pr-6">
            <RightControls />
          </div>
        </div>
      </header>
    );
  }

  // ── Public / customer pages navbar ────────────────────────────────────────
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg shadow-black/5 border-b border-gray-100' : 'bg-white/90 backdrop-blur-md'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to={dashPath} className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div className="leading-none hidden sm:block">
              <span className="font-black text-gray-900 text-base tracking-tight">RideRental</span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-primary-500 mt-0.5">Premium Transport</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeLink(link.to)
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'}`}>
                {link.label}
                {activeLink(link.to) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full gradient-brand" />
                )}
              </Link>
            ))}
          </nav>

          <RightControls />
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-lg px-4 pb-4 animate-slide-down">
          <div className="space-y-1 pt-3">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition ${activeLink(link.to) ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                {link.label}
              </Link>
            ))}
          </div>
          {!user && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700">Sign In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-3 rounded-xl text-sm font-black text-white btn-primary">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
