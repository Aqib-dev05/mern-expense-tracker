import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { forgotPassword } from '../services/authService.js';
import { useToast } from '../store/ToastContext.jsx';

export default function ForgotPassword() {
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);

  const submit = async (ev) => {
    ev.preventDefault();
    const value = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(value)) return setError('Enter a valid email address');

    setLoading(true);
    try {
      await forgotPassword(value);
      toast.success('If this email is registered, a 6-digit code is on its way.');
      navigate('/reset-password', { state: { email: value } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Forgot password?</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter your account email and we will send you a 6-digit code to reset your password.
        </p>
      </div>
      <Input label="Email" type="email" autoComplete="email" leftIcon={Mail} placeholder="you@example.com" value={email}
        onChange={(e) => { setEmail(e.target.value); setError(undefined); }} error={error} />
      <Button type="submit" size="lg" className="w-full" loading={loading}>Send code</Button>
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Remembered it? <Link to="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">Back to log in</Link>
      </p>
    </form>
  );
}
