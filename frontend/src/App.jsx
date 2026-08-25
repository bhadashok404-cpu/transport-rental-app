import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home          from './pages/Home';
import Login         from './pages/Login';
import Register      from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ProfilePage   from './pages/ProfilePage';
import Vehicles      from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import BookingConfirm from './pages/BookingConfirm';
import BookingSuccess from './pages/BookingSuccess';
import Dashboard     from './pages/Dashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard  from './pages/AdminDashboard';

// ── NEW carpool pages (all public-accessible until "Book" is clicked) ─────────
import RideSearch    from './pages/RideSearch';
import RideDetail    from './pages/RideDetail';
import CarpoolPayment from './pages/CarpoolPayment';

import { useApp } from './context/AppContext';

// Pages that get only a Navbar — no shared Footer, no outer padding
const STANDALONE_PREFIXES = [
  '/login', '/register', '/forgot-password', '/profile',
  '/driver', '/admin', '/dashboard',
];

function Layout() {
  const { pathname } = useLocation();
  const standalone = STANDALONE_PREFIXES.some(p => pathname.startsWith(p));

  if (standalone) {
    return (
      <>
        <Navbar />
        <Routes>
          <Route path="/login"          element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/register"       element={<GuestOnly><Register /></GuestOnly>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile"        element={<PrivateOnly><ProfilePage /></PrivateOnly>} />
          <Route path="/driver/*"       element={<RoleOnly role="Driver"><DriverDashboard /></RoleOnly>} />
          <Route path="/admin/*"        element={<RoleOnly role="Admin"><AdminDashboard /></RoleOnly>} />
          <Route path="/dashboard/*"    element={<CustomerOnly><Dashboard /></CustomerOnly>} />
        </Routes>
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16">
        <Routes>
          {/* Home */}
          <Route path="/"  element={<HomeEntry />} />

          {/* ── Carpooling (PUBLIC — anyone can browse; auth required only at payment) ── */}
          <Route path="/rides"             element={<RideSearch />} />
          <Route path="/rides/:id"         element={<RideDetail />} />
          <Route path="/carpool/payment"   element={<PrivateOnly><CarpoolPayment /></PrivateOnly>} />

          {/* ── Vehicle rental (customer only) ─────────────────────────────────── */}
          <Route path="/vehicles"          element={<CustomerOnly><Vehicles /></CustomerOnly>} />
          <Route path="/vehicles/:id"      element={<CustomerOnly><VehicleDetail /></CustomerOnly>} />
          <Route path="/booking/confirm"   element={<CustomerOnly><BookingConfirm /></CustomerOnly>} />
          <Route path="/booking/success/:id" element={<CustomerOnly><BookingSuccess /></CustomerOnly>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// ── Route guards ───────────────────────────────────────────────────────────────
function GuestOnly({ children }) {
  const { user } = useApp();
  if (!user) return children;
  if (user.role === 'Admin')  return <Navigate to="/admin"     replace />;
  if (user.role === 'Driver') return <Navigate to="/driver"    replace />;
  return                             <Navigate to="/dashboard" replace />;
}

function CustomerOnly({ children }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'Customer'
    ? children
    : <Navigate to={user.role === 'Admin' ? '/admin' : '/driver'} replace />;
}

function HomeEntry() {
  const { user } = useApp();
  if (user?.role === 'Admin')  return <Navigate to="/admin"  replace />;
  if (user?.role === 'Driver') return <Navigate to="/driver" replace />;
  return <Home />;
}

function RoleOnly({ role, children }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === role
    ? children
    : <Navigate to={user.role === 'Admin' ? '/admin' : user.role === 'Driver' ? '/driver' : '/rides'} replace />;
}

function PrivateOnly({ children }) {
  const { user } = useApp();
  return user ? children : <Navigate to="/login" replace />;
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-8xl font-black text-gray-100 select-none">404</p>
      <h1 className="text-2xl font-bold text-gray-800 -mt-4 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
      <a href="/" className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition shadow">
        Back to Home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Layout />
      </AppProvider>
    </BrowserRouter>
  );
}
