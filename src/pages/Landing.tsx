import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowRight, Zap, Shield, TrendingUp, Globe, Check } from 'lucide-react';
import { SiSpotify, SiApplemusic, SiYoutubemusic, SiTidal, SiSoundcloud, SiAudiomack, SiPandora, SiTiktok } from 'react-icons/si';
import { FaAmazon, FaDeezer, FaInstagram, FaXTwitter } from 'react-icons/fa6';
import SiteNav from '../components/SiteNav';

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
  const { scrollY } = useScroll();
  const heroY   = useTransform(scrollY, [0, 600], [0, 110]);
  const heroOp  = useTransform(scrollY, [0, 350], [1, 0]);

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
    { id: 'basic',    name: 'Artiste',    price: '₦18k', accounts: '1 account',        hot: false },
    { id: 'premium',  name: 'Record Label', price: '₦35k', accounts: '10–15 accounts', hot: true  },
    { id: 'plus',     name: 'Label Plus', price: '₦50k', accounts: '20+ accounts',     hot: false },
    { id: 'standard', name: 'Enterprise', price: '₦150k',accounts: 'Unlimited',        hot: false },
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
    .grad-border { background: linear-gradient(#0c0c14, #0c0c14) padding-box, linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.16) 100%) border-box; border: 1px solid transparent; }
  `;

  return (
    <div className="relative bg-[#07070E] text-white overflow-x-hidden selection:bg-red-600/80 selection:text-white">
      <style>{css}</style>

      {/* ── Film grain fixed overlay ── */}
      <div
        className="fixed inset-0 z-[9999] pointer-events-none"
        style={{ backgroundImage: GRAIN_URL, backgroundRepeat: 'repeat', backgroundSize: '182px', opacity: 0.048 }}
      />

      {/* ── Ambient background wash (fixed, behind everything) — quiet, neutral ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.12, 1], x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.035) 0%, transparent 65%)' }}
        />
        <motion.div
          animate={{ scale: [1.08, 1, 1.08], x: [0, -18, 0], y: [0, 20, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute bottom-[20%] left-[-12%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 65%)' }}
        />
      </div>

      <SiteNav />

      {/* ══════════════════════════════════════════════════════════ HERO */}
      <section className="relative min-h-[100svh] lg:min-h-screen flex items-center overflow-hidden pt-24 pb-12 lg:pt-28 lg:pb-20">
        {/* Backdrop portrait — huge, blurred, monochrome; texture instead of a flat void */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img src="/fine.jpeg" alt=""
            className="absolute -top-[10%] -right-[18%] w-[65%] max-w-[820px] grayscale opacity-[0.09] blur-2xl scale-110" />
          <div className="absolute inset-0 bg-[#07070E]/40" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_30%_15%,rgba(255,255,255,0.035)_0%,transparent_60%)]" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#07070E] to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-8 items-center w-full">

          {/* ── Photo collage — shown first on phones so it isn't buried below a scroll ── */}
          <motion.div style={{ y: heroY }} className="order-1 lg:order-2 relative h-[280px] sm:h-[380px] lg:h-[540px] select-none">

            {/* Decorative vinyl ring, sits behind the prints */}
            <motion.div
              animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              className="absolute top-[8%] right-[2%] w-28 h-28 sm:w-52 sm:h-52 rounded-full border border-white/[0.06] pointer-events-none"
              style={{ background: 'repeating-radial-gradient(circle, transparent 0 8px, rgba(255,255,255,0.03) 9px 10px)' }}
            />

            {/* Back print — girl.jpeg */}
            <motion.div
              initial={{ opacity: 0, y: 24, rotate: -10 }}
              animate={{ opacity: 1, y: 0, rotate: -7 }}
              whileHover={{ rotate: -3, scale: 1.02 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 top-2 w-[58%] sm:w-[56%] z-10 cursor-default"
            >
              <div className="relative bg-[#f2ede2] p-2 sm:p-2.5 pb-6 sm:pb-8 rounded-[2px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)]">
                <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 w-12 sm:w-14 h-4 sm:h-5 bg-white/25 border border-white/10 backdrop-blur-sm rotate-2" />
                <div className="aspect-[3/4] overflow-hidden">
                  <img src="/girl.jpeg" alt="Artist distributing with Ayinz" className="w-full h-full object-cover" />
                </div>
                <p className="absolute bottom-1.5 sm:bottom-2 inset-x-0 text-center text-[9px] sm:text-[11px] font-serif italic text-black/60">
                  stream ready
                </p>
              </div>
            </motion.div>

            {/* Front print — fine.jpeg */}
            <motion.div
              initial={{ opacity: 0, y: 24, rotate: 12 }}
              animate={{ opacity: 1, y: 0, rotate: 6 }}
              whileHover={{ rotate: 2, scale: 1.02 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 bottom-0 w-[58%] sm:w-[58%] z-20 cursor-default"
            >
              <div className="relative bg-[#f2ede2] p-2 sm:p-2.5 pb-6 sm:pb-8 rounded-[2px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)]">
                <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 w-12 sm:w-14 h-4 sm:h-5 bg-white/20 border border-white/10 backdrop-blur-sm -rotate-3" />
                <div className="aspect-[3/4] overflow-hidden">
                  <img src="/fine.jpeg" alt="Artist distributing with Ayinz" className="w-full h-full object-cover" />
                </div>
                <p className="absolute bottom-1.5 sm:bottom-2 inset-x-0 text-center text-[9px] sm:text-[11px] font-serif italic text-black/60">
                  live in 48h
                </p>
              </div>
            </motion.div>

            {/* Floating sticker */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: -8 }}
              transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-[2%] left-[36%] sm:left-[42%] z-30 bg-white text-black text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full shadow-2xl"
            >
              100% royalties
            </motion.div>
          </motion.div>

          {/* ── Copy ── */}
          <motion.div style={{ opacity: heroOp }} className="order-2 lg:order-1 text-left">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.09] bg-white/[0.03] backdrop-blur-sm mb-6 lg:mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(225,29,72,1)]" />
              <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-white/50">Made for independent artists</span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={stagger(0.3)} initial="hidden" animate="show" className="mb-5 lg:mb-7">
              <div className="overflow-hidden">
                <motion.h1 variants={fadeUp}
                  className="text-[clamp(2.4rem,6.4vw,5rem)] font-black tracking-[-0.03em] leading-[0.98] text-white">
                  Your sound.
                </motion.h1>
              </div>
              <div className="overflow-hidden">
                <motion.h1 variants={fadeUp}
                  className="text-[clamp(2.4rem,6.4vw,5rem)] font-black tracking-[-0.03em] leading-[0.98] text-white">
                  Everywhere it
                </motion.h1>
              </div>
              <div className="overflow-hidden mt-1">
                <motion.div variants={fadeUp}>
                  <span className="text-[clamp(2.4rem,6.4vw,5rem)] italic font-serif tracking-[-0.02em] leading-[0.98] text-red-500">
                    needs to be.
                  </span>
                </motion.div>
              </div>
            </motion.div>

            {/* Sub */}
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.9 }}
              className="text-sm md:text-base text-white/40 font-light max-w-md leading-relaxed mb-7 lg:mb-10">
              No label breathing down your neck. No cut of your royalties.
              Just you, 150+ platforms, and a 48-hour runway to release day.
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.7 }}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-8 lg:mb-12">
              <Link to="/register"
                className="group flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_0_25px_rgba(225,29,72,0.2)] hover:shadow-[0_0_40px_rgba(225,29,72,0.3)]">
                Release Your Music
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login"
                className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/[0.09] bg-white/[0.03] text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white/70 hover:border-white/15 hover:bg-white/[0.06] transition-all duration-300 backdrop-blur-sm">
                Sign In
              </Link>
            </motion.div>

            {/* Trust row — real faces, not a stat card */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }}
              className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {['/girl.jpeg', '/fine.jpeg', '/serah.jpeg'].map((src, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-[#07070E] overflow-hidden shrink-0">
                    <img src={src} alt="Artist on Ayinz" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-white/35 font-medium leading-tight">
                <span className="text-white font-black">10,000+</span> artists already<br className="hidden sm:block" /> distributing with Ayinz
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ PLATFORMS */}
      <section id="platforms" className="relative py-20 overflow-hidden border-y border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6 mb-12 text-center">
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="text-[8px] uppercase tracking-[0.5em] font-bold text-white/30 mb-3">Distribution Network</p>
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
              <p className="text-[8px] uppercase tracking-[0.5em] font-bold text-white/30 mb-4">Why Ayinz</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.05] text-white">
                Built for artists.<br />
                <span className="text-white/25 font-light italic font-serif">Not for labels.</span>
              </h2>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Link to="/register"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors group">
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
                className="group relative p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.035] transition-all duration-400 overflow-hidden cursor-default backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
                <div className="w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center mb-5 group-hover:border-white/20 group-hover:bg-white/[0.08] transition-all duration-300">
                  <f.Icon className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
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
            <p className="text-[8px] uppercase tracking-[0.5em] font-bold text-white/30 mb-4">Membership</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">One price. Unlimited releases.</h2>
            <p className="text-sm text-white/30 font-light">No hidden fees. No royalty cuts. Cancel anytime.</p>
          </motion.div>

          <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -6 }}
                className={`relative flex flex-col p-6 rounded-2xl transition-all duration-400 overflow-hidden
                  ${plan.hot ? 'grad-border bg-[#0c0c14] shadow-[0_0_60px_rgba(255,255,255,0.05)]' : 'border border-white/[0.07] bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.035]'}`}>
                {plan.hot && (
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                )}
                {plan.hot && (
                  <span className="absolute top-4 right-4 text-[8px] font-black uppercase tracking-[0.15em] bg-white text-black px-2.5 py-1 rounded-full">Popular</span>
                )}

                <div className="mb-6">
                  <h3 className="text-base font-black text-white">{plan.name}</h3>
                  <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold mt-0.5">{plan.accounts}</p>
                </div>

                <div className="mb-7">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-[10px] text-white/25 font-bold ml-1.5 uppercase tracking-wider">/yr</span>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {['Unlimited releases', 'Live analytics', '100% royalties', '4–7 day SLA', 'Direct payouts'].map(feat => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <Check className={`w-3 h-3 shrink-0 ${plan.hot ? 'text-white/70' : 'text-white/20'}`} />
                      <span className="text-[11px] text-white/40 font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link to={`/register?plan=${plan.id}`}
                  className={`w-full py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300
                    ${plan.hot ? 'bg-white hover:bg-white/90 text-black shadow-lg shadow-white/10' : 'border border-white/[0.08] bg-white/[0.03] hover:bg-white hover:text-black text-white/60'}`}>
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
            <p className="text-[8px] uppercase tracking-[0.5em] font-bold text-white/30 mb-4">Artists</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">What artists say.</h2>
          </motion.div>

          <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -6 }}
                className="group relative flex flex-col p-7 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.035] transition-all duration-400 overflow-hidden cursor-default">
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

                <span className="text-5xl font-black text-white/10 leading-none mb-5 select-none">&ldquo;</span>
                <p className="text-sm text-white/50 font-light leading-relaxed flex-1 mb-8">{t.quote}</p>

                <div className="flex items-center gap-3 pt-6 border-t border-white/[0.06]">
                  {t.photo
                    ? <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0 group-hover:border-white/25 transition-colors" />
                    : <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-white/60">{t.name[0]}</span>
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <p className="text-[8px] uppercase tracking-[0.55em] font-bold text-white/30 mb-8">Ready?</p>
            <h2 className="text-5xl md:text-7xl font-black tracking-[-0.03em] leading-[0.97] text-white mb-5">
              Your music deserves<br />
              <span className="italic font-serif font-light text-red-500">the world.</span>
            </h2>
            <p className="text-sm text-white/30 font-light mb-12 max-w-sm mx-auto">
              Join thousands of independent artists distributing worldwide with Ayinz.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register"
                className="group flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-9 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_0_25px_rgba(225,29,72,0.2)] hover:shadow-[0_0_40px_rgba(225,29,72,0.3)]">
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
              { label: 'Platform', links: [
                { l: 'Distribution', to: '/#platforms' },
                { l: 'Analytics',    to: '/#features' },
                { l: 'Royalties',    to: '/#features' },
                { l: 'Promote',      to: '/promote' },
              ] },
              { label: 'Company',  links: [
                { l: 'About',   to: '/about' },
                { l: 'Pricing', to: '/pricing' },
                { l: 'Help',    to: '/help' },
              ] },
              { label: 'Legal',    links: [
                { l: 'Privacy', to: '/privacy' },
              ] },
            ].map(col => (
              <div key={col.label}>
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 mb-5">{col.label}</p>
                <ul className="space-y-3">
                  {col.links.map(link => (
                    <li key={link.l}>
                      <Link to={link.to} className="text-[10px] font-bold uppercase tracking-widest text-white/25 hover:text-white/60 transition-colors">{link.l}</Link>
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
