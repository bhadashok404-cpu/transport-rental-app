import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ProfilePage from './pages/ProfilePage';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import BookingConfirm from './pages/BookingConfirm';
import BookingSuccess from './pages/BookingSuccess';
import Dashboard from './pages/Dashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { useApp } from './context/AppContext';

// Pages that use their own full-screen layout (no shared Navbar/Footer)
const STANDALONE_PREFIXES = ['/login', '/register', '/forgot-password', '/profile', '/driver', '/admin'];

function Layout() {
  const { pathname } = useLocation();
  const standalone = STANDALONE_PREFIXES.some(p => pathname.startsWith(p));

  if (standalone) {
    return (
      <>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<PrivateOnly><ProfilePage /></PrivateOnly>} />
          <Route path="/driver/*" element={<RoleOnly role="Driver"><DriverDashboard /></RoleOnly>} />
          <Route path="/admin/*" element={<RoleOnly role="Admin"><AdminDashboard /></RoleOnly>} />
        </Routes>
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16">
        <Routes>
          <Route path="/" element={<HomeEntry />} />
          <Route path="/vehicles" element={<CustomerOnly><Vehicles /></CustomerOnly>} />
          <Route path="/vehicles/:id" element={<CustomerOnly><VehicleDetail /></CustomerOnly>} />
          <Route path="/booking/confirm" element={<CustomerOnly><BookingConfirm /></CustomerOnly>} />
          <Route path="/booking/success/:id" element={<CustomerOnly><BookingSuccess /></CustomerOnly>} />
          <Route path="/dashboard/*" element={<CustomerOnly><Dashboard /></CustomerOnly>} />
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function CustomerOnly({ children }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'Customer' ? children : <Navigate to={user.role === 'Admin' ? '/admin' : '/driver'} replace />;
}

function HomeEntry() {
  const { user } = useApp();
  if (user?.role === 'Admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'Driver') return <Navigate to="/driver" replace />;
  return <Home />;
}

function RoleOnly({ role, children }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === role ? children : <Navigate to={user.role === 'Admin' ? '/admin' : user.role === 'Driver' ? '/driver' : '/vehicles'} replace />;
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
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { borderRadius: '12px', fontSize: '14px', fontWeight: '500' },
            success: { iconTheme: { primary: '#0ea5e9', secondary: '#fff' } },
          }}
        />
        <Layout />
      </AppProvider>
    </BrowserRouter>
  );
}
