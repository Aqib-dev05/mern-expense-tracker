import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">Page not found</h1>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">The page you’re looking for doesn’t exist or was moved.</p>
      <Link to="/" className="mt-6"><Button>Back to dashboard</Button></Link>
    </div>
  );
}
