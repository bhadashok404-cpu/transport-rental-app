import { useState } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Car, ArrowRight, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

/**
 * AuthModal — shown when a guest clicks "Book" on a ride.
 * Supports login and register (Customer only) in one overlay.
 *
 * Props:
 *   onClose()        — close without action
 *   onSuccess(user)  — called after successful login/register
 */
export default function AuthModal({ onClose, onSuccess }) {
  const { login, register } = useApp();
  const [mode, setMode] = useState('login');   // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '', role: 'Customer' });
  const [regForm, setRegForm] = useState({
    firstName: '', lastName: '', email: '',
    phoneNumber: '', password: '', address: '',
    role: 'Customer',
  });

  const lf = (k, v) => setLoginForm(f => ({ ...f, [k]: v }));
  const rf = (k, v) => setRegForm(f => ({ ...f, [k]: v }));

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      const user = await login(loginForm.email, loginForm.password, loginForm.role);
      toast.success('Welcome back! 🎉');
      onSuccess(user);
    } catch (err) {
      toast.error(err?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, phoneNumber, password } = regForm;
    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      toast.error('Fill all required fields');
      return;
    }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const user = await register(regForm);
      toast.success('Account created! 🎉');
      onSuccess(user);
    } catch (err) {
      toast.error(err?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-pop">

        {/* Gradient header */}
        <div className="relative overflow-hidden gradient-brand px-6 py-5 flex items-center gap-4">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px,white 1px,transparent 0)', backgroundSize: '20px 20px' }} />
          <div className="relative w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0 shadow">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div className="relative flex-1">
            <h2 className="text-white font-black text-lg leading-tight">
              {mode === 'login' ? 'Sign in to book' : 'Create your account'}
            </h2>
            <p className="text-white/65 text-xs mt-0.5">
              {mode === 'login' ? 'One step away from your seat' : 'Free · takes 30 seconds'}
            </p>
          </div>
          <button onClick={onClose}
            className="relative w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b border-gray-100">
          {[['login', 'Sign In'], ['register', 'Sign Up']].map(([m, label]) => (
            <button key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-3 text-sm font-black transition-all duration-200 border-b-2 ${mode === m ? 'border-primary-500 text-primary-700 bg-primary-50/30' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="px-6 py-5">
          {/* ── LOGIN FORM ─────────────────────────────────────── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Role tabs */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Sign in as</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Customer', 'Driver', 'Admin'].map(r => (
                    <button key={r} type="button"
                      onClick={() => lf('role', r)}
                      className={`py-2 rounded-xl text-xs font-black transition-all duration-200 ${loginForm.role === r ? 'gradient-brand text-white shadow' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400 pointer-events-none" />
                  <input type="email" value={loginForm.email}
                    onChange={e => lf('email', e.target.value)}
                    placeholder="you@example.com" autoComplete="email" required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400 pointer-events-none" />
                  <input type={showPwd ? 'text' : 'password'} value={loginForm.password}
                    onChange={e => lf('password', e.target.value)}
                    placeholder="••••••••" autoComplete="current-password" required
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all" />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-black text-white text-sm gradient-brand shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Sign In & Book</span><ArrowRight className="w-4 h-4" /></>}
              </button>

              <p className="text-center text-xs text-gray-500">
                No account?{' '}
                <button type="button" onClick={() => setMode('register')}
                  className="text-primary-600 font-bold hover:text-primary-800 transition-colors">
                  Create one free
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ──────────────────────────────────── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[['firstName', 'First name', User], ['lastName', 'Last name', User]].map(([k, ph, Icon]) => (
                  <div key={k}>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{ph}</label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-400 pointer-events-none" />
                      <input value={regForm[k]} onChange={e => rf(k, e.target.value)}
                        placeholder={ph} required
                        className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all" />
                    </div>
                  </div>
                ))}
              </div>

              {[
                { k: 'email',       ph: 'Email address', Icon: Mail,  type: 'email', ac: 'email' },
                { k: 'phoneNumber', ph: 'Phone number',  Icon: Phone, type: 'tel',   ac: 'tel' },
              ].map(({ k, ph, Icon, type, ac }) => (
                <div key={k}>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{ph}</label>
                  <div className="relative">
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400 pointer-events-none" />
                    <input type={type} autoComplete={ac} value={regForm[k]} onChange={e => rf(k, e.target.value)}
                      placeholder={ph} required
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all" />
                  </div>
                </div>
              ))}

              {/* Password */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400 pointer-events-none" />
                  <input type={showPwd ? 'text' : 'password'} value={regForm.password}
                    onChange={e => rf('password', e.target.value)}
                    placeholder="Min. 8 characters" required
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all" />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-black text-white text-sm gradient-brand shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Create Account & Book</span><ArrowRight className="w-4 h-4" /></>}
              </button>

              <p className="text-center text-xs text-gray-400 leading-relaxed">
                By signing up you agree to our{' '}
                <span className="text-primary-600 font-semibold cursor-pointer">Terms</span> &{' '}
                <span className="text-primary-600 font-semibold cursor-pointer">Privacy Policy</span>.
              </p>

              <p className="text-center text-xs text-gray-500">
                Already a member?{' '}
                <button type="button" onClick={() => setMode('login')}
                  className="text-primary-600 font-bold hover:text-primary-800 transition-colors">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
