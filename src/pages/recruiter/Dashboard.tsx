import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, FileText, Briefcase, ArrowRight, Inbox } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { RecruiterProfile, Application } from '../../lib/types';

const navItems = [
  { label: 'Overview', path: '/recruiter', icon: User },
  { label: 'My Profile', path: '/recruiter/profile', icon: User },
  { label: 'Open Requisitions', path: '/recruiter/requisitions', icon: FileText },
  { label: 'My Applications', path: '/recruiter/applications', icon: Briefcase },
  { label: 'Direct Requests', path: '/recruiter/requests', icon: Inbox },
];

export function RecruiterDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [stats, setStats] = useState({ openReqs: 0, applications: 0, requests: 0, completion: 0 });
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [profileRes, openReqRes, appRes, reqRes] = await Promise.all([
        supabase.from('recruiter_profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('requisitions').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('applications').select('*, requisitions(job_title, engagement_type, status)').eq('recruiter_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('direct_requests').select('id', { count: 'exact', head: true }).eq('recruiter_id', user.id).eq('status', 'pending'),
      ]);

      const p = profileRes.data;
      setProfile(p);

      const fieldsTotal = 6;
      const filled = [p?.full_name, p?.bio, p?.photo_url, p?.specialties?.length, p?.industries?.length, p?.experience_years].filter(Boolean).length;
      const completion = Math.round((filled / fieldsTotal) * 100);

      setStats({
        openReqs: openReqRes.count ?? 0,
        applications: appRes.data?.length ?? 0,
        requests: reqRes.count ?? 0,
        completion,
      });
      setRecentApps(appRes.data ?? []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const cards = [
    { label: 'Profile Completion', value: `${stats.completion}%`, icon: User, color: 'text-[#00897B]', bg: 'bg-[#00897B]/10', link: '/recruiter/profile' },
    { label: 'Open Requisitions', value: stats.openReqs, icon: FileText, color: 'text-[#0D1B4B]', bg: 'bg-[#0D1B4B]/10', link: '/recruiter/requisitions' },
    { label: 'Applications Submitted', value: stats.applications, icon: Briefcase, color: 'text-[#00C853]', bg: 'bg-[#00C853]/10', link: '/recruiter/applications' },
    { label: 'Direct Requests', value: stats.requests, icon: Inbox, color: 'text-amber-600', bg: 'bg-amber-50', link: '/recruiter/requests' },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Recruiter">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[#0D1B4B]">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}. Here's your activity overview.
          </p>
        </div>

        {/* Profile completion banner */}
        {!loading && stats.completion < 100 && (
          <Link to="/recruiter/profile" className="block bg-[#0D1B4B] rounded-2xl p-4 hover:bg-[#162060] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-white">Complete your profile</p>
              <ArrowRight size={14} className="text-white/60" />
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5 mb-1">
              <div className="bg-[#00C853] h-1.5 rounded-full transition-all" style={{ width: `${stats.completion}%` }} />
            </div>
            <p className="text-xs text-white/60">{stats.completion}% complete — add your bio and specialties to get discovered</p>
          </Link>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading
            ? [...Array(4)].map((_, i) => <CardSkeleton key={i} />)
            : cards.map(card => (
              <Link key={card.label} to={card.link}>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <div className={`w-8 h-8 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                    <card.icon size={15} className={card.color} />
                  </div>
                  <p className="text-xl font-bold text-[#0D1B4B]">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                </div>
              </Link>
            ))
          }
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-[#0D1B4B]">Recent Applications</h2>
            <Link to="/recruiter/applications" className="text-xs text-[#00C853] hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : recentApps.length === 0 ? (
            <div className="py-12 text-center">
              <Briefcase size={28} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">No applications yet</p>
              <Link to="/recruiter/requisitions" className="text-xs text-[#00C853] hover:underline">Browse open requisitions</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentApps.map((app: Application & { requisitions?: { job_title: string; engagement_type: string; status: string } }) => (
                <div key={app.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-[#0D1B4B]">{app.requisitions?.job_title ?? 'Requisition'}</p>
                    <p className="text-xs text-gray-400">{app.requisitions?.engagement_type} · Applied {new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
