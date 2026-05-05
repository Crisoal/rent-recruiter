import { useEffect, useState } from 'react';
import { User, FileText, Briefcase, Inbox, Check, X, Building } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { DirectRequest, ClientProfile } from '../../lib/types';
import { Skeleton } from '../../components/ui/Skeleton';

const navItems = [
  { label: 'Overview', path: '/recruiter', icon: User },
  { label: 'My Profile', path: '/recruiter/profile', icon: User },
  { label: 'Open Requisitions', path: '/recruiter/requisitions', icon: FileText },
  { label: 'My Applications', path: '/recruiter/applications', icon: Briefcase },
  { label: 'Direct Requests', path: '/recruiter/requests', icon: Inbox },
];

type RequestWithClient = DirectRequest & { client_profiles?: ClientProfile };

export function RecruiterDirectRequests() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<RequestWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('direct_requests')
        .select('*, client_profiles(*)')
        .eq('recruiter_id', user.id)
        .order('created_at', { ascending: false });
      setRequests(data ?? []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleUpdate = async (id: string, status: 'accepted' | 'declined') => {
    setUpdating(id);
    const { error } = await supabase.from('direct_requests').update({ status }).eq('id', id);
    if (error) {
      showToast('error', 'Failed to update request.');
    } else {
      showToast('success', status === 'accepted' ? 'Request accepted!' : 'Request declined.');
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    }
    setUpdating(null);
  };

  const pending = requests.filter(r => r.status === 'pending');
  const others = requests.filter(r => r.status !== 'pending');

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Recruiter">
        <div className="max-w-3xl mx-auto space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Recruiter">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[#0D1B4B]">Direct Requests</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage hire and rent requests from clients.</p>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <Inbox size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-1">No direct requests yet</p>
            <p className="text-xs text-gray-400">Complete your profile to attract more clients</p>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pending ({pending.length})</p>
                <div className="space-y-3">
                  {pending.map(req => (
                    <RequestCard key={req.id} request={req} onUpdate={handleUpdate} updating={updating} />
                  ))}
                </div>
              </div>
            )}
            {others.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">History</p>
                <div className="space-y-3">
                  {others.map(req => (
                    <RequestCard key={req.id} request={req} onUpdate={handleUpdate} updating={updating} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function RequestCard({ request, onUpdate, updating }: {
  request: RequestWithClient;
  onUpdate: (id: string, status: 'accepted' | 'declined') => void;
  updating: string | null;
}) {
  const client = request.client_profiles;
  const isPending = request.status === 'pending';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F0F4FF] flex items-center justify-center">
            <Building size={16} className="text-[#0D1B4B]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0D1B4B]">{client?.company_name ?? 'A Client'}</p>
            <p className="text-xs text-gray-400">{new Date(request.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge status={request.engagement_type} />
          <Badge status={request.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-[#F0F4FF] rounded-xl px-3 py-2">
          <p className="text-xs text-gray-400">Duration</p>
          <p className="text-xs font-medium text-[#0D1B4B]">{request.duration || 'Not specified'}</p>
        </div>
        <div className="bg-[#F0F4FF] rounded-xl px-3 py-2">
          <p className="text-xs text-gray-400">Industry</p>
          <p className="text-xs font-medium text-[#0D1B4B]">{client?.industry || 'Not specified'}</p>
        </div>
      </div>

      {request.message && (
        <p className="text-xs text-gray-600 leading-relaxed mb-4 bg-gray-50 rounded-xl p-3 italic">
          "{request.message}"
        </p>
      )}

      {isPending && (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => onUpdate(request.id, 'declined')}
            loading={updating === request.id}
          >
            <X size={14} /> Decline
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => onUpdate(request.id, 'accepted')}
            loading={updating === request.id}
          >
            <Check size={14} /> Accept
          </Button>
        </div>
      )}
    </div>
  );
}
