import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../contexts/ToastContext';

export function Login() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = 'Email is required';
    if (!password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showToast('error', error.message);
      setLoading(false);
      return;
    }

    // No manual navigate — PublicOnlyRoute will redirect once AuthContext
    // finishes loading the user and their role from the users table.
    showToast('success', 'Welcome back!');
  };

  return (
    <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 26,24 2,24" fill="#00C853" />
              <text x="9" y="22" fontSize="11" fontWeight="700" fill="white" fontFamily="Inter">A</text>
            </svg>
            <span className="text-base font-bold text-[#0D1B4B]">Accretio</span>
          </Link>
          <h1 className="text-xl font-bold text-[#0D1B4B]">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={errors.password}
            />
            <Button type="submit" loading={loading} className="mt-2 w-full">
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#00C853] font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
