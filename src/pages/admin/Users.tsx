import { useEffect, useState } from 'react';
import { FileText, Users, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { User, ClientProfile, RecruiterProfile } from '../../lib/types';
import { TableRowSkeleton, Skeleton } from '../../components/ui/Skeleton';

const navItems = [
  { label: 'Overview', path: '/admin', icon: AlertCircle },
  { label: 'Requisitions', path: '/admin/requisitions', icon: FileText },
  { label: 'Users', path: '/admin/users', icon: Users },
];

type ClientWithProfile = User & { client_profiles?: ClientProfile };
type RecruiterWithProfile = User & { recruiter_profiles?: RecruiterProfile };

export function AdminUsers() {
  const [clients, setClients] = useState<ClientWithProfile[]>([]);
  const [recruiters, setRecruiters] = useState<RecruiterWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'clients' | 'recruiters'>('clients');

  useEffect(() => {
    const fetch = async () => {
      const [clientRes, recruiterRes] = await Promise.all([
        supabase.from('users').select('*, client_profiles(*)').eq('role', 'client').order('created_at', { ascending: false }),
        supabase.from('users').select('*, recruiter_profiles(*)').eq('role', 'recruiter').order('created_at', { ascending: false }),
      ]);
      setClients(clientRes.data ?? []);
      setRecruiters(recruiterRes.data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <DashboardLayout navItems={navItems} title="Admin">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[#0D1B4B]">Users</h1>
          <p className="text-xs text-gray-500 mt-0.5">All registered clients and recruiters on the platform.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 w-fit">
          {(['clients', 'recruiters'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all capitalize
                ${activeTab === tab ? 'bg-[#0D1B4B] text-white' : 'text-gray-500 hover:text-[#0D1B4B]'}`}
            >
              {tab} ({tab === 'clients' ? clients.length : recruiters.length})
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Name', 'Email', 'Joined', 'Details'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{[...Array(5)].map((_, i) => <TableRowSkeleton key={i} cols={4} />)}</tbody>
            </table>
          ) : activeTab === 'clients' ? (
            clients.length === 0 ? (
              <div className="py-16 text-center">
                <Users size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No clients yet.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Industry</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {clients.map(client => (
                    <tr key={client.id} className="hover:bg-[#F0F4FF] transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-[#0D1B4B]">{client.client_profiles?.company_name || '-'}</p>
                        <p className="text-xs text-gray-400">{client.client_profiles?.location || ''}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600">{client.email}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-600">{client.client_profiles?.industry || '-'}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">{new Date(client.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            recruiters.length === 0 ? (
              <div className="py-16 text-center">
                <Users size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No recruiters yet.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Availability</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recruiters.map(rec => {
                    const rp = rec.recruiter_profiles;
                    const initials = rp?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';
                    return (
                      <tr key={rec.id} className="hover:bg-[#F0F4FF] transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            {rp?.photo_url ? (
                              <img src={rp.photo_url} alt={rp.full_name} className="w-7 h-7 rounded-lg object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-[#0D1B4B] flex items-center justify-center text-white text-xs font-semibold">
                                {initials}
                              </div>
                            )}
                            <p className="text-sm font-medium text-[#0D1B4B]">{rp?.full_name || '-'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-600">{rec.email}</td>
                        <td className="px-4 py-3.5 text-xs text-gray-500 capitalize">{rp?.availability_status?.replace('_', ' ') || '-'}</td>
                        <td className="px-4 py-3.5 text-xs text-gray-500">{new Date(rec.created_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
