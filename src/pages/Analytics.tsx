import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Music, TrendingUp, DollarSign, Headphones, ChevronDown, Globe } from 'lucide-react';
import api from '../utils/api';
import { motion } from 'framer-motion';

interface HistoryPoint { date: string; streams: number; revenue: number; platform?: string; }
interface Release {
  id: string; title: string; artist: string; type: string; status: string;
  streams: number; revenue: number; platformStats?: Record<string, number>;
}

const PLATFORM_COLORS: Record<string, string> = {
  'Spotify': '#1DB954', 'Apple Music': '#FC3C44', 'YouTube Music': '#FF0000',
  'Amazon Music': '#00A8E1', 'Tidal': '#00d2ff', 'Deezer': '#FF0092',
  'Boomplay': '#f1c40f', 'Audiomack': '#FFA200', 'Other': '#71717a', 'Overall': '#52525b'
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 shadow-2xl rounded-xl px-3 py-2.5 text-sm">
        <p className="font-black text-white mb-1.5 text-[10px] uppercase tracking-wider border-b border-zinc-900 pb-1">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center justify-between gap-4 mt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-zinc-400 text-[10px]">{entry.name}:</span>
            </span>
            <span className="text-white font-mono font-black text-[10px]">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [selected, setSelected] = useState<Release | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const res = await api.get('/releases');
        const list: Release[] = res.data.releases || [];
        setReleases(list);
        if (list.length > 0) setSelected(list[0]);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetchReleases();
  }, []);

  useEffect(() => {
    if (!selected) return;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await api.get(`/releases/${selected.id}/history`);
        setHistory(res.data.history || []);
      } catch { setHistory([]); } finally { setLoadingHistory(false); }
    };
    fetchHistory();
  }, [selected]);

  const totalStreams = releases.reduce((s, r) => s + (r.streams || 0), 0);
  const totalRevenue = releases.reduce((s, r) => s + (r.revenue || 0), 0);

  const marketShare: Record<string, number> = {};
  releases.forEach(r => {
    if (r.platformStats) {
      Object.entries(r.platformStats).forEach(([platform, streams]) => {
        marketShare[platform] = (marketShare[platform] || 0) + Number(streams);
      });
    }
  });

  const pieData = Object.entries(marketShare).map(([name, value]) => ({ name, value }));
  const topPlatform = pieData.length > 0 ? pieData.reduce((prev, curr) => prev.value > curr.value ? prev : curr) : null;
  const topPlatformPercent = (topPlatform && totalStreams > 0) ? Math.round((topPlatform.value / totalStreams) * 100) : 0;
  const allPlatforms = Array.from(new Set(releases.flatMap(r => Object.keys(r.platformStats || {}))));

  const chartData = selected ? Object.values(
    history.reduce((acc: any, curr: any) => {
      if (!acc[curr.date]) acc[curr.date] = { date: curr.date };
      acc[curr.date][curr.platform || 'Overall'] = curr.streams;
      return acc;
    }, {})
  ) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-10 pb-6 space-y-6 md:space-y-8">

      {/* ─── Header ─── */}
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
        <p className="label-caps mb-1.5 text-[9px]">Performance Metrics</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display italic tracking-tight text-white uppercase leading-[1.1] pb-1">
          Project <span className="text-gradient-red">Analytics</span>
        </h1>
      </motion.div>

      {/* ─── Summary Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {[
          { label: 'Releases', value: releases.length, icon: Music, accent: 'from-zinc-800 to-black' },
          { label: 'Global Streams', value: totalStreams.toLocaleString(), icon: Headphones, accent: 'from-red-600 to-red-900' },
          { label: 'Top Platform', value: topPlatform ? topPlatform.name : '—', icon: Globe, accent: 'from-zinc-800 to-black' },
          { label: 'Total Revenue', value: `₦${totalRevenue.toLocaleString()}`, icon: DollarSign, accent: 'from-amber-500 to-amber-800' },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card-premium p-4 md:p-6 flex flex-col justify-between min-h-[120px] md:min-h-[140px] group cursor-default"
          >
            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br ${card.accent} flex items-center justify-center mb-3 md:mb-5 shadow-xl border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="label-caps opacity-60 mb-0.5 text-[8px]">{card.label}</p>
              <p className="text-lg md:text-xl lg:text-2xl font-black text-white tracking-tight truncate">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {releases.length === 0 ? (
        <div className="glass-card-premium rounded-2xl p-12 text-center">
          <Music className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h2 className="text-base font-black text-white mb-1">No releases yet</h2>
          <p className="text-sm text-zinc-500 font-medium">Submit a release to start seeing analytics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">

          {/* ─── Main Charts ─── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Streaming Trend */}
            <div className="glass-card-premium overflow-hidden flex flex-col rounded-[2rem]">
              <div className="px-5 md:px-7 py-4 md:py-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02]">
                <div>
                  <h2 className="text-sm md:text-base font-black text-white tracking-tight uppercase">Streaming Trend</h2>
                  <p className="label-caps mt-0.5 text-[8px] opacity-60">Daily Performance</p>
                </div>
                <div className="relative">
                  <select
                    className="appearance-none bg-zinc-950 border border-white/5 text-white text-[10px] font-black pl-4 pr-8 py-2.5 rounded-xl focus:outline-none focus:border-red-600/50 transition-all cursor-pointer"
                    value={selected?.id || ''}
                    onChange={e => {
                      const r = releases.find(r => r.id === e.target.value);
                      if (r) setSelected(r);
                    }}
                  >
                    {releases.map(r => <option key={r.id} value={r.id}>{r.title.toUpperCase()}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              <div className="p-4 md:p-6 overflow-x-auto">
                {loadingHistory ? (
                  <div className="flex items-center justify-center h-[220px] md:h-[280px]">
                    <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[220px] md:h-[280px] text-center">
                    <TrendingUp className="w-10 h-10 text-zinc-700 mb-3" />
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Awaiting streaming data…</p>
                  </div>
                ) : (
                  <div className="min-w-[300px]">
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#52525b', fontWeight: 900 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: '#52525b', fontWeight: 900 }} axisLine={false} tickLine={false} width={40} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="top" height={36} align="left" iconType="circle" wrapperStyle={{ paddingBottom: '16px', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                        {Array.from(new Set(history.map((h: any) => h.platform || 'Overall'))).map((platform: any) => (
                          <Line key={platform} type="monotone" dataKey={platform}
                            stroke={PLATFORM_COLORS[platform] || '#71717a'} strokeWidth={2.5}
                            dot={{ r: 0 }} activeDot={{ r: 5, stroke: '#000', strokeWidth: 2 }} name={platform} connectNulls />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Platform Distribution */}
            <div className="glass-card-premium rounded-[2rem] p-5 md:p-7 flex flex-col">
              <div className="mb-5">
                <h2 className="text-sm md:text-base font-black text-white tracking-tight uppercase">Platform Breakdown</h2>
                <p className="label-caps mt-0.5 text-[8px] opacity-60">Market Share by Platform</p>
              </div>
              <div className="overflow-x-auto min-w-0">
                <div className="min-w-[280px]">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={releases.map(r => ({ title: r.title.substring(0, 8) + '…', ...r.platformStats }))} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="title" tick={{ fontSize: 8, fill: '#52525b', fontWeight: 900 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 8, fill: '#52525b', fontWeight: 900 }} axisLine={false} tickLine={false} width={36} />
                      <Tooltip content={<CustomTooltip />} />
                      {allPlatforms.map((platform: any) => (
                        <Bar key={platform} dataKey={platform} stackId="a"
                          fill={PLATFORM_COLORS[platform] || '#52525b'} barSize={32} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Side Panel ─── */}
          <div className="space-y-5">

            {/* Audience Distribution Donut */}
            <div className="glass-card-premium rounded-[2rem] p-5 md:p-7">
              <p className="label-caps mb-5 text-[9px]">Audience Distribution</p>
              {pieData.length > 0 ? (
                <>
                  <div className="h-52 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={78} paddingAngle={3} dataKey="value" stroke="none">
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={PLATFORM_COLORS[pieData[i].name] || '#52525b'} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Volume</p>
                      <p className="text-xl font-black text-white leading-none">
                        {totalStreams > 1000 ? (totalStreams / 1000).toFixed(1) + 'K' : totalStreams}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    {pieData.map(p => (
                      <div key={p.name} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[p.name] || '#52525b' }} />
                          <span className="text-[10px] text-white font-black uppercase tracking-widest">{p.name}</span>
                        </div>
                        <span className="text-sm font-black text-white font-mono">
                          {totalStreams > 0 ? Math.round((p.value / totalStreams) * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Globe className="w-10 h-10 text-zinc-700 mb-3" />
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Global metrics pending…</p>
                </div>
              )}
            </div>

            {/* Growth Insight */}
            {topPlatform && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card-premium rounded-[2rem] p-5 md:p-7 border-l-4 border-l-red-600 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2.5 mb-3">
                  <TrendingUp className="w-4 h-4 text-red-500" />
                  <p className="label-caps text-red-500 text-[9px]">Growth Insight</p>
                </div>
                <p className="text-sm text-zinc-300 font-medium leading-relaxed">
                  <span className="text-white font-black">{topPlatform.name}</span> is your primary growth engine, commanding{' '}
                  <span className="text-red-500 font-black">{topPlatformPercent}%</span> of your total audience.
                </p>
                <p className="mt-3 text-[9px] text-zinc-500 uppercase tracking-widest font-black">Priority: Push marketing here</p>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
