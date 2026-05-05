import { useEffect, useState } from 'react';
import { User, FileText, Users, Save, Building2, MapPin, Briefcase } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { useToast } from '../../contexts/ToastContext';
import { ClientProfile } from '../../lib/types';
import { Skeleton } from '../../components/ui/Skeleton';

const navItems = [
    { label: 'Overview', path: '/client', icon: FileText },
    { label: 'My Profile', path: '/client/profile', icon: User },
    { label: 'Requisitions', path: '/client/requisitions', icon: FileText },
    { label: 'Browse Recruiters', path: '/client/browse', icon: Users },
];

const INDUSTRY_OPTIONS = [
    'Technology',
    'Finance',
    'Healthcare',
    'Retail',
    'Manufacturing',
    'Legal',
    'Marketing',
    'Real Estate',
    'Education',
    'Media',
    'Energy',
    'Logistics',
    'Hospitality',
    'Non-Profit',
    'Other',
];

export function ClientProfilePage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [profile, setProfile] = useState<ClientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        company_name: '',
        industry: '',
        location: '',
    });

    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            const { data } = await supabase
                .from('client_profiles')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (data) {
                setProfile(data);
                setForm({
                    company_name: data.company_name ?? '',
                    industry: data.industry ?? '',
                    location: data.location ?? '',
                });
            }
            setLoading(false);
        };
        fetchProfile();
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);

        const { error } = await supabase.from('client_profiles').upsert(
            {
                user_id: user.id,
                ...form,
            },
            { onConflict: 'user_id' }
        );

        if (error) {
            showToast('error', 'Failed to save profile. Please try again.');
        } else {
            showToast('success', 'Profile saved successfully!');
        }
        setSaving(false);
    };

    // Completion: company_name, industry, location
    const completionFields = [
        form.company_name.trim() !== '',
        form.industry.trim() !== '',
        form.location.trim() !== '',
    ];
    const completion = Math.round(
        (completionFields.filter(Boolean).length / completionFields.length) * 100
    );

    if (loading) {
        return (
            <DashboardLayout navItems={navItems} title="Client">
                <div className="max-w-3xl mx-auto space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={navItems} title="Client">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-[#0D1B4B]">My Profile</h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Manage your company information visible to recruiters.
                        </p>
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
                        <div
                            className="bg-[#00C853] h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${completion}%` }}
                        />
                    </div>
                    {completion < 100 && (
                        <p className="text-xs text-gray-400 mt-2">
                            Complete your profile so recruiters know who they're working with.
                        </p>
                    )}
                </div>

                <div className="grid lg:grid-cols-5 gap-6">
                    {/* Form */}
                    <div className="lg:col-span-3 space-y-5">
                        {/* Account Info (read-only) */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                            <h2 className="text-sm font-semibold text-[#0D1B4B]">Account Information</h2>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                    Email Address
                                </label>
                                <div className="px-3.5 py-2.5 text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-xl">
                                    {user?.email}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Email cannot be changed here. Contact support if needed.
                                </p>
                            </div>
                        </div>

                        {/* Company Details */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                            <h2 className="text-sm font-semibold text-[#0D1B4B]">Company Details</h2>
                            <Input
                                label="Company Name"
                                placeholder="e.g. Acme Corp"
                                value={form.company_name}
                                onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                            />
                            <Select
                                label="Industry"
                                value={form.industry}
                                onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                            >
                                <option value="">Select an industry...</option>
                                {INDUSTRY_OPTIONS.map(ind => (
                                    <option key={ind} value={ind}>
                                        {ind}
                                    </option>
                                ))}
                            </Select>
                            <Input
                                label="Location"
                                placeholder="e.g. London, UK"
                                value={form.location}
                                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Profile Preview */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-6">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                Profile Preview
                            </p>
                            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                                {/* Avatar / initials */}
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-[#0D1B4B] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                                        {form.company_name
                                            ? form.company_name
                                                .split(' ')
                                                .map(w => w[0])
                                                .join('')
                                                .toUpperCase()
                                                .slice(0, 2)
                                            : '?'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#0D1B4B]">
                                            {form.company_name || 'Your Company'}
                                        </p>
                                        <p className="text-xs text-gray-400">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-2.5 pt-1 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Briefcase size={13} className="text-[#00897B] shrink-0" />
                                        <span>{form.industry || <span className="text-gray-300">Industry not set</span>}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <MapPin size={13} className="text-[#00897B] shrink-0" />
                                        <span>{form.location || <span className="text-gray-300">Location not set</span>}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Building2 size={13} className="text-[#00897B] shrink-0" />
                                        <span className="capitalize">Client</span>
                                    </div>
                                </div>

                                {completion === 100 && (
                                    <div className="flex items-center gap-1.5 text-xs text-[#00C853] font-medium pt-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] inline-block" />
                                        Profile complete
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
