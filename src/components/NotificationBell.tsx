import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Megaphone, Sparkles, AlertTriangle, Gift, Inbox, MessageCircle, Trash2, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import { linkify } from '../utils/linkify';
import { getReadIds, markAllRead, getDeletedIds, deleteNotificationForMe } from '../utils/notificationStorage';

interface AyinzNotification {
  _id: string;
  title: string;
  message: string;
  image_url?: string;
  template: 'announcement' | 'promo' | 'alert' | 'update';
  created_at: string;
}

interface ITicketMessage {
  sender: 'user' | 'admin';
  content: string;
  timestamp: string;
}

interface ITicket {
  _id: string;
  subject: string;
  status: 'Open' | 'Resolved';
  messages: ITicketMessage[];
  unreadUser: boolean;
  updatedAt: string;
}

type FeedItem =
  | { kind: 'notification'; id: string; title: string; preview: string; date: string; unread: boolean; template: AyinzNotification['template'] }
  | { kind: 'ticket'; id: string; title: string; preview: string; date: string; unread: boolean; resolved: boolean };

const TEMPLATE_META: Record<AyinzNotification['template'], { icon: any; accent: string }> = {
  announcement: { icon: Megaphone, accent: 'text-red-400' },
  promo: { icon: Gift, accent: 'text-amber-400' },
  alert: { icon: AlertTriangle, accent: 'text-red-400' },
  update: { icon: Sparkles, accent: 'text-blue-400' },
};

const timeAgo = (dateStr: string) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
};

export default function NotificationBell({ variant = 'mobile' }: { variant?: 'mobile' | 'desktop' }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AyinzNotification[]>([]);
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [readIds, setReadIds] = useState<string[]>(getReadIds());
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const MENU_WIDTH = 320;

  const recomputeMenuPos = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
    setMenuPos({ top: rect.bottom + 8, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    recomputeMenuPos();
    window.addEventListener('resize', recomputeMenuPos);
    window.addEventListener('scroll', recomputeMenuPos, true);
    return () => {
      window.removeEventListener('resize', recomputeMenuPos);
      window.removeEventListener('scroll', recomputeMenuPos, true);
    };
  }, [open, recomputeMenuPos]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [notifRes, ticketRes] = await Promise.all([
          api.get('/notifications/mine').catch(() => ({ data: { notifications: [] } })),
          api.get('/support/my').catch(() => ({ data: { tickets: [] } })),
        ]);
        const deleted = getDeletedIds();
        const liveNotifications: AyinzNotification[] = (notifRes.data.notifications || []).filter((n: AyinzNotification) => !deleted.includes(n._id));
        setNotifications(liveNotifications);
        setTickets((ticketRes.data.tickets || []).filter((t: ITicket) => t.status === 'Open'));
      } catch (e) {}
    };
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const feed: FeedItem[] = [
    ...tickets.map((t): FeedItem => {
      const last = t.messages[t.messages.length - 1];
      return {
        kind: 'ticket',
        id: t._id,
        title: t.subject,
        preview: last ? `${last.sender === 'admin' ? 'Admin: ' : 'You: '}${last.content}` : 'No messages yet',
        date: t.updatedAt,
        unread: t.unreadUser,
        resolved: false,
      };
    }),
    ...notifications.map((n): FeedItem => ({
      kind: 'notification',
      id: n._id,
      title: n.title,
      preview: n.message,
      date: n.created_at,
      unread: !readIds.includes(n._id),
      template: n.template,
    })),
  ].sort((a, b) => {
    if (a.unread !== b.unread) return a.unread ? -1 : 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const unreadCount = feed.filter(f => f.unread).length;

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next && notifications.length > 0) {
      setReadIds(markAllRead(notifications.map(n => n._id)));
    }
  };

  const openTicket = async (id: string) => {
    setOpen(false);
    try { await api.patch(`/support/${id}/read`); } catch (e) {}
    navigate('/support');
  };

  const openNotification = (id: string) => {
    setOpen(false);
    navigate(`/notifications?id=${id}`);
  };

  const removeNotification = (e: React.MouseEvent, n: AyinzNotification) => {
    e.stopPropagation();
    if (!window.confirm(`Remove "${n.title}" from your notifications?`)) return;
    deleteNotificationForMe(n._id);
    setNotifications(prev => prev.filter(x => x._id !== n._id));
  };

  const buttonClass = variant === 'mobile'
    ? 'relative w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 bg-zinc-900/60 border border-zinc-800 text-zinc-500'
    : 'relative w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 bg-zinc-900/60 border border-zinc-800 text-zinc-500 hover:text-white';

  return (
    <div className="relative" ref={containerRef}>
      <button ref={buttonRef} onClick={toggleOpen} className={buttonClass}>
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[8px] font-black border-2 border-[#0a0a0a]">
            {unreadCount}
          </span>
        )}
      </button>

      {createPortal(
        <AnimatePresence>
        {open && menuPos && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{ top: menuPos.top, left: menuPos.left, width: MENU_WIDTH }}
            className="fixed max-w-[90vw] max-h-[70vh] flex flex-col rounded-2xl border border-zinc-800 bg-[#0a0a0a] shadow-2xl z-[10000] overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-zinc-900 shrink-0">
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Notifications</span>
            </div>

            {feed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Inbox className="w-6 h-6 text-zinc-700 mb-2" />
                <p className="text-xs text-zinc-500 font-bold">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-900 overflow-y-auto">
                {feed.map(item => {
                  const isTicket = item.kind === 'ticket';
                  const meta = isTicket ? null : TEMPLATE_META[item.template] || TEMPLATE_META.announcement;
                  const Icon = isTicket ? MessageCircle : meta!.icon;
                  const accent = isTicket ? 'text-emerald-400' : meta!.accent;
                  const content = (
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 shrink-0 ${accent}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-black text-white truncate flex items-center gap-1.5">
                            {item.title}
                            {isTicket && (
                              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                Support
                              </span>
                            )}
                          </p>
                          <span className="text-[9px] text-zinc-600 font-bold shrink-0">{timeAgo(item.date)}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-medium mt-0.5 line-clamp-2">
                          {isTicket ? item.preview : linkify(item.preview, 'text-zinc-300 underline underline-offset-2 decoration-1')}
                        </p>
                      </div>
                      {item.unread && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />}
                      {!isTicket && (
                        <button
                          onClick={e => { const n = notifications.find(x => x._id === item.id); if (n) removeNotification(e, n); }}
                          title="Remove"
                          className="shrink-0 p-1.5 rounded-lg text-zinc-700 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                  return isTicket ? (
                    <button
                      key={`ticket-${item.id}`}
                      onClick={() => openTicket(item.id)}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-900/40 transition-colors"
                    >
                      {content}
                    </button>
                  ) : (
                    <div
                      key={`notif-${item.id}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => openNotification(item.id)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openNotification(item.id); }}
                      className="px-4 py-3 hover:bg-zinc-900/40 transition-colors cursor-pointer"
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => { setOpen(false); navigate('/notifications'); }}
              className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-3 border-t border-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-900/40 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
