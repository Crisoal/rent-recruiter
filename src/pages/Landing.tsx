import { Link } from 'react-router-dom';
import { ArrowRight, Users, Briefcase, Zap, CheckCircle, Star } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';

export function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 bg-gradient-to-br from-[#0D1B4B] via-[#162060] to-[#0D1B4B] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-[#00C853] blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-64 h-64 rounded-full bg-[#00897B] blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          {/* <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
            <span className="text-xs text-white/80 font-medium">The future of flexible recruitment</span>
          </div> */}
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            Hire or Rent Expert Recruiters<br />
            <span className="text-[#00C853]">On Your Terms</span>
          </h1>
          <p className="text-base text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Accretio connects companies with elite recruiters — whether you need a full hire or a flexible rental engagement.
            Post requisitions, browse talent, and build your team faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button variant="primary" size="lg" className="gap-2">
                Get Started Free <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/recruiters">
              <Button variant="ghost" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                Browse Recruiters
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-[#F0F4FF] border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '500+', label: 'Expert Recruiters' },
            { value: '1,200+', label: 'Placements Made' },
            { value: '98%', label: 'Client Satisfaction' },
            { value: '48h', label: 'Avg. Time to Match' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-[#0D1B4B]">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-[#0D1B4B] mb-3">How Accretio Works</h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">From posting to placement in three simple steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Briefcase,
                step: '01',
                title: 'Post a Requisition',
                desc: 'Define the role, engagement type (Hire or Rent), duration, and your ideal candidate specification.',
              },
              {
                icon: Users,
                step: '02',
                title: 'Connect with Recruiters',
                desc: 'Recruiters apply to your requisition or you can directly request a specific recruiter from our directory.',
              },
              {
                icon: Zap,
                step: '03',
                title: 'Select & Get Started',
                desc: 'Review applications, select your recruiter, and kick off your engagement immediately.',
              },
            ].map(item => (
              <div key={item.step} className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00C853]/10 flex items-center justify-center">
                    <item.icon size={18} className="text-[#00C853]" />
                  </div>
                  <span className="text-2xl font-bold text-gray-100">{item.step}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#0D1B4B] mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-[#F0F4FF]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-[#0D1B4B] mb-3">Everything You Need</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Hire or Rent Flexibility', desc: 'Choose full-time placement or temporary rental engagements based on your business needs.' },
              { title: 'Verified Recruiter Profiles', desc: 'Every recruiter has a detailed profile with specialties, industries, and availability status.' },
              { title: 'Direct Outreach', desc: 'Browse the directory and send a direct request to any recruiter that matches your needs.' },
              { title: 'Application Management', desc: 'Track all applications in one place — accept, review, or decline with a single click.' },
              { title: 'Real-time Status Updates', desc: 'Stay informed at every step with live status badges and notifications.' },
              { title: 'Admin Oversight', desc: 'All requisitions are reviewed and approved by admin before going live to recruiters.' },
            ].map(feat => (
              <div key={feat.title} className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-100">
                <CheckCircle size={16} className="text-[#00C853] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#0D1B4B] mb-1">{feat.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-[#0D1B4B] mb-3">Trusted by Teams</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah Chen', role: 'Head of People, FinTech Co', quote: 'Accretio helped us fill 3 senior roles in under 2 weeks. The recruiter quality is exceptional.' },
              { name: 'James Okonkwo', role: 'Founder, Scale-Up Studio', quote: 'The rent model is perfect for startups. We got specialist help exactly when we needed it without long-term commitment.' },
              { name: 'Lisa Park', role: 'Talent Lead, Enterprise Corp', quote: 'The platform is incredibly easy to use. Posting a requisition takes minutes and the matching is spot-on.' },
            ].map(t => (
              <div key={t.name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-[#00C853] fill-[#00C853]" />)}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">"{t.quote}"</p>
                <div>
                  <p className="text-xs font-semibold text-[#0D1B4B]">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#0D1B4B]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Transform Your Hiring?</h2>
          <p className="text-sm text-white/60 mb-8">Join hundreds of companies already using Accretio to find top recruiting talent.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup?role=client">
              <Button variant="primary" size="lg">I'm Hiring</Button>
            </Link>
            <Link to="/signup?role=recruiter">
              <Button variant="ghost" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                I'm a Recruiter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 26,24 2,24" fill="#00C853" />
              <text x="9" y="22" fontSize="11" fontWeight="700" fill="white" fontFamily="Inter">A</text>
            </svg>
            <span className="text-sm font-bold text-[#0D1B4B]">Accretio</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 Accretio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
