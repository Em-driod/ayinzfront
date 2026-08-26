import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, Sparkles, AlertTriangle, Gift, ArrowRight } from 'lucide-react';
import { linkify } from '../utils/linkify';

export interface AyinzNotification {
  _id: string;
  title: string;
  message: string;
  image_url?: string;
  template: 'announcement' | 'promo' | 'alert' | 'update';
  created_at: string;
}

const DISMISSED_KEY = 'ayinz_dismissed_notifications';

const getDismissed = (): string[] => {
  try { return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]'); } catch { return []; }
};

const TEMPLATE_META: Record<AyinzNotification['template'], { icon: any; accent: string; label: string }> = {
  announcement: { icon: Megaphone, accent: 'red', label: 'Announcement' },
  promo: { icon: Gift, accent: 'amber', label: 'Offer' },
  alert: { icon: AlertTriangle, accent: 'red', label: 'Important' },
  update: { icon: Sparkles, accent: 'blue', label: "What's New" },
};

const ACCENT_CLASSES: Record<string, { text: string; bg: string; border: string; button: string }> = {
  red: { text: 'text-red-500', bg: 'bg-red-600/10', border: 'border-red-600/20', button: 'bg-red-600 hover:bg-red-500' },
  amber: { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', button: 'bg-amber-500 hover:bg-amber-400 text-black' },
  blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', button: 'bg-blue-600 hover:bg-blue-500' },
};

export default function NotificationPopup({ notifications }: { notifications: AyinzNotification[] }) {
  const [queue, setQueue] = useState<AyinzNotification[]>([]);

  useEffect(() => {
    if (!notifications || notifications.length === 0) return;
    const dismissed = getDismissed();
    setQueue(notifications.filter(n => !dismissed.includes(n._id)));
  }, [notifications]);

  const dismiss = (id: string) => {
    const dismissed = getDismissed();
    if (!dismissed.includes(id)) {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed, id]));
    }
    setQueue(q => q.filter(n => n._id !== id));
  };

  if (queue.length === 0) return null;
  const current = queue[0];
  const meta = TEMPLATE_META[current.template] || TEMPLATE_META.announcement;
  const accent = ACCENT_CLASSES[meta.accent];
  const Icon = meta.icon;
  const isPromo = current.template === 'promo';

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="notification-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[10000] p-4"
      >
        <motion.div
          key={current._id}
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 16 }}
          className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0a0a0a] overflow-hidden shadow-2xl relative"
        >
          <button
            onClick={() => dismiss(current._id)}
            className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {isPromo && current.image_url ? (
            <div className="relative h-56 w-full">
              <img src={current.image_url} alt={current.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
            </div>
          ) : current.image_url ? (
            <div className="w-full aspect-video">
              <img src={current.image_url} alt={current.title} className="w-full h-full object-cover" />
            </div>
          ) : null}

          <div className="p-7 md:p-8">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${accent.bg} ${accent.border} mb-5`}>
              <Icon className={`w-3.5 h-3.5 ${accent.text}`} />
              <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${accent.text}`}>{meta.label}</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-display italic uppercase tracking-tight text-white leading-[1.05] mb-4">
              {current.title}
            </h2>
            <p className="text-sm text-white/60 leading-relaxed font-medium mb-7 whitespace-pre-wrap">
              {linkify(current.message, `${accent.text} underline underline-offset-2 decoration-1 hover:opacity-80 transition-opacity break-all`)}
            </p>

            <button
              onClick={() => dismiss(current._id)}
              className={`w-full ${accent.button} text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95`}
            >
              Got It <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {queue.length > 1 && (
              <p className="text-center text-[9px] font-bold text-white/25 uppercase tracking-widest mt-4">
                {queue.length - 1} more update{queue.length > 2 ? 's' : ''} waiting
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
