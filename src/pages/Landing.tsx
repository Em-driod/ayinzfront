import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Menu, X, Zap, Shield, TrendingUp, Globe, Check } from 'lucide-react';
import { SiSpotify, SiApplemusic, SiYoutubemusic, SiTidal, SiSoundcloud, SiAudiomack, SiPandora, SiTiktok } from 'react-icons/si';
import { FaAmazon, FaDeezer, FaInstagram, FaXTwitter } from 'react-icons/fa6';

/* ─── Film grain SVG overlay ─────────────────────────────────────────── */
const GRAIN_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`;

/* ─── Stagger helpers ────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.7, ease: 'easeOut' as const } },
};
const stagger = (delay = 0) => ({
  hidden: {},
  show:   { transition: { staggerChildren: 0.11, delayChildren: delay } },
});

/* ─── Animated counter ───────────────────────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 48);
    const t = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(t); } else setCount(start);
    }, 22);
    return () => clearInterval(t);
  }, [inView, to]);
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const heroY   = useTransform(scrollY, [0, 600], [0, 110]);
  const heroOp  = useTransform(scrollY, [0, 350], [1, 0]);

  useEffect(() => {
    const u = scrollY.on('change', v => setScrolled(v > 30));
    return u;
  }, [scrollY]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  /* ── Data ── */
  const platforms = [
    { name: 'Spotify',       Icon: SiSpotify,      color: '#1DB954' },
    { name: 'Apple Music',   Icon: SiApplemusic,   color: '#FA243C' },
    { name: 'Amazon Music',  Icon: FaAmazon,       color: '#00A8E1' },
    { name: 'YouTube Music', Icon: SiYoutubemusic, color: '#FF0000' },
    { name: 'Tidal',         Icon: SiTidal,        color: '#c8c8c8' },
    { name: 'Deezer',        Icon: FaDeezer,       color: '#EF5466' },
    { name: 'SoundCloud',    Icon: SiSoundcloud,   color: '#FF5500' },
    { name: 'Audiomack',     Icon: SiAudiomack,    color: '#FFA200' },
    { name: 'Pandora',       Icon: SiPandora,      color: '#3668FF' },
    { name: 'TikTok',        Icon: SiTiktok,       color: '#c8c8c8' },
  ];
  const row1 = [...platforms, ...platforms, ...platforms];
  const row2 = [...[...platforms].reverse(), ...[...platforms].reverse(), ...[...platforms].reverse()];

  const features = [
    { Icon: Zap,       title: '48-Hour Delivery',     body: 'Your release hits every platform within two days. Fast ingestion pipelines, no delays, no excuses.' },
    { Icon: TrendingUp, title: 'Real-Time Analytics', body: 'Watch streams roll in as they happen. Territories, playlists, skips — all live in your dashboard.' },
    { Icon: Shield,    title: '100% Royalties',        body: 'We never take a cut of your music earnings. What you make is entirely yours. Always.' },
    { Icon: Globe,     title: 'Global Reach',          body: 'From Lagos to London to Los Angeles — every listener on earth can find your music today.' },
  ];

  const plans = [
    { id: 'basic',    name: 'Artiste',    price: '₦35k', accounts: '1 account',        hot: false },
    { id: 'premium',  name: 'Record Label', price: '₦50k', accounts: '10–15 accounts', hot: true  },
    { id: 'plus',     name: 'Label Plus', price: '₦85k', accounts: '20+ accounts',     hot: false },
    { id: 'standard', name: 'Enterprise', price: '₦350k',accounts: 'Unlimited',        hot: false },
  ];

  const testimonials = [
    { name: 'Sarah Johnson', role: 'Vocalist',  photo: '/serah.jpeg', quote: 'Complete control, zero compromise on fidelity. Ayinz handles everything I don\'t want to think about.' },
    { name: 'Ben Chris',     role: 'Producer',  photo: '/bella.jpeg', quote: 'The analytics are surgical. Real numbers, real money — exactly what my label needed.' },
    { name: 'Elena Davis',   role: 'Composer',  photo: '',            quote: 'Transparent royalty reports, every single time. This is how distribution should feel.' },
  ];

  /* ─── Reusable pill ── */
  const Pill = ({ p }: { p: typeof platforms[0] }) => (
    <span className="inline-flex items-center gap-2.5 px-5 py-2.5 mx-2 rounded-full border border-white/[0.08] bg-white/[0.025] shrink-0 select-none">
      <p.Icon size={13} style={{ color: p.color }} />
      <span className="text-[11px] font-semibold text-white/60 whitespace-nowrap tracking-wide">{p.name}</span>
    </span>
  );

  /* ─── Styles injected once ── */
  const css = `
    @keyframes ml { from { transform: translateX(0) } to { transform: translateX(-33.333%) } }
    @keyframes mr { from { transform: translateX(-33.333%) } to { transform: translateX(0) } }
    .run-l { animation: ml 38s linear infinite; }
    .run-r { animation: mr 38s linear infinite; }
    .run-l:hover, .run-r:hover { animation-play-state: paused; }
    .grad-border { background: linear-gradient(#0c0c14, #0c0c14) padding-box, linear-gradient(135deg, rgba(225,29,72,0.6) 0%, rgba(255,255,255,0.08) 50%, rgba(225,29,72,0.3) 100%) border-box; border: 1px solid transparent; }
    .glow-text { text-shadow: 0 0 60px rgba(225,29,72,0.35); }
  `;

  return (
    <div className="relative bg-[#07070E] text-white overflow-x-hidden selection:bg-red-600/80 selection:text-white">
      <style>{css}</style>

      {/* ── Film grain fixed overlay ── */}
      <div
        className="fixed inset-0 z-[9999] pointer-events-none"
        style={{ backgroundImage: GRAIN_URL, backgroundRepeat: 'repeat', backgroundSize: '182px', opacity: 0.048 }}
      />

      {/* ── Ambient background orbs (fixed, behind everything) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.18, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(225,29,72,0.11) 0%, transparent 65%)' }}
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], x: [0, -25, 0], y: [0, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute bottom-[20%] left-[-12%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(225,29,72,0.08) 0%, transparent 65%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
          className="absolute top-[45%] left-[38%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(225,29,72,0.06) 0%, transparent 70%)' }}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════ NAV */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#07070E]/80 backdrop-blur-2xl border-b border-white/[0.06]' : ''}`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10 shrink-0">
              <img src="/ayinz.jpeg" alt="Ayinz" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
            </div>
            <span className="font-black text-sm tracking-widest uppercase">Ayinz</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {['Platforms', 'Features', 'Pricing', 'Artists'].map(s => (
              <a key={s} href={`#${s.toLowerCase()}`}
                className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/35 hover:text-white/80 transition-colors">
                {s}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/35 hover:text-white/70 transition-colors">
              Sign In
            </Link>
            <Link to="/register"
              className="flex items-center gap-2 bg-white text-black text-[10px] uppercase tracking-[0.2em] font-black px-5 py-2.5 rounded-full hover:bg-white/90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              Get Started <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <button onClick={() => setMenuOpen(true)} className="md:hidden text-white/50 hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#07070E]/98 backdrop-blur-3xl flex flex-col p-7">
            <div className="flex justify-between items-center mb-16">
              <span className="font-black text-sm tracking-widest uppercase">Ayinz</span>
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-xl border border-white/10 text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-5">
              {['Platforms', 'Features', 'Pricing', 'Artists'].map((s, i) => (
                <motion.a key={s} href={`#${s.toLowerCase()}`}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="text-3xl font-black uppercase tracking-tight text-white/70 hover:text-red-500 transition-colors"
                  onClick={() => setMenuOpen(false)}>
                  {s}
                </motion.a>
              ))}
            </nav>
            <div className="mt-auto space-y-3 pt-8 border-t border-white/[0.07]">
              <Link to="/login" className="block text-xs font-bold uppercase tracking-widest text-white/30" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="block text-xs font-bold uppercase tracking-widest text-red-500" onClick={() => setMenuOpen(false)}>Get Started →</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════ HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video */}
        <video autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-[0.18] scale-105">
          <source src="/back.mp4" type="video/mp4" />
        </video>
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_30%,#07070E_100%)]" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#07070E] to-transparent" />

        <motion.div style={{ y: heroY, opacity: heroOp }}
          className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24 pb-16">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.09] bg-white/[0.03] backdrop-blur-sm mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(225,29,72,1)]" />
            <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-white/50">Global Music Distribution Network</span>
          </motion.div>

          {/* Headline — word by word */}
          <motion.div variants={stagger(0.45)} initial="hidden" animate="show" className="mb-7">
            {/* Line 1 */}
            <div className="overflow-hidden">
              <motion.h1 variants={fadeUp}
                className="text-[clamp(3rem,9vw,7rem)] font-black tracking-[-0.03em] leading-[0.95] text-white">
                Put Your Music
              </motion.h1>
            </div>
            {/* Line 2 — accent */}
            <div className="overflow-hidden">
              <motion.div variants={fadeUp}>
                <span className="text-[clamp(3rem,9vw,7rem)] font-black tracking-[-0.03em] leading-[0.95] italic font-serif text-red-500 glow-text">
                  Everywhere.
                </span>
              </motion.div>
            </div>
            {/* Line 3 */}
            <div className="overflow-hidden mt-1">
              <motion.h1 variants={fadeUp}
                className="text-[clamp(2rem,6vw,5rem)] font-light tracking-[-0.02em] leading-[1.1] text-white/40">
                Keep <span className="font-black text-white">100%</span> of Your Rights.
              </motion.h1>
            </div>
          </motion.div>

          {/* Sub */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.9 }}
            className="text-sm md:text-base text-white/35 font-light max-w-md mx-auto leading-relaxed mb-12">
            150+ platforms. 48-hour delivery. Zero royalty cuts.
            Built for independent artists who refuse to compromise.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.25, duration: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register"
              className="group flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_0_40px_rgba(225,29,72,0.3)] hover:shadow-[0_0_60px_rgba(225,29,72,0.45)]">
              Release Your Music
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login"
              className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/[0.09] bg-white/[0.03] text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white/70 hover:border-white/15 hover:bg-white/[0.06] transition-all duration-300 backdrop-blur-sm">
              Sign In
            </Link>
          </motion.div>

          {/* Scroll cue */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
            className="flex flex-col items-center gap-2 mt-24">
            <span className="text-[8px] uppercase tracking-[0.45em] text-white/15 font-bold">Scroll</span>
            <motion.div animate={{ scaleY: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-px h-9 bg-gradient-to-b from-red-500/60 to-transparent origin-top" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════ PLATFORMS */}
      <section id="platforms" className="relative py-20 overflow-hidden border-y border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6 mb-12 text-center">
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="text-[8px] uppercase tracking-[0.5em] font-bold text-red-500/70 mb-3">Distribution Network</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white/90">Your music. Every platform.</h2>
          </motion.div>
        </div>

        {/* Marquee row 1 */}
        <div className="overflow-hidden mb-3">
          <div className="flex run-l" style={{ width: 'max-content' }}>
            {row1.map((p, i) => <Pill key={i} p={p} />)}
          </div>
        </div>
        {/* Marquee row 2 */}
        <div className="overflow-hidden">
          <div className="flex run-r" style={{ width: 'max-content' }}>
            {row2.map((p, i) => <Pill key={i} p={p} />)}
          </div>
        </div>

        {/* Edge fades */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#07070E] to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#07070E] to-transparent pointer-events-none z-10" />
      </section>

      {/* ══════════════════════════════════════════════════════════ FEATURES */}
      <section id="features" className="relative py-28 md:py-36">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div variants={stagger(0)} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <motion.div variants={fadeUp}>
              <p className="text-[8px] uppercase tracking-[0.5em] font-bold text-red-500/70 mb-4">Why Ayinz</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.05] text-white">
                Built for artists.<br />
                <span className="text-white/25 font-light italic font-serif">Not for labels.</span>
              </h2>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Link to="/register"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-red-400 transition-colors group">
                Start distributing <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div key={i} variants={fadeUp}
                whileHover={{ y: -6 }}
                className="group relative p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-red-500/20 hover:bg-white/[0.035] transition-all duration-400 overflow-hidden cursor-default backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(225,29,72,0.12) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
                <div className="w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center mb-5 group-hover:border-red-500/30 group-hover:bg-red-500/10 transition-all duration-300">
                  <f.Icon className="w-4 h-4 text-white/40 group-hover:text-red-400 transition-colors" />
                </div>
                <h3 className="text-sm font-black text-white mb-2.5">{f.title}</h3>
                <p className="text-xs text-white/35 leading-relaxed font-light">{f.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ STATS */}
      <section className="border-y border-white/[0.05] py-16 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x divide-white/[0.06]">
            {[
              { val: 10, suffix: 'K+', lab: 'Artists' },
              { val: 150, suffix: '+',  lab: 'Platforms' },
              { val: 48, suffix: 'h',   lab: 'Go-Live' },
              { val: 100, suffix: '%',  lab: 'Royalties Kept' },
            ].map(({ val, suffix, lab }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center text-center px-4">
                <p className="text-4xl md:text-5xl font-black text-white tabular-nums leading-none">
                  <Counter to={val} suffix={suffix} />
                </p>
                <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-white/25 mt-2">{lab}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ PRICING */}
      <section id="pricing" className="relative py-28 md:py-36 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="mb-16 text-center">
            <p className="text-[8px] uppercase tracking-[0.5em] font-bold text-red-500/70 mb-4">Membership</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">One price. Unlimited releases.</h2>
            <p className="text-sm text-white/30 font-light">No hidden fees. No royalty cuts. Cancel anytime.</p>
          </motion.div>

          <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -6 }}
                className={`relative flex flex-col p-6 rounded-2xl transition-all duration-400 overflow-hidden
                  ${plan.hot ? 'grad-border bg-[#0c0c14] shadow-[0_0_60px_rgba(225,29,72,0.12)]' : 'border border-white/[0.07] bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.035]'}`}>
                {plan.hot && (
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
                )}
                {plan.hot && (
                  <span className="absolute top-4 right-4 text-[8px] font-black uppercase tracking-[0.15em] bg-red-600 text-white px-2.5 py-1 rounded-full">Popular</span>
                )}

                <div className="mb-6">
                  <h3 className="text-base font-black text-white">{plan.name}</h3>
                  <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold mt-0.5">{plan.accounts}</p>
                </div>

                <div className="mb-7">
                  <span className={`text-4xl font-black ${plan.hot ? 'text-red-400' : 'text-white'}`}>{plan.price}</span>
                  <span className="text-[10px] text-white/25 font-bold ml-1.5 uppercase tracking-wider">/yr</span>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {['Unlimited releases', 'Live analytics', '100% royalties', '4–7 day SLA', 'Direct payouts'].map(feat => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <Check className={`w-3 h-3 shrink-0 ${plan.hot ? 'text-red-500' : 'text-white/20'}`} />
                      <span className="text-[11px] text-white/40 font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link to={`/register?plan=${plan.id}`}
                  className={`w-full py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300
                    ${plan.hot ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25' : 'border border-white/[0.08] bg-white/[0.03] hover:bg-white hover:text-black text-white/60'}`}>
                  Get Started
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ TESTIMONIALS */}
      <section id="artists" className="relative py-28 md:py-36 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="mb-16">
            <p className="text-[8px] uppercase tracking-[0.5em] font-bold text-red-500/70 mb-4">Artists</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">What artists say.</h2>
          </motion.div>

          <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -6 }}
                className="group relative flex flex-col p-7 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.035] transition-all duration-400 overflow-hidden cursor-default">
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(225,29,72,0.1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

                <span className="text-5xl font-black text-red-600/15 leading-none mb-5 select-none">&ldquo;</span>
                <p className="text-sm text-white/50 font-light leading-relaxed flex-1 mb-8">{t.quote}</p>

                <div className="flex items-center gap-3 pt-6 border-t border-white/[0.06]">
                  {t.photo
                    ? <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0 group-hover:border-red-500/30 transition-colors" />
                    : <div className="w-10 h-10 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-red-400">{t.name[0]}</span>
                      </div>
                  }
                  <div>
                    <p className="text-sm font-black text-white">{t.name}</p>
                    <p className="text-[9px] uppercase tracking-[0.25em] text-white/25 font-bold mt-0.5">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ CTA */}
      <section className="relative py-36 overflow-hidden border-t border-white/[0.05]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(225,29,72,0.07)_0%,transparent_70%)] pointer-events-none" />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.06, 0.14, 0.06] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(225,29,72,0.18) 0%, transparent 65%)' }} />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <p className="text-[8px] uppercase tracking-[0.55em] font-bold text-red-500/60 mb-8">Ready?</p>
            <h2 className="text-5xl md:text-7xl font-black tracking-[-0.03em] leading-[0.97] text-white mb-5">
              Your music deserves<br />
              <span className="italic font-serif font-light text-red-500 glow-text">the world.</span>
            </h2>
            <p className="text-sm text-white/30 font-light mb-12 max-w-sm mx-auto">
              Join thousands of independent artists distributing worldwide with Ayinz.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register"
                className="group flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-9 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_0_50px_rgba(225,29,72,0.3)] hover:shadow-[0_0_70px_rgba(225,29,72,0.5)]">
                Release Your Music
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login"
                className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/[0.08] bg-white/[0.025] text-[11px] font-bold uppercase tracking-[0.2em] text-white/35 hover:text-white/60 hover:border-white/14 transition-all duration-300 backdrop-blur-sm">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ FOOTER */}
      <footer className="border-t border-white/[0.05] py-16 bg-[#050509]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10">
                  <img src="/ayinz.jpeg" alt="Ayinz" className="w-full h-full object-cover grayscale" />
                </div>
                <span className="font-black text-sm tracking-widest uppercase text-white">Ayinz</span>
              </div>
              <p className="text-[10px] text-white/25 font-light leading-relaxed max-w-[170px]">
                Boutique global music distribution for independent artists.
              </p>
              <div className="flex gap-4 mt-6">
                <FaInstagram size={14} className="text-white/20 hover:text-white/60 transition-colors cursor-pointer" />
                <FaXTwitter  size={14} className="text-white/20 hover:text-white/60 transition-colors cursor-pointer" />
              </div>
            </div>

            {[
              { label: 'Platform', links: ['Distribution', 'Analytics', 'Royalties', 'Support'] },
              { label: 'Company',  links: ['About', 'Pricing', 'Contact', 'Blog'] },
              { label: 'Legal',    links: ['Privacy', 'Terms', 'Cookies'] },
            ].map(col => (
              <div key={col.label}>
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 mb-5">{col.label}</p>
                <ul className="space-y-3">
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-white/25 hover:text-white/60 transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8 border-t border-white/[0.05]">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/15">© {new Date().getFullYear()} Ayinz. All rights reserved.</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/10">Distributed with pride · Lagos, Nigeria</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
