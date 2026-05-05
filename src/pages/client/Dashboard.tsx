import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Send, Users, ArrowRight, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/ui/Badge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { Requisition } from '../../lib/types';

const navItems = [
  { label: 'Overview', path: '/client', icon: FileText },
  { label: 'My Profile', path: '/client/profile', icon: User },
  { label: 'Requisitions', path: '/client/requisitions', icon: FileText },
  { label: 'Browse Recruiters', path: '/client/browse', icon: Users },
];

export function ClientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ requisitions: 0, requests: 0, applications: 0 });
  const [recent, setRecent] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [reqRes, requestsRes] = await Promise.all([
        supabase.from('requisitions').select('*').eq('client_id', user.id),
        supabase.from('direct_requests').select('*').eq('client_id', user.id),
      ]);

      const reqs = reqRes.data ?? [];
      const active = reqs.filter(r => r.status === 'approved').length;

      const appIds = reqs.map(r => r.id);
      let appCount = 0;
      if (appIds.length > 0) {
        const { count } = await supabase.from('applications').select('*', { count: 'exact', head: true }).in('requisition_id', appIds);
        appCount = count ?? 0;
      }

      setStats({ requisitions: active, requests: requestsRes.data?.length ?? 0, applications: appCount });
      setRecent(reqs.slice(0, 5));
      setLoading(false);
    };
    fetch();
  }, [user]);

  const cards = [
    { label: 'Active Requisitions', value: stats.requisitions, icon: FileText, color: 'text-[#00C853]', bg: 'bg-[#00C853]/10' },
    { label: 'Applications Received', value: stats.applications, icon: Users, color: 'text-[#0D1B4B]', bg: 'bg-[#0D1B4B]/10' },
    { label: 'Direct Requests Sent', value: stats.requests, icon: Send, color: 'text-[#00897B]', bg: 'bg-[#00897B]/10' },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Client">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[#0D1B4B]">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">Welcome back. Here's an overview of your activity.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading
            ? [...Array(3)].map((_, i) => <CardSkeleton key={i} />)
            : cards.map(card => (
              <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <card.icon size={16} className={card.color} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#0D1B4B]">{card.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
              </div>
            ))
          }
        </div>

        {/* Recent Requisitions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-[#0D1B4B]">Recent Requisitions</h2>
            <Link to="/client/requisitions" className="text-xs text-[#00C853] hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : recent.length === 0 ? (
            <div className="py-12 text-center">
              <FileText size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">No requisitions yet</p>
              <p className="text-xs text-gray-400">Post your first requisition to find recruiters</p>
              <Link to="/client/requisitions" className="mt-4 inline-block text-xs text-[#00C853] hover:underline">
                Post a Requisition
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recent.map(req => (
                <div key={req.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#F0F4FF] transition-colors">
                  <div>
                    <p className="text-sm font-medium text-[#0D1B4B]">{req.job_title}</p>
                    <p className="text-xs text-gray-400">{req.department} · {req.engagement_type}</p>
                  </div>
                  <Badge status={req.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
