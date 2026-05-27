import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Menu, X, Play, Shield, Globe, TrendingUp, Zap, Check } from 'lucide-react';
import { FaInstagram, FaXTwitter, FaFacebookF } from 'react-icons/fa6';
import { SiSpotify, SiApplemusic, SiYoutubemusic, SiTidal, SiSoundcloud, SiAudiomack, SiPandora, SiTiktok } from 'react-icons/si';
import { FaAmazon, FaDeezer } from 'react-icons/fa';

const marqueeStyle = `
@keyframes marquee-left  { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes marquee-right { from { transform: translateX(-50%) } to { transform: translateX(0) } }
.marquee-left  { animation: marquee-left  28s linear infinite; }
.marquee-right { animation: marquee-right 28s linear infinite; }
.marquee-left:hover, .marquee-right:hover { animation-play-state: paused; }
`;

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 700], [0, 160]);
  const opHero = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    const u = scrollY.on('change', v => setScrolled(v > 40));
    return u;
  }, [scrollY]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const platforms = [
    { name: 'Spotify',       icon: SiSpotify,      color: '#1DB954', bg: 'rgba(29,185,84,0.10)',   border: 'rgba(29,185,84,0.25)'  },
    { name: 'Apple Music',   icon: SiApplemusic,   color: '#FC3C44', bg: 'rgba(252,60,68,0.10)',   border: 'rgba(252,60,68,0.25)'  },
    { name: 'Amazon Music',  icon: FaAmazon,       color: '#00A8E1', bg: 'rgba(0,168,225,0.10)',   border: 'rgba(0,168,225,0.25)'  },
    { name: 'YouTube Music', icon: SiYoutubemusic, color: '#FF0000', bg: 'rgba(255,0,0,0.08)',     border: 'rgba(255,0,0,0.25)'    },
    { name: 'Tidal',         icon: SiTidal,        color: '#d0d0d0', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.12)'},
    { name: 'Deezer',        icon: FaDeezer,       color: '#FF0092', bg: 'rgba(255,0,146,0.10)',   border: 'rgba(255,0,146,0.25)'  },
    { name: 'SoundCloud',    icon: SiSoundcloud,   color: '#FF5500', bg: 'rgba(255,85,0,0.10)',    border: 'rgba(255,85,0,0.25)'   },
    { name: 'Audiomack',     icon: SiAudiomack,    color: '#FFA200', bg: 'rgba(255,162,0,0.10)',   border: 'rgba(255,162,0,0.25)'  },
    { name: 'Pandora',       icon: SiPandora,      color: '#5B74A8', bg: 'rgba(91,116,168,0.12)',  border: 'rgba(91,116,168,0.3)'  },
    { name: 'TikTok',        icon: SiTiktok,       color: '#d0d0d0', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.12)'},
  ];

  const row1 = [...platforms, ...platforms];
  const row2 = [...[...platforms].reverse(), ...[...platforms].reverse()];

  const testimonials = [
    { name: 'Sarah Johnson', role: 'Vocalist',  photo: '/serah.jpeg', content: 'Complete operational control. Absolutely no compromise on fidelity. Ayinz handles everything.' },
    { name: 'Ben Chris',     role: 'Producer',  photo: '/bella.jpeg', content: 'The analytics are unforgivingly precise. Real numbers, real money — exactly what our label required.' },
    { name: 'Elena Davis',   role: 'Composer',  photo: '',            content: 'A distribution network that respects the art form. Transparent, instantaneous royalty reports every time.' },
  ];

  const features = [
    { icon: Zap,      title: '48-Hour Delivery',       desc: 'Your release hits all 150+ platforms within two days of submission. No bottlenecks, no delays.' },
    { icon: TrendingUp, title: 'Real-Time Analytics',  desc: 'Track streams, territories, playlist placements and revenue as they happen — not days later.' },
    { icon: Shield,   title: '100% Rights Retained',   desc: 'You own your masters. Forever. We distribute, you keep every percentage of what is yours.' },
    { icon: Globe,    title: 'Global Reach',            desc: 'From Lagos to Los Angeles — your music reaches listeners on every continent simultaneously.' },
  ];

  const plans = [
    { id: 'basic',   name: 'Basic',    sub: 'Artiste Plan',       price: '₦35k', period: 'yr', accounts: '1 Account',        hot: false },
    { id: 'premium', name: 'Premium',  sub: 'Record Label',       price: '₦50k', period: 'yr', accounts: '10–15 Accounts',   hot: true  },
    { id: 'plus',    name: 'Plus',     sub: 'Record Label Plus',  price: '₦85k', period: 'yr', accounts: '20+ Accounts',     hot: false },
    { id: 'standard',name: 'Standard', sub: 'Enterprise',         price: '₦350k',period: 'yr', accounts: 'Unlimited',        hot: false },
  ];

  const PlatformPill = ({ p }: { p: typeof platforms[0] }) => (
    <div
      className="flex items-center gap-2.5 px-5 py-3 rounded-full border mx-2 shrink-0 group cursor-default transition-all duration-300 hover:scale-105"
      style={{ background: p.bg, borderColor: p.border }}
    >
      <p.icon style={{ color: p.color }} size={15} className="shrink-0" />
      <span className="text-xs font-semibold text-white/80 group-hover:text-white whitespace-nowrap transition-colors">{p.name}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060608] text-white selection:bg-red-600 selection:text-white overflow-x-hidden">
      <style>{marqueeStyle}</style>

      {/* ─── NAV ─────────────────────────────── */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#060608]/85 backdrop-blur-2xl border-b border-white/[0.06] py-4' : 'bg-transparent py-7'}`}
      >
        <div className="container mx-auto px-6 lg:px-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10">
              <img src="/ayinz.jpeg" alt="Ayinz" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
            </div>
            <span className="text-base font-black tracking-widest uppercase text-white">Ayinz</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
          </Link>

          <nav className="hidden md:flex items-center gap-9">
            {['Platforms', 'Features', 'Pricing', 'Artists'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-[10px] uppercase tracking-[0.22em] font-bold text-white/50 hover:text-white transition-colors duration-300 relative group">
                {item}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-red-500 group-hover:w-full transition-all duration-400" />
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-5">
            <Link to="/login" className="text-[10px] uppercase tracking-[0.22em] font-bold text-white/50 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register"
              className="group flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-[10px] uppercase tracking-[0.2em] font-black px-6 py-3 rounded-full transition-all duration-300 shadow-lg shadow-red-600/30 hover:shadow-red-500/40">
              Get Started <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-white/70 hover:text-white transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-[#060608]/97 backdrop-blur-3xl flex flex-col p-7">
            <div className="flex justify-between items-center">
              <span className="text-lg font-black tracking-widest uppercase">Ayinz</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-6 mt-20">
              {['Platforms', 'Features', 'Pricing', 'Artists'].map((item, i) => (
                <motion.a key={item} href={`#${item.toLowerCase()}`}
                  initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="text-4xl font-black uppercase tracking-tight text-white/80 hover:text-red-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}>
                  {item}
                </motion.a>
              ))}
            </nav>
            <div className="mt-auto space-y-4 pt-8 border-t border-white/10">
              <Link to="/login" className="block text-sm font-bold uppercase tracking-widest text-white/40" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="block text-sm font-bold uppercase tracking-widest text-red-500" onClick={() => setIsMenuOpen(false)}>Get Started →</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HERO ────────────────────────────── */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-black">

        {/* Video layer */}
        <video autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale scale-105">
          <source src="/back.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#060608]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.08)_0%,transparent_65%)]" />

        {/* Floating orbs */}
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.28, 0.15] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 right-[15%] w-[420px] h-[420px] rounded-full bg-red-600/20 blur-[100px] pointer-events-none" />
        <motion.div animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-1/3 left-[10%] w-[350px] h-[350px] rounded-full bg-red-800/20 blur-[120px] pointer-events-none" />

        {/* Hero content */}
        <motion.div style={{ y: yHero, opacity: opHero }}
          className="relative z-10 container mx-auto px-6 lg:px-14 flex flex-col items-center text-center">

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.9)]" />
            <span className="text-[9px] uppercase tracking-[0.35em] font-bold text-white/70">Independent Artist Network · Global Distribution</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.02] text-white mb-7 max-w-5xl">
            Put Your Music{' '}
            <span className="relative inline-block">
              <span className="italic font-serif font-light text-red-500 drop-shadow-[0_0_35px_rgba(239,68,68,0.5)]">Everywhere.</span>
              <motion.span animate={{ opacity: [0, 0.4, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute inset-0 bg-red-500/15 blur-2xl rounded-full pointer-events-none" />
            </span>
            <br />
            <span className="text-white/70 font-light">Keep{' '}
              <span className="font-black text-white">100%</span>
              {' '}of Your Rights.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.85 }}
            className="text-base md:text-lg text-white/50 font-light max-w-xl leading-relaxed mb-12">
            Distribute to Spotify, Apple Music, TikTok, Boomplay &amp; 150+ platforms worldwide.
            Get paid fast with real-time analytics.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.05 }}
            className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/register"
              className="group flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-9 py-4 rounded-full text-xs font-black uppercase tracking-[0.22em] transition-all duration-300 shadow-xl shadow-red-600/30 hover:shadow-red-500/50 hover:scale-[1.02]">
              Release Your Music
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login"
              className="flex items-center gap-2.5 px-7 py-4 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold uppercase tracking-[0.22em] text-white/60 hover:text-white transition-all duration-300 backdrop-blur-sm">
              <Play className="w-3.5 h-3.5 fill-current" /> Sign In
            </Link>
          </motion.div>

          {/* Stats strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
            className="mt-20 flex items-center gap-8 sm:gap-14">
            {[['150+', 'Platforms'], ['48h', 'Delivery'], ['100%', 'Royalties'], ['24/7', 'Support']].map(([val, lab]) => (
              <div key={lab} className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-white leading-none">{val}</p>
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/35 mt-1 font-bold">{lab}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll line */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
          <span className="text-[8px] uppercase tracking-[0.4em] text-white/25 font-bold">Scroll</span>
          <motion.div animate={{ scaleY: [0, 1, 0], originY: 0 }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-10 bg-gradient-to-b from-red-500 to-transparent" />
        </motion.div>
      </section>

      {/* ─── PLATFORMS MARQUEE ───────────────── */}
      <section id="platforms" className="relative py-24 overflow-hidden border-y border-white/[0.05]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.06)_0%,transparent_70%)] pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12">
          <p className="text-[9px] uppercase tracking-[0.45em] font-bold text-red-500 mb-3">Distribution Network</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">Your music on every platform.</h2>
        </motion.div>

        {/* Row 1 — scrolls left */}
        <div className="overflow-hidden mb-4">
          <div className="flex marquee-left" style={{ width: 'max-content' }}>
            {row1.map((p, i) => <PlatformPill key={i} p={p} />)}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div className="overflow-hidden">
          <div className="flex marquee-right" style={{ width: 'max-content' }}>
            {row2.map((p, i) => <PlatformPill key={i} p={p} />)}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────── */}
      <section id="features" className="relative py-32 lg:py-40 overflow-hidden">
        {/* Studio bg */}
        <div className="absolute inset-0">
          <img src="/ref.jpeg" alt="" className="w-full h-full object-cover grayscale opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#060608] via-[#060608]/80 to-[#060608]" />
        </div>

        <div className="container mx-auto px-6 lg:px-14 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">

            {/* Left sticky text */}
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="lg:w-2/5 lg:sticky lg:top-32">
              <p className="text-[9px] uppercase tracking-[0.45em] font-bold text-red-500 mb-4">Why Ayinz</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.08] text-white mb-6">
                Built for artists.<br />
                <span className="text-white/40 font-light italic font-serif">Not for labels.</span>
              </h2>
              <p className="text-sm text-white/45 leading-relaxed font-light mb-10">
                We built the infrastructure independent artists deserve — fast, transparent, and 100% in your corner.
              </p>
              <Link to="/register"
                className="inline-flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.2em] text-red-500 hover:text-red-400 transition-colors group">
                Start Distributing <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Right features grid */}
            <div className="lg:w-3/5 grid sm:grid-cols-2 gap-5">
              {features.map((f, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.1 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="group relative p-7 rounded-2xl border border-white/[0.07] bg-white/[0.025] hover:border-red-500/30 hover:bg-white/[0.04] transition-all duration-400 overflow-hidden cursor-default">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/6 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-red-600/15 transition-all duration-500" />
                  <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center mb-5 group-hover:bg-red-600/20 transition-colors">
                    <f.icon className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-base font-black text-white mb-2.5">{f.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed font-light">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF STRIP ──────────────── */}
      <section className="py-16 border-y border-white/[0.05] bg-[#040406]">
        <div className="container mx-auto px-6 lg:px-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-white/[0.06]">
            {[
              { val: '10K+', lab: 'Artists Distributed' },
              { val: '150+', lab: 'Music Platforms' },
              { val: '₦0', lab: 'Hidden Fees' },
              { val: '48h', lab: 'Average Go-Live' },
            ].map(({ val, lab }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center px-6">
                <span className="text-4xl md:text-5xl font-black text-white mb-2">{val}</span>
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/30">{lab}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─────────────────────────── */}
      <section id="pricing" className="relative py-32 lg:py-44 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-red-600/6 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-14 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-20">
            <p className="text-[9px] uppercase tracking-[0.45em] font-bold text-red-500 mb-4">Pricing</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">Simple. Transparent.</h2>
            <p className="text-sm text-white/40 font-light">One plan. Unlimited releases. No royalty cuts.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.09 }}
                whileHover={{ y: -8, scale: plan.hot ? 1.03 : 1.02 }}
                className={`relative flex flex-col p-7 rounded-2xl border transition-all duration-400 overflow-hidden
                  ${plan.hot
                    ? 'bg-gradient-to-b from-red-600/15 to-transparent border-red-500/40 shadow-[0_0_50px_rgba(220,38,38,0.18)]'
                    : 'bg-white/[0.025] border-white/[0.07] hover:border-white/15 hover:bg-white/[0.04]'
                  }`}>

                {plan.hot && (
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                )}
                {plan.hot && (
                  <span className="absolute top-4 right-4 text-[8px] font-black uppercase tracking-widest bg-red-600 text-white px-2.5 py-1 rounded-full">Popular</span>
                )}

                <div className="mb-8">
                  <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/35 mb-1">{plan.sub}</p>
                  <h3 className="text-xl font-black text-white">{plan.name}</h3>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black ${plan.hot ? 'text-red-400' : 'text-white'}`}>{plan.price}</span>
                    <span className="text-[10px] text-white/30 uppercase font-bold">/{plan.period}</span>
                  </div>
                  <p className="text-[10px] text-white/30 mt-1 font-medium">{plan.accounts}</p>
                </div>

                <ul className="space-y-2.5 mb-10 flex-1">
                  {['Unlimited releases', 'Real-time analytics', '100% royalties', '4–7 day SLA', 'Direct payouts'].map(feat => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <Check className={`w-3.5 h-3.5 shrink-0 ${plan.hot ? 'text-red-500' : 'text-white/30'}`} />
                      <span className="text-xs text-white/50 font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link to={`/register?plan=${plan.id}`}
                  className={`w-full py-3.5 text-center text-[10px] font-black uppercase tracking-[0.22em] rounded-xl transition-all duration-300
                    ${plan.hot
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30'
                      : 'bg-white/[0.06] hover:bg-white hover:text-black text-white border border-white/10'
                    }`}>
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ────────────────────── */}
      <section id="artists" className="relative py-32 lg:py-40 bg-[#040406] border-t border-white/[0.05] overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-red-600/6 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-14 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="mb-16">
            <p className="text-[9px] uppercase tracking-[0.45em] font-bold text-red-500 mb-4">Artist Stories</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">What artists say.</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.7 }}
                whileHover={{ y: -8 }}
                className="group relative flex flex-col p-7 rounded-2xl border border-white/[0.07] bg-white/[0.025] hover:border-red-500/25 hover:bg-white/[0.04] transition-all duration-400 overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-red-600/8 rounded-full blur-3xl -mr-8 -mt-8 group-hover:bg-red-600/18 transition-all duration-500 pointer-events-none" />

                {/* Quote mark */}
                <span className="text-6xl font-black text-red-600/20 leading-none mb-4 select-none">&ldquo;</span>

                <p className="text-sm text-white/65 font-light leading-relaxed flex-1 mb-8">{t.content}</p>

                <div className="flex items-center gap-3 pt-6 border-t border-white/[0.07]">
                  {t.photo ? (
                    <img src={t.photo} alt={t.name}
                      className="w-11 h-11 rounded-full object-cover border border-white/15 shrink-0 group-hover:border-red-500/40 transition-colors" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-red-600/15 border border-red-600/25 flex items-center justify-center shrink-0">
                      <span className="text-sm font-black text-red-400">{t.name[0]}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-black text-white">{t.name}</p>
                    <p className="text-[9px] uppercase tracking-[0.25em] text-white/35 font-bold mt-0.5">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────── */}
      <section className="relative py-36 overflow-hidden bg-[#060608]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.12)_0%,transparent_65%)]" />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-600/15 blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-14 relative z-10 flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9 }}>
            <p className="text-[9px] uppercase tracking-[0.5em] font-bold text-red-500 mb-6">Ready?</p>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.02] mb-8">
              Your music deserves<br />
              <span className="italic font-serif font-light text-red-500 drop-shadow-[0_0_40px_rgba(220,38,38,0.4)]">the world.</span>
            </h2>
            <p className="text-base text-white/40 font-light mb-12 max-w-lg mx-auto">
              Join thousands of independent artists distributing worldwide with Ayinz.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register"
                className="group flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-10 py-5 rounded-full text-xs font-black uppercase tracking-[0.25em] transition-all duration-300 shadow-2xl shadow-red-600/30 hover:shadow-red-500/50 hover:scale-[1.03]">
                Release Your Music <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login"
                className="flex items-center gap-2.5 px-8 py-5 rounded-full border border-white/10 text-xs font-bold uppercase tracking-[0.22em] text-white/50 hover:text-white hover:border-white/20 transition-all duration-300">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────── */}
      <footer className="bg-[#030305] border-t border-white/[0.05] pt-20 pb-10">
        <div className="container mx-auto px-6 lg:px-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10">
                  <img src="/ayinz.jpeg" alt="Ayinz" className="w-full h-full object-cover grayscale" />
                </div>
                <span className="text-base font-black tracking-widest uppercase text-white">Ayinz</span>
              </div>
              <p className="text-[10px] text-white/30 leading-relaxed font-light max-w-[180px]">
                A boutique music distribution network built for independent artists.
              </p>
            </div>

            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.35em] text-white/25 mb-6">Platform</p>
              <ul className="space-y-3.5">
                {['Distribution', 'Analytics', 'Royalties', 'Support'].map(l => (
                  <li key={l}><a href="#" className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.35em] text-white/25 mb-6">Company</p>
              <ul className="space-y-3.5">
                {['About', 'Pricing', 'Contact', 'Blog'].map(l => (
                  <li key={l}><a href="#" className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.35em] text-white/25 mb-6">Follow Us</p>
              <div className="flex gap-4">
                <FaInstagram className="w-5 h-5 text-white/30 hover:text-red-500 hover:scale-110 transition-all cursor-pointer" />
                <FaXTwitter className="w-5 h-5 text-white/30 hover:text-red-500 hover:scale-110 transition-all cursor-pointer" />
                <FaFacebookF className="w-5 h-5 text-white/30 hover:text-red-500 hover:scale-110 transition-all cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.05]">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/20">© {new Date().getFullYear()} Ayinz. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/20 hover:text-white/50 transition-colors">Privacy</a>
              <a href="#" className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/20 hover:text-white/50 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
