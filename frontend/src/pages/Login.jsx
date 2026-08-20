import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Car, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [form, setForm] = useState({ email: '', password: '', role: 'Customer' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const session = await login(form.email, form.password, form.role);
      toast.success('Welcome back! 🎉');
      navigate(session.role === 'Admin' ? '/admin' : session.role === 'Driver' ? '/driver' : '/dashboard');
    } catch (err) {
      toast.error(err?.message || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen relative overflow-hidden gradient-hero flex items-center justify-center px-4 py-8">
      {/* Blobs */}
      <div className="blob blob-blue w-96 h-96 top-0 right-0 translate-x-1/3 -translate-y-1/3 opacity-50" />
      <div className="blob blob-violet w-72 h-72 bottom-0 left-0 -translate-x-1/3 translate-y-1/3 opacity-40" />

      <div className="relative w-full max-w-md animate-pop">
        {/* Top badge */}
        <div className="flex justify-center mb-6">
          <div className="glass-dark rounded-full px-4 py-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-white/80 text-sm font-medium">Sign in to RideRental</span>
          </div>
        </div>

        <div className="auth-card">
          {/* Header */}
          <div className="relative px-8 py-10 text-center overflow-hidden gradient-brand">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Car className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-black text-white">Welcome Back</h1>
              <p className="text-white/70 mt-1.5 text-sm">Sign in to continue your journey</p>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-8 space-y-5">
            {/* Role selector */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Sign in as</label>
              <div className="grid grid-cols-3 gap-2">
                {['Customer', 'Driver', 'Admin'].map(r => (
                  <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                    className={`py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${form.role === r ? 'gradient-brand text-white shadow-lg' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', icon: Mail },
                { key: 'password', label: 'Password', type: showPwd ? 'text' : 'password', placeholder: '••••••••', icon: Lock },
              ].map(({ key, label, type, placeholder, icon: Icon }) => (
                <div key={key}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                    <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder} autoComplete={key === 'email' ? 'email' : 'current-password'}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all" />
                    {key === 'password' && (
                      <button type="button" onClick={() => setShowPwd(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-primary-600 font-semibold hover:text-primary-800">Forgot password?</Link>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-black text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 gradient-brand shadow-lg hover:shadow-xl">
                {loading
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-bold hover:text-primary-800">Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
