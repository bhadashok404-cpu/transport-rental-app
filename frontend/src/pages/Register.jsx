import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, Car, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate     = useNavigate();
  const { register } = useApp();
  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', phoneNumber:'',
    address:'', password:'', role:'Customer',
    licenseNumber:'', licenseExpiryDate:''
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, phoneNumber, address, password, role, licenseNumber, licenseExpiryDate } = form;
    if (!firstName || !lastName || !email || !phoneNumber || !address || !password) {
      toast.error('Please fill all fields'); return;
    }
    if (role === 'Driver' && (!licenseNumber || !licenseExpiryDate)) {
      toast.error('License details required for drivers'); return;
    }
    setLoading(true);
    try {
      const s = await register({
        firstName, lastName, email, phoneNumber, address, password, role,
        licenseNumber:     role === 'Driver' ? licenseNumber     : null,
        licenseExpiryDate: role === 'Driver' ? licenseExpiryDate : null,
      });
      toast.success('Account created! 🎉');
      navigate(s.role === 'Driver' ? '/driver' : '/dashboard');
    } catch (err) {
      toast.error(err?.title || err?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  // Micro input — label + icon input, min height
  const F = ({ k, label, type, ph, Icon }) => (
    <div>
      <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-400 pointer-events-none z-10" />
        <input type={type} value={form[k]} onChange={set(k)} placeholder={ph}
          className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all placeholder-gray-400" />
      </div>
    </div>
  );

  const isDriver = form.role === 'Driver';

  return (
    <div className="h-screen relative overflow-hidden gradient-hero flex items-center justify-center px-4 pt-14">
      {/* Blobs */}
      <div className="blob blob-violet w-72 h-72 top-0 left-0 -translate-x-1/3 -translate-y-1/3 opacity-40" />
      <div className="blob blob-rose   w-56 h-56 bottom-0 right-0  translate-x-1/3  translate-y-1/3 opacity-35" />

      <div className="relative w-full max-w-sm animate-pop">
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">

          {/* ── Header ── */}
          <div className="relative px-5 py-3.5 overflow-hidden gradient-brand flex items-center gap-3">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px,white 1px,transparent 0)', backgroundSize: '18px 18px' }} />
            <div className="relative w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
              <Car className="w-4 h-4 text-white" />
            </div>
            <div className="relative">
              <p className="text-base font-black text-white leading-none">Join RideRental</p>
              <p className="text-white/65 text-[10px] mt-0.5">50,000+ happy customers trust us</p>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="px-5 py-3 space-y-2.5">

            {/* Role toggle */}
            <div className="grid grid-cols-2 gap-2">
              {['Customer', 'Driver'].map(r => (
                <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                  className={`py-1.5 rounded-lg text-xs font-black transition-all duration-200 ${form.role === r ? 'gradient-brand text-white shadow' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
                  {r === 'Customer' ? '👤 Customer' : '🚗 Driver'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">

              {/* Name row */}
              <div className="grid grid-cols-2 gap-2">
                <F k="firstName" label="First Name" type="text"  ph="Rahul"          Icon={User} />
                <F k="lastName"  label="Last Name"  type="text"  ph="Sharma"         Icon={User} />
              </div>

              <F k="email"       label="Email"   type="email" ph="you@example.com"       Icon={Mail}   />
              <F k="phoneNumber" label="Phone"   type="tel"   ph="+91 98765 43210"        Icon={Phone}  />
              <F k="address"     label="Address" type="text"  ph="123 MG Road, Bangalore" Icon={MapPin} />

              {/* Driver-only extra fields */}
              {isDriver && (
                <>
                  <F k="licenseNumber" label="License No." type="text" ph="DL12345678" Icon={ShieldCheck} />
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">License Expiry</label>
                    <input type="date" value={form.licenseExpiryDate} onChange={set('licenseExpiryDate')}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all" />
                  </div>
                </>
              )}

              {/* Password */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-400 pointer-events-none z-10" />
                  <input
                    type={showPwd ? 'text' : 'password'} value={form.password}
                    onChange={set('password')} placeholder="Min 8 characters"
                    autoComplete="new-password"
                    className="w-full pl-8 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all placeholder-gray-400"
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl font-black text-white text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 gradient-brand shadow-lg hover:shadow-xl">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-center text-[11px] text-gray-500 pb-0.5">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-bold hover:text-primary-800 transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
