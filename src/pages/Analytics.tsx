import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Music, TrendingUp, DollarSign, Headphones, ChevronDown, Globe } from 'lucide-react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

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
      <div className="bg-zinc-950 border border-zinc-800 shadow-2xl rounded-xl px-4 py-3 text-sm">
        <p className="font-black text-white mb-2 text-xs uppercase tracking-wider border-b border-zinc-900 pb-1.5">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center justify-between space-x-4 mt-1">
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-zinc-500 text-xs">{entry.name}:</span>
            </span>
            <span className="text-white font-mono font-black text-xs">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
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
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 pb-24">

        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="label-elite mb-2">Performance Metrics</p>
            <h1 className="text-4xl md:text-6xl font-display italic tracking-tight text-white uppercase leading-[0.85]">
              Project<br/>
              <span className="text-gradient-red">Analytics</span>
            </h1>
          </motion.div>
        </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
        {[
          { label: 'Total Releases', value: releases.length, icon: Music, accent: 'from-zinc-800 to-black' },
          { label: 'Global Streams', value: totalStreams.toLocaleString(), icon: Headphones, accent: 'from-red-600 to-red-900' },
          { label: 'Top Platform', value: topPlatform ? `${topPlatform.name}` : '—', icon: Globe, accent: 'from-zinc-800 to-black' },
          { label: 'Total Revenue', value: `₦${totalRevenue.toLocaleString()}`, icon: DollarSign, accent: 'from-amber-500 to-amber-800' },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card-elite p-6 md:p-8 flex flex-col justify-between h-full min-h-[140px] group cursor-default"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.accent} flex items-center justify-center mb-6 shadow-xl border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                <card.icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="label-elite opacity-60 group-hover:opacity-100 transition-opacity mb-1">{card.label}</p>
                <p className="text-xl md:text-2xl font-black text-white tracking-tight truncate">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {releases.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-16 text-center">
          <Music className="w-10 h-10 text-zinc-900 mx-auto mb-3" />
          <h2 className="text-base font-black text-white mb-1">No releases yet</h2>
          <p className="text-sm text-zinc-700 font-bold">Submit a release to start seeing analytics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main charts */}
          <div className="lg:col-span-2 space-y-5">

            {/* Streaming Trend */}
            <div className="glass-card-elite overflow-hidden flex flex-col rounded-[2.5rem]">
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight uppercase leading-none">Streaming Trend</h2>
                  <p className="label-elite mt-2 opacity-60">Daily Performance</p>
                </div>
                <div className="relative">
                  <select
                    className="appearance-none bg-zinc-950 border border-white/5 text-white text-xs font-black pl-5 pr-10 py-3 rounded-2xl focus:outline-none focus:border-red-600/50 transition-all cursor-pointer shadow-xl"
                    value={selected?.id || ''}
                    onChange={e => {
                      const r = releases.find(r => r.id === e.target.value);
                      if (r) setSelected(r);
                    }}
                  >
                    {releases.map(r => <option key={r.id} value={r.id}>{r.title.toUpperCase()}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                </div>
              </div>

              <div className="p-8">
                  {loadingHistory ? (
                      <div className="flex items-center justify-center h-[300px]">
                          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                  ) : chartData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[300px] text-center">
                          <TrendingUp className="w-12 h-12 text-zinc-900 mb-4" />
                          <p className="text-xs text-zinc-600 font-black uppercase tracking-widest">Awaiting daily streaming logs...</p>
                      </div>
                  ) : (
                      <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#3f3f46', fontWeight: 900 }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 10, fill: '#3f3f46', fontWeight: 900 }} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend verticalAlign="top" height={40} align="left" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                              {Array.from(new Set(history.map((h: any) => h.platform || 'Overall'))).map((platform: any) => (
                              <Line key={platform} type="monotone" dataKey={platform}
                                  stroke={PLATFORM_COLORS[platform] || '#71717a'} strokeWidth={3}
                                  dot={{ r: 0 }} activeDot={{ r: 6, stroke: '#000', strokeWidth: 2 }} name={platform} connectNulls />
                              ))}
                          </LineChart>
                      </ResponsiveContainer>
                  )}
              </div>
            </div>

            {/* Platform Distribution Bar Chart */}
            <div className="glass-card-elite rounded-[2.5rem] p-8 md:p-10 flex flex-col">
              <div className="mb-8">
                  <h2 className="text-lg font-black text-white tracking-tight uppercase leading-none">Competitive Analysis</h2>
                  <p className="label-elite mt-2 opacity-60">Platform-specific Market Share</p>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={releases.map(r => ({ title: r.title.substring(0, 10) + '...', ...r.platformStats }))} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="title" tick={{ fontSize: 9, fill: '#3f3f46', fontWeight: 900 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#3f3f46', fontWeight: 900 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  {allPlatforms.map((platform: any) => (
                    <Bar key={platform} dataKey={platform} stackId="a"
                      fill={PLATFORM_COLORS[platform] || '#52525b'} radius={[0, 0, 0, 0]} barSize={40} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-6 md:space-y-10">
            
            {/* Market Share Donut */}
            <div className="glass-card-elite rounded-[2.5rem] p-8 md:p-10">
              <p className="label-elite mb-8">Audience Distribution</p>
              {pieData.length > 0 ? (
                <>
                  <div className="h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={PLATFORM_COLORS[pieData[i].name] || '#52525b'} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Volume</p>
                       <p className="text-2xl font-black text-white leading-none">{totalStreams > 1000 ? (totalStreams/1000).toFixed(1) + 'K' : totalStreams}</p>
                    </div>
                  </div>
                  <div className="mt-8 space-y-4">
                    {pieData.map(p => (
                      <div key={p.name} className="flex items-center justify-between group">
                        <div className="flex items-center">
                          <div className="w-2.5 h-2.5 rounded-full mr-4 shadow-lg shadow-black/50" style={{ backgroundColor: PLATFORM_COLORS[p.name] || '#52525b' }} />
                          <span className="text-[11px] text-zinc-500 font-black uppercase tracking-widest group-hover:text-white transition-colors">{p.name}</span>
                        </div>
                        <span className="text-sm font-black text-white font-mono">{totalStreams > 0 ? Math.round((p.value / totalStreams) * 100) : 0}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Globe className="w-12 h-12 text-zinc-900 mb-4" />
                  <p className="text-xs text-zinc-700 font-black uppercase tracking-widest">Global metrics pending...</p>
                </div>
              )}
            </div>

            {/* Enhanced Insight Card */}
            {topPlatform && (
              <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card-elite rounded-[2rem] p-8 border-l-4 border-l-red-600 relative overflow-hidden group"
              >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl pointer-events-none" />
                  <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="w-5 h-5 text-red-500" />
                      <p className="label-elite !text-red-500">Elite Growth Insight</p>
                  </div>
                  <p className="text-sm text-zinc-400 font-bold leading-relaxed">
                      Global data indicates that <span className="text-white font-black">{topPlatform.name}</span> is currently your primary growth engine, commanding <span className="text-red-500 font-black">{topPlatformPercent}%</span> of your total audience. 
                      <span className="block mt-4 text-[11px] text-zinc-500 uppercase tracking-widest font-black group-hover:text-zinc-300 transition-colors">Strategic Priority: Heavy Marketing Push</span>
                  </p>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
