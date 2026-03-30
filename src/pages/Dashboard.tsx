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
    const labels = {
      basic: { name: 'Basic Plan', desc: 'Standard distribution' },
      standard: { name: 'Standard Plan', desc: 'Pro distribution' },
      premium: { name: 'Premium Plan', desc: 'Full distribution suite' },
      premium_plus: { name: 'Premium Plus', desc: 'Unlimited distribution' }
    };
    return labels[plan] || labels.basic;
  };

  const getPlanLimits = (plan: string) => {
    const limits = { basic: 3, standard: 10, premium: 25, premium_plus: -1 };
    const analytics = { basic: false, standard: true, premium: true, premium_plus: true };
    const revenue = { basic: false, standard: false, premium: true, premium_plus: true };
    return {
      maxReleases: limits[plan] ?? 3,
      analytics: analytics[plan] ?? false,
      revenue: revenue[plan] ?? false
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
    return 'bg-zinc-800 text-zinc-400';
  };

  const statCards = [
    { label: 'Releases', value: stats.totalReleases, icon: Music, accent: 'from-zinc-700 to-zinc-800' },
    { label: 'Streams', value: formatNumber(stats.totalStreams), icon: Play, accent: 'from-zinc-700 to-zinc-800' },
    { label: 'Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, accent: 'from-red-600 to-red-700' },
    { label: 'Growth', value: stats.monthlyGrowth, icon: TrendingUp, accent: 'from-zinc-700 to-zinc-800' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Subtle top gradient wash */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-red-950/20 to-transparent pointer-events-none" />

      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 border-b border-zinc-900 bg-[#0a0a0a]/95 backdrop-blur-md"
      >
        <div className="px-5 md:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-1.5">
                {user.name || 'Artist'} · {planLabel.desc}
              </p>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Your Dashboard
              </h1>
            </div>
            <div className="self-start sm:self-auto">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] bg-zinc-900 text-zinc-400 border border-zinc-800">
                {planLabel.name}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 p-4 md:p-8 space-y-6 md:space-y-8">

        {/* ─── Stats Grid ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          {statCards.map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -2 }}
              className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 md:p-5 group cursor-default"
            >
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${stat.accent} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <p className="text-lg md:text-xl font-black text-white tracking-tight truncate">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── Recent Releases ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden"
        >
          <div className="px-5 md:px-6 py-4 border-b border-zinc-900 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-white tracking-tight">Recent Releases</h2>
              <p className="text-[10px] text-zinc-600 font-bold mt-0.5 uppercase tracking-wider">Latest tracks submitted for distribution</p>
            </div>
            <button
              onClick={() => navigate('/releases')}
              className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-[0.2em] flex items-center transition-colors"
            >
              All <ChevronRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-900/50">
                  <th className="px-6 py-3 text-left text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">Title</th>
                  <th className="px-6 py-3 text-left text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">Artist</th>
                  <th className="px-6 py-3 text-left text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-3 text-left text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">Streams</th>
                  <th className="px-6 py-3 text-right text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]"></th>
                </tr>
              </thead>
              <tbody>
                {userReleases.slice(0, 5).map((release: any, i) => (
                  <motion.tr
                    key={release._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-zinc-900/40 hover:bg-zinc-900/30 transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm font-bold text-white whitespace-nowrap">{release.title}</td>
                    <td className="px-6 py-4 text-sm text-zinc-500 whitespace-nowrap">{release.artist}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${getStatusStyle(release.status)}`}>
                        {release.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500 font-mono">{formatNumber(release.streams || 0)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate('/analytics')}
                        className="text-[9px] font-black text-red-600 hover:text-red-400 uppercase tracking-widest flex items-center ml-auto transition-colors"
                      >
                        View <ChevronRight className="w-3 h-3 ml-0.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-zinc-900/50">
            {userReleases.slice(0, 5).map((release: any, i) => (
              <motion.div
                key={release._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate('/analytics')}
                className="p-4 flex items-center justify-between active:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center flex-shrink-0 border border-zinc-800">
                    <Music className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{release.title}</p>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">{release.artist} · {formatNumber(release.streams || 0)} plays</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 pl-2">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${getStatusStyle(release.status)}`}>
                    {release.status}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
                </div>
              </motion.div>
            ))}
          </div>

          {userReleases.length === 0 && (
            <div className="py-16 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                <Music className="w-5 h-5 text-zinc-700" />
              </div>
              <p className="text-sm font-bold text-white mb-1">No releases yet</p>
              <p className="text-xs text-zinc-600 mb-6 max-w-xs mx-auto">
                Submit your first release and we'll distribute it to all major stores globally.
              </p>
              <button
                onClick={() => navigate('/releases/new')}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors"
              >
                Submit Release
              </button>
            </div>
          )}
        </motion.div>

        {/* ─── Quick Actions ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4"
        >
          {[
            {
              icon: Upload,
              title: 'New Release',
              desc: planLimits.maxReleases === -1 ? 'Unlimited submissions' : `${userReleases.length} / ${planLimits.maxReleases} used`,
              route: '/releases/new',
              locked: planLimits.maxReleases !== -1 && userReleases.length >= planLimits.maxReleases,
              active: true
            },
            {
              icon: BarChart3,
              title: 'Analytics',
              desc: planLimits.analytics ? 'Streams, charts & insights' : 'Upgrade to access',
              route: '/analytics',
              locked: !planLimits.analytics,
              active: planLimits.analytics
            },
            {
              icon: DollarSign,
              title: 'Revenue',
              desc: planLimits.revenue ? 'Earnings & payouts' : 'Upgrade to access',
              route: '/revenue',
              locked: !planLimits.revenue,
              active: planLimits.revenue
            }
          ].map((action, i) => (
            <motion.button
              key={i}
              onClick={() => !action.locked && navigate(action.route)}
              disabled={action.locked}
              whileHover={action.locked ? {} : { y: -2 }}
              whileTap={action.locked ? {} : { scale: 0.98 }}
              className={`relative rounded-2xl p-5 text-left border transition-all duration-200 ${
                action.locked
                  ? 'bg-zinc-950 border-zinc-900 opacity-50 cursor-not-allowed'
                  : action.active
                  ? 'bg-red-600 border-red-700 hover:bg-red-700'
                  : 'bg-zinc-950 border-zinc-900 hover:border-zinc-700'
              }`}
            >
              <action.icon className={`w-6 h-6 mb-4 ${action.active && !action.locked ? 'text-white' : 'text-zinc-500'}`} />
              <p className={`text-sm font-black ${action.active && !action.locked ? 'text-white' : 'text-zinc-400'}`}>
                {action.title}
              </p>
              <p className={`text-[11px] mt-0.5 ${action.active && !action.locked ? 'text-red-200' : 'text-zinc-600'}`}>
                {action.desc}
              </p>
              {!action.locked && (
                <ChevronRight className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 ${action.active ? 'text-red-200' : 'text-zinc-700'}`} />
              )}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="flex items-center space-x-3 bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4">
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-zinc-400 font-bold">Loading dashboard…</span>
          </div>
        </div>
      )}
    </div>
  );
}
