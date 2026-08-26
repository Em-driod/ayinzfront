
import React, { useState, useEffect, useMemo } from 'react';
import { Users, Music, DollarSign, CheckCircle, TrendingUp, BarChart3, X, Search, ChevronRight, LayoutDashboard, Wallet, MessageCircle, Send, UserCheck, UserPlus, Eye, Pencil, CreditCard, ArrowUpRight, Shield, AlertCircle, ListMusic, Plus, Trash2, ExternalLink, Paperclip, Bell, Megaphone, Sparkles, AlertTriangle, Gift, Upload } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

interface User {
    _id: string;
    name: string;
    email: string;
    subscription: string;
    created_at: string;
    artisteName?: string;
    phone?: string;
    whatsapp?: string;
    stateOfOrigin?: string;
    nationality?: string;
    socialLink?: string;
    referralCode?: string;
    myReferralCode?: string;
}

interface Release {
    id: string;
    title: string;
    artist: string;
    featured_artists?: string[];
    type: string;
    genre: string;
    release_date: string;
    contact_email: string;
    song_file: string;
    price: number;
    status: string;
    rejection_reason?: string;
    streams: number;
    revenue: number;
    cover_url: string;
    created_at: string;
    user: { name: string; email: string };
    contributors?: any[];
    songwriters?: string[];
    musicians?: any[];
    ai_assisted?: string;
    is_instrumental?: boolean;
    language?: string;
    explicit?: string;
    isrc?: string;
    upc?: string;
    lyrics?: string;
    label?: string;
    copyright_date_release?: string;
    copyright_date_recording?: string;
    tracks?: {
        title: string;
        artist: string;
        genre: string;
        song_url: string;
        isrc?: string;
        explicit?: string;
        featured_artist?: string;
        songwriter?: string;
    }[];
}

interface Playlist {
    _id: string;
    name: string;
    curator: string;
    cover: string;
    url: string;
    order: number;
    active: boolean;
}

interface PromoSubmission {
    _id: string;
    artiste_name: string;
    spotify_link: string;
    email: string;
    attachment_url?: string;
    status: 'pending' | 'reviewed';
    created_at: string;
}

interface AdminNotification {
    _id: string;
    title: string;
    message: string;
    image_url?: string;
    template: 'announcement' | 'promo' | 'alert' | 'update';
    audience: 'public' | 'all_users' | 'individual';
    target_user?: { _id: string; name: string; email: string };
    active: boolean;
    created_at: string;
}

