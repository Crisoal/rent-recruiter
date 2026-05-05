import { useEffect, useState } from 'react';
import { User, FileText, Briefcase, Inbox, Plus, X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../contexts/ToastContext';
import { RecruiterProfile } from '../../lib/types';
import { Skeleton } from '../../components/ui/Skeleton';

const navItems = [
  { label: 'Overview', path: '/recruiter', icon: User },
  { label: 'My Profile', path: '/recruiter/profile', icon: User },
  { label: 'Open Requisitions', path: '/recruiter/requisitions', icon: FileText },
  { label: 'My Applications', path: '/recruiter/applications', icon: Briefcase },
  { label: 'Direct Requests', path: '/recruiter/requests', icon: Inbox },
];

const SPECIALTY_OPTIONS = ['Technical', 'Finance', 'Sales', 'Marketing', 'HR', 'Legal', 'Executive', 'Healthcare', 'Operations'];
const INDUSTRY_OPTIONS = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Legal', 'Marketing', 'Real Estate', 'Education', 'Media'];

export function RecruiterProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    experience_years: 0,
    availability_status: 'available' as RecruiterProfile['availability_status'],
    photo_url: '',
    specialties: [] as string[],
    industries: [] as string[],
  });
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from('recruiter_profiles').select('*').eq('user_id', user.id).maybeSingle();
      if (data) {
        setProfile(data);
        setForm({
          full_name: data.full_name ?? '',
          bio: data.bio ?? '',
          experience_years: data.experience_years ?? 0,
          availability_status: data.availability_status ?? 'available',
          photo_url: data.photo_url ?? '',
          specialties: data.specialties ?? [],
          industries: data.industries ?? [],
        });
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const addTag = (type: 'specialties' | 'industries', value: string) => {
    if (!value.trim()) return;
    setForm(f => ({ ...f, [type]: [...new Set([...f[type], value.trim()])] }));
    if (type === 'specialties') setSpecialtyInput('');
    else setIndustryInput('');
  };

  const removeTag = (type: 'specialties' | 'industries', value: string) => {
    setForm(f => ({ ...f, [type]: f[type].filter(v => v !== value) }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase.from('recruiter_profiles').upsert({
      user_id: user.id,
      ...form,
    }, { onConflict: 'user_id' });

    if (error) {
      showToast('error', 'Failed to save profile.');
    } else {
      showToast('success', 'Profile saved successfully!');
    }
    setSaving(false);
  };

  const completionFields = [form.full_name, form.bio, form.photo_url, form.specialties.length > 0, form.industries.length > 0, form.experience_years > 0];
  const completion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Recruiter">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Recruiter">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0D1B4B]">My Profile</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage how you appear to clients.</p>
          </div>
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
            <Save size={14} /> Save Changes
          </Button>
        </div>

        {/* Completion bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500">Profile Completion</p>
            <span className="text-xs font-bold text-[#00C853]">{completion}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-[#00C853] h-1.5 rounded-full transition-all duration-500" style={{ width: `${completion}%` }} />
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-[#0D1B4B]">Basic Information</h2>
              <Input label="Full Name" placeholder="Jane Smith" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
              <Textarea label="Bio" placeholder="Tell clients about your recruiting expertise..." rows={4} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Years of Experience" type="number" min={0} max={50} value={form.experience_years} onChange={e => setForm(f => ({ ...f, experience_years: parseInt(e.target.value) || 0 }))} />
                <Select label="Availability Status" value={form.availability_status} onChange={e => setForm(f => ({ ...f, availability_status: e.target.value as RecruiterProfile['availability_status'] }))}>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="open_to_offers">Open to Offers</option>
                </Select>
              </div>
              <Input label="Photo URL" placeholder="https://example.com/photo.jpg" value={form.photo_url} onChange={e => setForm(f => ({ ...f, photo_url: e.target.value }))} />
            </div>

            {/* Specialties */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-[#0D1B4B]">Specialties</h2>
              <div className="flex gap-2">
                <select
                  value={specialtyInput}
                  onChange={e => setSpecialtyInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#00C853] bg-white"
                >
                  <option value="">Select a specialty...</option>
                  {SPECIALTY_OPTIONS.filter(s => !form.specialties.includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <Button variant="secondary" size="sm" onClick={() => addTag('specialties', specialtyInput)}>
                  <Plus size={14} />
                </Button>
              </div>
              {form.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.specialties.map(s => (
                    <span key={s} className="inline-flex items-center gap-1.5 text-xs px-3 py-1 bg-[#0D1B4B] text-white rounded-full">
                      {s}
                      <button onClick={() => removeTag('specialties', s)}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Industries */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-[#0D1B4B]">Industries</h2>
              <div className="flex gap-2">
                <select
                  value={industryInput}
                  onChange={e => setIndustryInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#00C853] bg-white"
                >
                  <option value="">Select an industry...</option>
                  {INDUSTRY_OPTIONS.filter(i => !form.industries.includes(i)).map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                <Button variant="secondary" size="sm" onClick={() => addTag('industries', industryInput)}>
                  <Plus size={14} />
                </Button>
              </div>
              {form.industries.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.industries.map(ind => (
                    <span key={ind} className="inline-flex items-center gap-1.5 text-xs px-3 py-1 bg-[#00897B] text-white rounded-full">
                      {ind}
                      <button onClick={() => removeTag('industries', ind)}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Live Preview</p>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  {form.photo_url ? (
                    <img src={form.photo_url} alt="Profile" className="w-12 h-12 rounded-xl object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#0D1B4B] flex items-center justify-center text-white text-sm font-semibold">
                      {form.full_name ? form.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-[#0D1B4B]">{form.full_name || 'Your Name'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge status={form.availability_status} />
                      {form.experience_years > 0 && <span className="text-xs text-gray-400">{form.experience_years}y exp</span>}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-3">
                  {form.bio || 'Your bio will appear here...'}
                </p>
                {form.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.specialties.map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 bg-[#F0F4FF] text-[#0D1B4B] rounded-full">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
