import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import { CURRENCIES } from '../constants/index.js';
import { useAuth } from '../store/AuthContext.jsx';
import { useToast } from '../store/ToastContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', currency: 'PKR' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Enter a valid email address';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (Object.keys(e).length) return setErrors(e);

    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, currency: form.currency });
      toast.success('Account created. Welcome aboard!');
      navigate('/', { replace: true });
    } catch (err) {
      if (err.details?.length) setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      else setErrors({ email: err.status === 409 ? err.message : undefined });
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Start tracking income, expenses and budgets in minutes.</p>
      </div>
      <Input label="Full name" autoComplete="name" leftIcon={User} placeholder="Aqib Ali" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
      <Input label="Email" type="email" autoComplete="email" leftIcon={Mail} placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
      <Input label="Password" type="password" autoComplete="new-password" leftIcon={Lock} placeholder="At least 8 characters" value={form.password} onChange={(e) => set('password', e.target.value)} error={errors.password} />
      <Select label="Currency" options={CURRENCIES.map((c) => ({ value: c.code, label: c.label }))} value={form.currency} onChange={(e) => set('currency', e.target.value)} error={errors.currency} />
      <Button type="submit" size="lg" className="w-full" loading={loading}>Create account</Button>
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">Log in</Link>
      </p>
    </form>
  );
}
