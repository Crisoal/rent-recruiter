import { useEffect, useState } from 'react';
import { User, FileText, Briefcase, Inbox, ChevronRight, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Input';
import { useToast } from '../../contexts/ToastContext';
import { Requisition } from '../../lib/types';
import { TableRowSkeleton } from '../../components/ui/Skeleton';

const navItems = [
  { label: 'Overview', path: '/recruiter', icon: User },
  { label: 'My Profile', path: '/recruiter/profile', icon: User },
  { label: 'Open Requisitions', path: '/recruiter/requisitions', icon: FileText },
  { label: 'My Applications', path: '/recruiter/applications', icon: Briefcase },
  { label: 'Direct Requests', path: '/recruiter/requests', icon: Inbox },
];

export function RecruiterOpenRequisitions() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [applyModal, setApplyModal] = useState<Requisition | null>(null);
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [filterEngagement, setFilterEngagement] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [reqRes, appRes] = await Promise.all([
        supabase.from('requisitions').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
        supabase.from('applications').select('requisition_id').eq('recruiter_id', user.id),
      ]);
      setRequisitions(reqRes.data ?? []);
      setAppliedIds(new Set(appRes.data?.map(a => a.requisition_id) ?? []));
      setLoading(false);
    };
    fetch();
  }, [user]);

  const filtered = requisitions.filter(r => !filterEngagement || r.engagement_type === filterEngagement);

  const handleApply = async () => {
    if (!user || !applyModal) return;
    setSubmitting(true);

    const { error } = await supabase.from('applications').insert({
      requisition_id: applyModal.id,
      recruiter_id: user.id,
      cover_note: coverNote,
    });

    if (error) {
      showToast('error', error.code === '23505' ? 'You already applied to this requisition.' : 'Failed to submit application.');
    } else {
      showToast('success', 'Application submitted!');
      setAppliedIds(prev => new Set([...prev, applyModal.id]));
      setApplyModal(null);
      setCoverNote('');
    }
    setSubmitting(false);
  };

  return (
    <DashboardLayout navItems={navItems} title="Recruiter">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0D1B4B]">Open Requisitions</h1>
            <p className="text-xs text-gray-500 mt-0.5">Browse and apply to approved requisitions from clients.</p>
          </div>
          <select
            value={filterEngagement}
            onChange={e => setFilterEngagement(e.target.value)}
            className="px-3.5 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#00C853] bg-white"
          >
            <option value="">All Types</option>
            <option value="hire">Hire</option>
            <option value="rent">Rent</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <table className="w-full">
              <tbody>{[...Array(5)].map((_, i) => <TableRowSkeleton key={i} cols={4} />)}</tbody>
            </table>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <FileText size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No open requisitions available.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(req => (
                <div key={req.id}>
                  <button
                    onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F0F4FF] transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#0D1B4B]">{req.job_title}</p>
                        <p className="text-xs text-gray-400">{req.department} · {req.duration || 'N/A'} · {new Date(req.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge status={req.engagement_type} />
                      {appliedIds.has(req.id) && <span className="text-xs text-[#00C853] font-medium">Applied</span>}
                      {expandedId === req.id ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                    </div>
                  </button>

                  {expandedId === req.id && (
                    <div className="border-t border-gray-100 px-5 py-5 bg-[#F0F4FF]/50 space-y-4">
                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{req.description}</p>
                      </div>

                      {req.person_specification && (
                        <div className="grid md:grid-cols-3 gap-4">
                          {req.person_specification.skills?.length > 0 && (
                            <div>
                              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Skills Required</h3>
                              <div className="flex flex-wrap gap-1.5">
                                {req.person_specification.skills.map((s: string) => (
                                  <span key={s} className="text-xs px-2 py-0.5 bg-white text-[#0D1B4B] rounded-full border border-gray-200">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {req.person_specification.experience_level && (
                            <div>
                              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Experience Level</h3>
                              <p className="text-xs text-gray-600">{req.person_specification.experience_level}</p>
                            </div>
                          )}
                          {req.person_specification.industry_background && (
                            <div>
                              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Industry Background</h3>
                              <p className="text-xs text-gray-600">{req.person_specification.industry_background}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex justify-end">
                        {appliedIds.has(req.id) ? (
                          <span className="text-xs text-[#00C853] font-medium flex items-center gap-1.5">
                            Application submitted
                          </span>
                        ) : (
                          <Button variant="primary" size="sm" onClick={() => setApplyModal(req)}>
                            Apply Now
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={!!applyModal} onClose={() => setApplyModal(null)} title={`Apply — ${applyModal?.job_title}`}>
        <div className="flex flex-col gap-4">
          <p className="text-xs text-gray-500">Add a cover note to introduce yourself and explain why you're a great fit.</p>
          <Textarea
            label="Cover Note"
            placeholder="Briefly describe your experience and why you'd be a great recruiter for this role..."
            rows={5}
            value={coverNote}
            onChange={e => setCoverNote(e.target.value)}
          />
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={() => setApplyModal(null)} className="flex-1">Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleApply} loading={submitting} className="flex-1">Submit Application</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
