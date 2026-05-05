import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const dashboardPath = user?.role === 'client' ? '/client' : user?.role === 'recruiter' ? '/recruiter' : '/admin';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 26,24 2,24" fill="#00C853" />
            <text x="9" y="22" fontSize="11" fontWeight="700" fill="white" fontFamily="Inter">A</text>
          </svg>
          <span className="text-base font-bold text-[#0D1B4B] tracking-tight">Accretio</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/recruiters" className="text-sm text-gray-600 hover:text-[#0D1B4B] transition-colors">
            Browse Recruiters
          </Link>
          {user ? (
            <>
              <Link to={dashboardPath} className="text-sm text-gray-600 hover:text-[#0D1B4B] transition-colors">
                Dashboard
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>Sign Out</Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </nav>

        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          <Link to="/recruiters" className="text-sm text-gray-600" onClick={() => setMobileOpen(false)}>Browse Recruiters</Link>
          {user ? (
            <>
              <Link to={dashboardPath} className="text-sm text-gray-600" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>Sign Out</Button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)}><Button variant="ghost" size="sm" className="w-full">Log In</Button></Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)}><Button variant="primary" size="sm" className="w-full">Get Started</Button></Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
