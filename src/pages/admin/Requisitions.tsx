import React, { useEffect, useState } from 'react';
import { FileText, Users, AlertCircle, ChevronRight, ChevronDown, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Input';
import { useToast } from '../../contexts/ToastContext';
import { Requisition } from '../../lib/types';
import { TableRowSkeleton } from '../../components/ui/Skeleton';

const navItems = [
  { label: 'Overview', path: '/admin', icon: AlertCircle },
  { label: 'Requisitions', path: '/admin/requisitions', icon: FileText },
  { label: 'Users', path: '/admin/users', icon: Users },
];

type ReqWithClient = Requisition & { client_profiles?: { company_name: string } };

export function AdminRequisitions() {
  const { showToast } = useToast();
  const [requisitions, setRequisitions] = useState<ReqWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('pending');

  const fetchReqs = async () => {
    let query = supabase
      .from('requisitions')
      .select('*, client_profiles(company_name)')
      .order('created_at', { ascending: false });

    if (filterStatus) query = query.eq('status', filterStatus);

    const { data } = await query;
    setRequisitions(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchReqs(); }, [filterStatus]);

  const handleApprove = async (id: string) => {
    setUpdating(id);
    const { error } = await supabase.from('requisitions').update({ status: 'approved' }).eq('id', id);
    if (error) showToast('error', 'Failed to approve.');
    else { showToast('success', 'Requisition approved!'); fetchReqs(); }
    setUpdating(null);
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setUpdating(rejectModal);
    const { error } = await supabase.from('requisitions').update({ status: 'rejected', rejection_reason: rejectReason }).eq('id', rejectModal);
    if (error) showToast('error', 'Failed to reject.');
    else { showToast('success', 'Requisition rejected.'); setRejectModal(null); setRejectReason(''); fetchReqs(); }
    setUpdating(null);
  };

  return (
    <DashboardLayout navItems={navItems} title="Admin">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0D1B4B]">Requisitions</h1>
            <p className="text-xs text-gray-500 mt-0.5">Review and approve client requisitions.</p>
          </div>
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setLoading(true); }}
            className="px-3.5 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#00C853] bg-white"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Client', 'Role', 'Type', 'Submitted', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{[...Array(5)].map((_, i) => <TableRowSkeleton key={i} cols={6} />)}</tbody>
            </table>
          ) : requisitions.length === 0 ? (
            <div className="py-16 text-center">
              <FileText size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No requisitions found.</p>
            </div>
          ) : (
            <div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Submitted</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requisitions.map(req => (
                    <React.Fragment key={req.id}>
                      <tr className="hover:bg-[#F0F4FF] transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}>
                        <td className="px-4 py-3.5 text-sm text-gray-600">{req.client_profiles?.company_name ?? 'Client'}</td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-medium text-[#0D1B4B]">{req.job_title}</p>
                          <p className="text-xs text-gray-400">{req.department}</p>
                        </td>
                        <td className="px-4 py-3.5"><Badge status={req.engagement_type} /></td>
                        <td className="px-4 py-3.5 text-xs text-gray-500">{new Date(req.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3.5"><Badge status={req.status} /></td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            {req.status === 'pending' && (
                              <>
                                <Button variant="primary" size="sm" loading={updating === req.id} onClick={() => handleApprove(req.id)}>
                                  <Check size={12} /> Approve
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => setRejectModal(req.id)}>
                                  <X size={12} /> Reject
                                </Button>
                              </>
                            )}
                            {expandedId === req.id ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                          </div>
                        </td>
                      </tr>
                      {expandedId === req.id && (
                        <tr>
                          <td colSpan={6} className="px-4 py-4 bg-[#F0F4FF]/60">
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</p>
                                <p className="text-xs text-gray-600 leading-relaxed">{req.description}</p>
                              </div>
                              {req.person_specification && (
                                <div className="grid grid-cols-3 gap-4">
                                  {req.person_specification.skills?.length > 0 && (
                                    <div>
                                      <p className="text-xs font-semibold text-gray-400 mb-1">Skills</p>
                                      <div className="flex flex-wrap gap-1">{req.person_specification.skills.map((s: string) => <span key={s} className="text-xs px-2 py-0.5 bg-white rounded-full border border-gray-200">{s}</span>)}</div>
                                    </div>
                                  )}
                                  {req.person_specification.experience_level && (
                                    <div>
                                      <p className="text-xs font-semibold text-gray-400 mb-1">Experience Level</p>
                                      <p className="text-xs text-gray-600">{req.person_specification.experience_level}</p>
                                    </div>
                                  )}
                                  {req.person_specification.industry_background && (
                                    <div>
                                      <p className="text-xs font-semibold text-gray-400 mb-1">Industry Background</p>
                                      <p className="text-xs text-gray-600">{req.person_specification.industry_background}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                              {req.rejection_reason && (
                                <div className="bg-red-50 rounded-xl p-3">
                                  <p className="text-xs text-red-600"><span className="font-semibold">Rejection reason:</span> {req.rejection_reason}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Requisition">
        <div className="flex flex-col gap-4">
          <p className="text-xs text-gray-500">Provide a brief reason for rejecting this requisition. This will be visible to the client.</p>
          <Textarea label="Rejection Reason" placeholder="e.g. Incomplete information, duplicate posting..." rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={() => setRejectModal(null)} className="flex-1">Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleReject} loading={!!updating} className="flex-1">Confirm Rejection</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
