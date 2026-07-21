import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, Mail, ArrowRight } from 'lucide-react';
import PageShell from '../components/PageShell';

const faqs = [
  {
    q: 'How long does it take for my music to go live?',
    a: 'Most releases go live across every platform within 48 hours of submission and approval. Some stores (like TikTok and Apple Music) may take a little longer to reflect on their end, but your release window is always respected.',
  },
  {
    q: 'Do I keep 100% of my royalties?',
    a: 'Yes. Ayinz never takes a cut of your streaming or download royalties. You keep everything your music earns — we only charge the annual plan fee for distribution access.',
  },
  {
    q: 'Which platforms do you distribute to?',
    a: 'Over 150 platforms including Spotify, Apple Music, Amazon Music, YouTube Music, Tidal, Deezer, SoundCloud, Audiomack, Pandora, and TikTok — with more added regularly.',
  },
  {
    q: 'What\'s the difference between the Artiste, Record Label, Label Plus, and Enterprise plans?',
    a: 'They differ mainly in how many artist accounts you can manage under one login — from a single artist on the Artiste plan up to unlimited accounts on Enterprise. All plans include unlimited releases, full analytics, and 100% royalty retention.',
  },
  {
    q: 'Can I upload a Single, EP, or full Album?',
    a: 'Yes — all plans support singles, EPs, and albums. There\'s no limit on how many releases you submit during your subscription period.',
  },
  {
    q: 'How do payouts work?',
    a: 'Royalties collected from streaming platforms are reflected in your Revenue dashboard and paid out directly to you. You can track earnings by release, platform, and territory in real time.',
  },
  {
    q: 'What is a referral code, and do I need one to sign up?',
    a: 'No — a referral code is completely optional at signup. If someone on the Ayinz team or an existing partner gave you a code, you can enter it, but you can create an account and start distributing without one. Every artist also gets their own personal referral code after signing up, visible on their dashboard.',
  },
  {
    q: 'I need help that isn\'t answered here — what do I do?',
    a: 'Reach out through the Support section in your dashboard once logged in, or email us directly — we typically respond within one business day.',
  },
];

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/[0.07] rounded-2xl bg-white/[0.02] overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="text-sm font-bold text-white">{q}</span>
        <ChevronDown className={`w-4 h-4 text-white/30 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.25 }} className="px-5 pb-4">
          <p className="text-xs text-white/40 font-light leading-relaxed">{a}</p>
        </motion.div>
      )}
    </div>
  );
}

export default function Help() {
  return (
    <PageShell
      eyebrow="Help Center"
      title="Questions, answered."
      subtitle="Everything you need to know about distributing, promoting, and getting paid on Ayinz."
    >
      <div className="space-y-3 mb-16">
        {faqs.map((f, i) => (
          <FaqItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="p-7 rounded-2xl border border-white/[0.07] bg-white/[0.02] text-center">
        <Mail className="w-5 h-5 text-white/30 mx-auto mb-4" />
        <h3 className="text-base font-black text-white mb-2">Still stuck?</h3>
        <p className="text-xs text-white/35 font-light mb-6 max-w-sm mx-auto leading-relaxed">
          Logged-in artists can open a ticket straight from their dashboard, or reach our team directly by email.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/support"
            className="group inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-zinc-100">
            Open a Ticket <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="mailto:support@ayinz.com"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors">
            support@ayinz.com
          </a>
        </div>
      </motion.div>
    </PageShell>
  );
}
