import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, AlertCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/ui/Badge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { Requisition } from '../../lib/types';

const navItems = [
  { label: 'Overview', path: '/admin', icon: AlertCircle },
  { label: 'Requisitions', path: '/admin/requisitions', icon: FileText },
  { label: 'Users', path: '/admin/users', icon: Users },
];

export function AdminDashboard() {
  const [stats, setStats] = useState({ pending: 0, clients: 0, recruiters: 0 });
  const [pendingReqs, setPendingReqs] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [pendingRes, clientRes, recruiterRes, recentRes] = await Promise.all([
        supabase.from('requisitions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'client'),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'recruiter'),
        supabase.from('requisitions').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        pending: pendingRes.count ?? 0,
        clients: clientRes.count ?? 0,
        recruiters: recruiterRes.count ?? 0,
      });
      setPendingReqs(recentRes.data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const cards = [
    { label: 'Pending Requisitions', value: stats.pending, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Clients', value: stats.clients, icon: Users, color: 'text-[#00C853]', bg: 'bg-[#00C853]/10' },
    { label: 'Total Recruiters', value: stats.recruiters, icon: Users, color: 'text-[#00897B]', bg: 'bg-[#00897B]/10' },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Admin">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[#0D1B4B]">Admin Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">Platform oversight and management.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading
            ? [...Array(3)].map((_, i) => <CardSkeleton key={i} />)
            : cards.map(card => (
              <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                  <card.icon size={16} className={card.color} />
                </div>
                <p className="text-2xl font-bold text-[#0D1B4B]">{card.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
              </div>
            ))
          }
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-[#0D1B4B]">Pending Review</h2>
            <Link to="/admin/requisitions" className="text-xs text-[#00C853] hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : pendingReqs.length === 0 ? (
            <div className="py-12 text-center">
              <AlertCircle size={28} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No pending requisitions. All caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {pendingReqs.map(req => (
                <Link key={req.id} to="/admin/requisitions" className="flex items-center justify-between px-5 py-3.5 hover:bg-[#F0F4FF] transition-colors">
                  <div>
                    <p className="text-sm font-medium text-[#0D1B4B]">{req.job_title}</p>
                    <p className="text-xs text-gray-400">{req.engagement_type} · {new Date(req.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge status={req.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
