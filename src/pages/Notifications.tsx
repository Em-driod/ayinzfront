import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Sparkles, AlertTriangle, Gift, Inbox, Trash2 } from 'lucide-react';
import api from '../utils/api';
import { linkify } from '../utils/linkify';
import { markAllRead, getDeletedIds, deleteNotificationForMe } from '../utils/notificationStorage';

interface AyinzNotification {
  _id: string;
  title: string;
  message: string;
  image_url?: string;
  template: 'announcement' | 'promo' | 'alert' | 'update';
  created_at: string;
}

const TEMPLATE_META: Record<AyinzNotification['template'], { icon: any; accent: string; bg: string; border: string; label: string }> = {
  announcement: { icon: Megaphone, accent: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Announcement' },
  promo: { icon: Gift, accent: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Offer' },
  alert: { icon: AlertTriangle, accent: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Important' },
  update: { icon: Sparkles, accent: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: "What's New" },
};

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString(undefined, {
  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
});

export default function Notifications() {
  const [notifications, setNotifications] = useState<AyinzNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications/mine');
        const list: AyinzNotification[] = res.data.notifications || [];
        const deleted = getDeletedIds();
        setNotifications(list.filter(n => !deleted.includes(n._id)));
        markAllRead(list.map(n => n._id));
      } catch (e) {} finally { setLoading(false); }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightId, notifications]);

  const handleDelete = (n: AyinzNotification) => {
    if (!window.confirm(`Remove "${n.title}" from your notifications?`)) return;
    deleteNotificationForMe(n._id);
    setNotifications(prev => prev.filter(x => x._id !== n._id));
  };

  return (
    <div className="min-h-screen">
      <div className="relative z-10 p-5 md:p-10 max-w-3xl mx-auto space-y-8">
        <div>
          <p className="label-caps text-red-500 mb-2">Inbox</p>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase leading-none">Notifications</h1>
          <p className="text-xs text-white/40 font-medium mt-3">
            Updates and announcements from Ayinz. Tap the trash icon to remove one from your list.
          </p>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-24 text-center glass-card-premium rounded-[2rem]">
            <Inbox className="w-8 h-8 mx-auto mb-4 text-white/15" />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-white/25">Nothing here yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {notifications.map(n => {
                const meta = TEMPLATE_META[n.template] || TEMPLATE_META.announcement;
                const Icon = meta.icon;
                const isHighlighted = n._id === highlightId;
                return (
                  <motion.div
                    key={n._id}
                    ref={isHighlighted ? highlightRef : undefined}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className={`glass-card-premium rounded-[1.75rem] p-5 md:p-6 border transition-colors ${
                      isHighlighted ? 'border-red-600/40 bg-red-600/[0.04]' : 'border-white/5'
                    }`}
                  >
                    {n.image_url && (
                      <div className="w-full aspect-video rounded-2xl overflow-hidden mb-4 border border-white/5">
                        <img src={n.image_url} alt={n.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${meta.bg} ${meta.border}`}>
                        <Icon className={`w-3.5 h-3.5 ${meta.accent}`} />
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${meta.accent}`}>{meta.label}</span>
                      </div>
                      <button
                        onClick={() => handleDelete(n)}
                        title="Remove"
                        className="w-8 h-8 shrink-0 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h2 className="text-lg font-display italic uppercase tracking-tight text-white leading-tight mb-2">
                      {n.title}
                    </h2>
                    <p className="text-sm text-white/60 leading-relaxed font-medium whitespace-pre-wrap mb-3">
                      {linkify(n.message, `${meta.accent} underline underline-offset-2 decoration-1 hover:opacity-80 transition-opacity break-all`)}
                    </p>
                    <p className="text-[10px] text-white/25 font-bold uppercase tracking-widest">{formatDate(n.created_at)}</p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
