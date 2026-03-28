import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Music, TrendingUp, DollarSign, Headphones, ChevronDown, Globe } from 'lucide-react';
import api from '../utils/api';

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

      {/* Page header */}
      <div className="mb-8 pb-6 border-b border-zinc-900">
        <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-1.5">Performance</p>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Analytics</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Releases', value: releases.length, icon: Music },
          { label: 'Total Streams', value: totalStreams.toLocaleString(), icon: Headphones },
          { label: 'Top Platform', value: topPlatform ? `${topPlatform.name} ${topPlatformPercent}%` : '—', icon: Globe },
          { label: 'Revenue', value: `₦${totalRevenue.toLocaleString()}`, icon: DollarSign },
        ].map((card, i) => (
          <div key={i} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
              <card.icon className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-zinc-700 uppercase tracking-wider">{card.label}</p>
              <p className="text-sm font-black text-white truncate mt-0.5">{card.value}</p>
            </div>
          </div>
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
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Streaming Trend</p>
                <div className="relative">
                  <select
                    className="appearance-none bg-black border border-zinc-900 text-white text-xs font-black pl-3 pr-8 py-2 rounded-xl focus:outline-none focus:border-zinc-700 transition-colors"
                    value={selected?.id || ''}
                    onChange={e => {
                      const r = releases.find(r => r.id === e.target.value);
                      if (r) setSelected(r);
                    }}
                  >
                    {releases.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
                </div>
              </div>

              {loadingHistory ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <TrendingUp className="w-8 h-8 text-zinc-900 mb-3" />
                  <p className="text-sm text-zinc-700 font-bold">No stream data for this release yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#52525b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#52525b' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '10px', color: '#71717a' }} />
                    {Array.from(new Set(history.map((h: any) => h.platform || 'Overall'))).map((platform: any) => (
                      <Line key={platform} type="monotone" dataKey={platform}
                        stroke={PLATFORM_COLORS[platform] || '#71717a'} strokeWidth={2}
                        dot={{ r: 3, fill: '#09090b' }} name={platform} connectNulls />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Platform Breakdown Bar */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 md:p-6">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-5">Platform Breakdown per Release</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={releases.map(r => ({ title: r.title, ...r.platformStats }))} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                  <XAxis dataKey="title" tick={{ fontSize: 10, fill: '#52525b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#52525b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '10px', color: '#71717a' }} />
                  {allPlatforms.map((platform: any) => (
                    <Bar key={platform} dataKey={platform} stackId="a"
                      fill={PLATFORM_COLORS[platform] || '#52525b'} radius={[0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-5">
            {/* Market Share Pie */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 md:p-6">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-5">Market Share</p>
              {pieData.length > 0 ? (
                <>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={PLATFORM_COLORS[pieData[i].name] || '#52525b'} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-5 space-y-2.5">
                    {pieData.map(p => (
                      <div key={p.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full mr-2.5" style={{ backgroundColor: PLATFORM_COLORS[p.name] || '#52525b' }} />
                          <span className="text-xs text-zinc-500 font-bold">{p.name}</span>
                        </div>
                        <span className="text-xs text-white font-black">{totalStreams > 0 ? Math.round((p.value / totalStreams) * 100) : 0}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-52">
                  <Globe className="w-10 h-10 text-zinc-900 mb-3" />
                  <p className="text-sm text-zinc-700 font-bold">No data yet</p>
                </div>
              )}
            </div>

            {/* Insight Card */}
            {topPlatform && (
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-3">Top Insight</p>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                  Your music performs best on{' '}
                  <span className="text-white font-black">{topPlatform.name}</span>, accounting for{' '}
                  <span className="text-red-500 font-black">{topPlatformPercent}%</span> of all your streams.
                  Focus your next marketing push there for maximum return.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
