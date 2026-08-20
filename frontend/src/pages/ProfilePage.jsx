import { useEffect, useState } from 'react';
import { CheckCircle, Mail, MapPin, Phone, Save, User, ShieldCheck, Car, Edit3, Camera, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { accountService } from '../services';
import { useApp } from '../context/AppContext';
import { Loader } from '../components';

const ROLE_CONFIG = {
  Admin: {
    gradient: 'linear-gradient(135deg,#020617 0%,#0f172a 40%,#1e1b4b 100%)',
    accent: 'text-violet-400',
    badge: '⚡ Super Admin',
    badgeBg: 'bg-violet-500/20 text-violet-300',
    backTo: '/admin',
    backLabel: 'Admin Dashboard',
  },
  Driver: {
    gradient: 'linear-gradient(135deg,#064e3b 0%,#059669 50%,#0d9488 100%)',
    accent: 'text-emerald-400',
    badge: '🚗 Verified Driver',
    badgeBg: 'bg-emerald-500/20 text-emerald-300',
    backTo: '/driver',
    backLabel: 'Driver Portal',
  },
  Customer: {
    gradient: 'linear-gradient(135deg,#1e1b4b 0%,#1d4ed8 50%,#6d28d9 100%)',
    accent: 'text-primary-400',
    badge: '✓ Customer',
    badgeBg: 'bg-primary-500/20 text-primary-300',
    backTo: '/dashboard',
    backLabel: 'My Dashboard',
  },
};

export default function ProfilePage() {
  const { user, updateUser } = useApp();
  const roleConfig = ROLE_CONFIG[user?.role] || ROLE_CONFIG.Customer;

  const [form, setForm] = useState({
    name:        user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    email:       user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address:     user?.address || '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    accountService.getProfile()
      .then(res => {
        const p = res?.data || res;
        setForm({
          name:        p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
          email:       p.email || '',
          phoneNumber: p.phoneNumber || '',
          address:     p.address || '',
        });
      })
      .catch(() => toast.error('Could not load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await accountService.updateProfile(form);
      updateUser?.(res?.data || res);
      setSaved(true);
      toast.success('Profile saved!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast.error(err?.message || 'Could not save profile.');
    } finally { setSaving(false); }
  };

  const initials = form.name
    ? form.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
    : (user?.role || '?')[0].toUpperCase();

  if (loading) return <Loader fullPage />;

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Back link */}
        <Link to={roleConfig.backTo}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to {roleConfig.backLabel}
        </Link>

        {/* ── Hero card ── */}
        <div className="relative overflow-hidden rounded-3xl mb-6 shadow-xl">
          {/* Background */}
          <div className="absolute inset-0" style={{ background: roleConfig.gradient }} />
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
          {/* Blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0 group">
              <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center text-white text-4xl font-black shadow-2xl ring-4 ring-white/20">
                {initials}
              </div>
              <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{form.name || 'Your Name'}</h1>
              <p className="text-white/60 text-sm mt-1">{form.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${roleConfig.badgeBg}`}>
                  {roleConfig.badge}
                </span>
                {form.phoneNumber && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 text-white/70">
                    <Phone className="w-3 h-3" /> {form.phoneNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Edit icon */}
            <div className="shrink-0">
              <div className="w-10 h-10 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center cursor-pointer transition">
                <Edit3 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Form card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Card header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 text-sm">Personal Information</h2>
              <p className="text-xs text-gray-400">Keep your details up to date</p>
            </div>
          </div>

          <form onSubmit={submit} className="p-6 space-y-5">
            {/* Full name */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                <input type="text" value={form.name} onChange={set('name')} required
                  placeholder="Your full name"
                  className="input-field pl-10 rounded-xl py-3.5" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                <input type="email" value={form.email} onChange={set('email')} required
                  placeholder="you@example.com"
                  className="input-field pl-10 rounded-xl py-3.5" />
              </div>
            </div>

            {/* Phone + Address row */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                  <input type="tel" value={form.phoneNumber} onChange={set('phoneNumber')}
                    placeholder="+91 98765 43210"
                    className="input-field pl-10 rounded-xl py-3.5" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                  <input type="text" value={form.address} onChange={set('address')}
                    placeholder="Your city & address"
                    className="input-field pl-10 rounded-xl py-3.5" />
                </div>
              </div>
            </div>

            {/* Info notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 font-medium">
                Your personal details are encrypted and only used for bookings and support communications.
              </p>
            </div>

            {/* Save button */}
            <button type="submit" disabled={saving}
              className="w-full py-4 rounded-xl font-black text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl gradient-brand">
              {saving
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : saved
                  ? <><CheckCircle className="w-5 h-5" /> Profile Saved!</>
                  : <><Save className="w-5 h-5" /> Save Profile</>}
            </button>
          </form>
        </div>

        {/* ── Account meta (read-only) ── */}
        <div className="mt-5 bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          <div className="px-6 py-4 flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full gradient-brand" />
            <h3 className="font-black text-gray-900 text-sm">Account Details</h3>
          </div>
          {[
            { label: 'Role',        value: user?.role || '—' },
            { label: 'Account ID',  value: `#${user?.id || '—'}` },
            { label: 'Status',      value: 'Active & Verified', highlight: true },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="flex items-center justify-between px-6 py-3.5">
              <span className="text-sm text-gray-500 font-medium">{label}</span>
              <span className={`text-sm font-bold ${highlight ? 'text-emerald-600' : 'text-gray-900'}`}>{value}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
