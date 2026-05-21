import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Music, Home, Upload, BarChart3, DollarSign, Settings, X, LogOut, ShieldAlert, HelpCircle } from 'lucide-react';
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
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isLandingPage = location.pathname === '/';

  const userStr = localStorage.getItem('user');
  let isAdmin = false;
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      if (u.email === 'Ayinzcontact@gmail.com') isAdmin = true;
    } catch (e) {}
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Backend logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      setIsSigningOut(false);
    }
  };

  if (isLandingPage || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#050505] bg-mesh-main flex">

      {/* ── Desktop Sidebar ── */}
      <div className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-zinc-900 overflow-y-auto">
        <div className="flex items-center h-16 px-5 border-b border-zinc-900 shrink-0">
          <img src="/ayinz.jpeg" alt="Ayinz" className="w-9 h-9 rounded-xl object-cover border border-zinc-800" />
          <span className="ml-3 text-2xl font-black text-white tracking-tighter">Ayinz</span>
        </div>

        <nav className="flex-1 mt-6 px-3">
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-3 px-2">Navigation</p>
          <div className="space-y-0.5">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <item.icon className={`mr-3 h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-white'}`} />
                  {item.name}
                </Link>
              );
            })}

            <Link
              to="/support"
              className={`group flex items-center px-3 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                location.pathname === '/support'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <HelpCircle className={`mr-3 h-4 w-4 shrink-0 ${location.pathname === '/support' ? 'text-white' : 'text-zinc-500 group-hover:text-white'}`} />
              Support
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`group flex items-center px-3 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 mt-2 ${
                  location.pathname === '/admin'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                    : 'text-red-500/60 hover:bg-red-950/40 hover:text-red-400'
                }`}
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
              className="w-full group flex items-center px-3 py-2.5 text-sm font-bold text-zinc-500 rounded-xl hover:bg-zinc-900 hover:text-white transition-all duration-200 disabled:opacity-50"
            >
              {isSigningOut ? (
                <>
                  <div className="w-4 h-4 mr-3 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign Out
                </>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* ── Mobile Slide-out Sidebar (for More / Admin) ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0a0a0a] border-r border-zinc-900 flex flex-col z-10">
            <div className="flex items-center justify-between h-16 px-5 border-b border-zinc-900">
              <div className="flex items-center gap-3">
                <img src="/ayinz.jpeg" alt="Ayinz" className="w-9 h-9 rounded-xl object-cover border border-zinc-800" />
                <span className="text-xl font-black text-white tracking-tighter">Ayinz</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 mt-4 px-3 overflow-y-auto">
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-3 px-2">Navigation</p>
              <div className="space-y-0.5">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center px-3 py-3 text-sm font-bold rounded-xl transition-all ${
                        isActive ? 'bg-red-600 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      <item.icon className={`mr-3 h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                      {item.name}
                    </Link>
                  );
                })}

                <Link
                  to="/support"
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-3 text-sm font-bold rounded-xl transition-all ${
                    location.pathname === '/support' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <HelpCircle className={`mr-3 h-5 w-5 shrink-0 ${location.pathname === '/support' ? 'text-white' : 'text-zinc-500'}`} />
                  Support
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-3 py-3 text-sm font-bold rounded-xl transition-all mt-2 ${
                      location.pathname === '/admin' ? 'bg-red-600 text-white' : 'text-red-500/60 hover:bg-red-950/40 hover:text-red-400'
                    }`}
                  >
                    <ShieldAlert className="mr-3 h-5 w-5" />
                    Admin Panel
                  </Link>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-900">
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full flex items-center px-3 py-3 text-sm font-bold text-zinc-500 rounded-xl hover:bg-zinc-900 hover:text-white transition-all disabled:opacity-50"
                >
                  {isSigningOut ? (
                    <>
                      <div className="w-4 h-4 mr-3 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
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
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        {/* Mobile top bar — logo only */}
        <div className="lg:hidden sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-zinc-900">
          <div className="flex items-center justify-center h-14 px-5 relative">
            <div className="flex items-center gap-2.5">
              <img src="/ayinz.jpeg" alt="Ayinz" className="w-7 h-7 rounded-lg object-cover border border-zinc-800" />
              <span className="text-lg font-black text-white tracking-tighter">Ayinz</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>

        {/* ── Mobile Bottom Nav Bar ── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/98 backdrop-blur-xl border-t border-zinc-900 safe-area-pb">
          <div className="flex items-center justify-around px-1 py-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all active:scale-90"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive ? 'bg-red-600 shadow-lg shadow-red-600/30' : 'bg-transparent'
                  }`}>
                    <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${
                    isActive ? 'text-red-500' : 'text-zinc-600'
                  }`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
