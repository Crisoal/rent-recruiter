import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Users, UserCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { RecruiterProfile } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Textarea, Select } from '../../components/ui/Input';
import { useToast } from '../../contexts/ToastContext';
import { CardSkeleton } from '../../components/ui/Skeleton';

const navItems = [
  { label: 'Overview', path: '/client', icon: FileText },
  { label: 'My Profile', path: '/client/profile', icon: UserCircle },
  { label: 'Requisitions', path: '/client/requisitions', icon: FileText },
  { label: 'Browse Recruiters', path: '/client/browse', icon: Users },
];

const SPECIALTIES = ['Technical', 'Finance', 'Sales', 'Marketing', 'HR', 'Legal', 'Executive', 'Healthcare'];

export function ClientBrowseRecruiters() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [recruiters, setRecruiters] = useState<RecruiterProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');
  const [selectedRecruiter, setSelectedRecruiter] = useState<RecruiterProfile | null>(null);
  const [requestModal, setRequestModal] = useState(false);
  const [engagementType, setEngagementType] = useState<'hire' | 'rent'>('hire');
  const [duration, setDuration] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('recruiter_profiles').select('*').order('created_at', { ascending: false });
      setRecruiters(data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = recruiters.filter(r => {
    const matchSearch = !search || r.full_name.toLowerCase().includes(search.toLowerCase());
    const matchSpec = !filterSpecialty || r.specialties.some(s => s.toLowerCase().includes(filterSpecialty.toLowerCase()));
    const matchAvail = !filterAvailability || r.availability_status === filterAvailability;
    return matchSearch && matchSpec && matchAvail;
  });

  const openRequest = (r: RecruiterProfile) => {
    setSelectedRecruiter(r);
    setRequestModal(true);
  };

  const handleSendRequest = async () => {
    if (!user || !selectedRecruiter) return;
    setSubmitting(true);

    const { error } = await supabase.from('direct_requests').insert({
      client_id: user.id,
      recruiter_id: selectedRecruiter.user_id,
      engagement_type: engagementType,
      duration,
      message,
    });

    if (error) {
      showToast('error', 'Failed to send request.');
    } else {
      showToast('success', 'Request sent!');
      setRequestModal(false);
      setMessage('');
      setDuration('');
    }
    setSubmitting(false);
  };

  return (
    <DashboardLayout navItems={navItems} title="Client">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[#0D1B4B]">Browse Recruiters</h1>
          <p className="text-xs text-gray-500 mt-0.5">Find and connect with specialist recruiters.</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#00C853] focus:ring-2 focus:ring-[#00C853]/20 transition-all"
            />
          </div>
          <select
            value={filterSpecialty}
            onChange={e => setFilterSpecialty(e.target.value)}
            className="px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#00C853] bg-white"
          >
            <option value="">All Specialties</option>
            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filterAvailability}
            onChange={e => setFilterAvailability(e.target.value)}
            className="px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#00C853] bg-white"
          >
            <option value="">All Availability</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="open_to_offers">Open to Offers</option>
          </select>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <Users size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No recruiters match your criteria.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(r => {
              const initials = r.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    {r.photo_url ? (
                      <img src={r.photo_url} alt={r.full_name} className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#0D1B4B] flex items-center justify-center text-white text-xs font-semibold">
                        {initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0D1B4B] truncate">{r.full_name || 'Recruiter'}</p>
                      <p className="text-xs text-gray-400">{r.experience_years}y experience</p>
                    </div>
                    <Badge status={r.availability_status} />
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{r.bio || 'No bio yet.'}</p>
                  {r.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {r.specialties.slice(0, 3).map(s => (
                        <span key={s} className="text-xs px-2 py-0.5 bg-[#F0F4FF] text-[#0D1B4B] rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Link to={`/recruiters/${r.user_id}`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full">View Profile</Button>
                    </Link>
                    <Button variant="primary" size="sm" className="flex-1" onClick={() => openRequest(r)}>
                      Send Request
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={requestModal} onClose={() => setRequestModal(false)} title={`Request ${selectedRecruiter?.full_name ?? 'Recruiter'}`}>
        <div className="flex flex-col gap-4">
          <Select label="Engagement Type" value={engagementType} onChange={e => setEngagementType(e.target.value as 'hire' | 'rent')}>
            <option value="hire">Hire</option>
            <option value="rent">Rent</option>
          </Select>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">Duration</label>
            <input
              type="text"
              placeholder="e.g. 3 months, permanent"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#00C853] focus:ring-2 focus:ring-[#00C853]/20 transition-all"
            />
          </div>
          <Textarea label="Message" placeholder="Describe the opportunity..." rows={3} value={message} onChange={e => setMessage(e.target.value)} />
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={() => setRequestModal(false)} className="flex-1">Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSendRequest} loading={submitting} className="flex-1">Send Request</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
