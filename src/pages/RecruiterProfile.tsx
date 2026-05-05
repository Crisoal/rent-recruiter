import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { RecruiterProfile as IRecruiterProfile } from '../lib/types';
import { Navbar } from '../components/layout/Navbar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Textarea, Select } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Skeleton } from '../components/ui/Skeleton';

export function RecruiterProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [recruiter, setRecruiter] = useState<IRecruiterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestModal, setRequestModal] = useState(false);
  const [engagementType, setEngagementType] = useState<'hire' | 'rent'>('hire');
  const [duration, setDuration] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('recruiter_profiles')
        .select('*')
        .eq('user_id', id)
        .maybeSingle();
      setRecruiter(data);
      setLoading(false);
    };
    if (id) fetch();
  }, [id]);

  const handleSendRequest = async () => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'client') { showToast('error', 'Only clients can send requests.'); return; }
    setSubmitting(true);

    const { error } = await supabase.from('direct_requests').insert({
      client_id: user.id,
      recruiter_id: id,
      engagement_type: engagementType,
      duration,
      message,
    });

    if (error) {
      showToast('error', 'Failed to send request.');
    } else {
      showToast('success', 'Request sent successfully!');
      setRequestModal(false);
      setMessage('');
      setDuration('');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4FF]">
        <Navbar />
        <div className="pt-20 max-w-3xl mx-auto px-6 py-10 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!recruiter) {
    return (
      <div className="min-h-screen bg-[#F0F4FF]">
        <Navbar />
        <div className="pt-32 text-center">
          <p className="text-sm text-gray-500">Recruiter not found.</p>
        </div>
      </div>
    );
  }

  const initials = recruiter.full_name
    ? recruiter.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      <Navbar />
      <div className="pt-20 max-w-3xl mx-auto px-6 py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0D1B4B] mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-5">
          <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
            {recruiter.photo_url ? (
              <img src={recruiter.photo_url} alt={recruiter.full_name} className="w-20 h-20 rounded-2xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[#0D1B4B] flex items-center justify-center text-white text-xl font-bold">
                {initials}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-xl font-bold text-[#0D1B4B]">{recruiter.full_name || 'Unnamed Recruiter'}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge status={recruiter.availability_status} />
                    <span className="text-xs text-gray-500">{recruiter.experience_years} years experience</span>
                  </div>
                </div>
                {user?.role === 'client' && (
                  <Button variant="primary" size="sm" onClick={() => setRequestModal(true)}>
                    Send Request
                  </Button>
                )}
                {!user && (
                  <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
                    Sign in to Request
                  </Button>
                )}
              </div>
            </div>
          </div>

          {recruiter.bio && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{recruiter.bio}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-5">
            {recruiter.specialties.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Briefcase size={12} /> Specialties
                </h2>
                <div className="flex flex-wrap gap-2">
                  {recruiter.specialties.map(s => (
                    <span key={s} className="text-xs px-3 py-1 bg-[#F0F4FF] text-[#0D1B4B] rounded-full border border-[#0D1B4B]/10 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {recruiter.industries.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Globe size={12} /> Industries
                </h2>
                <div className="flex flex-wrap gap-2">
                  {recruiter.industries.map(ind => (
                    <span key={ind} className="text-xs px-3 py-1 bg-[#00897B]/10 text-[#00897B] rounded-full border border-[#00897B]/20 font-medium">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={requestModal} onClose={() => setRequestModal(false)} title="Send Direct Request">
        <div className="flex flex-col gap-4">
          <Select
            label="Engagement Type"
            value={engagementType}
            onChange={e => setEngagementType(e.target.value as 'hire' | 'rent')}
          >
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
          <Textarea
            label="Message"
            placeholder="Tell the recruiter about the opportunity..."
            rows={4}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <div className="flex gap-3 mt-2">
            <Button variant="ghost" size="sm" onClick={() => setRequestModal(false)} className="flex-1">Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSendRequest} loading={submitting} className="flex-1">
              Send Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
