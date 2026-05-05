import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { RecruiterProfile } from '../lib/types';
import { Navbar } from '../components/layout/Navbar';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';

const SPECIALTIES = ['Technical', 'Finance', 'Sales', 'Marketing', 'HR', 'Legal', 'Executive', 'Healthcare'];

export function RecruiterDirectory() {
  const [recruiters, setRecruiters] = useState<RecruiterProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('recruiter_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      setRecruiters(data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = recruiters.filter(r => {
    const matchSearch = !search || r.full_name.toLowerCase().includes(search.toLowerCase()) || r.bio.toLowerCase().includes(search.toLowerCase());
    const matchSpec = !filterSpecialty || r.specialties.some(s => s.toLowerCase().includes(filterSpecialty.toLowerCase()));
    const matchAvail = !filterAvailability || r.availability_status === filterAvailability;
    return matchSearch && matchSpec && matchAvail;
  });

  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      <Navbar />
      <div className="pt-20 max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0D1B4B] mb-1">Recruiter Directory</h1>
          <p className="text-sm text-gray-500">Discover and connect with specialist recruiters across every industry.</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or keyword..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#00C853] focus:ring-2 focus:ring-[#00C853]/20 transition-all"
              />
            </div>
          </div>
          <select
            value={filterSpecialty}
            onChange={e => setFilterSpecialty(e.target.value)}
            className="px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#00C853] bg-white"
          >
            <option value="">All Specialties</option>
            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filterAvailability}
            onChange={e => setFilterAvailability(e.target.value)}
            className="px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#00C853] bg-white"
          >
            <option value="">All Availability</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="open_to_offers">Open to Offers</option>
          </select>
          {(search || filterSpecialty || filterAvailability) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterSpecialty(''); setFilterAvailability(''); }}>
              <Filter size={14} /> Clear
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-gray-500">No recruiters found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(r => (
              <RecruiterCard key={r.id} recruiter={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecruiterCard({ recruiter }: { recruiter: RecruiterProfile }) {
  const initials = recruiter.full_name
    ? recruiter.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <Link to={`/recruiters/${recruiter.user_id}`}>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-[#00C853]/30 transition-all duration-200 cursor-pointer group">
        <div className="flex items-start gap-4 mb-4">
          {recruiter.photo_url ? (
            <img src={recruiter.photo_url} alt={recruiter.full_name} className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#0D1B4B] flex items-center justify-center text-white text-sm font-semibold">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#0D1B4B] truncate group-hover:text-[#00C853] transition-colors">
              {recruiter.full_name || 'Unnamed Recruiter'}
            </h3>
            <p className="text-xs text-gray-500">{recruiter.experience_years}y experience</p>
          </div>
          <Badge status={recruiter.availability_status} />
        </div>

        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {recruiter.bio || 'No bio yet.'}
        </p>

        {recruiter.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recruiter.specialties.slice(0, 3).map(s => (
              <span key={s} className="text-xs px-2 py-0.5 bg-[#F0F4FF] text-[#0D1B4B] rounded-full border border-[#0D1B4B]/10">
                {s}
              </span>
            ))}
            {recruiter.specialties.length > 3 && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                +{recruiter.specialties.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
