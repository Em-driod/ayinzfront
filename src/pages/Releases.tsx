import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Music, Calendar, Clock, CheckCircle, AlertCircle, Upload, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

interface Track {
  title: string;
  artist: string;
  genre: string;
  song_url: string;
  isrc?: string;
  explicit?: string;
}

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
  tracks?: Track[];
}

const getStatusStyle = (status: string) => {
  if (status === 'approved') return { cls: 'bg-red-600/10 text-red-500 border border-red-600/20', label: 'Approved' };
  if (status === 'pending')  return { cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', label: 'Pending' };
  if (status === 'rejected') return { cls: 'bg-red-500/10 text-red-400 border border-red-500/20', label: 'Rejected' };
  return { cls: 'bg-zinc-800 text-white', label: status };
};

export default function Releases() {
  const navigate = useNavigate();
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/releases');
        setReleases(res.data.releases || []);
      } catch {
        setError('Could not load releases. Please check your connection.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = releases.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.artist.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (id: string) =>
    setExpandedId(prev => (prev === id ? null : id));

  return (
    <div className="min-h-screen">
      <div className="relative z-10 p-5 md:p-10 space-y-10">

        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <p className="label-caps mb-2">Catalogue Management</p>
            <h1 className="text-4xl md:text-6xl font-display italic tracking-tight text-white uppercase leading-[1.1] pb-2">
              Your<br/><span className="text-gradient-red px-1">Catalogue</span>
            </h1>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
              <input
                type="text"
                placeholder="Search catalogue…"
                className="w-full pl-11 pr-4 py-4 bg-zinc-950/50 border border-white/5 rounded-2xl text-sm text-white placeholder-zinc-700 focus:border-red-600/50 focus:outline-none transition-all font-bold"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate('/releases/new')}
              className="group relative px-8 py-4 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-zinc-200 active:scale-95 shadow-xl flex items-center justify-center gap-3"
            >
              <Plus className="w-4 h-4" /> New Release
            </motion.button>
          </div>
        </div>

        {/* ─── Content ─── */}
        <div className="relative min-h-[400px]">

          {/* Loading */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-20 bg-[#050505]/50 backdrop-blur-sm"
              >
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && !loading && (
            <div className="bg-red-600/10 border border-red-600/20 text-red-500 rounded-2xl p-6 text-sm font-black uppercase tracking-widest flex items-center gap-4">
              <AlertCircle className="w-6 h-6" />{error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center glass-card-premium rounded-[3rem]"
            >
              <div className="w-20 h-20 bg-zinc-950 border border-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-widest">
                {search ? 'Track Not Found' : 'Catalogue Empty'}
              </h2>
              <p className="text-xs text-white mb-10 max-w-xs font-bold uppercase tracking-widest leading-relaxed">
                {search
                  ? 'Try adjusting your search filters or browse all titles.'
                  : 'Begin your journey by uploading your first masterpiece.'}
              </p>
              {!search && (
                <button
                  onClick={() => navigate('/releases/new')}
                  className="bg-red-600 text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-red-500 active:scale-95"
                >
                  Start First Release
                </button>
              )}
            </motion.div>
          )}

          {/* Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              <AnimatePresence mode="popLayout">
                {filtered.map((release, i) => {
                  const status     = getStatusStyle(release.status);
                  const date       = new Date(release.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                  const hasTracks  = (release.tracks?.length ?? 0) > 0;
                  const multiTrack = (release.tracks?.length ?? 0) > 1;
                  const isExpanded = expandedId === release.id;

                  return (
                    <motion.div
                      key={release.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="glass-card-premium flex flex-col group overflow-hidden rounded-[2.5rem]"
                    >
                      {/* Cover Art */}
                      <div
                        className="aspect-square relative overflow-hidden bg-zinc-950 cursor-pointer"
                        onClick={() => navigate('/analytics')}
                      >
                        {release.cover_url ? (
                          <img src={release.cover_url} alt={release.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-12 h-12 text-zinc-900 group-hover:text-red-600/20 transition-colors duration-500" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4 z-10">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-2xl backdrop-blur-md ${status.cls}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform">
                            <Upload className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] translate-y-4 group-hover:translate-y-0 transition-transform delay-75">Analytics</p>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-6 md:p-8 flex flex-col flex-1 bg-white/[0.02]">
                        <h3 className="text-lg md:text-xl font-black text-white truncate uppercase tracking-tight group-hover:text-red-500 transition-colors mb-1">
                          {release.title}
                        </h3>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-4">
                          {release.artist} · {release.type}
                          {multiTrack && ` · ${release.tracks!.length} Tracks`}
                        </p>

                        <div className="mt-auto space-y-4">
                          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                            <div>
                              <p className="label-caps opacity-50 mb-0.5">Streams</p>
                              <p className="text-sm font-black text-white font-mono">{release.streams?.toLocaleString() || '—'}</p>
                            </div>
                            <div className="text-right">
                              <p className="label-caps opacity-50 mb-0.5">Revenue</p>
                              <p className="text-sm font-black text-red-500 font-mono">
                                {release.revenue > 0 ? `₦${release.revenue.toLocaleString()}` : '—'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-widest">
                            <Calendar className="w-3 h-3" />
                            <span>Added {date}</span>
                          </div>

                          {/* Tracklist Toggle — EP / Album only */}
                          {multiTrack && (
                            <button
                              onClick={() => toggleExpand(release.id)}
                              className="w-full flex items-center justify-between pt-3 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-white hover:text-red-500 transition-colors"
                            >
                              <span>{isExpanded ? 'Hide Tracklist' : `View All ${release.tracks!.length} Tracks`}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable Tracklist */}
                      <AnimatePresence>
                        {isExpanded && hasTracks && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden border-t border-white/5"
                          >
                            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                              <p className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em] mb-3">Tracklist</p>
                              {release.tracks!.map((track, idx) => (
                                <div key={idx} className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2 hover:border-red-600/20 transition-colors">
                                  <div className="min-w-0">
                                    <p className="text-xs font-black text-white truncate">
                                      <span className="text-red-500 mr-2">{idx + 1}.</span>{track.title}
                                    </p>
                                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
                                      {track.artist} · {track.genre}
                                      {track.explicit === 'Yes' && (
                                        <span className="ml-2 px-1 bg-white/10 rounded text-[8px]">E</span>
                                      )}
                                    </p>
                                  </div>
                                  {track.song_url && (
                                    <audio
                                      controls
                                      src={track.song_url}
                                      className="w-full h-8 invert opacity-50 hover:opacity-100 transition-opacity"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
