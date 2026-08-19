import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, notificationService } from '../services';

const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }) => {
  // ── Auth ──────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; }
    catch { return null; }
  });

  // ── Booking cart (single pending booking) ─────────────
  const [bookingCart, setBookingCart] = useState(null);

  // ── Notifications ──────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Persist user ───────────────────────────────────────
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  // ── Load notifications when user is set ───────────────
  const loadNotifications = useCallback(async () => {
    if (user?.role !== 'Customer' || !user?.customerId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const res = await notificationService.getByCustomer(user.customerId, { pageSize: 20 });
      const items = res?.data || res?.items || res || [];
      setNotifications(Array.isArray(items) ? items : []);
      const unread = Array.isArray(items) ? items.filter(n => !n.isRead).length : 0;
      setUnreadCount(unread);
    } catch {
      // silent — notifications are non-critical
    }
  }, [user?.role, user?.customerId]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  // ── Auth helpers ───────────────────────────────────────
  const login = async (email, password, role = 'Customer') => {
    const res = await authService.login({ email, password, role });
    const session = res?.data || res;
    localStorage.setItem('token', session.token);
    const user = { id: session.userId, customerId: session.customerId, driverId: session.driverId, email: session.email, name: session.fullName, role: session.role };
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    const session = res?.data || res;
    localStorage.setItem('token', session.token);
    const user = { id: session.userId, customerId: session.customerId, driverId: session.driverId, email: session.email, name: session.fullName, role: session.role };
    setUser(user);
    return user;
  };

  const logout = () => {
    setUser(null);
    setBookingCart(null);
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('token');
  };

  // ── Booking cart helpers ───────────────────────────────
  const startBooking = (vehicle, dates) => {
    setBookingCart({ vehicle, ...dates, step: 'review' });
  };

  const clearBookingCart = () => setBookingCart(null);

  const markNotificationRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  return (
    <AppContext.Provider value={{
      user, login, register, logout,
      bookingCart, startBooking, clearBookingCart,
      notifications, unreadCount, loadNotifications, markNotificationRead,
    }}>
      {children}
    </AppContext.Provider>
  );
};
