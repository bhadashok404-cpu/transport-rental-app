import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Car, Eye, EyeOff, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', role: 'Customer', newPassword: '', confirmPassword: '' });
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.email)                        return toast.error('Enter your email address.');
    if (!form.newPassword || form.newPassword.length < 8)
                                            return toast.error('Password must be at least 8 characters.');
    if (form.newPassword !== form.confirmPassword)
                                            return toast.error('Passwords do not match.');
    setLoading(true);
    try {
      await authService.resetPassword({ email: form.email, role: form.role, newPassword: form.newPassword });
      toast.success('Password reset successfully! 🎉');
      navigate('/login');
    } catch (err) {
      toast.error(err?.message || 'Could not reset password. Check your email and try again.');
    } finally { setLoading(false); }
  };

  // password strength
  const strength = (() => {
    const p = form.newPassword;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)        s++;
    if (/[A-Z]/.test(p))      s++;
    if (/[0-9]/.test(p))      s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-rose-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-400'][strength];

  return (
    <div className="min-h-screen relative overflow-hidden gradient-hero flex items-center justify-center px-4 pt-16">
      {/* Blobs — edges only */}
      <div className="blob blob-blue  w-80 h-80 top-0 right-0  translate-x-1/3 -translate-y-1/3 opacity-40" />
      <div className="blob blob-violet w-64 h-64 bottom-0 left-0 -translate-x-1/3 translate-y-1/3 opacity-35" />

      <div className="relative w-full max-w-md animate-pop">
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">

          {/* ── Gradient header ───────────────────────────────────────────── */}
          <div className="relative px-8 py-7 overflow-hidden flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #312e81 100%)' }}>
            {/* dot grid */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px,white 1px,transparent 0)', backgroundSize: '20px 20px' }} />
            {/* lock icon ring */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shadow-inner border border-white/20">
                <KeyRound className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center shadow">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </div>
            <div className="relative">
              <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-0.5">RideRental account</p>
              <h1 className="text-xl font-black text-white leading-tight">Reset Password</h1>
              <p className="text-white/55 text-xs mt-0.5">Choose your role and set a new password</p>
            </div>
          </div>

          {/* ── Form body ─────────────────────────────────────────────────── */}
          <div className="px-8 py-6 space-y-5">

            {/* Role tabs */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Account type</p>
              <div className="grid grid-cols-3 gap-1.5">
                {['Customer', 'Driver', 'Admin'].map(r => (
                  <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                    className={`py-2.5 rounded-xl text-sm font-black transition-all duration-200
                      ${form.role === r
                        ? 'gradient-brand text-white shadow'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400 pointer-events-none" />
                  <input
                    type="email" value={form.email} onChange={set('email')}
                    placeholder="you@example.com" required autoComplete="email"
                    className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400 pointer-events-none" />
                  <input
                    type={showPwd ? 'text' : 'password'} value={form.newPassword} onChange={set('newPassword')}
                    placeholder="At least 8 characters" required autoComplete="new-password"
                    className="w-full pl-10 pr-11 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all"
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength bar */}
                {form.newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-gray-100'}`} />
                      ))}
                    </div>
                    <p className={`text-[10px] font-bold ${
                      strength <= 1 ? 'text-rose-500' : strength === 2 ? 'text-amber-500' : strength === 3 ? 'text-blue-500' : 'text-emerald-500'
                    }`}>{strengthLabel} password</p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400 pointer-events-none" />
                  <input
                    type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')}
                    placeholder="Repeat your new password" required autoComplete="new-password"
                    className={`w-full pl-10 pr-11 py-3.5 bg-gray-50 border rounded-xl text-sm font-medium outline-none focus:ring-2 focus:bg-white transition-all
                      ${form.confirmPassword && form.confirmPassword !== form.newPassword
                        ? 'border-rose-300 focus:ring-rose-300'
                        : form.confirmPassword && form.confirmPassword === form.newPassword
                          ? 'border-emerald-300 focus:ring-emerald-300'
                          : 'border-gray-200 focus:ring-primary-400'}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {/* match indicator */}
                  {form.confirmPassword && (
                    <div className={`absolute right-10 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-colors
                      ${form.confirmPassword === form.newPassword ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  )}
                </div>
                {form.confirmPassword && form.confirmPassword !== form.newPassword && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1">Passwords don't match</p>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-black text-white text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 gradient-brand shadow-lg hover:shadow-xl mt-2">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><ShieldCheck className="w-4 h-4" /><span>Reset Password</span></>}
              </button>
            </form>

            {/* Back link */}
            <Link to="/login"
              className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary-600 font-semibold transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
