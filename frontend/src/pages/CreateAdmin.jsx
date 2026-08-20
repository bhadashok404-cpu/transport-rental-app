import { useState } from 'react';
import { KeyRound, Mail, ShieldPlus, User, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services';

export default function CreateAdmin() {
  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [done, setDone]     = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    setSaving(true);
    try {
      await authService.createAdmin(form);
      toast.success('Admin account created!');
      setForm({ name: '', email: '', password: '' });
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      toast.error(err?.message || 'Could not create admin account.');
    } finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header stripe */}
      <div className="gradient-brand px-6 py-5 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <ShieldPlus className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-black">New Admin Account</p>
          <p className="text-white/70 text-xs">Grant super-admin portal access</p>
        </div>
      </div>

      <form onSubmit={submit} className="p-6 space-y-5">
        {[
          { key: 'name',     label: 'Full Name',       type: 'text',     placeholder: 'Operations Manager', icon: User },
          { key: 'email',    label: 'Email Address',   type: 'email',    placeholder: 'admin@example.com',  icon: Mail },
          { key: 'password', label: 'Temp Password',   type: 'password', placeholder: 'Min 8 characters',   icon: KeyRound },
        ].map(({ key, label, type, placeholder, icon: Icon }) => (
          <div key={key}>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">{label}</label>
            <div className="relative">
              <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 pointer-events-none z-10" />
              <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder} required
                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 hover:border-gray-200 focus:border-primary-400 focus:bg-white rounded-xl text-sm font-medium outline-none transition-all" />
            </div>
          </div>
        ))}

        <div className="flex items-start gap-3 p-4 bg-violet-50 border border-violet-100 rounded-xl text-sm text-violet-700">
          <ShieldPlus className="w-4 h-4 mt-0.5 shrink-0 text-violet-500" />
          <p className="font-medium">The new admin can reset their password using the forgot-password flow after first login.</p>
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-4 rounded-xl font-black text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2 gradient-brand shadow-lg hover:shadow-xl">
          {saving
            ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : done
              ? <><CheckCircle className="w-5 h-5" />Account Created!</>
              : <><ShieldPlus className="w-5 h-5" />Create Admin Account</>}
        </button>
      </form>
    </div>
  );
}
