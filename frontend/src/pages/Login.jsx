import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Car, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [form, setForm]       = useState({ email: '', password: '', role: 'Customer' });
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
    <div className="min-h-screen relative overflow-hidden gradient-hero flex items-center justify-center px-4 pt-16">
      {/* Blobs */}
      <div className="blob blob-blue  w-80 h-80 top-0 right-0  translate-x-1/3 -translate-y-1/3 opacity-40" />
      <div className="blob blob-violet w-64 h-64 bottom-0 left-0 -translate-x-1/3 translate-y-1/3 opacity-35" />

      <div className="relative w-full max-w-md animate-pop">

        {/* ── Card ── */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">

          {/* Compact gradient header */}
          <div className="relative px-8 py-6 overflow-hidden gradient-brand flex items-center gap-4">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px,white 1px,transparent 0)', backgroundSize: '20px 20px' }} />
            <div className="relative w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0 shadow">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div className="relative">
              <h1 className="text-xl font-black text-white leading-tight">Welcome Back</h1>
              <p className="text-white/65 text-xs mt-0.5">Sign in to continue your journey</p>
            </div>
          </div>

          {/* Form body */}
          <div className="px-8 py-6 space-y-5">

            {/* Role tabs */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Sign in as</p>
              <div className="grid grid-cols-3 gap-1.5">
                {['Customer', 'Driver', 'Admin'].map(r => (
                  <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                    className={`py-2.5 rounded-xl text-sm font-black transition-all duration-200 ${form.role === r ? 'gradient-brand text-white shadow' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400 pointer-events-none z-10" />
                  <input
                    type="email" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400 pointer-events-none z-10" />
                  <input
                    type={showPwd ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all"
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot */}
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-primary-600 font-semibold hover:text-primary-800 transition-colors">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-black text-white text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 gradient-brand shadow-lg hover:shadow-xl">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-bold hover:text-primary-800 transition-colors">Create one free</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
