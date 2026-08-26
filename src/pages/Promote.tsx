import { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Share2, ListMusic, BarChart3, Users, Sparkles, Upload, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { SiSpotify } from 'react-icons/si';
import PageShell from '../components/PageShell';
import api from '../utils/api';

interface Playlist {
  _id: string;
  name: string;
  curator: string;
  cover: string;
  url: string;
}

const steps = [
  {
    Icon: Share2,
    title: 'Pre-save before you drop',
    body: 'Share your release link the moment it\'s scheduled. A pre-save campaign turns your existing fans into first-day streams, which is exactly what playlist algorithms look for.',
  },
  {
    Icon: ListMusic,
    title: 'Pitch for playlists early',
    body: 'Submit your track to editorial and algorithmic playlists at least a week before release day. New, unreleased music gets priority consideration on most platforms.',
  },
  {
    Icon: Sparkles,
    title: 'Give TikTok and Reels a hook',
    body: 'Clip the most quotable 15 seconds of your song and post it before, during, and after release. A single viral moment can outperform months of paid promotion.',
  },
  {
    Icon: BarChart3,
    title: 'Watch, then double down',
    body: 'Your Ayinz Analytics dashboard shows exactly which territories, platforms, and playlists are driving streams in real time — spend your energy where it\'s already working.',
  },
  {
    Icon: Users,
    title: 'Bring other artists in',
    body: 'Every Ayinz account comes with its own personal referral code, visible on your dashboard. Share it with artists you know — it costs nothing and grows the community you\'re already part of.',
  },
];

const inputCls = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:border-red-600/50 outline-none transition-all font-medium";

export default function Promote() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [brokenCovers, setBrokenCovers] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState({ artiste_name: '', spotify_link: '', email: '' });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: '' | 'success' | 'error'; text: string }>({ type: '', text: '' });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/promote/playlists');
        setPlaylists(res.data.playlists || []);
      } catch { /* silently hide the section if unavailable */ }
    })();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', text: '' });
    try {
      const data = new FormData();
      data.append('artiste_name', form.artiste_name);
      data.append('spotify_link', form.spotify_link);
      data.append('email', form.email);
      if (attachment) data.append('attachment', attachment);

      const res = await api.post('/promote/submit', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStatus({ type: 'success', text: res.data.message || 'Submitted! We\'ll get back to you within 7 days.' });
      setForm({ artiste_name: '', spotify_link: '', email: '' });
      setAttachment(null);
    } catch (err: any) {
      setStatus({ type: 'error', text: err.response?.data?.error || 'Failed to submit. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      eyebrow="Promotion"
      title={<>Distribution gets you<br /><span className="italic font-serif text-red-500">on the shelf.</span></>}
      subtitle="This is what gets people to actually press play. A few things that consistently move the needle for artists on Ayinz."
    >
      <div className="space-y-4 mb-16">
        {steps.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.07 }}
            className="flex items-start gap-4 p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <div className="w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center shrink-0">
              <s.Icon className="w-4 h-4 text-white/50" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white mb-1.5">{s.title}</h3>
              <p className="text-xs text-white/35 leading-relaxed font-light">{s.body}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Featured playlists */}
      {playlists.length > 0 && (
        <div className="mb-16">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-6">
            <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-white/25 mb-2">Get Playlisted</p>
            <h2 className="text-xl font-black text-white">Playlists actively pulling from Ayinz artists.</h2>
            <p className="text-xs text-white/35 font-light mt-2 max-w-lg leading-relaxed">
              These are real, active Spotify playlists. Submitting your release through Ayinz puts it in front of the
              same people who run these.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {playlists.map((p, i) => (
              <motion.a
                key={p._id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                className="group flex items-center gap-4 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/[0.08] bg-white/[0.03] flex items-center justify-center">
                  {p.cover && !brokenCovers[p._id] ? (
                    <img
                      src={p.cover}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={() => setBrokenCovers(prev => ({ ...prev, [p._id]: true }))}
                    />
                  ) : (
                    <ListMusic className="w-5 h-5 text-white/15" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-white truncate">{p.name}</p>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/30 mt-1">{p.curator}</p>
                </div>
                <div className="w-8 h-8 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center shrink-0 group-hover:border-[#1DB954]/40 group-hover:bg-[#1DB954]/10 transition-all">
                  <SiSpotify className="w-3.5 h-3.5 text-white/40 group-hover:text-[#1DB954] transition-colors" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      )}

      {/* Playlist submission form */}
      <div className="mb-16">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
          <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-white/25 mb-2">Submit for Consideration</p>
          <h2 className="text-xl font-black text-white">Get your track in front of our curators.</h2>
        </motion.div>

        <div className="p-6 md:p-8 rounded-[2rem] border border-white/[0.07] bg-white/[0.02]">
          {status.type === 'success' ? (
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-red-600/10 border border-red-600/20 text-red-400">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-bold">{status.text}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {status.type === 'error' && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-600/10 border border-red-600/20 text-red-400 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />{status.text}
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Artiste Name</label>
                  <input type="text" required placeholder="Enter your artiste name" className={inputCls}
                    value={form.artiste_name} onChange={e => setForm({ ...form, artiste_name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Email</label>
                  <input type="email" required placeholder="Enter your email address" className={inputCls}
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Song Spotify Link</label>
                <input type="url" required placeholder="Paste your song Spotify link here" className={inputCls}
                  value={form.spotify_link} onChange={e => setForm({ ...form, spotify_link: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Attach Screenshot (optional)</label>
                <div
                  onClick={() => document.getElementById('promo-attachment')?.click()}
                  className={`py-6 border-2 border-dashed rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${attachment ? 'border-red-600/30 bg-red-600/5' : 'border-white/10 bg-black/20 hover:border-white/20'}`}
                >
                  <Upload className={`w-4 h-4 ${attachment ? 'text-red-500' : 'text-white/30'}`} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
                    {attachment ? attachment.name : 'Attach the screenshot of the playlist you follow'}
                  </p>
                  <input id="promo-attachment" type="file" accept="image/*" className="sr-only"
                    onChange={e => { if (e.target.files?.[0]) setAttachment(e.target.files[0]); }} />
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <Info className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
                <ul className="text-[10px] text-white/40 font-medium leading-relaxed space-y-1 list-disc list-inside">
                  <li>Share the playlist to at least 2 of your social platforms</li>
                  <li>Follow the playlist</li>
                  <li>Screenshot it and attach it above</li>
                </ul>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2.5 active:scale-95">
                {submitting ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : 'Submit for Consideration'}
              </button>
              <p className="text-[9px] text-white/25 font-bold text-center">We'll get back to you through your email within 7 days.</p>
            </form>
          )}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="p-7 rounded-2xl border border-white/[0.07] bg-white/[0.02] text-center">
        <h3 className="text-base font-black text-white mb-2">Your streams, your analytics, your call.</h3>
        <p className="text-xs text-white/35 font-light mb-6 max-w-sm mx-auto leading-relaxed">
          Everything above is available the moment you distribute your first release — no extra fee, no separate tool.
        </p>
        <Link to="/register"
          className="group inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300">
          Release Your Music <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </PageShell>
  );
}