interface Ticket {
    _id: string;
    user: { name: string; email: string };
    subject: string;
    status: 'Open' | 'Resolved';
    messages: { sender: 'user' | 'admin', content: string, timestamp: string }[];
    unreadAdmin: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Payout {
    _id: string;
    user: { name: string; email: string };
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
    status: string;
    created_at: string;
}

interface Payment {
    _id: string;
    user: { name: string; email: string; subscription: string };
    plan: string;
    amount: number;
    reference: string;
    status: string;
    paid_at: string;
}

const PLAN_LABELS: Record<string, string> = {
    basic: 'Artiste Plan',
    premium: 'Record Label',
    plus: 'Record Label Plus',
    standard: 'Enterprise',
    plan500: 'Sonic 500',
    none: 'Free'
};

const SUBSCRIPTION_STYLE: Record<string, string> = {
    plus: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    premium: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    standard: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    basic: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    plan500: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    none: 'bg-white/5 border-white/10 text-white/30'
};

const AVATAR_BG: Record<string, string> = {
    plus: 'bg-amber-500/20 text-amber-300 border-amber-500/20',
    premium: 'bg-blue-500/20 text-blue-300 border-blue-500/20',
    standard: 'bg-purple-500/20 text-purple-300 border-purple-500/20',
    basic: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20',
    plan500: 'bg-orange-500/20 text-orange-300 border-orange-500/20',
    none: 'bg-white/5 text-white/40 border-white/10'
};

const PLATFORM_COLORS: Record<string, string> = {
    'Spotify': '#1DB954', 'Apple Music': '#FB233B', 'YouTube Music': '#FF0000',
    'Amazon Music': '#00A8E1', 'Tidal': '#00d2ff', 'Deezer': '#FF0092',
    'Boomplay': '#f1c40f', 'Audiomack': '#FFA200', 'Other': '#fb923c', 'Overall': '#ef4444'
};

const NOTIFICATION_TEMPLATES: { id: AdminNotification['template']; label: string; icon: any; accent: string }[] = [
    { id: 'announcement', label: 'Announcement', icon: Megaphone, accent: 'text-red-400 bg-red-500/10 border-red-500/20' },
    { id: 'promo', label: 'Promo / Offer', icon: Gift, accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { id: 'alert', label: 'Alert', icon: AlertTriangle, accent: 'text-red-400 bg-red-500/10 border-red-500/20' },
    { id: 'update', label: "What's New", icon: Sparkles, accent: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
];

const AUDIENCE_LABELS: Record<string, string> = {
    public: 'Public (Landing Page)',
    all_users: 'All Accounts (Dashboard)',
    individual: 'Specific Artist',
};

const STATUS_COLORS: Record<string, string> = {
    approved: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    uploaded: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    pending: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    rejected: 'bg-red-500/10 border-red-500/20 text-red-400',
};

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [releases, setReleases] = useState<Release[]>([]);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [unrecordedPayers, setUnrecordedPayers] = useState<User[]>([]);
    const [paymentsError, setPaymentsError] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'releases' | 'payouts' | 'support' | 'payments' | 'promote' | 'notifications'>('overview');
    const [selectedUserFilter, setSelectedUserFilter] = useState<User | null>(null);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const filteredUsers = useMemo(() => {
        const q = userSearchQuery.trim().toLowerCase();
        if (!q) return users;
        return users.filter(u =>
            u.name?.toLowerCase().includes(q)
            || u.email?.toLowerCase().includes(q)
            || u.artisteName?.toLowerCase().includes(q)
            || u.referralCode?.toLowerCase().includes(q)
            || u.myReferralCode?.toLowerCase().includes(q)
        );
    }, [users, userSearchQuery]);
    const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [replying, setReplying] = useState(false);
    const [editingRelease, setEditingRelease] = useState<Release | null>(null);
    const [statsForm, setStatsForm] = useState({ date: '', streams: 0, revenue: 0, platform: 'Spotify' });
    const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
    const [editingIdentifiers, setEditingIdentifiers] = useState(false);
    const [identifierForm, setIdentifierForm] = useState({ isrc: '', upc: '', label: '' });
    const [savingIdentifiers, setSavingIdentifiers] = useState(false);
    const [rejectingRelease, setRejectingRelease] = useState<Release | null>(null);
    const [rejectionReasonInput, setRejectionReasonInput] = useState('');
    const [savingRejection, setSavingRejection] = useState(false);
    const [viewingRelease, setViewingRelease] = useState<Release | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [creatingUser, setCreatingUser] = useState(false);
    const [createUserForm, setCreateUserForm] = useState({ name: '', email: '', password: '', subscription: 'basic' });
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [updatingUser, setUpdatingUser] = useState(false);
    const [editUserForm, setEditUserForm] = useState({ name: '', email: '', password: '', subscription: 'basic' });

    const [promoteSubTab, setPromoteSubTab] = useState<'playlists' | 'submissions'>('playlists');
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [promoSubmissions, setPromoSubmissions] = useState<PromoSubmission[]>([]);
    const [editingPlaylist, setEditingPlaylist] = useState<Playlist | 'new' | null>(null);
    const [playlistForm, setPlaylistForm] = useState({ name: '', curator: 'Curated by Ayinz', cover: '', url: '', order: 0, active: true });
    const [playlistCoverFile, setPlaylistCoverFile] = useState<File | null>(null);
    const [savingPlaylist, setSavingPlaylist] = useState(false);

    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [showNewNotification, setShowNewNotification] = useState(false);
    const [notificationForm, setNotificationForm] = useState<{ title: string; message: string; template: AdminNotification['template']; audience: AdminNotification['audience']; target_user: string }>({
        title: '', message: '', template: 'announcement', audience: 'all_users', target_user: ''
    });
    const [notificationImage, setNotificationImage] = useState<File | null>(null);
    const [savingNotification, setSavingNotification] = useState(false);

    const fetchData = async () => {
        try {
            const [usersRes, releasesRes, payoutsRes, ticketsRes, paymentsRes, unrecordedRes, playlistsRes, promoSubsRes, notificationsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/releases'),
                api.get('/admin/payouts'),
                api.get('/support/all'),
                api.get('/admin/payments').catch((e) => { setPaymentsError('Failed to load payment records: ' + (e.response?.data?.error || e.message)); return { data: { payments: [] } }; }),
                api.get('/admin/payments/unrecorded').catch(() => ({ data: { users: [] } })),
                api.get('/admin/playlists').catch(() => ({ data: { playlists: [] } })),
                api.get('/admin/promo-submissions').catch(() => ({ data: { submissions: [] } })),
                api.get('/admin/notifications').catch(() => ({ data: { notifications: [] } })),
            ]);
            setUsers(usersRes.data.users);
            setReleases(releasesRes.data.releases);
            setPayouts(payoutsRes.data.payouts);
            setTickets(ticketsRes.data.tickets);
            setPayments(paymentsRes.data.payments || []);
            setUnrecordedPayers(unrecordedRes.data.users || []);
            setPlaylists(playlistsRes.data.playlists || []);
            setPromoSubmissions(promoSubsRes.data.submissions || []);
            setNotifications(notificationsRes.data.notifications || []);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Access denied. You must be an admin.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleTicketStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/support/${id}/status`, { status });
            setTickets(tickets.map(t => t._id === id ? { ...t, status } : t) as any);
            if (activeTicket?._id === id) setActiveTicket({ ...activeTicket, status } as any);
        } catch { alert('Failed to change status'); }
    };

    const handleTicketReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim() || !activeTicket) return;
        setReplying(true);
        try {
            const res = await api.post(`/support/${activeTicket._id}/message`, { message: replyMessage });
            setTickets(tickets.map(t => t._id === activeTicket._id ? res.data.ticket : t));
            setActiveTicket(res.data.ticket);
            setReplyMessage('');
        } catch { alert('Failed to reply'); }
        setReplying(false);
    };

    const handleOpenAdminTicket = async (ticket: Ticket) => {
        setActiveTicket(ticket);
        if (ticket.unreadAdmin) {
            try {
                await api.patch(`/support/${ticket._id}/read`);
                setTickets(tickets.map(t => t._id === ticket._id ? { ...t, unreadAdmin: false } : t));
                setActiveTicket({ ...ticket, unreadAdmin: false });
            } catch { }
        }
    };

    const handlePayoutStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/admin/payouts/${id}/status`, { status });
            setPayouts(payouts.map(p => p._id === id ? { ...p, status } : p));
        } catch { alert('Failed to update payout status'); }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/admin/releases/${id}/status`, { status: newStatus });
            setReleases(releases.map(r => r.id === id ? { ...r, status: newStatus } : r));
            if (selectedRelease?.id === id) setSelectedRelease({ ...selectedRelease, status: newStatus });
        } catch { alert('Failed to update status'); }
    };

    const startRejectingRelease = (release: Release) => {
        setRejectingRelease(release);
        setRejectionReasonInput(release.rejection_reason || '');
    };

    const handleConfirmRejection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectingRelease) return;
        setSavingRejection(true);
        try {
            await api.patch(`/admin/releases/${rejectingRelease.id}/status`, { status: 'rejected', rejection_reason: rejectionReasonInput });
            const updated = { status: 'rejected', rejection_reason: rejectionReasonInput };
            setReleases(releases.map(r => r.id === rejectingRelease.id ? { ...r, ...updated } : r));
            if (selectedRelease?.id === rejectingRelease.id) setSelectedRelease({ ...selectedRelease, ...updated });
            setRejectingRelease(null);
            setRejectionReasonInput('');
        } catch { alert('Failed to reject release'); }
        finally { setSavingRejection(false); }
    };

    const handleViewStats = async (release: Release) => {
        setViewingRelease(release);
        setLoadingHistory(true);
        try {
            const res = await api.get(`/releases/${release.id}/history`);
            setHistory(res.data.history || []);
        } catch { setHistory([]); }
        finally { setLoadingHistory(false); }
    };

    const handleUpdateStats = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRelease) return;
        try {
            const res = await api.patch(`/admin/releases/${editingRelease.id}/stats`, statsForm);
            setReleases(releases.map(r => r.id === editingRelease.id
                ? { ...r, streams: res.data.release.streams, revenue: res.data.release.revenue } : r));
            setEditingRelease(null);
            setStatsForm({ date: '', streams: 0, revenue: 0, platform: 'Spotify' });
        } catch { alert('Failed to update stats'); }
    };

    const closeReleaseModal = () => {
        setSelectedRelease(null);
        setEditingIdentifiers(false);
    };

    const startEditingIdentifiers = () => {
        if (!selectedRelease) return;
        setIdentifierForm({
            isrc: selectedRelease.isrc || '',
            upc: selectedRelease.upc || '',
            label: selectedRelease.label || ''
        });
        setEditingIdentifiers(true);
    };

    const handleUpdateIdentifiers = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRelease) return;
        setSavingIdentifiers(true);
        try {
            const res = await api.patch(`/admin/releases/${selectedRelease.id}/identifiers`, identifierForm);
            const updated = { isrc: res.data.isrc, upc: res.data.upc, label: res.data.label };
            setReleases(releases.map(r => r.id === selectedRelease.id ? { ...r, ...updated } : r));
            setSelectedRelease({ ...selectedRelease, ...updated });
            setEditingIdentifiers(false);
        } catch { alert('Failed to update identifiers'); }
        finally { setSavingIdentifiers(false); }
    };

    const handleUpdatePrice = async (id: string, newPrice: number) => {
        try {
            await api.patch(`/admin/releases/${id}/status`, { price: newPrice });
            setReleases(releases.map(r => r.id === id ? { ...r, price: newPrice } : r));
        } catch { alert('Failed to update price'); }
    };

    const handleDeleteUser = async (id: string, name: string) => {
        if (!window.confirm(`Delete artist "${name}" and all their releases? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
            setReleases(releases.filter(r => (r.user as any)._id !== id));
        } catch { alert('Failed to delete user'); }
    };

    const handleDeleteRelease = async (id: string, title: string) => {
        if (!window.confirm(`Delete release "${title}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/releases/${id}`);
            setReleases(releases.filter(r => r.id !== id));
        } catch { alert('Failed to delete release'); }
    };

    const startNewPlaylist = () => {
        setPlaylistForm({ name: '', curator: 'Curated by Ayinz', cover: '', url: '', order: playlists.length, active: true });
        setPlaylistCoverFile(null);
        setEditingPlaylist('new');
    };

    const startEditPlaylist = (p: Playlist) => {
        setPlaylistForm({ name: p.name, curator: p.curator, cover: p.cover, url: p.url, order: p.order, active: p.active });
        setPlaylistCoverFile(null);
        setEditingPlaylist(p);
    };

    const handleSavePlaylist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!playlistCoverFile && !playlistForm.cover.trim()) {
            alert('Upload a cover image or paste a cover image URL.');
            return;
        }
        setSavingPlaylist(true);
        try {
            const data = new FormData();
            data.append('name', playlistForm.name);
            data.append('curator', playlistForm.curator);
            data.append('url', playlistForm.url);
            data.append('order', String(playlistForm.order));
            data.append('active', String(playlistForm.active));
            if (playlistForm.cover.trim()) data.append('cover', playlistForm.cover.trim());
            if (playlistCoverFile) data.append('cover_image', playlistCoverFile);

            if (editingPlaylist === 'new') {
                const res = await api.post('/admin/playlists', data, { headers: { 'Content-Type': 'multipart/form-data' } });
                setPlaylists([...playlists, res.data.playlist]);
            } else if (editingPlaylist) {
                const res = await api.patch(`/admin/playlists/${editingPlaylist._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
                setPlaylists(playlists.map(p => p._id === editingPlaylist._id ? res.data.playlist : p));
            }
            setEditingPlaylist(null);
            setPlaylistCoverFile(null);
        } catch { alert('Failed to save playlist'); }
        finally { setSavingPlaylist(false); }
    };

    const handleTogglePlaylistActive = async (p: Playlist) => {
        try {
            const res = await api.patch(`/admin/playlists/${p._id}`, { active: !p.active });
            setPlaylists(playlists.map(pl => pl._id === p._id ? res.data.playlist : pl));
        } catch { alert('Failed to update playlist'); }
    };

    const handleDeletePlaylist = async (id: string, name: string) => {
        if (!window.confirm(`Delete playlist "${name}"?`)) return;
        try {
            await api.delete(`/admin/playlists/${id}`);
            setPlaylists(playlists.filter(p => p._id !== id));
        } catch { alert('Failed to delete playlist'); }
    };

    const handleMarkSubmissionReviewed = async (id: string) => {
        try {
            const res = await api.patch(`/admin/promo-submissions/${id}`, { status: 'reviewed' });
            setPromoSubmissions(promoSubmissions.map(s => s._id === id ? res.data.submission : s));
        } catch { alert('Failed to update submission'); }
    };

    const resetNotificationForm = () => {
        setNotificationForm({ title: '', message: '', template: 'announcement', audience: 'all_users', target_user: '' });
        setNotificationImage(null);
    };

    const handleCreateNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (notificationForm.audience === 'individual' && !notificationForm.target_user) {
            alert('Choose an artist to target this notification at.');
            return;
        }
        setSavingNotification(true);
        try {
            const data = new FormData();
            data.append('title', notificationForm.title);
            data.append('message', notificationForm.message);
            data.append('template', notificationForm.template);
            data.append('audience', notificationForm.audience);
            if (notificationForm.audience === 'individual') data.append('target_user', notificationForm.target_user);
            if (notificationImage) data.append('image', notificationImage);

            const res = await api.post('/admin/notifications', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            setNotifications([res.data.notification, ...notifications]);
            setShowNewNotification(false);
            resetNotificationForm();
        } catch (err: any) { alert(err.response?.data?.error || 'Failed to create notification'); }
        finally { setSavingNotification(false); }
    };

    const handleToggleNotificationActive = async (n: AdminNotification) => {
        try {
            const res = await api.patch(`/admin/notifications/${n._id}`, { active: !n.active });
            setNotifications(notifications.map(x => x._id === n._id ? res.data.notification : x));
        } catch { alert('Failed to update notification'); }
    };

    const handleDeleteNotification = async (id: string, title: string) => {
        if (!window.confirm(`Delete notification "${title}"?`)) return;
        try {
            await api.delete(`/admin/notifications/${id}`);
            setNotifications(notifications.filter(n => n._id !== id));
        } catch { alert('Failed to delete notification'); }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingUser(true);
        try {
            const res = await api.post('/admin/users', createUserForm);
            setUsers([res.data.user, ...users]);
            setShowCreateUser(false);
            setCreateUserForm({ name: '', email: '', password: '', subscription: 'basic' });
            alert('User created successfully');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to create user');
        } finally { setCreatingUser(false); }
    };

    const openEditUser = (u: User) => {
        setEditingUser(u);
        setEditUserForm({ name: u.name, email: u.email, password: '', subscription: u.subscription });
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setUpdatingUser(true);
        try {
            const res = await api.patch(`/admin/users/${editingUser._id}`, editUserForm);
            setUsers(users.map(u => u._id === editingUser._id ? res.data.user : u));
            setEditingUser(null);
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to update user');
        } finally { setUpdatingUser(false); }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Loading Dashboard</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-display uppercase mb-2">Access Denied</h2>
                <p className="text-white/40 text-sm mb-8">{error}</p>
                <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-zinc-100 transition-colors">Return Home</button>
            </div>
        </div>
    );

    const unreadCount = tickets.filter(t => t.unreadAdmin).length;
    const pendingCount = releases.filter(r => r.status === 'pending').length;

    const StatCard = ({ title, value, icon: Icon, color, sub }: any) => (
        <motion.div whileHover={{ y: -3 }} className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent p-5 sm:p-6 group cursor-default transition-all duration-300 hover:border-white/10">
            <div className={`absolute -top-12 -right-12 w-36 h-36 rounded-full bg-${color}-500/5 blur-3xl transition-all duration-700 group-hover:bg-${color}-500/12`} />
            <div className="relative">
                <div className={`w-9 h-9 rounded-xl bg-${color}-500/10 border border-${color}-500/15 flex items-center justify-center mb-4`}>
                    <Icon className={`w-4.5 h-4.5 text-${color}-400`} />
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">{title}</p>
                <p className="text-3xl font-display text-white leading-none mb-1">{value}</p>
                {sub && <p className="text-[10px] text-white/25 font-bold">{sub}</p>}
            </div>
        </motion.div>
    );

    const TABS = [
        { id: 'overview', name: 'Overview', icon: LayoutDashboard, badge: 0 },
        { id: 'users', name: 'Artists', icon: Users, badge: 0 },
        { id: 'releases', name: 'Releases', icon: Music, badge: pendingCount },
        { id: 'payouts', name: 'Payouts', icon: Wallet, badge: 0 },
        { id: 'payments', name: 'Payments', icon: CreditCard, badge: 0 },
        { id: 'support', name: 'Support', icon: MessageCircle, badge: unreadCount },
        { id: 'promote', name: 'Promote', icon: ListMusic, badge: promoSubmissions.filter(s => s.status === 'pending').length },
        { id: 'notifications', name: 'Notify', icon: Bell, badge: 0 },
    ];

    const inputCls = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-white/20 focus:bg-white/[0.06] outline-none transition-all font-medium";
    const labelCls = "text-[9px] font-black uppercase tracking-[0.25em] text-white/30 mb-1.5 block";

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Top glow line */}
            <div className="h-px bg-gradient-to-r from-transparent via-red-600/60 to-transparent" />

            {/* Sticky top bar */}
            <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#050505]/90 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-red-600 flex items-center justify-center shrink-0">
                            <LayoutDashboard className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60">Sonic Distro</span>
                        <span className="text-white/15">/</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white">Admin</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 pb-28">

                {/* Page heading */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-red-500 mb-3">System Control</p>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-display uppercase leading-none tracking-tight">
                        Admin<br />
                        <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Dashboard</span>
                    </h1>
                </motion.div>

                {/* Tab bar */}
                <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl mb-8 overflow-x-auto no-scrollbar">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id as any); if (tab.id === 'releases') setSelectedUserFilter(null); }}
                            className={`relative flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap flex-1 transition-all duration-200 ${
                                activeTab === tab.id
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                                    : 'text-white/35 hover:text-white/70 hover:bg-white/[0.04]'
                            }`}
                        >
                            <tab.icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="hidden sm:inline">{tab.name}</span>
                            {tab.badge > 0 && (
                                <span className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 text-[8px] font-black rounded-full flex items-center justify-center ${activeTab === tab.id ? 'bg-white text-red-600' : 'bg-red-600 text-white'}`}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ─── Tab content ─── */}
                <AnimatePresence mode="wait">

                    {/* OVERVIEW */}
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">

                            {/* Stat cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                <StatCard title="Total Artists" value={users.length} icon={Users} color="blue" sub={`${users.filter(u => u.subscription !== 'none').length} paid`} />
                                <StatCard title="Paid Users" value={users.filter(u => u.subscription !== 'none').length} icon={CreditCard} color="emerald" sub="Active subscriptions" />
                                <StatCard title="Total Streams" value={releases.reduce((s, r) => s + r.streams, 0).toLocaleString()} icon={BarChart3} color="red" sub="All time" />
                                <StatCard title="Revenue" value={`₦${payments.reduce((s, p) => s + p.amount, 0).toLocaleString()}`} icon={DollarSign} color="amber" sub="Subscription income" />
                            </div>

                            {/* Overview panels */}
                            <div className="grid lg:grid-cols-2 gap-6">

                                {/* Recent users */}
                                <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden">
                                    <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-0.5">Artists</p>
                                            <h3 className="text-sm font-black uppercase tracking-tight">Recent Signups</h3>
                                        </div>
                                        <button onClick={() => setActiveTab('users')} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-red-500 transition-colors">
                                            View All <ArrowUpRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="divide-y divide-white/[0.04]">
                                        {users.slice(0, 5).map(u => (
                                            <div key={u._id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl border font-black text-sm flex items-center justify-center shrink-0 ${AVATAR_BG[u.subscription] || AVATAR_BG['none']}`}>
                                                        {u.name[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white leading-none mb-0.5">{u.name}</p>
                                                        <p className="text-[10px] text-white/30 font-medium">{u.email}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${SUBSCRIPTION_STYLE[u.subscription] || SUBSCRIPTION_STYLE['none']}`}>
                                                    {PLAN_LABELS[u.subscription] || u.subscription}
                                                </span>
                                            </div>
                                        ))}
                                        {users.length === 0 && (
                                            <div className="py-16 text-center text-white/20">
                                                <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                                <p className="text-xs font-black uppercase tracking-widest">No artists yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Pending releases */}
                                <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden">
                                    <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-0.5">Queue</p>
                                            <h3 className="text-sm font-black uppercase tracking-tight">Pending Review</h3>
                                        </div>
                                        {pendingCount > 0 && (
                                            <button onClick={() => { setActiveTab('releases'); setSelectedUserFilter(null); }} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-red-500 transition-colors">
                                                Manage <ArrowUpRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="divide-y divide-white/[0.04]">
                                        {releases.filter(r => r.status === 'pending').slice(0, 5).map(r => (
                                            <div key={r.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                                                        {r.cover_url
                                                            ? <img src={r.cover_url} alt={r.title} className="w-full h-full object-cover" />
                                                            : <div className="w-full h-full flex items-center justify-center"><Music className="w-4 h-4 text-white/20" /></div>
                                                        }
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white leading-none mb-0.5 truncate max-w-[160px]">{r.title}</p>
                                                        <p className="text-[10px] text-white/30 font-medium">{r.artist}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">Review</span>
                                            </div>
                                        ))}
                                        {pendingCount === 0 && (
                                            <div className="py-16 text-center text-white/20">
                                                <CheckCircle className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                                <p className="text-xs font-black uppercase tracking-widest">All clear</p>
                                                <p className="text-[10px] mt-1 opacity-60">No pending releases</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick stats row */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { label: 'Total Releases', value: releases.length, icon: Music },
                                    { label: 'Open Tickets', value: tickets.filter(t => t.status === 'Open').length, icon: MessageCircle },
                                    { label: 'Pending Payouts', value: payouts.filter(p => p.status === 'Pending').length, icon: Wallet },
                                ].map(item => (
                                    <div key={item.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5 flex items-center gap-4">
                                        <item.icon className="w-5 h-5 text-white/20 shrink-0" />
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25 mb-0.5">{item.label}</p>
                                            <p className="text-xl font-display text-white">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* USERS */}
                    {activeTab === 'users' && (
                        <motion.div key="users" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden">
                                {/* Header */}
                                <div className="px-4 sm:px-8 py-5 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                    <div className="flex items-center justify-between sm:block gap-4">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-0.5">Registered</p>
                                            <h2 className="text-base font-black uppercase tracking-tight">All Artists <span className="text-white/20 font-bold ml-2 text-sm">{users.length}</span></h2>
                                        </div>
                                        <button onClick={() => setShowCreateUser(true)} className="sm:hidden flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 shrink-0">
                                            <UserPlus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="flex flex-1 sm:flex-none items-center gap-2 bg-white/[0.04] border border-white/[0.06] px-4 py-2.5 rounded-xl">
                                            <Search className="w-3.5 h-3.5 text-white/20 shrink-0" />
                                            <input
                                                type="text"
                                                placeholder="Search artists…"
                                                value={userSearchQuery}
                                                onChange={e => setUserSearchQuery(e.target.value)}
                                                className="bg-transparent text-xs text-white placeholder-white/20 outline-none w-full sm:w-40 font-medium"
                                            />
                                        </div>
                                        <button onClick={() => setShowCreateUser(true)} className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20">
                                            <UserPlus className="w-3.5 h-3.5" /> Create
                                        </button>
                                    </div>
                                </div>

                                {/* User rows */}
                                <div className="divide-y divide-white/[0.04]">
                                    {filteredUsers.map((u, i) => (
                                        <motion.div
                                            key={u._id}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border font-black text-base flex items-center justify-center shrink-0 transition-all group-hover:scale-105 ${AVATAR_BG[u.subscription] || AVATAR_BG['none']}`}>
                                                    {u.name[0].toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-white truncate mb-0.5">{u.name}{u.artisteName ? <span className="text-white/30 font-medium ml-1.5">· {u.artisteName}</span> : null}</p>
                                                    <p className="text-[10px] text-white/30 font-medium truncate">{u.email}{u.phone ? <span className="ml-2 text-white/20">{u.phone}</span> : null}</p>
                                                    <div className="flex items-center gap-2 mt-1 sm:hidden">
                                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${SUBSCRIPTION_STYLE[u.subscription] || SUBSCRIPTION_STYLE['none']}`}>
                                                            {PLAN_LABELS[u.subscription] || u.subscription}
                                                        </span>
                                                        {u.referralCode && (
                                                            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400">
                                                                Ref: {u.referralCode}
                                                            </span>
                                                        )}
                                                        {u.myReferralCode && (
                                                            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-sky-500/30 bg-sky-500/10 text-sky-400">
                                                                Code: {u.myReferralCode}
                                                            </span>
                                                        )}
                                                        <span className="text-[8px] text-white/20 font-medium tabular-nums ml-auto">
                                                            {new Date(u.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                                                <div className="hidden md:flex flex-col items-end gap-1">
                                                    <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border ${SUBSCRIPTION_STYLE[u.subscription] || SUBSCRIPTION_STYLE['none']}`}>
                                                        {PLAN_LABELS[u.subscription] || u.subscription}
                                                    </span>
                                                    <span className={`text-[8px] font-black uppercase tracking-widest ${u.subscription !== 'none' ? 'text-emerald-400' : 'text-white/20'}`}>
                                                        {u.subscription !== 'none' ? '✓ paid' : 'free'}
                                                    </span>
                                                    {u.referralCode && (
                                                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 tracking-widest">
                                                            Ref: {u.referralCode}
                                                        </span>
                                                    )}
                                                    {u.myReferralCode && (
                                                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border border-sky-500/30 bg-sky-500/10 text-sky-400 tracking-widest">
                                                            Code: {u.myReferralCode}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="hidden lg:block text-[10px] text-white/20 font-medium tabular-nums">
                                                    {new Date(u.created_at).toLocaleDateString()}
                                                </p>
                                                <div className="flex items-center gap-1.5">
                                                    <button onClick={() => { setSelectedUserFilter(u); setActiveTab('releases'); }} title="Releases" className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 hover:bg-purple-500/15 hover:border-purple-500/30 hover:text-purple-400 transition-all">
                                                        <Music className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => openEditUser(u)} title="Edit" className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 hover:bg-blue-500/15 hover:border-blue-500/30 hover:text-blue-400 transition-all">
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDeleteUser(u._id, u.name)} title="Delete" className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-400 transition-all">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <div className="py-24 text-center">
                                            <Users className="w-12 h-12 mx-auto mb-4 text-white/10" />
                                            <p className="text-xs font-black uppercase tracking-[0.3em] text-white/20">
                                                {users.length === 0 ? 'No artists registered' : 'No artists match your search'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* RELEASES */}
                    {activeTab === 'releases' && (() => {
                        const displayReleases = selectedUserFilter
                            ? releases.filter(r => r.user?.email === selectedUserFilter.email)
                            : releases;
                        return (
                            <motion.div key="releases" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
                                {selectedUserFilter && (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-4">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-400 mb-0.5">Filtered by artist</p>
                                            <p className="text-sm font-bold text-white">{selectedUserFilter.name}</p>
                                        </div>
                                        <button onClick={() => setSelectedUserFilter(null)} className="text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all">
                                            Show All
                                        </button>
                                    </div>
                                )}

                                <div className="grid lg:grid-cols-2 gap-4">
                                    {displayReleases.length === 0 ? (
                                        <div className="col-span-2 py-24 text-center">
                                            <Music className="w-12 h-12 mx-auto mb-4 text-white/10" />
                                            <p className="text-xs font-black uppercase tracking-[0.3em] text-white/20">
                                                {selectedUserFilter ? 'No releases by this artist' : 'No releases found'}
                                            </p>
                                        </div>
                                    ) : displayReleases.map((r, i) => (
                                        <motion.div
                                            key={r.id}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent overflow-hidden hover:border-white/10 transition-all group"
                                        >
                                            {/* Card header */}
                                            <div className="p-5 pb-4 flex items-start gap-4">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0 group-hover:scale-105 transition-transform duration-300">
                                                    {r.cover_url
                                                        ? <img src={r.cover_url} alt={r.title} className="w-full h-full object-cover" />
                                                        : <div className="w-full h-full flex items-center justify-center text-white/10"><Music className="w-6 h-6" /></div>
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <div className="min-w-0">
                                                            <h3 className="font-bold text-base text-white leading-tight truncate">{r.title}</h3>
                                                            <p className="text-[10px] text-white/40 font-medium mt-0.5">{r.artist}</p>
                                                        </div>
                                                        <select
                                                            value={r.status}
                                                            onChange={e => e.target.value === 'rejected' ? startRejectingRelease(r) : handleStatusChange(r.id, e.target.value)}
                                                            className={`text-[9px] font-black uppercase rounded-xl px-3 py-1.5 border outline-none cursor-pointer shrink-0 transition-all ${STATUS_COLORS[r.status] || 'bg-white/5 border-white/10 text-white/40'}`}
                                                        >
                                                            <option value="pending">Reviewing</option>
                                                            <option value="approved">Approved</option>
                                                            <option value="rejected">Rejected</option>
                                                            <option value="uploaded">Uploaded</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-2">
                                                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/30">{r.type}</span>
                                                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/30">{r.genre}</span>
                                                        {r.explicit === 'Yes' && <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400">E</span>}
                                                    </div>
                                                    {r.status === 'rejected' && (
                                                        <button onClick={() => startRejectingRelease(r)} className="mt-2 w-full flex items-start gap-1.5 text-left p-2 rounded-lg bg-red-500/5 border border-red-500/15 hover:border-red-500/30 transition-colors">
                                                            <span className="text-[8px] font-black uppercase text-red-400/60 shrink-0 mt-px">Reason</span>
                                                            <span className="text-[9px] font-medium text-red-300/80 line-clamp-2">{r.rejection_reason || 'No reason given — click to add one'}</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Audio */}
                                            {r.tracks && r.tracks.length > 0 ? (
                                                <div className="px-5 pb-4 space-y-2 max-h-48 overflow-y-auto">
                                                    {r.tracks.map((track, idx) => (
                                                        <div key={idx} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
                                                            <p className="text-[10px] font-bold text-white mb-1 truncate">{idx + 1}. {track.title} <span className="text-white/30">— {track.artist}</span></p>
                                                            <audio controls src={track.song_url} className="w-full h-7 invert opacity-30 hover:opacity-70 transition-opacity" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : r.song_file ? (
                                                <div className="px-5 pb-4">
                                                    <audio controls src={r.song_file} className="w-full h-8 invert opacity-30 hover:opacity-70 transition-opacity" />
                                                </div>
                                            ) : null}

                                            {/* Stats row */}
                                            <div className="px-5 pb-4">
                                                <div className="grid grid-cols-3 gap-2 rounded-xl bg-white/[0.02] border border-white/[0.05] p-3">
                                                    <div>
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/25 mb-0.5">Streams</p>
                                                        <p className="text-sm font-display text-white">{r.streams.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/25 mb-0.5">Revenue</p>
                                                        <p className="text-sm font-display text-emerald-400">₦{r.revenue.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/25 mb-0.5">Price</p>
                                                        <input
                                                            type="number"
                                                            className="w-full bg-transparent border-none p-0 text-sm font-display text-blue-400 focus:ring-0 outline-none"
                                                            defaultValue={r.price || 0}
                                                            onBlur={e => handleUpdatePrice(r.id, Number(e.target.value))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action buttons */}
                                            <div className="px-5 pb-5 flex gap-2">
                                                <button onClick={() => handleViewStats(r)} className="flex-1 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all flex items-center justify-center gap-1.5">
                                                    <TrendingUp className="w-3 h-3" /> Graph
                                                </button>
                                                <button onClick={() => setSelectedRelease(r)} className="flex-1 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all flex items-center justify-center gap-1.5">
                                                    <Eye className="w-3 h-3" /> Details
                                                </button>
                                                <button onClick={() => setEditingRelease(r)} className="flex-1 py-2.5 rounded-xl bg-red-500/8 hover:bg-red-600 border border-red-500/15 hover:border-red-600 text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-white transition-all flex items-center justify-center gap-1.5">
                                                    + Stats
                                                </button>
                                                <button onClick={() => handleDeleteRelease(r.id, r.title)} className="py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-red-500/15 border border-white/[0.06] hover:border-red-500/20 text-white/25 hover:text-red-400 transition-all flex items-center justify-center">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })()}

                    {/* PAYMENTS */}
                    {activeTab === 'payments' && (
                        <motion.div key="payments" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">

                            {/* ── All Active Subscribers (ground truth) ── */}
                            {(() => {
                                const subscribers = users.filter(u => u.subscription && u.subscription !== 'none');
                                return (
                                    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden">
                                        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between gap-4 flex-wrap">
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-0.5">All Time</p>
                                                <h2 className="text-base font-black uppercase tracking-tight">Active Subscribers</h2>
                                                <p className="text-[10px] text-white/30 mt-0.5 font-medium">Every user with a paid plan — the complete record regardless of when they subscribed</p>
                                            </div>
                                            <span className="text-[9px] font-black uppercase px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                                {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        {subscribers.length === 0 ? (
                                            <div className="py-16 text-center">
                                                <Users className="w-10 h-10 mx-auto mb-3 text-white/10" />
                                                <p className="text-xs font-black uppercase tracking-[0.3em] text-white/20">No active subscribers yet</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-white/[0.04]">
                                                {subscribers.map((u, i) => (
                                                    <motion.div
                                                        key={u._id}
                                                        initial={{ opacity: 0, x: -8 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.03 }}
                                                        className="px-4 sm:px-6 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                                                    >
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${AVATAR_BG[u.subscription] || AVATAR_BG['none']}`}>
                                                            {u.name?.[0]?.toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-white truncate">{u.name}{u.artisteName ? <span className="text-white/30 font-medium ml-1.5">· {u.artisteName}</span> : null}</p>
                                                            <p className="text-[10px] text-white/30 truncate">{u.email}{u.phone ? <span className="ml-2 text-white/20">{u.phone}</span> : null}</p>
                                                        </div>
                                                        <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border shrink-0 ${SUBSCRIPTION_STYLE[u.subscription] || SUBSCRIPTION_STYLE['none']}`}>
                                                            {PLAN_LABELS[u.subscription] || u.subscription}
                                                        </span>
                                                        <div className="text-right shrink-0">
                                                            <p className="text-[9px] text-white/25 font-medium">
                                                                {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </p>
                                                            {unrecordedPayers.some(up => up._id === u._id) && (
                                                                <span className="text-[8px] font-black text-amber-400 uppercase tracking-wide">no log</span>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Error banner */}
                            {paymentsError && (
                                <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {paymentsError}
                                </div>
                            )}

                            {/* Unrecorded payers — users with active subscriptions but no Payment log */}
                            {unrecordedPayers.length > 0 && (
                                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-amber-500/10 flex items-center gap-3">
                                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                                        <div className="flex-1">
                                            <h3 className="text-sm font-black uppercase text-amber-400 tracking-tight">Missing Payment Records — {unrecordedPayers.length} user{unrecordedPayers.length > 1 ? 's' : ''}</h3>
                                            <p className="text-[10px] text-amber-400/60 font-medium mt-0.5">These users have an active subscription but no Paystack payment log. They may have paid before payment tracking was enabled, or their payment record failed to save.</p>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-amber-500/10">
                                        {unrecordedPayers.map((u) => (
                                            <div key={u._id} className="px-6 py-4 flex items-center gap-4">
                                                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-black text-amber-400 text-sm shrink-0">
                                                    {u.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-white truncate">{u.name}</p>
                                                    <p className="text-[10px] text-white/30 truncate">{u.email}</p>
                                                </div>
                                                <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border shrink-0 ${SUBSCRIPTION_STYLE[u.subscription] || SUBSCRIPTION_STYLE['none']}`}>
                                                    {PLAN_LABELS[u.subscription] || u.subscription}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Verified payment records */}
                            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden">
                                <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between gap-4 flex-wrap">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-0.5">Finance</p>
                                        <h2 className="text-base font-black uppercase tracking-tight">Verified Payments</h2>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/25">{payments.length} records</span>
                                        <span className="text-[9px] font-black uppercase px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                            ₦{payments.reduce((s, p) => s + p.amount, 0).toLocaleString()} total
                                        </span>
                                    </div>
                                </div>
                                <div className="divide-y divide-white/[0.04]">
                                    {payments.map((p, i) => (
                                        <motion.div
                                            key={p._id}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/[0.02] transition-colors"
                                        >
                                            <div className="flex items-center gap-4 sm:flex-1">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-black text-emerald-400 shrink-0">
                                                    {p.user?.name?.[0]?.toUpperCase() ?? '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{p.user?.name}</p>
                                                    <p className="text-[10px] text-white/30 font-medium">{p.user?.email}</p>
                                                </div>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border w-fit ${SUBSCRIPTION_STYLE[p.plan] || SUBSCRIPTION_STYLE['none']}`}>
                                                {PLAN_LABELS[p.plan] || p.plan}
                                            </span>
                                            <div className="sm:text-right">
                                                <p className="text-xl font-display text-emerald-400 leading-none">₦{p.amount.toLocaleString()}</p>
                                                <p className="text-[9px] text-white/25 font-medium mt-0.5">{new Date(p.paid_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex flex-col items-start sm:items-end gap-1">
                                                <span className="text-[8px] font-black uppercase px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">{p.status}</span>
                                                <p className="text-[8px] font-mono text-white/20 truncate max-w-[140px]">{p.reference}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {payments.length === 0 && !paymentsError && (
                                        <div className="py-20 text-center">
                                            <CreditCard className="w-10 h-10 mx-auto mb-4 text-white/10" />
                                            <p className="text-xs font-black uppercase tracking-[0.3em] text-white/20">No verified payment records</p>
                                            <p className="text-[10px] text-white/15 mt-1">Paystack-verified payments appear here</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* PAYOUTS */}
                    {activeTab === 'payouts' && (
                        <motion.div key="payouts" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden">
                                <div className="px-6 py-5 border-b border-white/[0.06]">
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-0.5">Withdrawals</p>
                                    <h2 className="text-base font-black uppercase tracking-tight">Payout Requests <span className="text-white/20 font-bold ml-2">{payouts.length}</span></h2>
                                </div>
                                <div className="divide-y divide-white/[0.04]">
                                    {payouts.map((p, i) => (
                                        <motion.div
                                            key={p._id}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5 hover:bg-white/[0.02] transition-colors"
                                        >
                                            <div className="flex items-center gap-4 sm:flex-1">
                                                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center font-black text-red-400 shrink-0">
                                                    {p.user?.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{p.user?.name}</p>
                                                    <p className="text-[10px] text-white/30">{p.user?.email}</p>
                                                </div>
                                            </div>

                                            <div className="sm:text-right">
                                                <p className="text-2xl font-display text-red-500 leading-none">₦{p.amount.toLocaleString()}</p>
                                                <p className="text-[9px] text-white/25 mt-0.5">{new Date(p.created_at).toLocaleDateString()}</p>
                                            </div>

                                            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 sm:min-w-[180px]">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-red-500/70 mb-1">{p.bankName}</p>
                                                <p className="text-sm font-mono tracking-widest text-white/80">{p.accountNumber}</p>
                                                <p className="text-[9px] text-white/30 uppercase font-bold mt-0.5">{p.accountName}</p>
                                            </div>

                                            <select
                                                value={p.status}
                                                onChange={e => handlePayoutStatus(p._id, e.target.value)}
                                                className={`text-[9px] font-black uppercase rounded-xl px-4 py-3 border outline-none cursor-pointer transition-all ${
                                                    p.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    p.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    p.status === 'Processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-white/[0.04] text-white/40 border-white/[0.06]'
                                                }`}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </motion.div>
                                    ))}
                                    {payouts.length === 0 && (
                                        <div className="py-24 text-center">
                                            <Wallet className="w-12 h-12 mx-auto mb-4 text-white/10" />
                                            <p className="text-xs font-black uppercase tracking-[0.3em] text-white/20">No payout requests</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* SUPPORT */}
                    {activeTab === 'support' && (
                        <motion.div key="support" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden">
                                <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-0.5">Inbox</p>
                                        <h2 className="text-base font-black uppercase tracking-tight">Support Tickets <span className="text-white/20 font-bold ml-2">{tickets.length}</span></h2>
                                    </div>
                                    {unreadCount > 0 && (
                                        <span className="text-[9px] font-black uppercase px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                                            {unreadCount} unread
                                        </span>
                                    )}
                                </div>
                                <div className="divide-y divide-white/[0.04]">
                                    {tickets.map((t, i) => (
                                        <motion.div
                                            key={t._id}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            onClick={() => handleOpenAdminTicket(t)}
                                            className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] cursor-pointer transition-colors group"
                                        >
                                            <div className="flex items-start gap-3">
                                                {t.unreadAdmin && <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse" />}
                                                <div>
                                                    <p className={`text-sm font-bold mb-0.5 ${t.unreadAdmin ? 'text-white' : 'text-white/70'}`}>{t.subject}</p>
                                                    <p className="text-[10px] text-white/30 font-medium">{t.user?.name} · {t.user?.email}</p>
                                                    <p className="text-[9px] text-white/20 mt-1">{new Date(t.updatedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border ${
                                                    t.status === 'Resolved'
                                                        ? 'bg-white/[0.04] border-white/[0.06] text-white/30'
                                                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                                                }`}>
                                                    {t.status}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                                            </div>
                                        </motion.div>
                                    ))}
                                    {tickets.length === 0 && (
                                        <div className="py-24 text-center">
                                            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-white/10" />
                                            <p className="text-xs font-black uppercase tracking-[0.3em] text-white/20">No tickets</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* PROMOTE */}
                    {activeTab === 'promote' && (
                        <motion.div key="promote" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                            <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl mb-6 w-fit">
                                {(['playlists', 'submissions'] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setPromoteSubTab(t)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${promoteSubTab === t ? 'bg-red-600 text-white' : 'text-white/40 hover:text-white/70'}`}
                                    >
                                        {t === 'playlists' ? 'Playlists' : `Submissions ${promoSubmissions.filter(s => s.status === 'pending').length > 0 ? `(${promoSubmissions.filter(s => s.status === 'pending').length})` : ''}`}
                                    </button>
                                ))}
                            </div>

                            {promoteSubTab === 'playlists' && (
                                <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden">
                                    <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-0.5">Promote Page</p>
                                            <h2 className="text-base font-black uppercase tracking-tight">Playlists <span className="text-white/20 font-bold ml-2">{playlists.length}</span></h2>
                                        </div>
                                        <button onClick={startNewPlaylist} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all">
                                            <Plus className="w-3.5 h-3.5" /> Add Playlist
                                        </button>
                                    </div>
                                    <div className="divide-y divide-white/[0.04]">
                                        {playlists.map(p => (
                                            <div key={p._id} className="px-4 sm:px-6 py-4 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
                                                    {p.cover ? <img src={p.cover} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/10"><ListMusic className="w-5 h-5" /></div>}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold text-white truncate">{p.name}</p>
                                                    <p className="text-[10px] text-white/30 font-medium truncate">{p.curator}</p>
                                                </div>
                                                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg border shrink-0 ${p.active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-white/30'}`}>
                                                    {p.active ? 'Live' : 'Hidden'}
                                                </span>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <button onClick={() => handleTogglePlaylistActive(p)} title={p.active ? 'Hide from Promote page' : 'Show on Promote page'} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white transition-all">
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white transition-all">
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                    <button onClick={() => startEditPlaylist(p)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-blue-400 transition-all">
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDeletePlaylist(p._id, p.name)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-red-400 transition-all">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {playlists.length === 0 && (
                                            <div className="py-24 text-center">
                                                <ListMusic className="w-12 h-12 mx-auto mb-4 text-white/10" />
                                                <p className="text-xs font-black uppercase tracking-[0.3em] text-white/20">No playlists yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {promoteSubTab === 'submissions' && (
                                <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden">
                                    <div className="px-6 py-5 border-b border-white/[0.06]">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-0.5">Promote Page</p>
                                        <h2 className="text-base font-black uppercase tracking-tight">Submissions <span className="text-white/20 font-bold ml-2">{promoSubmissions.length}</span></h2>
                                    </div>
                                    <div className="divide-y divide-white/[0.04]">
                                        {promoSubmissions.map(s => (
                                            <div key={s._id} className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-white truncate">{s.artiste_name}</p>
                                                    <p className="text-[10px] text-white/30 font-medium truncate">{s.email}</p>
                                                    <a href={s.spotify_link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-red-400 hover:text-red-300 font-bold inline-flex items-center gap-1 mt-0.5">
                                                        Spotify Link <ExternalLink className="w-2.5 h-2.5" />
                                                    </a>
                                                    {s.attachment_url && (
                                                        <a href={s.attachment_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/40 hover:text-white font-bold inline-flex items-center gap-1 mt-0.5 ml-3">
                                                            <Paperclip className="w-2.5 h-2.5" /> Attachment
                                                        </a>
                                                    )}
                                                    <p className="text-[9px] text-white/20 mt-1">{new Date(s.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border ${s.status === 'reviewed' ? 'bg-white/[0.04] border-white/[0.06] text-white/30' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                                                        {s.status}
                                                    </span>
                                                    {s.status === 'pending' && (
                                                        <button onClick={() => handleMarkSubmissionReviewed(s._id)} className="text-[9px] font-black uppercase px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all">
                                                            Mark Reviewed
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {promoSubmissions.length === 0 && (
                                            <div className="py-24 text-center">
                                                <Send className="w-12 h-12 mx-auto mb-4 text-white/10" />
                                                <p className="text-xs font-black uppercase tracking-[0.3em] text-white/20">No submissions yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* NOTIFICATIONS */}
                    {activeTab === 'notifications' && (
                        <motion.div key="notifications" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden">
                                <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-0.5">Broadcast Center</p>
                                        <h2 className="text-base font-black uppercase tracking-tight">Notifications <span className="text-white/20 font-bold ml-2">{notifications.length}</span></h2>
                                    </div>
                                    <button onClick={() => { resetNotificationForm(); setShowNewNotification(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all">
                                        <Plus className="w-3.5 h-3.5" /> New Notification
                                    </button>
                                </div>
                                <div className="divide-y divide-white/[0.04]">
                                    {notifications.map(n => {
                                        const tmpl = NOTIFICATION_TEMPLATES.find(t => t.id === n.template) || NOTIFICATION_TEMPLATES[0];
                                        const TmplIcon = tmpl.icon;
                                        return (
                                            <div key={n._id} className="px-4 sm:px-6 py-4 flex items-start gap-4">
                                                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${tmpl.accent}`}>
                                                    <TmplIcon className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold text-white truncate">{n.title}</p>
                                                    <p className="text-[10px] text-white/30 font-medium truncate mt-0.5">{n.message}</p>
                                                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/40">
                                                            {n.audience === 'individual' ? `${n.target_user?.name || 'Artist'}` : AUDIENCE_LABELS[n.audience]}
                                                        </span>
                                                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/40">{tmpl.label}</span>
                                                        <span className="text-[8px] text-white/20">{new Date(n.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button onClick={() => handleToggleNotificationActive(n)} className={`text-[8px] font-black uppercase px-2.5 py-1.5 rounded-lg border transition-all ${n.active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-white/30'}`}>
                                                        {n.active ? 'Live' : 'Hidden'}
                                                    </button>
                                                    <button onClick={() => handleDeleteNotification(n._id, n.title)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-red-400 transition-all">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {notifications.length === 0 && (
                                        <div className="py-24 text-center">
                                            <Bell className="w-12 h-12 mx-auto mb-4 text-white/10" />
                                            <p className="text-xs font-black uppercase tracking-[0.3em] text-white/20">No notifications sent yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* ══════════════════════ MODALS ══════════════════════ */}

            {/* Update Stats Modal */}
            <AnimatePresence>
                {editingRelease && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }} className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0a0a0a] overflow-hidden">
                            <div className="px-6 py-5 border-b border-white/[0.06] flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500 mb-0.5">Admin Action</p>
                                    <h3 className="text-lg font-display uppercase">Update Stats</h3>
                                    <p className="text-[10px] text-white/30 mt-0.5">{editingRelease.title} — {editingRelease.artist}</p>
                                </div>
                                <button onClick={() => setEditingRelease(null)} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateStats} className="p-6 space-y-4">
                                <div>
                                    <label className={labelCls}>Period</label>
                                    <input type="text" required placeholder="e.g. March 2024" className={inputCls} value={statsForm.date} onChange={e => setStatsForm({ ...statsForm, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelCls}>Platform</label>
                                    <select className={inputCls} value={statsForm.platform} onChange={e => setStatsForm({ ...statsForm, platform: e.target.value })}>
                                        {Object.keys(PLATFORM_COLORS).filter(k => k !== 'Overall').map(p => <option key={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelCls}>New Streams</label>
                                        <input type="number" required min="0" className={inputCls} value={statsForm.streams || ''} onChange={e => setStatsForm({ ...statsForm, streams: parseInt(e.target.value) || 0 })} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Revenue (₦)</label>
                                        <input type="number" required min="0" step="0.01" className={inputCls} value={statsForm.revenue || ''} onChange={e => setStatsForm({ ...statsForm, revenue: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setEditingRelease(null)} className="flex-1 py-3 rounded-xl border border-white/[0.06] text-xs font-black uppercase tracking-wider text-white/40 hover:text-white hover:bg-white/[0.04] transition-all">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-red-600/20">Submit</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* Reject Release Modal */}
                {rejectingRelease && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }} className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0a0a0a] overflow-hidden">
                            <div className="px-6 py-5 border-b border-white/[0.06] flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500 mb-0.5">Admin Action</p>
                                    <h3 className="text-lg font-display uppercase">Reject Release</h3>
                                    <p className="text-[10px] text-white/30 mt-0.5">{rejectingRelease.title} — {rejectingRelease.artist}</p>
                                </div>
                                <button onClick={() => setRejectingRelease(null)} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <form onSubmit={handleConfirmRejection} className="p-6 space-y-4">
                                <div>
                                    <label className={labelCls}>Reason for Rejection</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Explain what the artist needs to fix, e.g. cover art resolution, missing metadata…"
                                        className={`${inputCls} resize-none`}
                                        value={rejectionReasonInput}
                                        onChange={e => setRejectionReasonInput(e.target.value)}
                                    />
                                    <p className="text-[9px] text-white/25 mt-1.5">The artist will see this message on their release.</p>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setRejectingRelease(null)} className="flex-1 py-3 rounded-xl border border-white/[0.06] text-xs font-black uppercase tracking-wider text-white/40 hover:text-white hover:bg-white/[0.04] transition-all">Cancel</button>
                                    <button type="submit" disabled={savingRejection} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 disabled:opacity-50">
                                        {savingRejection ? 'Saving…' : 'Confirm Rejection'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* Growth Graph Modal */}
                {viewingRelease && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/85 backdrop-blur-2xl flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="w-full max-w-4xl rounded-2xl border border-white/[0.08] bg-[#0a0a0a] overflow-hidden">
                            <div className="px-6 py-5 border-b border-white/[0.06] flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-red-500 mb-1">Performance Graph</p>
                                    <h3 className="text-xl font-display uppercase leading-none">{viewingRelease.title}</h3>
                                    <p className="text-[10px] text-white/30 mt-1 font-medium">by {viewingRelease.artist}</p>
                                </div>
                                <button onClick={() => setViewingRelease(null)} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white transition-colors shrink-0">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-6 h-72 sm:h-96">
                                {loadingHistory ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full rounded-xl border border-white/[0.05] bg-white/[0.02]">
                                        <TrendingUp className="w-10 h-10 text-white/10 mb-3" />
                                        <p className="text-xs font-black uppercase tracking-widest text-white/20">No history data yet</p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={Object.values(history.reduce((acc: any, curr: any) => {
                                            if (!acc[curr.date]) acc[curr.date] = { date: curr.date };
                                            acc[curr.date][curr.platform || 'Overall'] = curr.streams;
                                            return acc;
                                        }, {}))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#444', fontWeight: 800 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 10, fill: '#444', fontWeight: 800 }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff' }} itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }} cursor={{ stroke: '#dc2626', strokeWidth: 1 }} />
                                            <Legend verticalAlign="top" align="right" iconType="circle" />
                                            {Array.from(new Set(history.map((h: any) => h.platform || 'Overall'))).map((platform: any) => (
                                                <Line key={platform} type="monotone" dataKey={platform} stroke={PLATFORM_COLORS[platform as string] || '#fff'} strokeWidth={2.5} dot={false} activeDot={{ r: 6, stroke: '#000', strokeWidth: 2 }} name={platform} />
                                            ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Release Details Modal */}
                {selectedRelease && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.96, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 12 }} className="w-full max-w-5xl rounded-2xl border border-white/[0.08] bg-[#080808] flex flex-col h-[92vh]">
                            {/* Modal Header */}
                            <div className="p-4 sm:p-6 border-b border-white/[0.06] flex items-start justify-between gap-4 bg-white/[0.02]">
                                <div className="flex gap-4 sm:gap-6 min-w-0">
                                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shrink-0">
                                        {selectedRelease.cover_url
                                            ? <img src={selectedRelease.cover_url} alt={selectedRelease.title} className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center text-white/10"><Music className="w-8 h-8" /></div>
                                        }
                                    </div>
                                    <div className="pt-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg border ${STATUS_COLORS[selectedRelease.status] || 'bg-white/5 border-white/10 text-white/30'}`}>{selectedRelease.status}</span>
                                            <span className="text-[8px] font-black uppercase text-white/25">{selectedRelease.type} · {selectedRelease.genre}</span>
                                        </div>
                                        <h2 className="text-xl sm:text-3xl font-display uppercase italic tracking-tight text-white leading-none truncate">{selectedRelease.title}</h2>
                                        <p className="text-xs font-bold text-white/40 mt-1.5 uppercase tracking-widest">by {selectedRelease.artist}</p>
                                        {selectedRelease.featured_artists && selectedRelease.featured_artists.length > 0 && (
                                            <p className="text-[10px] text-white/25 italic mt-0.5">ft. {selectedRelease.featured_artists.join(', ')}</p>
                                        )}
                                    </div>
                                </div>
                                <button onClick={closeReleaseModal} className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white transition-colors shrink-0">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
                                {selectedRelease.status === 'rejected' && (
                                    <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5 flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500 mb-1.5">Rejection Reason</p>
                                            <p className="text-sm text-white/70 leading-relaxed">{selectedRelease.rejection_reason || 'No reason given yet.'}</p>
                                        </div>
                                        <button onClick={() => startRejectingRelease(selectedRelease)} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-red-500 transition-colors shrink-0">
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                                <div className="grid sm:grid-cols-3 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-red-500/15 pb-2">
                                            <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-red-500">Identification</h4>
                                            {!editingIdentifiers && (
                                                <button onClick={startEditingIdentifiers} className="text-white/30 hover:text-red-500 transition-colors">
                                                    <Pencil className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                        {editingIdentifiers ? (
                                            <form onSubmit={handleUpdateIdentifiers} className="space-y-3">
                                                <div>
                                                    <label className={labelCls}>ISRC</label>
                                                    <input type="text" placeholder="e.g. USRC17607839" className={inputCls} value={identifierForm.isrc} onChange={e => setIdentifierForm({ ...identifierForm, isrc: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className={labelCls}>UPC</label>
                                                    <input type="text" placeholder="e.g. 093624947405" className={inputCls} value={identifierForm.upc} onChange={e => setIdentifierForm({ ...identifierForm, upc: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className={labelCls}>Label</label>
                                                    <input type="text" placeholder="Indie / None" className={inputCls} value={identifierForm.label} onChange={e => setIdentifierForm({ ...identifierForm, label: e.target.value })} />
                                                </div>
                                                <div className="flex gap-2 pt-1">
                                                    <button type="button" onClick={() => setEditingIdentifiers(false)} className="flex-1 py-2.5 rounded-xl border border-white/[0.06] text-[10px] font-black uppercase tracking-wider text-white/40 hover:text-white hover:bg-white/[0.04] transition-all">Cancel</button>
                                                    <button type="submit" disabled={savingIdentifiers} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50">
                                                        {savingIdentifiers ? 'Saving…' : 'Save'}
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            [
                                                { label: 'ISRC', value: selectedRelease.isrc || 'Not assigned' },
                                                { label: 'UPC', value: selectedRelease.upc || 'Not assigned' },
                                                { label: 'Label', value: selectedRelease.label || 'Indie / None' },
                                            ].map(item => (
                                                <div key={item.label}>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/25 mb-1">{item.label}</p>
                                                    <p className="text-xs font-mono tracking-wider text-white/70">{item.value}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500 border-b border-blue-500/15 pb-2">Technical Specs</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { label: 'Language', value: selectedRelease.language || 'English' },
                                                { label: 'Explicit', value: selectedRelease.explicit || 'No' },
                                                { label: 'AI Assisted', value: selectedRelease.ai_assisted || 'No' },
                                                { label: 'Instrumental', value: selectedRelease.is_instrumental ? 'Yes' : 'No' },
                                            ].map(item => (
                                                <div key={item.label}>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/25 mb-0.5">{item.label}</p>
                                                    <p className={`text-xs font-bold uppercase ${item.label === 'Explicit' && item.value === 'Yes' ? 'text-red-400' : 'text-white/60'}`}>{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-500 border-b border-purple-500/15 pb-2">Rights & Timeline</h4>
                                        {[
                                            { label: 'Release Date', value: selectedRelease.release_date ? new Date(selectedRelease.release_date).toLocaleDateString() : 'TBD' },
                                            { label: 'Copyright (Recording)', value: `© ${selectedRelease.copyright_date_recording || 'N/A'}` },
                                            { label: 'Copyright (Composition)', value: `℗ ${selectedRelease.copyright_date_release || 'N/A'}` },
                                        ].map(item => (
                                            <div key={item.label}>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-white/25 mb-0.5">{item.label}</p>
                                                <p className="text-xs font-bold text-white/60">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 border-b border-white/[0.06] pb-2 mb-4">Production Team</h4>
                                        {selectedRelease.contributors && selectedRelease.contributors.length > 0 ? (
                                            <div className="space-y-2">
                                                {selectedRelease.contributors.map((c: any, idx: number) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                                                        <span className="text-sm font-bold text-white">{c.name}</span>
                                                        <span className="text-[8px] font-black uppercase text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/15">{c.role}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <p className="text-xs text-white/20 italic">No contributors listed</p>}
                                    </div>
                                    <div>
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 border-b border-white/[0.06] pb-2 mb-4">Songwriters & Musicians</h4>
                                        {selectedRelease.songwriters && selectedRelease.songwriters.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {selectedRelease.songwriters.map((s: string, idx: number) => (
                                                    <span key={idx} className="text-xs font-bold text-white/60 bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-xl">{s}</span>
                                                ))}
                                            </div>
                                        )}
                                        {selectedRelease.musicians && selectedRelease.musicians.length > 0 ? (
                                            <div className="space-y-1.5">
                                                {selectedRelease.musicians.map((m: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between text-xs">
                                                        <span className="text-white/60 font-bold">{m.name}</span>
                                                        <span className="text-white/25 uppercase font-bold">{m.instrument}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (!selectedRelease.songwriters?.length && <p className="text-xs text-white/20 italic">None listed</p>)}
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 border-b border-white/[0.06] pb-2 mb-4">Audio</h4>
                                        {selectedRelease.song_file
                                            ? <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4"><audio controls src={selectedRelease.song_file} className="w-full h-10 invert" /></div>
                                            : <div className="rounded-xl border border-dashed border-white/[0.06] p-8 text-center text-white/20 text-xs font-bold">No audio file</div>
                                        }
                                    </div>
                                    <div>
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 border-b border-white/[0.06] pb-2 mb-4">Lyrics</h4>
                                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4 max-h-40 overflow-y-auto text-xs text-white/40 italic leading-relaxed whitespace-pre-wrap">
                                            {selectedRelease.lyrics || 'No lyrics provided.'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 sm:p-6 border-t border-white/[0.06] bg-black/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex flex-wrap gap-4">
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-0.5">Contact</p>
                                        <p className="text-xs font-bold text-white/50 break-all">{selectedRelease.contact_email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-0.5">Artist Email</p>
                                        <p className="text-xs font-bold text-white/50 break-all">{selectedRelease.user?.email}</p>
                                    </div>
                                </div>
                                <button onClick={closeReleaseModal} className="w-full sm:w-auto px-8 py-3 bg-white text-black rounded-xl text-xs font-black uppercase tracking-wider hover:bg-zinc-100 transition-colors">Dismiss</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Artist Modal */}
            <AnimatePresence>
                {showCreateUser && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4" onClick={() => setShowCreateUser(false)}>
                        <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }} className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0a0a0a] overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500 mb-0.5">Admin Action</p>
                                    <h3 className="text-lg font-display uppercase">Create Artist</h3>
                                </div>
                                <button onClick={() => setShowCreateUser(false)} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                                <div><label className={labelCls}>Full Name</label><input type="text" required placeholder="Artist or Band Name" className={inputCls} value={createUserForm.name} onChange={e => setCreateUserForm({ ...createUserForm, name: e.target.value })} /></div>
                                <div><label className={labelCls}>Email Address</label><input type="email" required placeholder="artist@example.com" className={inputCls} value={createUserForm.email} onChange={e => setCreateUserForm({ ...createUserForm, email: e.target.value })} /></div>
                                <div><label className={labelCls}>Password</label><input type="password" required placeholder="Minimum 8 characters" className={inputCls} value={createUserForm.password} onChange={e => setCreateUserForm({ ...createUserForm, password: e.target.value })} /></div>
                                <div>
                                    <label className={labelCls}>Subscription Tier</label>
                                    <select className={inputCls} value={createUserForm.subscription} onChange={e => setCreateUserForm({ ...createUserForm, subscription: e.target.value })}>
                                        <option value="none">Free</option>
                                        <option value="basic">Artiste Plan</option>
                                        <option value="premium">Record Label</option>
                                        <option value="plus">Record Label Plus</option>
                                        <option value="standard">Enterprise</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowCreateUser(false)} className="flex-1 py-3 rounded-xl border border-white/[0.06] text-xs font-black uppercase tracking-wider text-white/40 hover:text-white hover:bg-white/[0.04] transition-all">Cancel</button>
                                    <button type="submit" disabled={creatingUser} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2">
                                        {creatingUser ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><UserPlus className="w-4 h-4" /> Create</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit User Modal */}
            <AnimatePresence>
                {editingUser && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4" onClick={() => setEditingUser(null)}>
                        <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }} className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0a0a0a] overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500 mb-0.5">Admin Action</p>
                                    <h3 className="text-lg font-display uppercase">Edit Artist</h3>
                                    <p className="text-[10px] text-white/30 mt-0.5">{editingUser.email}</p>
                                </div>
                                <button onClick={() => setEditingUser(null)} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="overflow-y-auto max-h-[75vh]">
                            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                                <div><label className={labelCls}>Full Name</label><input type="text" required placeholder="Artist or Band Name" className={inputCls} value={editUserForm.name} onChange={e => setEditUserForm({ ...editUserForm, name: e.target.value })} /></div>
                                <div><label className={labelCls}>Email Address</label><input type="email" required className={inputCls} value={editUserForm.email} onChange={e => setEditUserForm({ ...editUserForm, email: e.target.value })} /></div>
                                <div><label className={labelCls}>New Password <span className="text-white/20 normal-case font-medium">(leave blank to keep)</span></label><input type="password" placeholder="New password" className={inputCls} value={editUserForm.password} onChange={e => setEditUserForm({ ...editUserForm, password: e.target.value })} /></div>
                                <div>
                                    <label className={labelCls}>Subscription Tier</label>
                                    <select className={inputCls} value={editUserForm.subscription} onChange={e => setEditUserForm({ ...editUserForm, subscription: e.target.value })}>
                                        <option value="none">Free</option>
                                        <option value="basic">Artiste Plan</option>
                                        <option value="premium">Record Label</option>
                                        <option value="plus">Record Label Plus</option>
                                        <option value="standard">Enterprise</option>
                                    </select>
                                </div>

                                {/* Read-only artist profile info */}
                                {(editingUser?.artisteName || editingUser?.phone || editingUser?.whatsapp || editingUser?.stateOfOrigin || editingUser?.nationality || editingUser?.socialLink) && (
                                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Artist Profile</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                                            {editingUser.artisteName && (
                                                <div className="sm:col-span-2">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/25 mb-0.5">Artiste Name</p>
                                                    <p className="text-sm font-bold text-white">{editingUser.artisteName}</p>
                                                </div>
                                            )}
                                            {editingUser.phone && (
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/25 mb-0.5">Phone</p>
                                                    <p className="text-xs font-medium text-white/70">{editingUser.phone}</p>
                                                </div>
                                            )}
                                            {editingUser.whatsapp && (
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/25 mb-0.5">WhatsApp</p>
                                                    <p className="text-xs font-medium text-white/70">{editingUser.whatsapp}</p>
                                                </div>
                                            )}
                                            {editingUser.stateOfOrigin && (
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/25 mb-0.5">State of Origin</p>
                                                    <p className="text-xs font-medium text-white/70">{editingUser.stateOfOrigin}</p>
                                                </div>
                                            )}
                                            {editingUser.nationality && (
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/25 mb-0.5">Nationality</p>
                                                    <p className="text-xs font-medium text-white/70">{editingUser.nationality}</p>
                                                </div>
                                            )}
                                            {editingUser.socialLink && (
                                                <div className="col-span-2">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/25 mb-0.5">IG / FB Link</p>
                                                    <a href={editingUser.socialLink} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-400 hover:text-blue-300 truncate block transition-colors">{editingUser.socialLink}</a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-3 rounded-xl border border-white/[0.06] text-xs font-black uppercase tracking-wider text-white/40 hover:text-white hover:bg-white/[0.04] transition-all">Cancel</button>
                                    <button type="submit" disabled={updatingUser} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2">
                                        {updatingUser ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Pencil className="w-4 h-4" /> Save</>}
                                    </button>
                                </div>
                            </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create/Edit Playlist Modal */}
            <AnimatePresence>
                {editingPlaylist && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }} className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0a0a0a] overflow-hidden">
                            <div className="px-6 py-5 border-b border-white/[0.06] flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500 mb-0.5">Promote Page</p>
                                    <h3 className="text-lg font-display uppercase">{editingPlaylist === 'new' ? 'Add Playlist' : 'Edit Playlist'}</h3>
                                </div>
                                <button onClick={() => setEditingPlaylist(null)} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <form onSubmit={handleSavePlaylist} className="p-6 space-y-4">
                                <div>
                                    <label className={labelCls}>Playlist Name</label>
                                    <input type="text" required placeholder="e.g. Afro Replay" className={inputCls} value={playlistForm.name} onChange={e => setPlaylistForm({ ...playlistForm, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelCls}>Curator</label>
                                    <input type="text" placeholder="Curated by Ayinz" className={inputCls} value={playlistForm.curator} onChange={e => setPlaylistForm({ ...playlistForm, curator: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelCls}>Cover Image</label>
                                    <label htmlFor="playlist-cover-upload"
                                        className={`py-6 border-2 border-dashed rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${playlistCoverFile || playlistForm.cover ? 'border-red-600/30 bg-red-600/5' : 'border-white/10 bg-black/20 hover:border-white/20'}`}>
                                        {playlistCoverFile ? (
                                            <img src={URL.createObjectURL(playlistCoverFile)} alt="Cover preview" className="w-16 h-16 rounded-lg object-cover" />
                                        ) : playlistForm.cover ? (
                                            <img src={playlistForm.cover} alt="Cover preview" className="w-16 h-16 rounded-lg object-cover" />
                                        ) : (
                                            <Upload className="w-4 h-4 text-white/30" />
                                        )}
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
                                            {playlistCoverFile ? playlistCoverFile.name : playlistForm.cover ? 'Replace cover image' : 'Upload a cover image'}
                                        </p>
                                        <input id="playlist-cover-upload" type="file" accept="image/*" className="sr-only"
                                            onChange={e => { if (e.target.files?.[0]) setPlaylistCoverFile(e.target.files[0]); }} />
                                    </label>
                                    <input type="text" placeholder="…or paste a cover image URL instead" className={`${inputCls} mt-2`}
                                        value={playlistForm.cover} onChange={e => { setPlaylistForm({ ...playlistForm, cover: e.target.value }); setPlaylistCoverFile(null); }} />
                                </div>
                                <div>
                                    <label className={labelCls}>Spotify URL</label>
                                    <input type="text" required placeholder="https://open.spotify.com/playlist/..." className={inputCls} value={playlistForm.url} onChange={e => setPlaylistForm({ ...playlistForm, url: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-3 items-end">
                                    <div>
                                        <label className={labelCls}>Order</label>
                                        <input type="number" className={inputCls} value={playlistForm.order} onChange={e => setPlaylistForm({ ...playlistForm, order: parseInt(e.target.value) || 0 })} />
                                    </div>
                                    <button type="button" onClick={() => setPlaylistForm({ ...playlistForm, active: !playlistForm.active })}
                                        className={`h-[46px] rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${playlistForm.active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/[0.04] border-white/[0.06] text-white/40'}`}>
                                        {playlistForm.active ? 'Live on Site' : 'Hidden'}
                                    </button>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setEditingPlaylist(null)} className="flex-1 py-3 rounded-xl border border-white/[0.06] text-xs font-black uppercase tracking-wider text-white/40 hover:text-white hover:bg-white/[0.04] transition-all">Cancel</button>
                                    <button type="submit" disabled={savingPlaylist} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 disabled:opacity-50">
                                        {savingPlaylist ? 'Saving…' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* New Notification Modal */}
            <AnimatePresence>
                {showNewNotification && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }} className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0a0a0a] overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="px-6 py-5 border-b border-white/[0.06] flex items-start justify-between gap-4 shrink-0">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500 mb-0.5">Broadcast Center</p>
                                    <h3 className="text-lg font-display uppercase">New Notification</h3>
                                </div>
                                <button onClick={() => setShowNewNotification(false)} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={handleCreateNotification} className="p-6 space-y-5 overflow-y-auto">
                                <div>
                                    <label className={labelCls}>Send To</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['public', 'all_users', 'individual'] as const).map(a => (
                                            <button key={a} type="button" onClick={() => setNotificationForm({ ...notificationForm, audience: a })}
                                                className={`py-3 px-2 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all ${notificationForm.audience === a ? 'bg-red-600 border-red-600 text-white' : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70'}`}>
                                                {a === 'public' ? 'Everyone' : a === 'all_users' ? 'All Accounts' : 'One Artist'}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[9px] text-white/25 mt-1.5">
                                        {notificationForm.audience === 'public' && 'Pops up on the public landing page for any visitor, account or not.'}
                                        {notificationForm.audience === 'all_users' && 'Pops up on the dashboard for every artist with an account.'}
                                        {notificationForm.audience === 'individual' && 'Pops up only for the specific artist you choose below.'}
                                    </p>
                                </div>

                                {notificationForm.audience === 'individual' && (
                                    <div>
                                        <label className={labelCls}>Artist</label>
                                        <select className={inputCls} value={notificationForm.target_user} onChange={e => setNotificationForm({ ...notificationForm, target_user: e.target.value })}>
                                            <option value="">Select an artist…</option>
                                            {users.map(u => <option key={u._id} value={u._id}>{u.name} — {u.email}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className={labelCls}>Template</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {NOTIFICATION_TEMPLATES.map(t => (
                                            <button key={t.id} type="button" onClick={() => setNotificationForm({ ...notificationForm, template: t.id })}
                                                className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left ${notificationForm.template === t.id ? 'border-red-600 bg-red-600/10' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'}`}>
                                                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${t.accent}`}>
                                                    <t.icon className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-[10px] font-bold text-white/70">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className={labelCls}>Title</label>
                                    <input type="text" required placeholder="e.g. New Payout Cycle Starts Monday" className={inputCls} value={notificationForm.title} onChange={e => setNotificationForm({ ...notificationForm, title: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelCls}>Message</label>
                                    <textarea required rows={4} placeholder="Write the notification body…" className={`${inputCls} resize-none`} value={notificationForm.message} onChange={e => setNotificationForm({ ...notificationForm, message: e.target.value })} />
                                </div>

                                <div>
                                    <label className={labelCls}>Image (Optional)</label>
                                    <div onClick={() => document.getElementById('notification-image-upload')?.click()}
                                        className={`py-6 border-2 border-dashed rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${notificationImage ? 'border-red-600/30 bg-red-600/5' : 'border-white/10 bg-black/20 hover:border-white/20'}`}>
                                        <Upload className={`w-4 h-4 ${notificationImage ? 'text-red-500' : 'text-white/30'}`} />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60">{notificationImage ? notificationImage.name : 'Attach an image'}</p>
                                        <input id="notification-image-upload" type="file" accept="image/*" className="sr-only" onChange={e => { if (e.target.files?.[0]) setNotificationImage(e.target.files[0]); }} />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowNewNotification(false)} className="flex-1 py-3 rounded-xl border border-white/[0.06] text-xs font-black uppercase tracking-wider text-white/40 hover:text-white hover:bg-white/[0.04] transition-all">Cancel</button>
                                    <button type="submit" disabled={savingNotification} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 disabled:opacity-50">
                                        {savingNotification ? 'Sending…' : 'Send Notification'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Support Ticket Chat Modal */}
            {activeTicket && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                    <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 30 }} className="w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl border border-white/[0.08] bg-[#080808] flex flex-col h-[90vh] sm:h-[80vh]">
                        <div className="px-5 py-4 border-b border-white/[0.06] flex items-start justify-between gap-4 bg-white/[0.02]">
                            <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500 mb-0.5">{activeTicket.user?.name} · {activeTicket.user?.email}</p>
                                <h3 className="text-sm font-bold text-white truncate">{activeTicket.subject}</h3>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <select value={activeTicket.status} onChange={e => handleTicketStatus(activeTicket._id, e.target.value)} className="bg-white/[0.04] border border-white/[0.06] text-[9px] font-black uppercase tracking-wider rounded-lg px-3 py-2 text-white/50 focus:border-red-600/40 outline-none">
                                    <option value="Open">Open</option>
                                    <option value="Resolved">Resolved</option>
                                </select>
                                <button onClick={() => setActiveTicket(null)} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-5">
                            {activeTicket.messages.map((msg, idx) => {
                                const isAdmin = msg.sender === 'admin';
                                return (
                                    <div key={idx} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                                        <div className={`flex items-center gap-2 mb-1.5 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${isAdmin ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                                                {isAdmin ? <LayoutDashboard className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                                                {isAdmin ? 'Admin' : activeTicket.user?.name}
                                            </span>
                                        </div>
                                        <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed whitespace-pre-wrap ${isAdmin
                                            ? 'bg-zinc-900 border border-white/[0.06] text-white/80 rounded-tr-sm'
                                            : 'bg-white/[0.04] border border-white/[0.06] text-white/60 rounded-tl-sm'
                                        }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <form onSubmit={handleTicketReply} className="p-4 border-t border-white/[0.06] bg-black/40 flex gap-3">
                            <input
                                type="text"
                                value={replyMessage}
                                onChange={e => setReplyMessage(e.target.value)}
                                placeholder="Type your reply…"
                                className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:border-white/15 outline-none font-medium"
                            />
                            <button type="submit" disabled={!replyMessage.trim() || replying} className="px-5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black transition-all shadow-lg shadow-red-600/20 flex items-center justify-center disabled:opacity-40">
                                {replying ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
