import { ReactNode, useState, ComponentType } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
}

function SidebarContent({
  navItems,
  title,
  currentPath,
  userEmail,
  userRole,
  onNavClick,
  onSignOut,
}: {
  navItems: NavItem[];
  title: string;
  currentPath: string;
  userEmail?: string;
  userRole?: string;
  onNavClick: () => void;
  onSignOut: () => void;
}) {
  return (
    <aside className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 26,24 2,24" fill="#00C853" />
            <text x="9" y="22" fontSize="11" fontWeight="700" fill="white" fontFamily="Inter">A</text>
          </svg>
          <span className="text-sm font-bold text-[#0D1B4B] tracking-tight">Accretio</span>
        </Link>
      </div>

      <div className="px-4 py-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">{title}</p>
        <nav className="flex flex-col gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${active
                    ? 'bg-[#0D1B4B] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-[#F0F4FF] hover:text-[#0D1B4B]'
                  }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto px-4 py-4 border-t border-gray-100">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs font-medium text-gray-700 truncate">{userEmail}</p>
          <p className="text-xs text-gray-400 capitalize">{userRole}</p>
        </div>
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all w-full"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export function DashboardLayout({ children, navItems, title }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const sidebarProps = {
    navItems,
    title,
    currentPath: location.pathname,
    userEmail: user?.email,
    userRole: user?.role,
    onNavClick: () => setSidebarOpen(false),
    onSignOut: handleSignOut,
  };

  return (
    <div className="flex h-screen bg-[#F0F4FF]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 shrink-0">
        <SidebarContent {...sidebarProps} />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-60 h-full bg-white">
            <SidebarContent {...sidebarProps} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <Menu size={20} className="text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-[#0D1B4B]">Accretio</span>
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
