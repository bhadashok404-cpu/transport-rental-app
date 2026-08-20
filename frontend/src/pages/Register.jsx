import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, Car, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const FIELDS = [
  { key: 'firstName', label: 'First Name', type: 'text', placeholder: 'Rahul', icon: User, half: true },
  { key: 'lastName',  label: 'Last Name',  type: 'text', placeholder: 'Sharma', icon: User, half: true },
  { key: 'email',    label: 'Email',       type: 'email', placeholder: 'you@example.com', icon: Mail, half: false },
  { key: 'phoneNumber', label: 'Phone',   type: 'tel',  placeholder: '+91 98765 43210', icon: Phone, half: false },
  { key: 'address',  label: 'Address',     type: 'text', placeholder: '123 MG Road, Bangalore', icon: MapPin, half: false },
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useApp();
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phoneNumber:'', address:'', password:'', role:'Customer', licenseNumber:'', licenseExpiryDate:'' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, phoneNumber, address, password, role, licenseNumber, licenseExpiryDate } = form;
    if (!firstName || !lastName || !email || !phoneNumber || !address || !password) { toast.error('Please fill all fields'); return; }
    if (role === 'Driver' && (!licenseNumber || !licenseExpiryDate)) { toast.error('License details required for drivers'); return; }
    setLoading(true);
    try {
      const s = await register({ firstName, lastName, email, phoneNumber, address, password, role, licenseNumber: role === 'Driver' ? licenseNumber : null, licenseExpiryDate: role === 'Driver' ? licenseExpiryDate : null });
      toast.success('Account created! 🎉');
      navigate(s.role === 'Driver' ? '/driver' : '/dashboard');
    } catch (err) {
      toast.error(err?.title || err?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const Field = ({ k, label, type, placeholder, icon: Icon }) => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
        <input type={type} value={form[k]} onChange={set(k)} placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden gradient-hero flex items-center justify-center px-4 py-8">
      <div className="blob blob-violet w-96 h-96 top-0 left-0 -translate-x-1/3 -translate-y-1/3 opacity-40" />
      <div className="blob blob-rose w-72 h-72 bottom-0 right-0 translate-x-1/3 translate-y-1/3 opacity-35" />

      <div className="relative w-full max-w-lg animate-pop">
        <div className="flex justify-center mb-6">
          <div className="glass-dark rounded-full px-4 py-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-white/80 text-sm font-medium">Create your free account</span>
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
              <h1 className="text-3xl font-black text-white">Join RideRental</h1>
              <p className="text-white/70 mt-1.5 text-sm">50,000+ happy customers trust us</p>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {/* Role */}
            <div className="mb-5">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Register as</label>
              <div className="grid grid-cols-2 gap-2">
                {['Customer', 'Driver'].map(r => (
                  <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                    className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 ${form.role === r ? 'gradient-brand text-white shadow-lg' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                    {r === 'Customer' ? '👤 Customer' : '🚗 Driver'}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Half-width fields */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {FIELDS.filter(f => f.half).map(({ key: k, ...rest }) => (
                  <Field key={k} k={k} {...rest} />
                ))}
              </div>

              {/* Full-width fields */}
              <div className="space-y-4 mb-4">
                {FIELDS.filter(f => !f.half).map(({ key: k, ...rest }) => (
                  <Field key={k} k={k} {...rest} />
                ))}

                {/* Driver-only fields */}
                {form.role === 'Driver' && (
                  <>
                    <Field k="licenseNumber" label="License Number" type="text" placeholder="DL12345678" icon={ShieldCheck} />
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">License Expiry</label>
                      <input type="date" value={form.licenseExpiryDate} onChange={set('licenseExpiryDate')}
                        className="input-field py-3.5 rounded-xl" />
                    </div>
                  </>
                )}

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                    <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')}
                      placeholder="Min 8 characters" autoComplete="new-password"
                      className="input-field pl-10 pr-12 py-3.5 rounded-xl" />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-black text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2 gradient-brand shadow-lg hover:shadow-xl">
                {loading
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-bold hover:text-primary-800">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
