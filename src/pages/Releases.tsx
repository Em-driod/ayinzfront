import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Music, Calendar, CheckCircle, AlertCircle, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

interface Track {
  title: string;
  artist: string;
  genre: string;
  song_url: string;
  isrc?: string;
  explicit?: string;
  featured_artist?: string;
  songwriter?: string;
}

interface Release {
  id: string;
  title: string;
  artist: string;
  featured_artists?: string[];
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
  if (status === 'pending') return { cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', label: 'Pending' };
  if (status === 'rejected') return { cls: 'bg-zinc-800 text-zinc-400 border border-zinc-700', label: 'Rejected' };
  return { cls: 'bg-zinc-800 text-white border border-zinc-700', label: status };
};

export default function Releases() {
  const navigate = useNavigate();
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
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
      <div className="relative z-10 p-4 md:p-8 lg:p-10 space-y-6 md:space-y-10">

        {/* ─── Header ─── */}
        <div className="flex flex-col gap-4">
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
            <p className="label-caps mb-1.5 text-[9px]">Catalogue Management</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display italic tracking-tight text-white uppercase leading-[1.1] pb-1">
              Your <span className="text-gradient-red">Catalogue</span>
            </h1>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="text"
                placeholder="Search releases…"
                className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-white/5 rounded-2xl text-sm text-white placeholder-zinc-700 focus:border-red-600/40 focus:outline-none transition-all font-bold"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <motion.button
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate('/releases/new')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all hover:bg-zinc-100 active:scale-95 shadow-lg shrink-0"
            >
              <Plus className="w-4 h-4" /> New Release
            </motion.button>
          </div>
        </div>

        {/* ─── Content ─── */}
        <div className="relative min-h-[300px]">

          {/* Loading */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-20"
              >
                <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && !loading && (
            <div className="bg-red-600/10 border border-red-600/20 text-red-400 rounded-2xl p-5 text-sm font-bold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />{error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center glass-card-premium rounded-[2rem]"
            >
              <div className="w-16 h-16 bg-zinc-950 border border-white/5 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl">
                <Music className="w-7 h-7 text-zinc-600" />
              </div>
              <h2 className="text-xl font-black text-white mb-2 uppercase tracking-wide">
                {search ? 'No Results' : 'Catalogue Empty'}
              </h2>
              <p className="text-xs text-zinc-500 mb-8 max-w-xs font-medium leading-relaxed">
                {search
                  ? 'Try different keywords or browse all titles.'
                  : 'Upload your first release to start distributing worldwide.'}
              </p>
              {!search && (
                <button
                  onClick={() => navigate('/releases/new')}
                  className="bg-red-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all hover:bg-red-500 active:scale-95"
                >
                  Start First Release
                </button>
              )}
            </motion.div>
          )}

          {/* Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((release, i) => {
                  const status = getStatusStyle(release.status);
                  const date = new Date(release.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  });
                  const hasTracks = (release.tracks?.length ?? 0) > 0;
                  const multiTrack = (release.tracks?.length ?? 0) > 1;
                  const isExpanded = expandedId === release.id;

                  return (
                    <motion.div
                      key={release.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      className="glass-card-premium flex flex-col group overflow-hidden rounded-[2rem]"
                    >
                      {/* Cover Art */}
                      <div
                        className="aspect-square relative overflow-hidden bg-zinc-950 cursor-pointer"
                        onClick={() => navigate('/analytics')}
                      >
                        {release.cover_url ? (
                          <img src={release.cover_url} alt={release.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-10 h-10 text-zinc-800 group-hover:text-red-600/20 transition-colors duration-500" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border backdrop-blur-md ${status.cls}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-xl translate-y-2 group-hover:translate-y-0 transition-transform">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 md:p-5 flex flex-col flex-1 bg-white/[0.02]">
                        <h3 className="text-base font-black text-white truncate uppercase tracking-tight group-hover:text-red-500 transition-colors mb-2">
                          {release.title}
                        </h3>

                        {/* Artist */}
                        <div className="mb-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-black text-red-500">{release.artist?.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-black text-white truncate">{release.artist}</p>
                              {release.featured_artists && release.featured_artists.length > 0 && (
                                <p className="text-[9px] font-bold text-zinc-500 truncate">ft. {release.featured_artists.join(', ')}</p>
                              )}
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[8px] font-black text-red-500/80 uppercase tracking-widest px-1.5 py-0.5 bg-red-600/10 rounded-md border border-red-600/10">{release.type}</span>
                                {multiTrack && <span className="text-[8px] font-bold text-zinc-600 uppercase">{release.tracks!.length} tracks</span>}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto space-y-3">
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                            <div>
                              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Streams</p>
                              <p className="text-sm font-black text-white font-mono">{release.streams?.toLocaleString() || '—'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Revenue</p>
                              <p className="text-sm font-black text-red-500 font-mono">
                                {release.revenue > 0 ? `₦${release.revenue.toLocaleString()}` : '—'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-600 uppercase tracking-wider">
                            <Calendar className="w-3 h-3" />
                            <span>{date}</span>
                          </div>

                          {multiTrack && (
                            <button
                              onClick={() => toggleExpand(release.id)}
                              className="w-full flex items-center justify-between pt-2.5 border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-colors"
                            >
                              <span>{isExpanded ? 'Hide Tracklist' : `View ${release.tracks!.length} Tracks`}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
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
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden border-t border-white/5"
                          >
                            <div className="p-3 space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                              <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest mb-2">Tracklist</p>
                              {release.tracks!.map((track, idx) => (
                                <div key={idx} className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5 hover:border-red-600/20 transition-colors">
                                  <p className="text-xs font-black text-white truncate">
                                    <span className="text-red-500 mr-1.5">{idx + 1}.</span>{track.title}
                                  </p>
                                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                                    {track.artist} {track.featured_artist ? `ft. ${track.featured_artist}` : ''} · {track.genre}
                                    {track.explicit === 'Yes' && (
                                      <span className="ml-1.5 px-1 bg-white/10 rounded text-[7px]">E</span>
                                    )}
                                  </p>
                                  {track.song_url && (
                                    <audio
                                      controls
                                      src={track.song_url}
                                      className="w-full h-7 invert opacity-40 hover:opacity-80 transition-opacity"
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
