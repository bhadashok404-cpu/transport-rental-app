import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, notificationService } from '../services';

const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }) => {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; }
    catch { return null; }
  });

  // ── Vehicle rental booking cart ────────────────────────────────────────────
  const [bookingCart, setBookingCart] = useState(null);

  // ── Carpool booking cart ───────────────────────────────────────────────────
  // { ride, seatsBooked, paymentMethod, pendingRedirect: '/rides/:id' }
  const [carpoolCart, setCarpoolCart] = useState(null);

  // ── Auth modal state (shown when guest clicks "Book" on a ride) ───────────
  // null | { mode: 'login'|'register', redirectTo: string }
  const [authModal, setAuthModal] = useState(null);

  // ── Notifications ──────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Persist user ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  // ── Load notifications when user is set ────────────────────────────────────
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

  // ── Auth helpers ───────────────────────────────────────────────────────────
  const login = async (email, password, role = 'Customer') => {
    const res = await authService.login({ email, password, role });
    const session = res?.data || res;
    localStorage.setItem('token', session.token);
    const u = {
      id: session.userId,
      customerId: session.customerId,
      driverId: session.driverId,
      email: session.email,
      name: session.fullName,
      role: session.role,
    };
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    const session = res?.data || res;
    localStorage.setItem('token', session.token);
    const u = {
      id: session.userId,
      customerId: session.customerId,
      driverId: session.driverId,
      email: session.email,
      name: session.fullName,
      role: session.role,
    };
    setUser(u);
    return u;
  };

  const logout = () => {
    setUser(null);
    setBookingCart(null);
    setCarpoolCart(null);
    setAuthModal(null);
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('token');
  };

  const updateUser = (profile) => {
    // Split name into firstName/lastName so all components that read those fields stay in sync
    const nameParts = (profile.name || '').trim().split(' ');
    const nextUser = {
      ...user,
      id:          profile.id,
      customerId:  profile.customerId,
      driverId:    profile.driverId,
      email:       profile.email,
      name:        profile.name,
      firstName:   nameParts[0] || '',
      lastName:    nameParts.slice(1).join(' ') || '',
      role:        profile.role,
      phoneNumber: profile.phoneNumber,
      address:     profile.address,
    };
    setUser(nextUser);
    localStorage.setItem('user', JSON.stringify(nextUser));
    return nextUser;
  };

  // ── Vehicle rental booking cart helpers ────────────────────────────────────
  const startBooking = (vehicle, dates) => setBookingCart({ vehicle, ...dates, step: 'review' });
  const clearBookingCart = () => setBookingCart(null);

  // ── Carpool booking cart helpers ───────────────────────────────────────────
  /**
   * Save the ride + seat selection so we can resume after login.
   * @param {object} ride        - Full RideOfferDto from the API
   * @param {number} seatsBooked - How many seats the user wants
   * @param {string} paymentMethod - e.g. 'UPI', 'Card', 'Cash'
   */
  const startCarpoolBooking = (ride, seatsBooked = 1, paymentMethod = 'UPI') => {
    setCarpoolCart({ ride, seatsBooked, paymentMethod });
  };

  const clearCarpoolCart = () => setCarpoolCart(null);

  // ── Auth modal helpers ─────────────────────────────────────────────────────
  /**
   * Open the auth overlay that appears when a guest tries to book.
   * @param {'login'|'register'} mode
   * @param {string} [redirectTo]  - path to navigate after successful auth
   */
  const openAuthModal  = (mode = 'login', redirectTo = '/') => setAuthModal({ mode, redirectTo });
  const closeAuthModal = () => setAuthModal(null);

  // ── Notification helpers ───────────────────────────────────────────────────
  const markNotificationRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  return (
    <AppContext.Provider value={{
      // auth
      user, login, register, logout, updateUser,
      // vehicle rental cart
      bookingCart, startBooking, clearBookingCart,
      // carpool cart
      carpoolCart, startCarpoolBooking, clearCarpoolCart,
      // auth modal
      authModal, openAuthModal, closeAuthModal,
      // notifications
      notifications, unreadCount, loadNotifications, markNotificationRead,
    }}>
      {children}
    </AppContext.Provider>
  );
};
