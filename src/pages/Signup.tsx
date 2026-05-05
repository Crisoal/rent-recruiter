import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Users, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../contexts/ToastContext';

type Role = 'client' | 'recruiter';

export function Signup() {
  const [params] = useSearchParams();
  const { showToast } = useToast();

  const initialRole = (params.get('role') as Role) || 'client';
  const [role, setRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = 'Email is required';
    if (!password || password.length < 6) e.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (role === 'client' && !companyName) e.companyName = 'Company name is required';
    if (role === 'recruiter' && !fullName) e.fullName = 'Full name is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      showToast('error', error.message);
      setLoading(false);
      return;
    }

    const userId = data.user!.id;

    const { error: userError } = await supabase.from('users').insert({ id: userId, email, role });
    if (userError) {
      showToast('error', 'Account setup failed. Please try again.');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    if (role === 'client') {
      await supabase.from('client_profiles').insert({ user_id: userId, company_name: companyName });
    } else {
      await supabase.from('recruiter_profiles').insert({ user_id: userId, full_name: fullName });
    }

    showToast('success', 'Account created! Welcome to Accretio.');
    // No manual navigate — PublicOnlyRoute will redirect once AuthContext
    // finishes loading the user and their role from the users table.
    setLoading(false);
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
          <h1 className="text-xl font-bold text-[#0D1B4B]">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Choose how you'll use Accretio</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(['client', 'recruiter'] as Role[]).map(r => {
              const Icon = r === 'client' ? Briefcase : Users;
              const labels = { client: 'I need a recruiter', recruiter: 'I am a recruiter' };
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
                    ${role === r
                      ? 'border-[#00C853] bg-[#00C853]/5 text-[#0D1B4B]'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                >
                  <Icon size={20} className={role === r ? 'text-[#00C853]' : 'text-gray-400'} />
                  <span className="text-xs font-medium">{labels[r]}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {role === 'client' ? (
              <Input
                label="Company name"
                placeholder="Acme Corp"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                error={errors.companyName}
              />
            ) : (
              <Input
                label="Full name"
                placeholder="Jane Smith"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                error={errors.fullName}
              />
            )}
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
              placeholder="Min. 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={errors.password}
            />
            <Input
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
            />
            <Button type="submit" loading={loading} className="mt-2 w-full">
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#00C853] font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
