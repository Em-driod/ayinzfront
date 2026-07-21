import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

function isAdminUser(): boolean {
  const userStr = localStorage.getItem('user');
  if (!userStr) return false;
  try {
    const u = JSON.parse(userStr);
    return u.email === 'Ayinzcontact@gmail.com';
  } catch {
    return false;
  }
}

export default function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdminUser()) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
