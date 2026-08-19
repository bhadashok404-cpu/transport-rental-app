import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, Car, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useApp();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '', address: '', password: '', role: 'Customer', licenseNumber: '', licenseExpiryDate: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, phoneNumber, address, password, role, licenseNumber, licenseExpiryDate } = form;
    if (!firstName || !lastName || !email || !phoneNumber || !address || !password || (role === 'Driver' && (!licenseNumber || !licenseExpiryDate))) {
      toast.error('Please fill all fields'); return;
    }
    setLoading(true);
    try {
      const session = await register({
        firstName,
        lastName,
        email,
        phoneNumber,
        address,
        password,
        role,
        licenseNumber: role === 'Driver' ? licenseNumber : null,
        licenseExpiryDate: role === 'Driver' ? licenseExpiryDate : null,
      });
      toast.success('Account created! Welcome aboard 🎉');
      navigate(session.role === 'Driver' ? '/driver' : '/dashboard');
    } catch (err) {
      toast.error(err?.title || err?.message || 'Registration failed. Email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'firstName', label: 'First Name', type: 'text', placeholder: 'Rahul', icon: User, half: true },
    { key: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Sharma', icon: User, half: true },
    { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', icon: Mail, half: false },
    { key: 'phoneNumber', label: 'Phone Number', type: 'tel', placeholder: '+91 98765 43210', icon: Phone, half: false },
    { key: 'address', label: 'Address', type: 'text', placeholder: '123 MG Road, Bangalore', icon: MapPin, half: false },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-primary-600 to-primary-800 px-8 py-10 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white">Create Account</h1>
            <p className="text-primary-200 mt-1.5 text-sm">Join 50,000+ happy customers</p>
          </div>

          <div className="px-8 py-8">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {fields.filter(f => f.half).map(({ key, label, type, placeholder, icon: Icon }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder}
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Register As</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={form.role} onChange={set('role')} className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition">
                    <option value="Customer">Customer</option>
                    <option value="Driver">Driver</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 mb-5">
                {fields.filter(f => !f.half).map(({ key, label, type, placeholder, icon: Icon }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                    <div className="relative">
                      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder}
                        className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition" />
                    </div>
                  </div>
                ))}

                {form.role === 'Driver' && <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">License Number</label>
                    <input value={form.licenseNumber} onChange={set('licenseNumber')} placeholder="Enter driving license number" className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">License Expiry Date</label>
                    <input type="date" value={form.licenseExpiryDate} onChange={set('licenseExpiryDate')} className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition" />
                  </div>
                </>}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min 8 characters"
                      className="w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition" />
                    <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create My Account'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition">Sign in</Link>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By creating an account you agree to our{' '}
          <a href="#" className="text-primary-600 hover:underline">Terms</a> &{' '}
          <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
