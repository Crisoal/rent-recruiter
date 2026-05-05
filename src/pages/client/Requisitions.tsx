import { useEffect, useState } from 'react';
import { Plus, FileText, ChevronRight, ChevronDown, User, Check, X, UserCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../contexts/ToastContext';
import { Requisition, Application, RecruiterProfile } from '../../lib/types';
import { Users } from 'lucide-react';

const navItems = [
  { label: 'Overview', path: '/client', icon: FileText },
  { label: 'My Profile', path: '/client/profile', icon: UserCircle },
  { label: 'Requisitions', path: '/client/requisitions', icon: FileText },
  { label: 'Browse Recruiters', path: '/client/browse', icon: Users },
];

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Temporary'];
const ENGAGEMENT_TYPES = ['hire', 'rent'];
const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Legal', 'Marketing', 'HR'];

interface AppWithRecruiter extends Application {
  recruiter_profiles?: RecruiterProfile;
}

export function ClientRequisitions() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [applications, setApplications] = useState<AppWithRecruiter[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    job_title: '', department: '', employment_type: 'Full-time', engagement_type: 'hire',
    duration: '', description: '', skills: '', experience_level: '', industry_background: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchRequisitions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('requisitions')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });
    setRequisitions(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRequisitions(); }, [user]);

  const fetchApplications = async (reqId: string) => {
    setAppsLoading(true);
    const { data } = await supabase
      .from('applications')
      .select('*, recruiter_profiles(*)')
      .eq('requisition_id', reqId)
      .order('created_at', { ascending: false });
    setApplications(data ?? []);
    setAppsLoading(false);
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      fetchApplications(id);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.job_title) e.job_title = 'Job title is required';
    if (!form.description) e.description = 'Description is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    const { error } = await supabase.from('requisitions').insert({
      client_id: user!.id,
      job_title: form.job_title,
      department: form.department,
      employment_type: form.employment_type,
      engagement_type: form.engagement_type,
      duration: form.duration,
      description: form.description,
      person_specification: {
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        experience_level: form.experience_level,
        industry_background: form.industry_background,
      },
    });

    if (error) {
      showToast('error', 'Failed to post requisition.');
    } else {
      showToast('success', 'Requisition submitted for review!');
      setShowForm(false);
      setForm({ job_title: '', department: '', employment_type: 'Full-time', engagement_type: 'hire', duration: '', description: '', skills: '', experience_level: '', industry_background: '' });
      fetchRequisitions();
    }
    setSubmitting(false);
  };

  const handleApplicationStatus = async (appId: string, status: 'selected' | 'not_selected') => {
    const { error } = await supabase.from('applications').update({ status }).eq('id', appId);
    if (error) {
      showToast('error', 'Failed to update application.');
    } else {
      showToast('success', status === 'selected' ? 'Recruiter selected!' : 'Application declined.');
      if (expandedId) fetchApplications(expandedId);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Client">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0D1B4B]">Requisitions</h1>
            <p className="text-xs text-gray-500 mt-0.5">Post and manage your job requisitions.</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            <Plus size={14} /> New Requisition
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
          </div>
        ) : requisitions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <FileText size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-1">No requisitions yet</p>
            <p className="text-xs text-gray-400 mb-4">Post your first requisition to start receiving recruiter applications</p>
            <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Post First Requisition
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {requisitions.map(req => (
              <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleExpand(req.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F0F4FF] transition-colors"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div>
                      <p className="text-sm font-semibold text-[#0D1B4B]">{req.job_title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{req.department} · {req.employment_type} · {new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status={req.status} />
                    <Badge status={req.engagement_type} />
                    {expandedId === req.id ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                  </div>
                </button>

                {expandedId === req.id && (
                  <div className="border-t border-gray-100 px-5 py-5 space-y-5">
                    {req.rejection_reason && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                        <p className="text-xs text-red-600"><span className="font-semibold">Rejection reason:</span> {req.rejection_reason}</p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{req.description}</p>
                    </div>

                    {req.person_specification && (
                      <div className="grid md:grid-cols-3 gap-4">
                        {req.person_specification.skills?.length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Skills</h3>
                            <div className="flex flex-wrap gap-1.5">
                              {req.person_specification.skills.map((s: string) => (
                                <span key={s} className="text-xs px-2 py-0.5 bg-[#F0F4FF] text-[#0D1B4B] rounded-full">{s}</span>
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

                    {/* Applications */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Applications ({appsLoading ? '...' : applications.length})
                      </h3>
                      {appsLoading ? (
                        <div className="space-y-2">
                          {[...Array(2)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
                        </div>
                      ) : applications.length === 0 ? (
                        <div className="text-center py-8 bg-[#F0F4FF] rounded-xl">
                          <User size={24} className="text-gray-300 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">No applications yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {applications.map(app => {
                            const rp = app.recruiter_profiles;
                            const initials = rp?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';
                            return (
                              <div key={app.id} className="flex items-start gap-4 p-4 bg-[#F0F4FF] rounded-xl">
                                {rp?.photo_url ? (
                                  <img src={rp.photo_url} alt={rp.full_name} className="w-9 h-9 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-9 h-9 rounded-lg bg-[#0D1B4B] flex items-center justify-center text-white text-xs font-semibold">
                                    {initials}
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-[#0D1B4B]">{rp?.full_name ?? 'Recruiter'}</p>
                                  <p className="text-xs text-gray-500">{rp?.experience_years}y experience · {rp?.specialties?.slice(0, 2).join(', ')}</p>
                                  {app.cover_note && <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">"{app.cover_note}"</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge status={app.status} />
                                  {app.status === 'submitted' || app.status === 'reviewed' ? (
                                    <>
                                      <button
                                        onClick={() => handleApplicationStatus(app.id, 'selected')}
                                        className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                        title="Accept"
                                      >
                                        <Check size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleApplicationStatus(app.id, 'not_selected')}
                                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                        title="Decline"
                                      >
                                        <X size={14} />
                                      </button>
                                    </>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Requisition Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Post New Requisition" size="lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Job Title *" placeholder="Senior Account Manager" value={form.job_title} onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))} error={errors.job_title} />
            <Input label="Department" placeholder="Sales" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Employment Type" value={form.employment_type} onChange={e => setForm(f => ({ ...f, employment_type: e.target.value }))}>
              {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Select label="Engagement Type" value={form.engagement_type} onChange={e => setForm(f => ({ ...f, engagement_type: e.target.value }))}>
              {ENGAGEMENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </Select>
          </div>
          <Input label="Duration" placeholder="e.g. 6 months, permanent" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
          <Textarea label="Role Description *" placeholder="Describe the role and responsibilities..." rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} error={errors.description} />

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Person Specification</p>
            <div className="flex flex-col gap-4">
              <Input label="Required Skills (comma-separated)" placeholder="Sales, CRM, Negotiation" value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Experience Level" placeholder="5+ years" value={form.experience_level} onChange={e => setForm(f => ({ ...f, experience_level: e.target.value }))} />
                <Select label="Industry Background" value={form.industry_background} onChange={e => setForm(f => ({ ...f, industry_background: e.target.value }))}>
                  <option value="">Select industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <Button variant="ghost" type="button" size="sm" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            <Button variant="primary" type="submit" size="sm" loading={submitting} className="flex-1">Submit Requisition</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
