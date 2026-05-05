import { useEffect, useState } from 'react';
import { User, FileText, Briefcase, Inbox } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/ui/Badge';
import { Application, Requisition } from '../../lib/types';
import { TableRowSkeleton } from '../../components/ui/Skeleton';

const navItems = [
  { label: 'Overview', path: '/recruiter', icon: User },
  { label: 'My Profile', path: '/recruiter/profile', icon: User },
  { label: 'Open Requisitions', path: '/recruiter/requisitions', icon: FileText },
  { label: 'My Applications', path: '/recruiter/applications', icon: Briefcase },
  { label: 'Direct Requests', path: '/recruiter/requests', icon: Inbox },
];

type AppWithReq = Application & { requisitions?: Requisition };

export function RecruiterApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<AppWithReq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('applications')
        .select('*, requisitions(*)')
        .eq('recruiter_id', user.id)
        .order('created_at', { ascending: false });
      setApplications(data ?? []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const statusOrder: Record<string, number> = { submitted: 0, reviewed: 1, selected: 2, not_selected: 3 };
  const sorted = [...applications].sort((a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99));

  return (
    <DashboardLayout navItems={navItems} title="Recruiter">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[#0D1B4B]">My Applications</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track the status of your requisition applications.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">Applied</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>{[...Array(5)].map((_, i) => <TableRowSkeleton key={i} cols={4} />)}</tbody>
            </table>
          ) : sorted.length === 0 ? (
            <div className="py-16 text-center">
              <Briefcase size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">No applications yet</p>
              <p className="text-xs text-gray-400">Browse open requisitions and apply to get started</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">Applied</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map(app => (
                  <tr key={app.id} className="hover:bg-[#F0F4FF] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-[#0D1B4B]">{app.requisitions?.job_title ?? 'Requisition'}</p>
                      <p className="text-xs text-gray-400">{app.requisitions?.department}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={app.requisitions?.engagement_type ?? 'hire'} />
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs text-gray-500">{new Date(app.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={app.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
