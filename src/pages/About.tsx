import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Music, Globe, Shield, Zap } from 'lucide-react';
import PageShell from '../components/PageShell';

const values = [
  { Icon: Shield, title: '100% Royalties', body: 'We never take a cut of what your music earns. Every naira, dollar, and pound you generate belongs to you — always.' },
  { Icon: Zap,    title: 'Speed Over Bureaucracy', body: 'No committee decides when your record drops. Submit today, stream everywhere within 48 hours.' },
  { Icon: Globe,  title: 'Global by Default', body: 'From Lagos to London to Los Angeles, every release is pushed to 150+ platforms — no extra fee, no extra wait.' },
  { Icon: Music,  title: 'Built by Artists', body: 'Ayinz was built around what independent artists actually need — not what a label wants to sell them.' },
];

export default function About() {
  return (
    <PageShell
      eyebrow="Our Story"
      title={<>We built the label<br /><span className="italic font-serif text-red-500">you don't need.</span></>}
      subtitle="Ayinz is a music distribution platform for independent artists and small labels who want their music everywhere, without giving up ownership of it."
    >
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="space-y-6 text-sm md:text-base text-white/50 font-light leading-relaxed mb-16">
        <p>
          Ayinz started with a simple frustration shared by artists across Lagos, Accra, and Nairobi: getting your
          music onto Spotify, Apple Music, and every other platform that matters shouldn't require signing away your
          rights, waiting weeks for approval, or losing a chunk of your royalties to a middleman.
        </p>
        <p>
          So we built a distribution network that does one thing well — puts your music everywhere it needs to be,
          fast, and hands you back 100% of what it earns. No contracts that outlive your career. No recoupment
          clauses buried in fine print. Just a dashboard, a release form, and a 48-hour runway to release day.
        </p>
        <p>
          Today, thousands of independent artists and record labels use Ayinz to distribute singles, EPs, and albums
          to over 150 platforms worldwide — including Spotify, Apple Music, Amazon Music, YouTube Music, Tidal,
          Deezer, SoundCloud, Audiomack, Pandora, and TikTok.
        </p>
      </motion.div>

      {/* Values grid */}
      <div className="grid sm:grid-cols-2 gap-4 mb-16">
        {values.map((v, i) => (
          <motion.div key={v.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <div className="w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center mb-4">
              <v.Icon className="w-4 h-4 text-white/50" />
            </div>
            <h3 className="text-sm font-black text-white mb-2">{v.title}</h3>
            <p className="text-xs text-white/35 leading-relaxed font-light">{v.body}</p>
          </motion.div>
        ))}
      </div>

      {/* Location note */}
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] mb-16 text-center">
        <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-white/25 mb-2">Headquartered</p>
        <p className="text-sm text-white/60 font-medium">Lagos, Nigeria — distributing worldwide.</p>
      </motion.div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-center">
        <Link to="/register"
          className="group inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300">
          Start Distributing <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </PageShell>
  );
}
