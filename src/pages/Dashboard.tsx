import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Upload, BarChart3, DollarSign, Users, TrendingUp, ChevronRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const plan = user.subscription || 'basic';

  const [userReleases, setUserReleases] = useState([]);
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
        const releases = releasesResponse.data.releases || [];
        setUserReleases(releases);
        setStats({
          totalReleases: releases.length,
          totalStreams: releases.reduce((sum, r) => sum + (r.streams || 0), 0),
          totalRevenue: releases.reduce((sum, r) => sum + (r.revenue || 0), 0),
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
      basic: { name: 'Artiste Plan', desc: 'Basic distribution' },
      premium: { name: 'Record Label Plan', desc: 'Professional distribution' },
      plus: { name: 'Record Label Plus', desc: 'Advanced distribution' },
      standard: { name: 'Enterprise Edition', desc: 'Premium distribution' }
    };
    return labels[plan] || labels.basic;
  };

  const getPlanLimits = (plan: string) => {
    // All plans have unlimited releases now
    const analytics = { basic: true, premium: true, plus: true, standard: true };
    const revenue = { basic: true, premium: true, plus: true, standard: true };
    return {
      maxReleases: -1,
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
    if (status === 'rejected') return 'bg-red-500/10 text-red-400 border border-red-500/20';
    return 'bg-zinc-800 text-white';
  };

  const statCards = [
    { label: 'Releases', value: stats.totalReleases, icon: Music, accent: 'from-zinc-700 to-zinc-800' },
    { label: 'Streams', value: formatNumber(stats.totalStreams), icon: Play, accent: 'from-zinc-700 to-zinc-800' },
    { label: 'Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, accent: 'from-red-600 to-red-700' },
    { label: 'Growth', value: stats.monthlyGrowth, icon: TrendingUp, accent: 'from-zinc-700 to-zinc-800' }
  ];

  return (
    <div className="min-h-screen">

      <div className="relative z-10 p-5 md:p-10 space-y-10">

        {/* ─── Welcome Header ─── */}
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
            <div>
                <p className="label-caps mb-2">Workspace Overview</p>
                <h1 className="text-4xl md:text-6xl font-display italic tracking-tight text-white uppercase leading-[0.85]">
                    Welcome back,<br/>
                    <span className="text-gradient-red">{user.name?.split(' ')[0] || 'Artist'}</span>
                </h1>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
                <div className="px-5 py-2 glass-dark rounded-2xl border border-white/10 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.8)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">{planLabel.name} ACTIVE</span>
                </div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">{planLabel.desc}</p>
            </div>
        </motion.div>

        {/* ─── Stats Grid ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {statCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass-card-premium p-6 md:p-8 flex flex-col justify-between h-full min-h-[160px] cursor-default group"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.accent} flex items-center justify-center mb-6 shadow-xl shadow-black/50 group-hover:shadow-red-600/20 transition-all duration-500`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="label-caps opacity-60 group-hover:opacity-100 transition-opacity mb-1">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-black text-white tracking-tight">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── Recent Releases & Actions ─── */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-10">
          
          {/* Recent Releases Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 glass-card-premium overflow-hidden flex flex-col"
          >
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h2 className="text-lg font-black text-white tracking-tight uppercase">Recent Releases</h2>
                <p className="label-caps mt-1">Catalogue Activity</p>
              </div>
              <button
                onClick={() => navigate('/releases')}
                className="text-[11px] font-black text-red-500 hover:text-red-400 uppercase tracking-[0.2em] flex items-center transition-colors bg-red-600/10 px-4 py-2 rounded-xl border border-red-600/20"
              >
                View All <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {userReleases.length === 0 ? (
                <div className="py-24 text-center px-10">
                  <div className="w-16 h-16 rounded-[2rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <Music className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-lg font-black text-white mb-2 uppercase">No catalogue yet</p>
                  <p className="text-xs text-white mb-8 max-w-xs mx-auto font-bold leading-relaxed">
                    Submit your first release and we'll distribute it to 150+ major stores globally.
                  </p>
                  <button
                    onClick={() => navigate('/releases/new')}
                    className="bg-white text-black px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-zinc-200 active:scale-95 shadow-xl shadow-white/5"
                  >
                    Start Distribution
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {userReleases.slice(0, 5).map((release: any, i) => (
                    <motion.div
                      key={release._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => navigate('/analytics')}
                      className="p-6 md:p-8 flex items-center justify-between hover:bg-white/[0.03] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center space-x-6 min-w-0">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-zinc-900 flex items-center justify-center flex-shrink-0 border border-white/5 shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                          {release.cover_url ? (
                            <img src={release.cover_url} alt={release.title} className="w-full h-full object-cover" />
                          ) : (
                            <Music className="w-6 h-6 text-red-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-base md:text-lg font-black text-white truncate group-hover:text-red-500 transition-colors uppercase leading-tight mb-1">{release.title}</p>
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${getStatusStyle(release.status)}`}>
                                {release.status}
                            </span>
                            <p className="text-[10px] text-white font-black uppercase tracking-widest">{release.artist} · {formatNumber(release.streams || 0)} STREAMS</p>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white group-hover:text-white transition-all transform group-hover:translate-x-1" />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions Column */}
          <div className="space-y-6 md:space-y-8 flex flex-col">
            <h3 className="label-caps pl-2">Operations Center</h3>
            <div className="grid grid-cols-1 gap-4 md:gap-6 flex-1">
              {[
                {
                  icon: Upload,
                  title: 'New Release',
                  desc: planLimits.maxReleases === -1 ? 'Unlimited submissions' : `${userReleases.length} / ${planLimits.maxReleases} used`,
                  route: '/releases/new',
                  locked: planLimits.maxReleases !== -1 && userReleases.length >= planLimits.maxReleases,
                  accent: 'from-red-600 to-red-900',
                  active: true
                },
                {
                  icon: BarChart3,
                  title: 'Analytics',
                  desc: planLimits.analytics ? 'Streams, charts & insights' : 'Upgrade to access',
                  route: '/analytics',
                  locked: !planLimits.analytics,
                  accent: 'from-zinc-800 to-black',
                  active: planLimits.analytics
                },
                {
                  icon: DollarSign,
                  title: 'Revenue',
                  desc: planLimits.revenue ? 'Earnings & payouts' : 'Upgrade to access',
                  route: '/revenue',
                  locked: !planLimits.revenue,
                  accent: 'from-zinc-800 to-black',
                  active: planLimits.revenue
                }
              ].map((action, i) => (
                <motion.button
                  key={i}
                  onClick={() => !action.locked && navigate(action.route)}
                  disabled={action.locked}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  whileHover={action.locked ? {} : { x: 5, scale: 1.02 }}
                  whileTap={action.locked ? {} : { scale: 0.98 }}
                  className={`relative rounded-[2rem] p-8 text-left border transition-all duration-500 overflow-hidden group shadow-2xl flex flex-col justify-end min-h-[140px] md:min-h-0 md:flex-1 ${
                    action.locked
                      ? 'bg-zinc-950/50 border-zinc-900 opacity-40 cursor-not-allowed'
                      : 'glass-card-premium hover:border-red-600/50'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${action.accent} opacity-10 blur-3xl group-hover:opacity-30 transition-opacity`} />
                  
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border transition-all ${
                        action.active && !action.locked ? 'bg-red-600 border-red-500 shadow-lg shadow-red-600/20' : 'bg-zinc-900 border-white/5'
                    }`}>
                      <action.icon className={`w-6 h-6 ${action.active && !action.locked ? 'text-white' : 'text-white'}`} />
                    </div>
                    <div>
                      <p className={`text-lg font-black uppercase tracking-tight ${action.active && !action.locked ? 'text-white' : 'text-white'}`}>
                        {action.title}
                      </p>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${action.active && !action.locked ? 'text-white' : 'text-white'}`}>
                        {action.desc}
                      </p>
                    </div>
                  </div>
                  
                  {!action.locked && (
                    <ChevronRight className={`absolute right-8 bottom-8 w-6 h-6 transform group-hover:translate-x-2 transition-transform ${action.active ? 'text-red-600' : 'text-white'}`} />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="flex items-center space-x-3 bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4">
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-white font-bold">Loading dashboard…</span>
          </div>
        </div>
      )}
    </div>
  );
}
