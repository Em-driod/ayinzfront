import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowRight, Menu, X, Play, Shield, Globe, TrendingUp, Zap, Instagram, Twitter, Facebook } from 'lucide-react';
import { SiSpotify, SiApplemusic, SiYoutubemusic, SiTidal, SiSoundcloud, SiAudiomack, SiPandora, SiTiktok } from 'react-icons/si';
import { FaAmazon, FaDeezer } from 'react-icons/fa';

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const yHeroText = useTransform(scrollY, [0, 800], [0, 200]);
  const opacityHeroText = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; }
  }, [isMenuOpen]);

  const testimonials = [
    { name: "SARAH JOHNSON", role: "Vocalist", photo: "/serah.jpeg",  content: "Complete operational control. Absolutely no compromise on fidelity. Ayinz handles everything." },
    { name: "BEN CHRIS",     role: "Producer", photo: "/bella.jpeg",  content: "The analytics architecture is unforgivingly precise. Exactly what our label required." },
    { name: "ELENA DAVIS",   role: "Composer", photo: "",             content: "A distribution matrix that respects the art form. Transparent, instantaneous royalty reports." }
  ];

  const platforms = [
    { name: 'Spotify',       icon: SiSpotify,     color: '#1DB954', bg: 'rgba(29,185,84,0.12)',  border: 'rgba(29,185,84,0.3)'  },
    { name: 'Apple Music',   icon: SiApplemusic,  color: '#FC3C44', bg: 'rgba(252,60,68,0.12)',  border: 'rgba(252,60,68,0.3)'  },
    { name: 'Amazon Music',  icon: FaAmazon,      color: '#00A8E1', bg: 'rgba(0,168,225,0.12)',  border: 'rgba(0,168,225,0.3)'  },
    { name: 'YouTube Music', icon: SiYoutubemusic,color: '#FF0000', bg: 'rgba(255,0,0,0.10)',    border: 'rgba(255,0,0,0.3)'    },
    { name: 'Tidal',         icon: SiTidal,       color: '#e0e0e0', bg: 'rgba(255,255,255,0.06)',border: 'rgba(255,255,255,0.15)'},
    { name: 'Deezer',        icon: FaDeezer,      color: '#FF0092', bg: 'rgba(255,0,146,0.12)', border: 'rgba(255,0,146,0.3)'  },
    { name: 'SoundCloud',    icon: SiSoundcloud,  color: '#FF5500', bg: 'rgba(255,85,0,0.12)',   border: 'rgba(255,85,0,0.3)'   },
    { name: 'Audiomack',     icon: SiAudiomack,   color: '#FFA200', bg: 'rgba(255,162,0,0.12)', border: 'rgba(255,162,0,0.3)'  },
    { name: 'Pandora',       icon: SiPandora,     color: '#224099', bg: 'rgba(34,64,153,0.15)',  border: 'rgba(34,64,153,0.35)' },
    { name: 'TikTok',        icon: SiTiktok,      color: '#e0e0e0', bg: 'rgba(255,255,255,0.06)',border: 'rgba(255,255,255,0.15)'},
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-red-600 selection:text-white overflow-x-hidden">
      
      {/* Editorial Navigation */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrollY.get() > 50 ? 'bg-[#020202]/80 backdrop-blur-2xl border-b border-white/5 py-4' : 'bg-transparent py-8'}`}
      >
        <div className="container mx-auto px-6 lg:px-12 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded overflow-hidden">
              <img src="/ayinz.jpeg" alt="Ayinz" className="w-full h-full object-cover filter grayscale contrast-125 group-hover:scale-110 group-hover:grayscale-0 transition-all duration-700" />
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-bold tracking-widest uppercase text-white">Ayinz</span>
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full ml-1 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {['Platforms', 'Architecture', 'Pricing', 'Clients'].map((item) => (
               <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] uppercase tracking-[0.2em] font-medium text-white hover:text-white transition-colors duration-300 relative group">
                {item}
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-red-600 group-hover:w-full transition-all duration-500 ease-out" />
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/login" className="text-[10px] uppercase tracking-[0.2em] font-medium text-white hover:text-white transition-colors">Login </Link>
            <Link to="/register" className="group rounded-full flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-white bg-white/5 border border-white/10 px-6 py-2.5 backdrop-blur-md hover:bg-red-600 hover:border-red-600 transition-all duration-500">
              Sign up <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[60] bg-[#020202]/95 flex flex-col p-6 lg:p-12"
          >
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-baseline"><span className="text-xl font-bold tracking-widest uppercase text-white">Ayinz</span><span className="w-1.5 h-1.5 bg-red-600 rounded-full ml-1 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(220,38,38,0.8)]" /></div>
              <button onClick={() => setIsMenuOpen(false)} className="text-white hover:text-red-500 transition-colors"><X className="w-8 h-8" /></button>
            </div>

            <nav className="flex flex-col gap-8 mt-24">
              {['Platforms', 'Architecture', 'Pricing', 'Clients'].map((item, i) => (
                <motion.a 
                  key={item} 
                  href={`#${item.toLowerCase()}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.5 }}
                  className="text-4xl font-light uppercase tracking-widest text-white hover:text-red-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </motion.a>
              ))}
            </nav>

            <div className="mt-auto pt-8 border-t border-white/10 flex flex-col gap-6">
              <Link to="/login" className="text-xs uppercase tracking-[0.2em] font-medium text-white" onClick={() => setIsMenuOpen(false)}>Client Portal</Link>
              <Link to="/register" className="text-xs uppercase tracking-[0.2em] font-medium text-red-500" onClick={() => setIsMenuOpen(false)}>Apply For Access</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Cinematic Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        {/* Abstract Cinematic Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <motion.video 
            autoPlay loop muted playsInline 
            className="w-full h-full object-cover filter grayscale opacity-[0.35]"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: 'easeOut' }}
          >
            <source src="/back.mp4" type="video/mp4" />
          </motion.video>
          
          {/* Subtle vignette and gradient mask */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020202_100%)] opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#2A0000]/30 to-[#020202]/60" />
        </div>

        <motion.div 
          style={{ y: yHeroText, opacity: opacityHeroText }}
          className="container mx-auto px-6 lg:px-12 relative z-10 flex flex-col items-center text-center mt-12"
        >
          {/* Glassmorphic Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
          >
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
            <span className="text-[9px] uppercase tracking-[0.3em] font-medium text-white">Independent Audio Network</span>
          </motion.div>

          {/* Refined Typography */}
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6 max-w-5xl leading-[1.1]"
          >
            Put Your Music Everywhere.{' '}
            <span className="font-light italic px-1 font-serif text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.4)] relative inline-block">
              Keep 100%
              <motion.span
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-red-600/20 blur-xl rounded-full -z-10"
              />
            </span>{' '}
            of Your Rights.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm md:text-base text-white max-w-2xl font-light leading-relaxed mb-12"
          >
            Distribute to Spotify, Apple Music, TikTok, Boomplay &amp; 150+ platforms worldwide. Get paid fast with clear, <span className="text-red-500">real-time analytics.</span>
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <Link to="/register" className="group rounded-full flex items-center gap-4 bg-red-600 text-white px-8 py-4 text-xs uppercase tracking-[0.2em] font-bold transition-all hover:bg-red-700 shadow-lg shadow-red-900/20 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]">
              Release Your Music <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-medium text-white hover:text-white transition-colors">
              <Play className="w-4 h-4" /> Watch Demo
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-px h-12 bg-gradient-to-b from-red-600 to-transparent animate-[pulse_2s_ease-in-out_infinite]" />
        </motion.div>
      </section>

      {/* Elegant Platforms Marquee / Grid */}
      <section id="platforms" className="relative py-32 border-b border-white/5 overflow-hidden">
        {/* Subtle red ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-red-600/10 blur-[120px] rounded-[100%] pointer-events-none" />
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.8 }}
             className="text-center mb-16"
          >
            <h2 className="text-xl md:text-2xl font-light tracking-widest uppercase text-white mb-4 flex items-center justify-center gap-4">
              <span className="hidden md:block w-12 h-px bg-gradient-to-r from-transparent to-red-600/80" />
              The Network <span className="text-red-600 font-serif italic pr-1 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">Matrix</span>
              <span className="hidden md:block w-12 h-px bg-gradient-to-l from-transparent to-red-600/80" />
            </h2>
            <p className="text-xs uppercase tracking-[0.2em] font-medium text-white">Deploy your sound globally in 48 hours.</p>
          </motion.div>

          {/* Staggered elegant grid */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-5xl mx-auto">
            {platforms.map((platform, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.06, y: -4 }}
                className="flex items-center gap-2.5 px-5 py-3 rounded-full border cursor-pointer transition-all duration-300 group"
                style={{ background: platform.bg, borderColor: platform.border }}
              >
                <platform.icon
                  style={{ color: platform.color }}
                  className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110"
                  size={16}
                />
                <span className="text-xs font-semibold tracking-wide text-white/80 group-hover:text-white transition-colors whitespace-nowrap">
                  {platform.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Parallax Architecture Section */}
      <section id="architecture" className="relative py-32 lg:py-48 overflow-hidden">
        {/* Animated Red Glow */}
        <motion.div 
          animate={{ opacity: [0.1, 0.25, 0.1], scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[120px] -translate-y-1/2 -z-10" 
        />
        {/* Ref.jpeg Parallax Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/ref.jpeg" 
            alt="Studio Environment" 
            className="w-full h-[120%] object-cover object-center filter grayscale opacity-20 -translate-y-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020202] via-[#020202]/80 to-[#020202]" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.8 }}
             className="mb-20 max-w-2xl"
          >
            <div className="flex items-center gap-4 mb-6"><div className="w-8 h-[1px] bg-red-600" /><span className="text-[10px] uppercase tracking-[0.2em] font-medium text-red-500">Architecture</span></div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight text-white mb-6">Designed For Precision.</h2>
            <p className="text-sm text-white font-light leading-relaxed">Our infrastructure replaces archaic label systems with modern, transparent code. You maintain absolute equity.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Velocity', desc: 'Secure ingestion pipelines mapping audio straight to endpoints within 48 hours.', icon: Zap },
              { title: 'Telemetry', desc: 'Live data visualizing exact listener territories, skips, and playlist placements.', icon: TrendingUp },
              { title: 'Shield', desc: 'Immutable global registration protocols defending against illicit usage.', icon: Shield },
              { title: 'Economics', desc: 'Fluid royalty transfers bypassing intermediary banks directly to your accounts.', icon: Globe }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-red-600/40 hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] backdrop-blur-sm transition-all duration-500 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-red-600/20 transition-all duration-500" />
                <div className="mb-6 p-3 rounded-full bg-white/5 inline-block group-hover:bg-red-600/10 transition-colors">
                   <feat.icon className="w-5 h-5 text-white group-hover:text-red-500 transition-colors" />
                </div>
                <h3 className="text-lg font-bold tracking-wide text-white mb-3">{feat.title}</h3>
                <p className="text-xs text-white font-light leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / Membership Tiers */}
      <section id="pricing" className="relative py-32 lg:py-48 border-t border-white/5 bg-[#020202]">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.8 }}
             className="text-center mb-24"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Membership Tiers.</h2>
            <p className="text-sm text-white tracking-wide font-light">Scalable ecosystems for independent creators to establishing labels.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {[
              { id: 'basic', name: 'Basic', subtitle: 'Artiste Plan', price: '₦35k', period: 'Annually', accounts: '01 Account', featured: false, temp: false },
              { id: 'premium', name: 'Premium', subtitle: 'Record Label Plan', price: '₦50k', period: 'Annually', accounts: '10–15 Accounts', featured: true, temp: false },
              { id: 'plus', name: 'Plus', subtitle: 'Record Label Plus', price: '₦85k', period: 'Annually', accounts: '20+ Accounts', featured: false, temp: false },
              { id: 'standard', name: 'Standard', subtitle: 'Enterprise Edition', price: '₦350k', period: 'Annually', accounts: 'Unlimited', featured: false, temp: false }
            ].map((plan, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -10, scale: plan.featured ? 1.05 : 1.02 }}
                className={`relative p-8 rounded-2xl flex flex-col justify-between border transition-all duration-500 overflow-hidden group
                  ${plan.temp ? 'bg-zinc-950 border-amber-500/40 opacity-90' : plan.featured ? 'bg-zinc-900 border-red-600/50 shadow-[0_0_40px_rgba(220,38,38,0.2)] scale-105 z-10' : 'bg-[#050505] border-white/5 hover:border-red-600/30 hover:shadow-[0_0_30px_rgba(220,38,38,0.1)]'}
                `}
              >
                {plan.featured && <div className="absolute top-0 right-8 -translate-y-1/2 bg-red-600 text-white px-3 py-1 text-[8px] font-bold uppercase tracking-[0.2em] rounded-full">Recommended</div>}
                {plan.temp && <div className="absolute top-0 right-4 -translate-y-1/2 bg-amber-500 text-black px-3 py-1 text-[8px] font-bold uppercase tracking-[0.2em] rounded-full">Temporary</div>}

                <div>
                  <h3 className={`text-xl font-bold tracking-tight ${plan.featured ? 'text-white' : plan.temp ? 'text-amber-400' : 'text-zinc-200'}`}>{plan.name}</h3>
                  <p className={`text-[9px] uppercase tracking-[0.2em] font-medium mt-1 ${plan.featured ? 'text-red-400' : plan.temp ? 'text-amber-400/80' : 'text-white'}`}>{plan.subtitle}</p>

                  <div className="my-8 flex items-baseline flex-wrap">
                    <span className={`text-3xl font-bold tracking-tighter ${plan.featured ? 'text-white' : plan.temp ? 'text-amber-400' : 'text-white'}`}>{plan.price}</span>
                    <span className={`text-[9px] uppercase tracking-widest ml-2 ${plan.featured ? 'text-white' : 'text-white'}`}>/ {plan.period}</span>
                  </div>

                  <div className={`text-xs font-light leading-relaxed ${plan.featured ? 'text-white' : 'text-white'}`}>
                    <span className="font-bold">{plan.accounts}</span> allocated.<br/><br/>
                    Unlimited releases, analytics suite, 4-7 days release SLA, and transparent royalty payouts included.
                  </div>
                </div>

                <Link to={`/register?plan=${plan.id}`} className={`mt-10 w-full py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] rounded-full transition-all
                  ${plan.temp ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black border border-amber-500/20' : plan.featured ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-white/5 text-white hover:bg-white hover:text-black'}
                `}>
                  Select Plan
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Elegant Testimonials Section */}
      <section id="clients" className="relative py-32 lg:py-48 px-6 lg:px-12 bg-[#050505] border-t border-white/5">
        <div className="container mx-auto">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
             className="flex flex-col items-center text-center mb-24"
          >
            <div className="w-px h-12 bg-red-600 mb-8" />
            <h2 className="text-3xl font-light tracking-widest uppercase text-white mb-4">Client Consensus</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: i * 0.2, ease: "easeOut" }}
                whileHover={{ y: -10 }}
                className="flex flex-col p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-red-600/40 hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] transition-all duration-500 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-red-600/30 transition-all duration-500" />
                <p className="text-lg lg:text-xl font-light text-white leading-relaxed italic mb-8 flex-1 relative z-10">"{t.content}"</p>
                <div className="border-t border-white/10 pt-6 relative z-10 flex items-center gap-3">
                  {t.photo ? (
                    <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center shrink-0">
                      <span className="text-xs font-black text-red-400">{t.name[0]}</span>
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white">{t.name}</h4>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/50 mt-0.5">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorially Clean CTA & Footer */}
      <footer className="relative pt-32 pb-12 bg-[#020202] border-t border-white/5 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center text-center max-w-4xl mx-auto mb-32"
          >
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-10 leading-[1.2] pb-2">
              <span className="font-light italic font-serif text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.4)] px-1">Ayinz</span> your catalog. 
            </h2>
             <Link to="/register" className="rounded-full bg-red-600 text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-red-700 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all">
              Begin Distribution
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-16 border-t border-white/10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded bg-white overflow-hidden">
                  <img src="/ayinz.jpeg" alt="Ayinz" className="w-full h-full object-cover filter grayscale contrast-125" />
                </div>
                <span className="text-xl font-bold tracking-widest uppercase text-white">Ayinz</span>
              </div>
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-white leading-relaxed md:max-w-[200px]">A boutique approach to global music delivery.</p>
            </div>
            
            <div>
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-white mb-6">Platform</p>
              <ul className="space-y-4">
                {['Network', 'Analytics', 'Defense', 'Support'].map(i => (
                  <li key={i}><a href="#" className="text-[10px] font-medium uppercase tracking-widest text-white hover:text-white transition-colors">{i}</a></li>
                ))}
              </ul>
            </div>

            <div>
               <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-white mb-6">Company</p>
              <ul className="space-y-4">
                {['About', 'Brand', 'Careers', 'Contact'].map(i => (
                  <li key={i}><a href="#" className="text-[10px] font-medium uppercase tracking-widest text-white hover:text-white transition-colors">{i}</a></li>
                ))}
              </ul>
            </div>

            <div>
               <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-white mb-6">Socials</p>
              <div className="flex gap-4">
                <Instagram className="w-5 h-5 text-white hover:text-red-500 hover:scale-110 transition-all cursor-pointer" />
                <Twitter className="w-5 h-5 text-white hover:text-red-500 hover:scale-110 transition-all cursor-pointer" />
                <Facebook className="w-5 h-5 text-white hover:text-red-500 hover:scale-110 transition-all cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white">© {new Date().getFullYear()} Ayinz Matrices.</p>
            <div className="flex gap-8">
              <a href="#" className="text-[9px] font-bold uppercase tracking-[0.2em] text-white hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-[9px] font-bold uppercase tracking-[0.2em] text-white hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
