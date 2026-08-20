import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', role: 'Customer', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const set = key => event => setForm(current => ({ ...current, [key]: event.target.value }));

  const submit = async event => {
    event.preventDefault();
    if (!form.email || !form.newPassword || form.newPassword.length < 8) return toast.error('Enter an email and a password of at least 8 characters.');
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match.');
    setLoading(true);
    try {
      await authService.resetPassword({ email: form.email, role: form.role, newPassword: form.newPassword });
      toast.success('Password reset successfully.');
      navigate('/login');
    } catch (error) {
      toast.error(error?.message || 'We could not reset that account.');
    } finally { setLoading(false); }
  };

  return <div className="auth-shell"><div className="auth-card max-w-md"><div className="auth-header"><div className="auth-mark"><Car className="w-7 h-7" /></div><p className="auth-kicker">RideRental account</p><h1>Reset your password</h1><p>Choose your account type and create a new password.</p></div><form onSubmit={submit} className="p-8 space-y-5"><div><label className="form-label">Account type</label><div className="input-wrap"><ShieldCheck /><select value={form.role} onChange={set('role')}><option value="Customer">Customer</option><option value="Driver">Driver</option><option value="Admin">Admin</option></select></div></div><div><label className="form-label">Email address</label><div className="input-wrap"><Mail /><input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" /></div></div><div><label className="form-label">New password</label><div className="input-wrap"><KeyRound /><input type="password" value={form.newPassword} onChange={set('newPassword')} placeholder="At least 8 characters" /></div></div><div><label className="form-label">Confirm password</label><div className="input-wrap"><KeyRound /><input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat your new password" /></div></div><button disabled={loading} className="auth-submit">{loading ? 'Resetting...' : 'Reset Password'}</button><Link to="/login" className="auth-back"><ArrowLeft className="w-4 h-4" /> Back to sign in</Link></form></div></div>;
}
