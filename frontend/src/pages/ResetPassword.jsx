import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, Lock } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { forgotPassword, resetPassword } from '../services/authService.js';
import { useToast } from '../store/ToastContext.jsx';

const RESEND_SECONDS = 60;

export default function ResetPassword() {
  const toast = useToast();
  const navigate = useNavigate();
  const email = useLocation().state?.email;

  const [form, setForm] = useState({ otp: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS); // a code was just sent on the previous page

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Opened directly (no email in navigation state): start again from the first step.
  if (!email) return <Navigate to="/forgot-password" replace />;

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: k === 'otp' ? v.replace(/\D/g, '').slice(0, 6) : v }));
    setErrors((e) => ({ ...e, [k]: undefined, form: undefined }));
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!/^\d{6}$/.test(form.otp)) e.otp = 'Enter the 6-digit code from your email';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    if (Object.keys(e).length) return setErrors(e);

    setLoading(true);
    try {
      await resetPassword({ email, otp: form.otp, password: form.password });
      toast.success('Password updated. Log in with your new password.');
      navigate('/login', { replace: true });
    } catch (err) {
      if (err.details?.length) setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      else setErrors({ form: err.message });
      if (err.status !== 400) toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await forgotPassword(email);
      setCooldown(RESEND_SECONDS);
      toast.success('If this email is registered, a new code is on its way.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Reset password</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          We sent a 6-digit code to <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span>. It expires in 10 minutes.
        </p>
      </div>
      {errors.form && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {errors.form}
        </div>
      )}
      <Input label="Verification code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} leftIcon={KeyRound}
        className="font-semibold tracking-[0.3em]" placeholder="123456" value={form.otp} onChange={(e) => set('otp', e.target.value)} error={errors.otp} />
      <Input label="New password" type="password" autoComplete="new-password" leftIcon={Lock} placeholder="At least 8 characters"
        value={form.password} onChange={(e) => set('password', e.target.value)} error={errors.password} />
      <Input label="Confirm new password" type="password" autoComplete="new-password" leftIcon={Lock} placeholder="Re-enter new password"
        value={form.confirm} onChange={(e) => set('confirm', e.target.value)} error={errors.confirm} />
      <Button type="submit" size="lg" className="w-full" loading={loading}>Reset password</Button>
      <Button variant="ghost" size="sm" className="w-full" loading={resending} disabled={cooldown > 0} onClick={resend}>
        {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
      </Button>
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Wrong email? <Link to="/forgot-password" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">Start over</Link>
      </p>
    </form>
  );
}
