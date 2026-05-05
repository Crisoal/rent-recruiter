import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { RecruiterDirectory } from './pages/RecruiterDirectory';
import { RecruiterProfilePage } from './pages/RecruiterProfile';

import { ClientDashboard } from './pages/client/Dashboard';
import { ClientRequisitions } from './pages/client/Requisitions';
import { ClientBrowseRecruiters } from './pages/client/BrowseRecruiters';
import { ClientProfilePage } from './pages/client/Profile';

import { RecruiterDashboard } from './pages/recruiter/Dashboard';
import { RecruiterProfilePage as RecruiterProfileEdit } from './pages/recruiter/Profile';
import { RecruiterOpenRequisitions } from './pages/recruiter/OpenRequisitions';
import { RecruiterApplications } from './pages/recruiter/Applications';
import { RecruiterDirectRequests } from './pages/recruiter/DirectRequests';

import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminRequisitions } from './pages/admin/Requisitions';
import { AdminUsers } from './pages/admin/Users';

function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles: string[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none" className="animate-bounce">
            <polygon points="14,2 26,24 2,24" fill="#00C853" />
            <text x="9" y="22" fontSize="11" fontWeight="700" fill="white" fontFamily="Inter">A</text>
          </svg>
          <p className="text-xs text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    const redirectMap: Record<string, string> = { client: '/client', recruiter: '/recruiter', admin: '/admin' };
    return <Navigate to={redirectMap[user.role] ?? '/'} replace />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 28 28" fill="none" className="animate-bounce">
          <polygon points="14,2 26,24 2,24" fill="#00C853" />
          <text x="9" y="22" fontSize="11" fontWeight="700" fill="white" fontFamily="Inter">A</text>
        </svg>
        <p className="text-xs text-gray-400">Loading...</p>
      </div>
    </div>
  );
  if (user) {
    const redirectMap: Record<string, string> = { client: '/client', recruiter: '/recruiter', admin: '/admin' };
    return <Navigate to={redirectMap[user.role] ?? '/'} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/recruiters" element={<RecruiterDirectory />} />
      <Route path="/recruiters/:id" element={<RecruiterProfilePage />} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />

      <Route path="/client" element={<ProtectedRoute allowedRoles={['client']}><ClientDashboard /></ProtectedRoute>} />
      <Route path="/client/profile" element={<ProtectedRoute allowedRoles={['client']}><ClientProfilePage /></ProtectedRoute>} />
      <Route path="/client/requisitions" element={<ProtectedRoute allowedRoles={['client']}><ClientRequisitions /></ProtectedRoute>} />
      <Route path="/client/browse" element={<ProtectedRoute allowedRoles={['client']}><ClientBrowseRecruiters /></ProtectedRoute>} />

      <Route path="/recruiter" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterDashboard /></ProtectedRoute>} />
      <Route path="/recruiter/profile" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterProfileEdit /></ProtectedRoute>} />
      <Route path="/recruiter/requisitions" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterOpenRequisitions /></ProtectedRoute>} />
      <Route path="/recruiter/applications" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterApplications /></ProtectedRoute>} />
      <Route path="/recruiter/requests" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterDirectRequests /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/requisitions" element={<ProtectedRoute allowedRoles={['admin']}><AdminRequisitions /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
