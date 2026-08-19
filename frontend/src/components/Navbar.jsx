import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Car, Menu, X, Bell, User, LogOut, ChevronDown,
  LayoutDashboard, MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Navbar = () => {
  const { user, logout, unreadCount } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserMenuOpen(false);
  };

  const customerNavigation = !user || user.role === 'Customer';
  const navLinks = customerNavigation ? [
    { label: 'Home', to: '/' },
    { label: 'Vehicles', to: '/vehicles' },
    { label: 'How It Works', to: '/#how-it-works' },
  ] : [];
  const homePath = user?.role === 'Admin' ? '/admin' : user?.role === 'Driver' ? '/driver' : '/';

  const isActive = (to) => location.pathname === to;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to={homePath} className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-linear-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary-300 transition-shadow">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-gray-900 text-lg">RideRental</span>
              <span className="block text-[10px] text-primary-600 font-medium -mt-0.5 tracking-wide uppercase">Transport</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Notifications */}
                <Link
                  to={user.role === 'Admin' ? '/admin' : user.role === 'Driver' ? '/driver' : '/dashboard/notifications'}
                  className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="w-8 h-8 bg-linear-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.firstName?.[0] || user.name?.[0] || user.role?.[0]}{user.lastName?.[0] || user.name?.split(' ')[1]?.[0]}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user.firstName || user.name || user.role}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 animate-slide-down">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user.name || `${user.firstName || ''} ${user.lastName || ''}`}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to={user.role === 'Admin' ? '/admin' : user.role === 'Driver' ? '/driver' : '/dashboard'}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-400" /> {user.role === 'Admin' ? 'Admin Operations' : user.role === 'Driver' ? 'Driver Portal' : 'My Dashboard'}
                      </Link>
                      {user.role === 'Customer' && <Link
                        to="/dashboard/bookings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <MapPin className="w-4 h-4 text-gray-400" /> My Bookings
                      </Link>}
                      {user.role === 'Customer' && <Link
                        to="/dashboard/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <User className="w-4 h-4 text-gray-400" /> Profile
                      </Link>}
                      <div className="border-t border-gray-100 mt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 shadow transition"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 animate-slide-down">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-medium mt-1 ${
                isActive(link.to) ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <div className="flex gap-2 mt-3">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">Sign In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold">Register</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
