import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Share2, ListMusic, BarChart3, Users, Sparkles } from 'lucide-react';
import { SiSpotify } from 'react-icons/si';
import PageShell from '../components/PageShell';

const playlists = [
  {
    name: 'Afro Replay',
    curator: 'Curated by Ayinz',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000d72c8af591abf85398f917697c48',
    url: 'https://open.spotify.com/playlist/3hJrrIzwP5O1PVCCfUzR3R',
  },
  {
    name: 'Gospel Replay',
    curator: 'Curated by Ayinz',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000d72cfa5fd7c023ecef67ceb9957f',
    url: 'https://open.spotify.com/playlist/1roi8BsP4VlfRSejFm2niq',
  },
  {
    name: 'Global Hip Hop',
    curator: 'Curated by Ayinz',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000d72c23636ac93b84eda3d51e48cb',
    url: 'https://open.spotify.com/playlist/5lMTJUjITxZr87KOLapYAt',
  },
  {
    name: 'Afrobeat Monsters',
    curator: 'Partner playlist',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000d72cfebffe28d42251c93970a271',
    url: 'https://open.spotify.com/playlist/6qcDtSppKU2okCLHI6k52d',
  },
];

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

export default function Promote() {
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
      <div className="mb-16">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-6">
          <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-white/25 mb-2">Get Playlisted</p>
          <h2 className="text-xl font-black text-white">Playlists actively pulling from Ayinz artists.</h2>
          <p className="text-xs text-white/35 font-light mt-2 max-w-lg leading-relaxed">
            These are real, active Spotify playlists — three curated in-house, one from a partner curator. Submitting
            your release through Ayinz puts it in front of the same people who run these.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {playlists.map((p, i) => (
            <motion.a
              key={p.name}
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
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/[0.08]">
                <img src={p.cover} alt={p.name} className="w-full h-full object-cover" />
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
