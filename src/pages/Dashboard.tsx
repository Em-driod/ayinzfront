import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Upload, BarChart3, DollarSign, TrendingUp, ChevronRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const plan = user.subscription || 'basic';

  const [userReleases, setUserReleases] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalReleases: 0,
    totalStreams: 0,
    totalRevenue: 0,
    monthlyGrowth: '+0%'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const releasesResponse = await api.get('/releases');
        const releases: any[] = releasesResponse.data.releases || [];
        setUserReleases(releases);
        setStats({
          totalReleases: releases.length,
          totalStreams: releases.reduce((sum: number, r: any) => sum + (r.streams || 0), 0),
          totalRevenue: releases.reduce((sum: number, r: any) => sum + (r.revenue || 0), 0),
          monthlyGrowth: '+0%'
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const getPlanLabel = (plan: string) => {
    const labels: Record<string, { name: string; desc: string }> = {
      none: { name: 'No Active Plan', desc: 'Upgrade to start distributing' },
      basic: { name: 'Artiste Plan', desc: 'Basic distribution' },
      premium: { name: 'Record Label Plan', desc: 'Professional distribution' },
      plus: { name: 'Record Label Plus', desc: 'Advanced distribution' },
      standard: { name: 'Enterprise Edition', desc: 'Premium distribution' }
    };
    return labels[plan] || labels.none;
  };

  const getPlanLimits = (plan: string) => {
    const analytics = { none: false, basic: true, premium: true, plus: true, standard: true };
    const revenue = { none: false, basic: true, premium: true, plus: true, standard: true };
    return {
      maxReleases: plan === 'none' ? 0 : -1,
      analytics: analytics[plan as keyof typeof analytics] ?? true,
      revenue: revenue[plan as keyof typeof revenue] ?? true
    };
  };

  const planLabel = getPlanLabel(plan);
  const planLimits = getPlanLimits(plan);

  const formatCurrency = (num: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
  };

  const getStatusStyle = (status: string) => {
    if (status === 'approved') return 'bg-red-600/10 text-red-500 border border-red-600/20';
    if (status === 'pending') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    if (status === 'rejected') return 'bg-zinc-800 text-zinc-400 border border-zinc-700';
    return 'bg-zinc-800 text-white border border-zinc-700';
  };

  const statCards = [
    { label: 'Releases', value: stats.totalReleases, icon: Music, accent: 'from-zinc-700 to-zinc-800' },
    { label: 'Streams', value: formatNumber(stats.totalStreams), icon: Play, accent: 'from-zinc-700 to-zinc-800' },
    { label: 'Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, accent: 'from-red-600 to-red-700' },
    { label: 'Growth', value: stats.monthlyGrowth, icon: TrendingUp, accent: 'from-zinc-700 to-zinc-800' }
  ];

  return (
    <div className="min-h-screen">
      <div className="relative z-10 p-4 md:p-8 lg:p-10 space-y-6 md:space-y-10">

        {/* ─── Welcome Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <p className="label-caps mb-1.5 text-[9px]">Workspace Overview</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display italic tracking-tight text-white uppercase leading-[1.1] pb-1">
              Welcome,{' '}
              <span className="text-gradient-red">{user.name?.split(' ')[0] || 'Artist'}</span>
            </h1>
          </div>
          <div className={`self-start sm:self-auto flex items-center gap-2.5 px-4 py-2 glass-dark rounded-2xl border ${plan === 'none' ? 'border-amber-500/40' : 'border-white/10'}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${plan === 'none' ? 'bg-amber-500' : 'bg-red-600'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">{planLabel.name}</span>
          </div>
        </motion.div>

        {/* ─── Stats Grid ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {statCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card-premium p-4 md:p-6 flex flex-col justify-between min-h-[120px] md:min-h-[150px] cursor-default group"
            >
              <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-gradient-to-br ${stat.accent} flex items-center justify-center mb-3 md:mb-5 shadow-xl shadow-black/50`}>
                <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <p className="label-caps opacity-60 mb-0.5 text-[8px] md:text-[9px]">{stat.label}</p>
                <p className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── Recent Releases & Actions ─── */}
        <div className="grid lg:grid-cols-3 gap-5 md:gap-8">

          {/* Recent Releases */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 glass-card-premium overflow-hidden flex flex-col"
          >
            <div className="px-5 md:px-7 py-4 md:py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h2 className="text-sm md:text-base font-black text-white tracking-tight uppercase">Recent Releases</h2>
                <p className="label-caps mt-0.5 text-[8px] opacity-60">Catalogue Activity</p>
              </div>
              <button
                onClick={() => navigate('/releases')}
                className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest flex items-center gap-1 bg-red-600/10 px-3 py-1.5 rounded-xl border border-red-600/20 transition-colors"
              >
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[360px]">
              {userReleases.length === 0 ? (
                <div className="py-16 text-center px-8">
                  <div className="w-14 h-14 rounded-[1.5rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-5 shadow-2xl">
                    <Music className="w-6 h-6 text-zinc-500" />
                  </div>
                  <p className="text-base font-black text-white mb-1.5 uppercase">No catalogue yet</p>
                  <p className="text-xs text-zinc-500 mb-7 max-w-xs mx-auto font-medium leading-relaxed">
                    Submit your first release and we'll distribute it to 150+ stores globally.
                  </p>
                  <button
                    onClick={() => navigate('/releases/new')}
                    className="bg-white text-black px-7 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all hover:bg-zinc-100 active:scale-95 shadow-xl"
                  >
                    Start Distribution
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {userReleases.map((release: any, i) => (
                    <motion.div
                      key={release.id || release._id || i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => navigate('/analytics')}
                      className="px-5 md:px-7 py-4 md:py-5 flex items-center justify-between hover:bg-white/[0.03] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-11 h-11 md:w-13 md:h-13 rounded-xl md:rounded-2xl bg-zinc-900 flex items-center justify-center shrink-0 border border-white/5 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                          {release.cover_url ? (
                            <img src={release.cover_url} alt={release.title} className="w-full h-full object-cover" />
                          ) : (
                            <Music className="w-5 h-5 text-red-500/60" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm md:text-base font-black text-white truncate group-hover:text-red-500 transition-colors uppercase leading-tight">
                            {release.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(release.status)}`}>
                              {release.status}
                            </span>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider truncate">
                              {release.artist} · {formatNumber(release.streams || 0)} streams
                            </p>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-3 md:gap-4">
            <h3 className="label-caps text-[9px]">Quick Actions</h3>
            {[
              {
                icon: Upload,
                title: 'New Release',
                desc: planLimits.maxReleases === -1 ? 'Unlimited submissions' : `${userReleases.length} / ${planLimits.maxReleases} used`,
                route: '/releases/new',
                locked: planLimits.maxReleases !== -1 && userReleases.length >= planLimits.maxReleases,
                primary: true
              },
              {
                icon: BarChart3,
                title: 'Analytics',
                desc: planLimits.analytics ? 'Streams & insights' : 'Upgrade to access',
                route: '/analytics',
                locked: !planLimits.analytics,
                primary: false
              },
              {
                icon: DollarSign,
                title: 'Revenue',
                desc: planLimits.revenue ? 'Earnings & payouts' : 'Upgrade to access',
                route: '/revenue',
                locked: !planLimits.revenue,
                primary: false
              }
            ].map((action, i) => (
              <motion.button
                key={i}
                onClick={() => !action.locked && navigate(action.route)}
                disabled={action.locked}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                whileHover={action.locked ? {} : { x: 4 }}
                whileTap={action.locked ? {} : { scale: 0.98 }}
                className={`relative rounded-2xl md:rounded-[1.5rem] p-5 md:p-6 text-left border transition-all duration-300 overflow-hidden group flex items-center gap-4 ${
                  action.locked
                    ? 'bg-zinc-950/50 border-zinc-900 opacity-40 cursor-not-allowed'
                    : action.primary
                    ? 'glass-card-premium border-red-600/20 hover:border-red-600/50'
                    : 'glass-card-premium hover:border-white/10'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                  action.primary && !action.locked
                    ? 'bg-red-600 border-red-500 shadow-lg shadow-red-600/20'
                    : 'bg-zinc-900 border-white/5'
                }`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white uppercase tracking-tight">{action.title}</p>
                  <p className="text-[10px] font-bold text-zinc-500 mt-0.5 truncate">{action.desc}</p>
                </div>
                {!action.locked && (
                  <ChevronRight className={`w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform ${action.primary ? 'text-red-500' : 'text-zinc-600'}`} />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 shadow-2xl">
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-white font-bold">Loading dashboard…</span>
          </div>
        </div>
      )}
    </div>
  );
}
