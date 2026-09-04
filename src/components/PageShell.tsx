import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SiteNav from './SiteNav';

export default function PageShell({
  eyebrow, title, subtitle, children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[var(--bg0)] text-[var(--fg0)] overflow-x-hidden">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-red-950/10 to-transparent pointer-events-none" />

      <SiteNav />

      {/* Header */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-32 pb-10 text-center">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--fg3)] mb-4">
          {eyebrow}
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-[1.1] pb-1">
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-[var(--fg2)] text-sm md:text-base font-light max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </motion.p>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pb-24">
        {children}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--line)] py-10 px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--fg5)]">© {new Date().getFullYear()} Ayinz. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="text-[9px] font-bold uppercase tracking-widest text-[var(--fg4)] hover:text-[var(--fg1)] transition-colors">About</Link>
            <Link to="/help" className="text-[9px] font-bold uppercase tracking-widest text-[var(--fg4)] hover:text-[var(--fg1)] transition-colors">Help</Link>
            <Link to="/promote" className="text-[9px] font-bold uppercase tracking-widest text-[var(--fg4)] hover:text-[var(--fg1)] transition-colors">Promote</Link>
            <Link to="/privacy" className="text-[9px] font-bold uppercase tracking-widest text-[var(--fg4)] hover:text-[var(--fg1)] transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
