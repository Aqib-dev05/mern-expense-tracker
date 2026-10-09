import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useAuth } from '../store/AuthContext.jsx';
import { useToast } from '../store/ToastContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined, form: undefined })); };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Enter your password';
    if (Object.keys(e).length) return setErrors(e);

    setLoading(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setErrors({ form: err.message });
      if (err.status !== 401) toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Log in to see where your money is going.</p>
      </div>
      {errors.form && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {errors.form}
        </div>
      )}
      <Input label="Email" type="email" autoComplete="email" leftIcon={Mail} placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
      <Input label="Password" type="password" autoComplete="current-password" leftIcon={Lock} placeholder="Your password" value={form.password} onChange={(e) => set('password', e.target.value)} error={errors.password} />
      <Button type="submit" size="lg" className="w-full" loading={loading}>Log in</Button>
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        New here? <Link to="/register" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">Create an account</Link>
      </p>
    </form>
  );
}
