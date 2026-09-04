import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Upload, BarChart3, DollarSign, Settings, X, LogOut, ShieldAlert, HelpCircle } from 'lucide-react';
import api from '../utils/api';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

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

  const [unreadTickets, setUnreadTickets] = useState(0);

  useEffect(() => {
    if (isLandingPage || isAuthPage) return;
    const fetchUnread = async () => {
      try {
        const res = await api.get('/support/my');
        const tickets = res.data.tickets || [];
        setUnreadTickets(tickets.filter((t: any) => t.unreadUser).length);
      } catch (e) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Backend logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
      setIsSigningOut(false);
    }
  };

  if (isLandingPage || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-mesh-main flex">

      {/* ── Desktop Sidebar ── */}
      <div className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg1)] border-r border-[var(--line)] overflow-y-auto">
        <div className="flex items-center justify-between h-16 px-5 border-b border-[var(--line)] shrink-0">
          <div className="flex items-center">
            <img src="/ayinz.jpeg" alt="Ayinz" className="w-9 h-9 rounded-xl object-cover border border-[var(--line-2)]" />
            <span className="ml-3 text-2xl font-black text-[var(--fg0)] tracking-tighter">Ayinz</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle variant="desktop" />
            <NotificationBell variant="desktop" />
          </div>
        </div>

        <nav className="flex-1 mt-6 px-3">
          <p className="text-[9px] font-black text-[var(--fg3)] uppercase tracking-[0.3em] mb-3 px-2">Navigation</p>
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
                      : 'text-[var(--fg2)] hover:bg-[var(--surface-hover)] hover:text-[var(--fg0)]'
                  }`}
                >
                  <item.icon className={`mr-3 h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-[var(--fg3)] group-hover:text-[var(--fg0)]'}`} />
                  {item.name}
                </Link>
              );
            })}

            <Link
              to="/support"
              className={`group flex items-center px-3 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                location.pathname === '/support'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : 'text-[var(--fg2)] hover:bg-[var(--surface-hover)] hover:text-[var(--fg0)]'
              }`}
            >
              <HelpCircle className={`mr-3 h-4 w-4 shrink-0 ${location.pathname === '/support' ? 'text-white' : 'text-[var(--fg3)] group-hover:text-[var(--fg0)]'}`} />
              Support
              {unreadTickets > 0 && (
                <span className="ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-black">
                  {unreadTickets}
                </span>
              )}
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`group flex items-center px-3 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 mt-2 ${
                  location.pathname === '/admin'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                    : 'text-[var(--danger-tint-fg)] hover:bg-[var(--danger-tint-bg)]'
                }`}
              >
                <ShieldAlert className="mr-3 h-4 w-4" />
                Admin Panel
              </Link>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--line)]">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full group flex items-center px-3 py-2.5 text-sm font-bold text-[var(--fg3)] rounded-xl hover:bg-[var(--surface-hover)] hover:text-[var(--fg0)] transition-all duration-200 disabled:opacity-50"
            >
              {isSigningOut ? (
                <>
                  <div className="w-4 h-4 mr-3 border-2 border-[var(--fg2)] border-t-transparent rounded-full animate-spin" />
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
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[var(--bg1)] border-r border-[var(--line)] flex flex-col z-10">
            <div className="flex items-center justify-between h-16 px-5 border-b border-[var(--line)]">
              <div className="flex items-center gap-3">
                <img src="/ayinz.jpeg" alt="Ayinz" className="w-9 h-9 rounded-xl object-cover border border-[var(--line-2)]" />
                <span className="text-xl font-black text-[var(--fg0)] tracking-tighter">Ayinz</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-xl text-[var(--fg3)] hover:text-[var(--fg0)] hover:bg-[var(--surface-hover)] transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 mt-4 px-3 overflow-y-auto">
              <p className="text-[9px] font-black text-[var(--fg3)] uppercase tracking-[0.3em] mb-3 px-2">Navigation</p>
              <div className="space-y-0.5">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center px-3 py-3 text-sm font-bold rounded-xl transition-all ${
                        isActive ? 'bg-red-600 text-white' : 'text-[var(--fg2)] hover:bg-[var(--surface-hover)] hover:text-[var(--fg0)]'
                      }`}
                    >
                      <item.icon className={`mr-3 h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-[var(--fg3)]'}`} />
                      {item.name}
                    </Link>
                  );
                })}

                <Link
                  to="/support"
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-3 text-sm font-bold rounded-xl transition-all ${
                    location.pathname === '/support' ? 'bg-red-600 text-white' : 'text-[var(--fg2)] hover:bg-[var(--surface-hover)] hover:text-[var(--fg0)]'
                  }`}
                >
                  <HelpCircle className={`mr-3 h-5 w-5 shrink-0 ${location.pathname === '/support' ? 'text-white' : 'text-[var(--fg3)]'}`} />
                  Support
                  {unreadTickets > 0 && (
                    <span className="ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-black">
                      {unreadTickets}
                    </span>
                  )}
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-3 py-3 text-sm font-bold rounded-xl transition-all mt-2 ${
                      location.pathname === '/admin' ? 'bg-red-600 text-white' : 'text-[var(--danger-tint-fg)] hover:bg-[var(--danger-tint-bg)]'
                    }`}
                  >
                    <ShieldAlert className="mr-3 h-5 w-5" />
                    Admin Panel
                  </Link>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--line)]">
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full flex items-center px-3 py-3 text-sm font-bold text-[var(--fg3)] rounded-xl hover:bg-[var(--surface-hover)] hover:text-[var(--fg0)] transition-all disabled:opacity-50"
                >
                  {isSigningOut ? (
                    <>
                      <div className="w-4 h-4 mr-3 border-2 border-[var(--fg2)] border-t-transparent rounded-full animate-spin" />
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

        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-[var(--bg1)]/95 backdrop-blur-md border-b border-[var(--line)]">
          <div className="flex items-center justify-between h-14 px-4">
            {/* Left: Sign Out */}
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--surface-hover)] border border-[var(--line-2)] text-[var(--fg3)] hover:text-[var(--fg0)] active:scale-90 transition-all disabled:opacity-50"
            >
              {isSigningOut
                ? <div className="w-4 h-4 border-2 border-[var(--fg2)] border-t-transparent rounded-full animate-spin" />
                : <LogOut className="w-4 h-4" />
              }
            </button>

            {/* Centered logo */}
            <div className="flex items-center gap-2.5">
              <img src="/ayinz.jpeg" alt="Ayinz" className="w-7 h-7 rounded-lg object-cover border border-[var(--line-2)]" />
              <span className="text-lg font-black text-[var(--fg0)] tracking-tighter">Ayinz</span>
            </div>

            {/* Right: Theme + Notifications + Admin shortcut */}
            <div className="flex items-center gap-2">
              <ThemeToggle variant="mobile" />
              <NotificationBell variant="mobile" />
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                    location.pathname === '/admin'
                      ? 'bg-red-600 shadow-lg shadow-red-600/30'
                      : 'bg-[var(--danger-tint-bg)] border border-[var(--danger-tint-border)]'
                  }`}
                >
                  <ShieldAlert className="w-5 h-5 text-[var(--danger-tint-fg)]" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>

        {/* ── Mobile Bottom Nav Bar ── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg1)]/98 backdrop-blur-xl border-t border-[var(--line)] safe-area-pb">
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
                    <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-[var(--fg3)]'}`} />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${
                    isActive ? 'text-red-500' : 'text-[var(--fg3)]'
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
