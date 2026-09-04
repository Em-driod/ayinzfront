import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';

const sectionLinks = [
  { label: 'Platforms', id: 'platforms' },
  { label: 'Features',  id: 'features' },
  { label: 'Pricing',   id: 'pricing' },
  { label: 'Artists',   id: 'artists' },
];
const pageLinks = [
  { label: 'About',   to: '/about' },
  { label: 'Promote', to: '/promote' },
];

/** Shared marketing-site navbar — used on every public page so the header stays identical site-wide. */
export default function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loggedIn = !!localStorage.getItem('user');
  const { pathname } = useLocation();
  const onLanding = pathname === '/';

  // On the landing page these scroll to the section in place; elsewhere they navigate home first.
  const navLinks: { label: string; href?: string; to?: string }[] = [
    ...sectionLinks.map(s => onLanding ? { label: s.label, href: `#${s.id}` } : { label: s.label, href: `/#${s.id}` }),
    ...pageLinks,
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[var(--bg0)]/80 backdrop-blur-2xl border-b border-[var(--line)]' : ''}`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-[var(--line-2)] shrink-0">
              <img src="/ayinz.jpeg" alt="Ayinz" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
            </div>
            <span className="font-black text-sm tracking-widest uppercase text-[var(--fg0)]">Ayinz</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(n => n.to ? (
              <Link key={n.label} to={n.to}
                className="text-[10px] uppercase tracking-[0.25em] font-bold text-[var(--fg3)] hover:text-[var(--fg1)] transition-colors">
                {n.label}
              </Link>
            ) : (
              <a key={n.label} href={n.href}
                className="text-[10px] uppercase tracking-[0.25em] font-bold text-[var(--fg3)] hover:text-[var(--fg1)] transition-colors">
                {n.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {loggedIn ? (
              <Link to="/dashboard"
                className="flex items-center gap-2 bg-[var(--invert-bg)] text-[var(--invert-fg)] text-[10px] uppercase tracking-[0.2em] font-black px-5 py-2.5 rounded-full hover:bg-[var(--invert-hover)] transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                Dashboard <ArrowUpRight className="w-3 h-3" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-[10px] uppercase tracking-[0.25em] font-bold text-[var(--fg3)] hover:text-[var(--fg1)] transition-colors">
                  Sign In
                </Link>
                <Link to="/register"
                  className="flex items-center gap-2 bg-[var(--invert-bg)] text-[var(--invert-fg)] text-[10px] uppercase tracking-[0.2em] font-black px-5 py-2.5 rounded-full hover:bg-[var(--invert-hover)] transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  Get Started <ArrowUpRight className="w-3 h-3" />
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(true)} className="md:hidden text-[var(--fg2)] hover:text-[var(--fg0)] transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[var(--bg0)]/98 backdrop-blur-3xl flex flex-col p-7">
            <div className="flex justify-between items-center mb-16">
              <span className="font-black text-sm tracking-widest uppercase text-[var(--fg0)]">Ayinz</span>
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-xl border border-[var(--line-2)] text-[var(--fg2)] hover:text-[var(--fg0)] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-5">
              {navLinks.map((n, i) => n.to ? (
                <motion.div key={n.label}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}>
                  <Link to={n.to}
                    className="text-3xl font-black uppercase tracking-tight text-[var(--fg1)] hover:text-[var(--fg0)] transition-colors"
                    onClick={() => setMenuOpen(false)}>
                    {n.label}
                  </Link>
                </motion.div>
              ) : (
                <motion.a key={n.label} href={n.href}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="text-3xl font-black uppercase tracking-tight text-[var(--fg1)] hover:text-[var(--fg0)] transition-colors"
                  onClick={() => setMenuOpen(false)}>
                  {n.label}
                </motion.a>
              ))}
            </nav>
            <div className="mt-auto space-y-4 pt-8 border-t border-[var(--line)]">
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <Link to="/help" className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg4)] hover:text-[var(--fg1)] transition-colors" onClick={() => setMenuOpen(false)}>Help</Link>
                <Link to="/privacy" className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg4)] hover:text-[var(--fg1)] transition-colors" onClick={() => setMenuOpen(false)}>Privacy</Link>
              </div>
              {loggedIn ? (
                <Link to="/dashboard" className="block text-xs font-bold uppercase tracking-widest text-[var(--fg0)]" onClick={() => setMenuOpen(false)}>Dashboard →</Link>
              ) : (
                <>
                  <Link to="/login" className="block text-xs font-bold uppercase tracking-widest text-[var(--fg3)]" onClick={() => setMenuOpen(false)}>Sign In</Link>
                  <Link to="/register" className="block text-xs font-bold uppercase tracking-widest text-[var(--fg0)]" onClick={() => setMenuOpen(false)}>Get Started →</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
