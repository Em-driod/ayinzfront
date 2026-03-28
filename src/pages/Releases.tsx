import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Music, Calendar, Clock, CheckCircle, AlertCircle, Upload, ChevronRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';

interface Release {
  id: string;
  title: string;
  artist: string;
  type: string;
  status: string;
  streams: number;
  revenue: number;
  created_at: string;
  cover_url?: string;
}

const getStatusStyle = (status: string) => {
  if (status === 'approved') return { cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', icon: <CheckCircle className="w-2.5 h-2.5" />, label: 'Approved' };
  if (status === 'pending') return { cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', icon: <Clock className="w-2.5 h-2.5" />, label: 'Pending' };
  if (status === 'rejected') return { cls: 'bg-red-500/10 text-red-400 border border-red-500/20', icon: <AlertCircle className="w-2.5 h-2.5" />, label: 'Rejected' };
  return { cls: 'bg-zinc-800 text-zinc-400', icon: <CheckCircle className="w-2.5 h-2.5" />, label: status };
};

export default function Releases() {
  const navigate = useNavigate();
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const response = await api.get('/releases');
        setReleases(response.data.releases || []);
      } catch {
        setError('Could not load releases. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchReleases();
  }, []);

  const filtered = releases.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.artist.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Header */}
      <div className="border-b border-zinc-900 bg-[#0a0a0a]/95 backdrop-blur-md sticky top-0 z-10">
        <div className="px-5 md:px-8 pt-6 pb-4">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-1">Catalogue</p>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Releases</h1>
            </div>
            <button
              onClick={() => navigate('/releases/new')}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Release</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-700" />
            <input
              type="text"
              placeholder="Search by title or artist…"
              className="w-full pl-9 pr-4 py-2.5 bg-zinc-950 border border-zinc-900 rounded-xl text-sm text-white placeholder-zinc-700 focus:border-zinc-700 focus:outline-none transition-colors font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-500/5 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm font-bold">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-center mb-5">
              <Music className="w-6 h-6 text-zinc-700" />
            </div>
            <h2 className="text-lg font-black text-white mb-1.5">
              {search ? 'No results' : 'No releases yet'}
            </h2>
            <p className="text-sm text-zinc-600 mb-7 max-w-xs font-medium">
              {search
                ? 'Try a different search term.'
                : 'Submit your first release and we\'ll distribute it globally within days.'}
            </p>
            {!search && (
              <button
                onClick={() => navigate('/releases/new')}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Submit First Release</span>
              </button>
            )}
          </div>
        )}

        {/* Release list */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((release, i) => {
              const status = getStatusStyle(release.status);
              const date = new Date(release.created_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              });

              return (
                <motion.div
                  key={release.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate('/analytics')}
                  className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-800 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    {/* Cover art */}
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {release.cover_url
                        ? <img src={release.cover_url} alt={release.title} className="w-full h-full object-cover" />
                        : <Music className="w-5 h-5 text-zinc-700" />
                      }
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h3 className="font-black text-white text-sm truncate max-w-[140px] md:max-w-none">{release.title}</h3>
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider flex-shrink-0 ${status.cls}`}>
                          {status.icon}
                          <span>{status.label}</span>
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 font-bold truncate uppercase tracking-wider">{release.artist} · {release.type}</p>
                      <div className="flex items-center space-x-1 mt-0.5 text-[10px] text-zinc-700 font-bold">
                        <Calendar className="w-2.5 h-2.5 flex-shrink-0" />
                        <span>{date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats & chevron */}
                  <div className="flex items-center space-x-4 md:space-x-8 text-right flex-shrink-0 pl-3">
                    <div className="hidden sm:block">
                      <p className="text-[10px] text-zinc-700 font-black uppercase tracking-wider">Streams</p>
                      <p className="font-black text-white text-sm">{release.streams?.toLocaleString() || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-700 font-black uppercase tracking-wider">Revenue</p>
                      <p className="font-black text-sm text-emerald-400">
                        {release.revenue > 0 ? `₦${release.revenue.toLocaleString()}` : '—'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-red-500 transition-colors flex-shrink-0 hidden sm:block" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
