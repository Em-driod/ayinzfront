import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Music, Home, Upload, BarChart3, DollarSign, Settings, Menu, X, LogOut, ShieldAlert, HelpCircle } from 'lucide-react';
import api from '../utils/api';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Releases', href: '/releases', icon: Upload },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Revenue', href: '/revenue', icon: DollarSign },
    { name: 'Support', href: '/support', icon: HelpCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isLandingPage = location.pathname === '/';

  // Get user info and check if admin
  const userStr = localStorage.getItem('user');
  let isAdmin = false;
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      if (u.email === 'Ayinzcontact@gmail.com') isAdmin = true;
    } catch (e) { }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      // Call backend logout endpoint
      await api.post('/auth/logout');
    } catch (error) {
      // Even if backend call fails, continue with frontend logout
      console.error('Backend logout failed:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Navigate to login page
      navigate('/login');
      setIsSigningOut(false);
    }
  };

  if (isLandingPage || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] shadow-2xl shadow-black/60 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-zinc-900
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-5 border-b border-zinc-900">
          <div className="flex items-center space-x-3">
            <img src="/ayinz.jpeg" alt="Ayinz Logo" className="w-9 h-9 text-orange-500 rounded-xl object-cover shadow-lg border border-gray-800" />
            <span className="text-2xl font-black text-white tracking-tighter">Ayinz</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-xl text-zinc-600 hover:text-white hover:bg-zinc-900 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-3 px-2">Navigation</p>
          <div className="space-y-0.5">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-2.5 text-sm font-bold rounded-xl transition-all duration-200
                    ${isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'
                    }
                  `}
                >
                  <item.icon className={`mr-3 h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                  {item.name}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                className={`
                  group flex items-center px-3 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 mt-2
                  ${location.pathname === '/admin'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                    : 'text-red-500/70 hover:bg-red-950/40 hover:text-red-400'
                  }
                `}
              >
                <ShieldAlert className="mr-3 h-4 w-4" />
                Admin Panel
              </Link>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-900">
            <button 
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full group flex items-center px-3 py-2.5 text-sm font-bold text-zinc-600 rounded-xl hover:bg-zinc-900 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningOut ? (
                <>
                  <div className="w-4 h-4 mr-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-zinc-900">
          <div className="flex items-center justify-between h-16 px-5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl text-zinc-600 hover:text-white hover:bg-zinc-900 active:scale-90 transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
              <img src="/ayinz.jpeg" alt="Ayinz Logo" className="w-8 h-8 text-orange-600 rounded-lg object-cover shadow-md" />
              <span className="text-xl font-black text-white tracking-tighter">Ayinz</span>
            </div>
            <div className="w-10"></div> {/* Spacer for perfect optical centering */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
