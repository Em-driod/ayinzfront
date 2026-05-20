
import React, { useState, useEffect } from 'react';
import { Users, Music, DollarSign, CheckCircle, Clock, TrendingUp, BarChart3, X, Filter, Search, ChevronRight, LayoutDashboard, Wallet, MessageCircle, Send, UserCheck, UserPlus, Eye, Settings, Pencil, CreditCard } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

interface User {
    _id: string;
    name: string;
    email: string;
    subscription: string;
    created_at: string;
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
    streams: number;
    revenue: number;
    cover_url: string;
    created_at: string;
    user: { name: string; email: string };

    // Detailed Metadata
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
    plus: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    premium: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
    standard: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
    basic: 'bg-green-500/15 border-green-500/30 text-green-400',
    plan500: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
    none: 'bg-zinc-900 border-white/5 text-white/40'
};

const PLATFORM_COLORS: Record<string, string> = {
    'Spotify': '#1DB954',
    'Apple Music': '#FB233B',
    'YouTube Music': '#FF0000',
    'Amazon Music': '#00A8E1',
    'Tidal': '#00d2ff',
    'Deezer': '#FF0092',
    'Boomplay': '#f1c40f',
    'Audiomack': '#FFA200',
    'Other': '#fb923c',
    'Overall': '#ef4444'
};

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [releases, setReleases] = useState<Release[]>([]);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'releases' | 'payouts' | 'support' | 'payments'>('overview');
    const [selectedUserFilter, setSelectedUserFilter] = useState<User | null>(null);

    // For support chat modal
    const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [replying, setReplying] = useState(false);

    // For updating stats modal
    const [editingRelease, setEditingRelease] = useState<Release | null>(null);
    const [statsForm, setStatsForm] = useState({ date: '', streams: 0, revenue: 0, platform: 'Spotify' });

    // For viewing release details & graph
    const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
    const [viewingRelease, setViewingRelease] = useState<Release | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // For creating artist modal
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [creatingUser, setCreatingUser] = useState(false);
    const [createUserForm, setCreateUserForm] = useState({
        name: '',
        email: '',
        password: '',
        subscription: 'basic'
    });

    // For editing user modal
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [updatingUser, setUpdatingUser] = useState(false);
    const [editUserForm, setEditUserForm] = useState({
        name: '',
        email: '',
        password: '',
        subscription: 'basic'
    });

    const fetchData = async () => {
        try {
            const [usersRes, releasesRes, payoutsRes, ticketsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/releases'),
                api.get('/admin/payouts'),
                api.get('/support/all'),
            ]);
            setUsers(usersRes.data.users);
            setReleases(releasesRes.data.releases);
            setPayouts(payoutsRes.data.payouts);
            setTickets(ticketsRes.data.tickets);

            // Fetch payments separately so a missing endpoint doesn't crash the whole dashboard
            api.get('/admin/payments')
                .then(res => setPayments(res.data.payments || []))
                .catch(() => setPayments([]));
        } catch (err: any) {
            setError(err.response?.data?.error || 'Access denied. You must be an admin.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTicketStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/support/${id}/status`, { status });
            setTickets(tickets.map(t => t._id === id ? { ...t, status } : t) as any);
            if (activeTicket?._id === id) setActiveTicket({ ...activeTicket, status } as any);
        } catch (err) { alert('Failed to change status'); }
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
        } catch (err) { alert('Failed to reply'); }
        setReplying(false);
    };

    const handleOpenAdminTicket = async (ticket: Ticket) => {
        setActiveTicket(ticket);
        if (ticket.unreadAdmin) {
            try {
                await api.patch(`/support/${ticket._id}/read`);
                setTickets(tickets.map(t => t._id === ticket._id ? { ...t, unreadAdmin: false } : t));
                setActiveTicket({ ...ticket, unreadAdmin: false });
            } catch (err) { }
        }
    };

    const handlePayoutStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/admin/payouts/${id}/status`, { status });
            setPayouts(payouts.map(p => p._id === id ? { ...p, status } : p));
        } catch (err) {
            alert('Failed to update payout status');
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/admin/releases/${id}/status`, { status: newStatus });
            setReleases(releases.map(r => r.id === id ? { ...r, status: newStatus } : r));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleViewStats = async (release: Release) => {
        setViewingRelease(release);
        setLoadingHistory(true);
        try {
            const res = await api.get(`/releases/${release.id}/history`);
            setHistory(res.data.history || []);
        } catch (err) {
            setHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleOpenReleaseDetail = (release: Release) => {
        setSelectedRelease(release);
    };

    const handleUpdateStats = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRelease) return;

        try {
            const res = await api.patch(`/admin/releases/${editingRelease.id}/stats`, statsForm);
            setReleases(releases.map(r => r.id === editingRelease.id ?
                { ...r, streams: res.data.release.streams, revenue: res.data.release.revenue } : r
            ));
            setEditingRelease(null);
            setStatsForm({ date: '', streams: 0, revenue: 0, platform: 'Spotify' });
        } catch (err) {
            alert('Failed to update stats');
        }
    };

    const handleUpdatePrice = async (id: string, newPrice: number) => {
        try {
            await api.patch(`/admin/releases/${id}/status`, { price: newPrice });
            setReleases(releases.map(r => r.id === id ? { ...r, price: newPrice } : r));
        } catch (err) {
            alert('Failed to update price');
        }
    };

    const handleDeleteUser = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete artist "${name}" and all their releases? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
            // Also remove their releases from the state
            setReleases(releases.filter(r => (r.user as any)._id !== id));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handleDeleteRelease = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete the release "${title}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/releases/${id}`);
            setReleases(releases.filter(r => r.id !== id));
        } catch (err) {
            alert('Failed to delete release');
        }
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
        } finally {
            setCreatingUser(false);
        }
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
        } finally {
            setUpdatingUser(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
            <div className="glass-card-premium rounded-[2.5rem] max-w-sm">
                <X className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                <p className="text-white text-sm mb-6">{error}</p>
                <button onClick={() => window.location.href = '/'} className="w-full py-3 bg-white text-black font-bold rounded-xl">Return Home</button>
            </div>
        </div>
    );

    const StatCard = ({ title, value, icon: Icon, color }: any) => (
        <div className="glass-card-premium p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 blur-[100px] -mr-16 -mt-16 group-hover:bg-${color}-500/20 transition-all duration-500`} />
            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-${color}-500/20 flex items-center justify-center mb-4 ring-1 ring-${color}-500/30 shadow-lg shadow-${color}-500/20`}>
                    <Icon className={`w-6 h-6 text-${color}-400`} />
                </div>
                <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">{title}</p>
                <h3 className="text-3xl font-display text-white tracking-tight">{value}</h3>
            </div>
        </div>
    );

    const TABS = [
        { id: 'overview', name: 'Overview', icon: LayoutDashboard },
        { id: 'users', name: 'Users', icon: Users },
        { id: 'releases', name: 'Releases', icon: Music },
        { id: 'payouts', name: 'Payouts', icon: Wallet },
        { id: 'payments', name: 'Payments', icon: CreditCard },
        { id: 'support', name: 'Support', icon: MessageCircle },
    ];

    return (
        <div className="min-h-screen bg-mesh-main text-white pb-24">

            {/* Header */}
            <div className="p-5 md:p-10 pt-12 md:pt-16 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <p className="label-caps text-red-500 mb-2">System Management</p>
                        <h1 className="text-4xl md:text-6xl font-display tracking-tight leading-[1.1] uppercase pb-2">
                            Admin<br /><span className="text-gradient-red px-1">Dashboard</span>
                        </h1>
                    </motion.div>
                    <div className="flex gap-2 bg-zinc-950/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl shrink-0 overflow-x-auto no-scrollbar">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id as any);
                                    if (tab.id === 'releases') {
                                        setSelectedUserFilter(null);
                                    }
                                }}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-red-600 text-black'
                                        : 'text-white hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.name}
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard title="Active Artists" value={users.length} icon={Users} color="blue" />
                                <StatCard title="Paid Subscribers" value={users.filter((u: User) => u.subscription !== 'none').length} icon={CreditCard} color="green" />
                                <StatCard title="Total Streams" value={releases.reduce((s: number, r: Release) => s + r.streams, 0).toLocaleString()} icon={BarChart3} color="red" />
                                <StatCard title="Subscription Revenue" value={`₦${payments.reduce((s: number, p: Payment) => s + p.amount, 0).toLocaleString()}`} icon={DollarSign} color="rose" />
                            </div>

                            <div className="grid lg:grid-cols-2 gap-8">
                                <div className="glass-card-premium rounded-[2.5rem] p-8 border border-white/5">
                                    <h3 className="text-xl font-display uppercase tracking-tight mb-6">Recent Users</h3>
                                    <div className="space-y-4">
                                        {users.slice(0, 5).map(u => (
                                            <div key={u._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center text-red-600 font-bold">
                                                        {u.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{u.name}</p>
                                                        <p className="text-xs text-white">{u.email}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${SUBSCRIPTION_STYLE[u.subscription] || SUBSCRIPTION_STYLE['none']}`}>
                                                    {PLAN_LABELS[u.subscription] || u.subscription}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => setActiveTab('users')} className="w-full mt-6 py-4 text-xs font-black uppercase tracking-widest text-white hover:text-red-600 transition-colors flex items-center justify-center gap-2">
                                        View All Users <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="glass-card-premium rounded-[2.5rem] p-8 border border-white/5">
                                    <h3 className="text-xl font-display uppercase tracking-tight mb-6">Pending Releases</h3>
                                    <div className="space-y-4">
                                        {releases.filter(r => r.status === 'pending').slice(0, 5).map(r => (
                                            <div key={r.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                                        <Music className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm tracking-tight">{r.title}</p>
                                                        <p className="text-xs text-white">{r.artist}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => { setActiveTab('releases'); setSelectedUserFilter(null); }} className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors">
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                        {releases.filter(r => r.status === 'pending').length === 0 && (
                                            <div className="text-center py-12 text-white">
                                                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                                <p className="text-sm font-bold uppercase tracking-widest">All Clear</p>
                                                <p className="text-xs mt-1">No pending releases to review.</p>
                                            </div>
                                        )}
                                    </div>
                                    {releases.filter(r => r.status === 'pending').length > 5 && (
                                        <button onClick={() => { setActiveTab('releases'); setSelectedUserFilter(null); }} className="w-full mt-6 py-4 text-xs font-black uppercase tracking-widest text-white hover:text-red-600 transition-colors flex items-center justify-center gap-2">
                                            Manage All Releases <ChevronRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'users' && (
                        <motion.div
                            key="users"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="glass-card-premium rounded-[2.5rem] overflow-hidden border border-white/5"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-xl font-display uppercase tracking-tight flex items-center gap-3">
                                    <Users className="w-6 h-6 text-blue-500" /> All Artists
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className="hidden md:flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                                        <Search className="w-4 h-4 text-white" />
                                        <input type="text" placeholder="Search artists..." className="bg-transparent border-none text-xs focus:ring-0 w-48 font-bold" />
                                    </div>
                                    <button
                                        onClick={() => setShowCreateUser(true)}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20"
                                    >
                                        <UserPlus className="w-3.5 h-3.5" /> Create Artist
                                    </button>
                                </div>
                            </div>
                            <div className="divide-y divide-white/5">
                                {users.map(u => (
                                    <div key={u._id} className="p-6 md:p-8 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center font-bold text-white group-hover:border-blue-500/50 shadow-2xl transition-colors shrink-0">
                                                {u.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-lg text-white mb-1 tracking-tight">{u.name}</p>
                                                <p className="text-xs text-white uppercase tracking-widest font-bold">{u.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-12">
                                            <div className="hidden lg:flex flex-col items-center gap-1.5">
                                                <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-2xl border ${SUBSCRIPTION_STYLE[u.subscription] || SUBSCRIPTION_STYLE['none']}`}>
                                                    {PLAN_LABELS[u.subscription] || u.subscription}
                                                </span>
                                                {u.subscription !== 'none' ? (
                                                    <span className="text-[9px] font-black uppercase text-green-400 tracking-widest flex items-center gap-1">
                                                        <CheckCircle className="w-2.5 h-2.5" /> PAID
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">FREE</span>
                                                )}
                                            </div>

                                            <div className="hidden lg:flex flex-col justify-end text-right">
                                                <p className="label-caps opacity-50 mb-1">Joined</p>
                                                <p className="text-xs font-black text-white">{new Date(u.created_at).toLocaleDateString()}</p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => { setSelectedUserFilter(u); setActiveTab('releases'); }}
                                                    className="w-12 h-12 flex items-center justify-center bg-zinc-900 hover:bg-purple-500 text-white hover:text-black rounded-2xl border border-white/5 hover:border-purple-500 transition-all shadow-xl"
                                                    title="View Releases"
                                                >
                                                    <Music className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => openEditUser(u)}
                                                    className="w-12 h-12 flex items-center justify-center bg-zinc-900 hover:bg-blue-500 text-white hover:text-black rounded-2xl border border-white/5 hover:border-blue-500 transition-all shadow-xl"
                                                    title="Edit User"
                                                >
                                                    <Pencil className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(u._id, u.name)}
                                                    className="w-12 h-12 flex items-center justify-center bg-zinc-900 hover:bg-rose-500 text-white hover:text-black rounded-2xl border border-white/5 hover:border-rose-500 transition-all shadow-xl"
                                                    title="Delete User"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {users.length === 0 && (
                                    <div className="py-24 text-center text-white">
                                        <Users className="w-16 h-16 mx-auto mb-6 opacity-5" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No artists registered yet</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'releases' && (() => {
                        const displayReleases = selectedUserFilter ? releases.filter(r => r.user?.email === selectedUserFilter.email) : releases;
                        return (
                            <motion.div
                                key="releases"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {selectedUserFilter && (
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/5 p-6 rounded-3xl border border-white/10">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-purple-400 tracking-widest">Filtered By Artist</p>
                                            <p className="text-xl font-bold text-white">{selectedUserFilter.name}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedUserFilter(null)}
                                            className="px-6 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-black transition-all text-[10px] font-black uppercase tracking-widest rounded-2xl border border-red-600/20 shadow-lg"
                                        >
                                            Show All Releases
                                        </button>
                                    </div>
                                )}
                                <div className="grid lg:grid-cols-2 gap-6">
                                    {displayReleases.length === 0 ? (
                                        <div className="col-span-1 lg:col-span-2 text-center py-24 text-white">
                                            <Music className="w-16 h-16 mx-auto mb-6 opacity-5" />
                                            <h3 className="text-sm font-black uppercase tracking-[0.3em]">{selectedUserFilter ? 'No releases by this artist' : 'No releases found'}</h3>
                                        </div>
                                    ) : displayReleases.map(r => (
                                        <div key={r.id} className="glass-card-premium rounded-[2.5rem] p-6 border border-white/10 hover:border-red-600/50 transition-all group overflow-hidden relative shadow-2xl shadow-red-600/5">
                                            {/* Status Glow */}
                                            <div className={`absolute top-0 right-0 w-32 h-32 blur-[100px] -mr-16 -mt-16 transition-all duration-700 ${r.status === 'approved' ? 'bg-red-600/30' :
                                                    r.status === 'rejected' ? 'bg-rose-500/30' :
                                                        'bg-blue-500/30'
                                                }`} />

                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start gap-4 mb-6">
                                                    <div className="flex gap-4">
                                                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-900 border border-white/20 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                                                            {r.cover_url ? (
                                                                <img src={r.cover_url} alt={r.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-white">
                                                                    <Music className="w-8 h-8" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-xl tracking-tighter text-white group-hover:text-red-400 transition-colors uppercase leading-tight">{r.title}</h3>
                                                            <p className="text-xs font-black text-white uppercase tracking-widest mt-1">by {r.artist}</p>
                                                            {r.featured_artists && r.featured_artists.length > 0 && (
                                                                <p className="text-[10px] font-bold text-white/50 mt-0.5 italic">ft. {r.featured_artists.join(', ')}</p>
                                                            )}
                                                            <div className="flex items-center gap-2 mt-3">
                                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-red-600/10 rounded-md border border-red-600/20 text-red-500">{r.type}</span>
                                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-white/5 rounded-md border border-white/10 text-white">{r.genre}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <select
                                                        value={r.status}
                                                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                                                        className={`text-[10px] font-black uppercase rounded-full px-4 py-2 border outline-none cursor-pointer transition-all self-start shadow-lg ${r.status === 'approved' || r.status === 'uploaded' ? 'bg-red-600 text-black border-red-600 hover:bg-red-500' :
                                                                r.status === 'rejected' ? 'bg-rose-500/20 text-rose-500 border-rose-500/30 hover:bg-rose-500 hover:text-white' :
                                                                    'bg-zinc-950 text-blue-400 border-blue-500/30 hover:border-blue-500'
                                                            }`}
                                                    >
                                                        <option value="pending">Reviewing</option>
                                                        <option value="approved">Approved</option>
                                                        <option value="rejected">Rejected</option>
                                                        <option value="uploaded">Uploaded</option>
                                                    </select>
                                                </div>

                                                {r.tracks && r.tracks.length > 0 ? (
                                                    <div className="mb-6 space-y-3">
                                                        <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] px-2">Tracklist & Masters</p>
                                                        <div className="space-y-1 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                                            {r.tracks.map((track, idx) => (
                                                                <div key={idx} className="p-3 bg-black/40 rounded-2xl border border-white/5 group/track hover:border-red-600/30 transition-all">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="text-xs font-black text-white truncate">{idx + 1}. {track.title}</p>
                                                                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                                                                {track.artist} {track.featured_artist ? `ft. ${track.featured_artist}` : ''} • {track.genre}
                                                                                {track.songwriter ? ` • Written by: ${track.songwriter}` : ''}
                                                                            </p>
                                                                        </div>
                                                                        {track.isrc && <span className="text-[8px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">{track.isrc}</span>}
                                                                    </div>
                                                                    <audio controls src={track.song_url} className="w-full h-8 invert opacity-40 hover:opacity-100 transition-opacity" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : r.song_file && (
                                                    <div className="mb-6 p-1 bg-black/40 rounded-2xl border border-white/5">
                                                        <audio controls src={r.song_file} className="w-full h-10 invert opacity-60 hover:opacity-100 transition-opacity" />
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-6">
                                                    <div>
                                                        <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">Streams</p>
                                                        <p className="font-display text-xl text-white">{r.streams.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">Revenue</p>
                                                        <p className="font-display text-xl text-red-500">₦{r.revenue.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">Price</p>
                                                        <input
                                                            type="number"
                                                            className="w-full bg-transparent border-none p-0 font-display text-xl text-blue-500 focus:ring-0"
                                                            defaultValue={r.price || 0}
                                                            onBlur={(e) => handleUpdatePrice(r.id, Number(e.target.value))}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col items-center justify-center border-l border-white/5 pl-2">
                                                        <button
                                                            onClick={() => handleDeleteRelease(r.id, r.title)}
                                                            className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all"
                                                            title="Delete Release"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleViewStats(r)}
                                                        className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/5 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <TrendingUp className="w-3.5 h-3.5" /> Growth
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedRelease(r)}
                                                        className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/5 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" /> Details
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingRelease(r)}
                                                        className="flex-1 py-3.5 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-red-600/20 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        + Stats
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })()}

                    {activeTab === 'payments' && (
                        <motion.div
                            key="payments"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="glass-card-premium rounded-[2.5rem] overflow-hidden border border-white/5">
                                <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                    <h2 className="text-xl font-display uppercase tracking-tight flex items-center gap-3">
                                        <CreditCard className="w-6 h-6 text-green-500" /> Payment History
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{payments.length} total</span>
                                        <span className="text-[10px] font-black uppercase px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 tracking-widest">
                                            ₦{payments.reduce((s: number, p: Payment) => s + p.amount, 0).toLocaleString()} collected
                                        </span>
                                    </div>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {payments.map((p: Payment) => (
                                        <div key={p._id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors">
                                            <div className="flex items-center gap-5 min-w-[220px]">
                                                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center font-bold text-green-400 text-lg shrink-0">
                                                    {p.user?.name?.[0] ?? '?'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-white">{p.user?.name}</p>
                                                    <p className="text-xs text-white/50">{p.user?.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Plan Purchased</p>
                                                <span className={`text-[11px] font-black uppercase px-3 py-1.5 rounded-xl border w-fit ${SUBSCRIPTION_STYLE[p.plan] || SUBSCRIPTION_STYLE['none']}`}>
                                                    {PLAN_LABELS[p.plan] || p.plan}
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Amount Paid</p>
                                                <p className="text-2xl font-display text-green-400 tracking-tight">₦{p.amount.toLocaleString()}</p>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Reference</p>
                                                <p className="text-xs font-mono text-white/60 tracking-wider">{p.reference}</p>
                                            </div>

                                            <div className="flex flex-col items-end gap-1">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Date</p>
                                                <p className="text-xs font-black text-white">{new Date(p.paid_at).toLocaleDateString()}</p>
                                                <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
                                                    {p.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {payments.length === 0 && (
                                        <div className="text-center py-24 text-white/30">
                                            <CreditCard className="w-16 h-16 mx-auto mb-6 opacity-10" />
                                            <h3 className="text-sm font-black uppercase tracking-[0.3em]">No Payment Records Yet</h3>
                                            <p className="text-xs mt-2 opacity-60">Payments made via Paystack will appear here.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'payouts' && (
                        <motion.div
                            key="payouts"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="glass-card-premium rounded-[2.5rem] overflow-hidden border border-white/5">
                                <div className="p-6 border-b border-white/5 bg-white/5">
                                    <h2 className="text-xl font-display uppercase tracking-tight flex items-center gap-3">
                                        <Wallet className="w-6 h-6 text-rose-500" /> Withdrawal Requests
                                    </h2>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {payouts.map(p => (
                                        <div key={p._id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors group">
                                            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-8">
                                                <div className="flex items-center gap-4 min-w-[200px]">
                                                    <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center font-bold text-rose-500">
                                                        {p.user?.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-white">{p.user?.name}</p>
                                                        <p className="text-xs text-white">{p.user?.email}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-white">Amount to pay</p>
                                                    <p className="text-3xl font-display text-red-500 tracking-tight">₦{p.amount.toLocaleString()}</p>
                                                </div>

                                                <div className="flex flex-col gap-2 p-4 rounded-2xl bg-black/40 border border-white/5">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{p.bankName}</p>
                                                        <div className="h-px flex-1 bg-white/5" />
                                                    </div>
                                                    <p className="text-sm font-mono tracking-wider text-white">{p.accountNumber}</p>
                                                    <p className="text-[10px] font-bold text-white uppercase italic tracking-tighter">Holder: {p.accountName}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <p className="text-[10px] font-black uppercase text-white hidden lg:block">{new Date(p.created_at).toLocaleDateString()}</p>
                                                <select
                                                    value={p.status}
                                                    onChange={(e) => handlePayoutStatus(p._id, e.target.value)}
                                                    className={`text-[11px] font-black uppercase rounded-2xl px-6 py-4 border outline-none cursor-pointer transition-all ${p.status === 'Completed' ? 'bg-red-600 text-black border-red-600' :
                                                            p.status === 'Rejected' ? 'bg-rose-500/20 text-rose-500 border-rose-500/30 hover:bg-rose-500 hover:text-white' :
                                                                'bg-zinc-950 text-blue-400 border-blue-500/30'
                                                        }`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Rejected">Rejected</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                    {payouts.length === 0 && (
                                        <div className="text-center py-24 text-white">
                                            <TrendingUp className="w-16 h-16 mx-auto mb-6 opacity-5" />
                                            <h3 className="text-sm font-black uppercase tracking-[0.3em]">No Pending Payouts</h3>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'support' && (
                        <motion.div
                            key="support"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="glass-card-premium rounded-[2.5rem] overflow-hidden border border-white/5">
                                <div className="p-6 border-b border-white/5 bg-white/5">
                                    <h2 className="text-xl font-display uppercase tracking-tight flex items-center gap-3">
                                        <MessageCircle className="w-6 h-6 text-red-600" /> Support Tickets
                                    </h2>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {tickets.map(t => (
                                        <div key={t._id} onClick={() => handleOpenAdminTicket(t)} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    {t.unreadAdmin && <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />}
                                                    <h3 className={`text-sm font-black uppercase tracking-widest ${t.unreadAdmin ? 'text-white' : 'text-white'}`}>{t.subject}</h3>
                                                </div>
                                                <p className="text-xs text-white">From: {t.user?.name} ({t.user?.email})</p>
                                                <p className="text-[10px] text-white uppercase font-black uppercase mt-1">Updated: {new Date(t.updatedAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${t.status === 'Resolved' ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-red-600/10 border-red-600/20 text-red-500'
                                                    }`}>
                                                    {t.status}
                                                </span>
                                                <ChevronRight className="text-white group-hover:text-red-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                    {tickets.length === 0 && (
                                        <div className="text-center py-24 text-white">
                                            <CheckCircle className="w-16 h-16 mx-auto mb-6 opacity-5" />
                                            <h3 className="text-sm font-black uppercase tracking-[0.3em]">No Open Tickets</h3>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* MODALS (STYLING ONLY, LOGIC REMAINS) */}
            <AnimatePresence>
                {editingRelease && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass rounded-[2rem] p-8 w-full max-w-md border border-white/10"
                        >
                            <h3 className="text-2xl font-display uppercase italic mb-1">Update Stats</h3>
                            <p className="text-xs font-bold text-white mb-8 uppercase tracking-widest">{editingRelease.title} — {editingRelease.artist}</p>

                            <form onSubmit={handleUpdateStats} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Period</label>
                                    <input
                                        type="text" required placeholder="e.g. March 2024"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:border-red-600 focus:ring-0 transition-colors"
                                        value={statsForm.date} onChange={e => setStatsForm({ ...statsForm, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Platform</label>
                                    <select
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:border-red-600 focus:ring-0 transition-colors"
                                        value={statsForm.platform} onChange={e => setStatsForm({ ...statsForm, platform: e.target.value })}
                                    >
                                        {Object.keys(PLATFORM_COLORS).filter(k => k !== 'Overall').map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">New Streams</label>
                                        <input
                                            type="number" required min="0"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:border-red-600 focus:ring-0 transition-colors"
                                            value={statsForm.streams || ''} onChange={e => setStatsForm({ ...statsForm, streams: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Revenue (₦)</label>
                                        <input
                                            type="number" required min="0" step="0.01"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:border-red-600 focus:ring-0 transition-colors"
                                            value={statsForm.revenue || ''} onChange={e => setStatsForm({ ...statsForm, revenue: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-8">
                                    <button type="button" onClick={() => setEditingRelease(null)} className="flex-1 py-4 text-xs font-black uppercase text-white hover:text-white transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 py-4 bg-red-600 text-black rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-600/40 active:scale-95 transition-all">Submit Entry</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {viewingRelease && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="glass rounded-[2rem] p-8 w-full max-w-4xl relative border border-white/10"
                        >
                            <button
                                onClick={() => setViewingRelease(null)}
                                className="absolute top-6 right-6 p-3 text-white hover:bg-white/5 rounded-2xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="mb-8">
                                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-1">Performance Graph</p>
                                <h3 className="text-3xl font-display uppercase tracking-tight leading-none">{viewingRelease.title}</h3>
                                <p className="text-xs font-bold text-white mt-2 uppercase tracking-widest">by {viewingRelease.artist}</p>
                            </div>

                            <div className="h-80 md:h-[24rem] w-full">
                                {loadingHistory ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center bg-white/[0.02] rounded-3xl border border-white/5">
                                        <TrendingUp className="w-16 h-16 text-white mb-4" />
                                        <p className="text-white text-sm font-bold uppercase tracking-widest">No history data found</p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={Object.values(history.reduce((acc: any, curr: any) => {
                                                if (!acc[curr.date]) acc[curr.date] = { date: curr.date };
                                                acc[curr.date][curr.platform || 'Overall'] = curr.streams;
                                                return acc;
                                            }, {}))}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 10, fill: '#666', fontWeight: 800 }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 10, fill: '#666', fontWeight: 800 }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '16px', color: '#fff' }}
                                                itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}
                                                cursor={{ stroke: '#10b981', strokeWidth: 1 }}
                                            />
                                            <Legend verticalAlign="top" align="right" iconType="circle" />
                                            {Array.from(new Set(history.map((h: any) => h.platform || 'Overall'))).map((platform: any) => {
                                                const color = PLATFORM_COLORS[platform as string] || '#fff';
                                                return (
                                                    <Line
                                                        key={platform}
                                                        type="monotone"
                                                        dataKey={platform}
                                                        stroke={color}
                                                        strokeWidth={4}
                                                        dot={false}
                                                        activeDot={{ r: 8, stroke: '#000', strokeWidth: 3 }}
                                                        name={platform}
                                                    />
                                                );
                                            })}
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {selectedRelease && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="glass-dark rounded-[2.5rem] w-full max-w-5xl h-[90vh] overflow-hidden border border-white/10 flex flex-col shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-white/5 flex justify-between items-start bg-white/5">
                                <div className="flex gap-8">
                                    <div className="w-24 h-24 rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl">
                                        {selectedRelease.cover_url ? (
                                            <img src={selectedRelease.cover_url} alt={selectedRelease.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white">
                                                <Music className="w-12 h-12" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-2">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 bg-red-600 text-black rounded-full">
                                                {selectedRelease.status}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                                                {selectedRelease.type} • {selectedRelease.genre}
                                            </span>
                                        </div>
                                        <h2 className="text-4xl font-display uppercase italic tracking-tight text-white mb-1 leading-none">{selectedRelease.title}</h2>
                                        <p className="text-sm font-black text-white uppercase tracking-widest">by {selectedRelease.artist}</p>
                                        {selectedRelease.featured_artists && selectedRelease.featured_artists.length > 0 && (
                                            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1 italic">ft. {selectedRelease.featured_artists.join(', ')}</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedRelease(null)}
                                    className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all border border-white/5"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 no-scrollbar">

                                {/* Production Details Grid */}
                                <div className="grid md:grid-cols-3 gap-12">

                                    {/* Identification */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] border-b border-red-600/20 pb-3">Identification</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1.5">ISRC CODE</p>
                                                <p className="text-sm font-mono tracking-widest text-white">{selectedRelease.isrc || 'NOT ASSIGNED'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1.5">UPC / BARCODE</p>
                                                <p className="text-sm font-mono tracking-widest text-white">{selectedRelease.upc || 'NOT ASSIGNED'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1.5">LABEL</p>
                                                <p className="text-sm font-bold text-white uppercase">{selectedRelease.label || 'INDIE / NONE'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Creative Specs */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] border-b border-blue-500/20 pb-3">Technical Specs</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">LANGUAGE</p>
                                                <p className="text-xs font-bold text-white uppercase">{selectedRelease.language || 'English'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">EXPLICIT</p>
                                                <p className={`text-xs font-bold uppercase ${selectedRelease.explicit === 'Yes' ? 'text-red-500' : 'text-white'}`}>{selectedRelease.explicit || 'No'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">AI ASSISTED</p>
                                                <p className="text-xs font-bold text-white uppercase">{selectedRelease.ai_assisted || 'No'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">INSTRUMENTAL</p>
                                                <p className="text-xs font-bold text-white uppercase">{selectedRelease.is_instrumental ? 'Yes' : 'No'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Governance */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] border-b border-purple-500/20 pb-3">Rights & Timeline</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">RELEASE DATE</p>
                                                <p className="text-xs font-bold text-white">{selectedRelease.release_date ? new Date(selectedRelease.release_date).toLocaleDateString() : 'TBD'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">COPYRIGHT RECORDING</p>
                                                <p className="text-xs font-bold text-white uppercase italic">© {selectedRelease.copyright_date_recording || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">COPYRIGHT COMPOSITION</p>
                                                <p className="text-xs font-bold text-white uppercase italic">℗ {selectedRelease.copyright_date_release || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Personnel Sections */}
                                <div className="grid md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] border-b border-white/5 pb-3">Production Team</h4>
                                        <div className="space-y-3">
                                            {selectedRelease.contributors && selectedRelease.contributors.length > 0 ? (
                                                selectedRelease.contributors.map((c: any, idx: number) => (
                                                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                                        <span className="text-sm font-bold text-white">{c.name}</span>
                                                        <span className="text-[10px] font-black uppercase text-red-600 tracking-widest bg-red-600/10 px-2 py-0.5 rounded-md border border-red-600/20">{c.role}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-white italic">No contributors listed</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] border-b border-white/5 pb-3">Composition & Performance</h4>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                                <p className="text-[9px] font-black text-white uppercase tracking-widest mb-2">SONGWRITERS</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedRelease.songwriters && selectedRelease.songwriters.length > 0 ? (
                                                        selectedRelease.songwriters.map((s: string, idx: number) => (
                                                            <span key={idx} className="text-xs font-bold text-white flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl">
                                                                <Users className="w-3 h-3 text-white" /> {s}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-white italic">None listed</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                                <p className="text-[9px] font-black text-white uppercase tracking-widest mb-2">MUSICIANS</p>
                                                <div className="space-y-2">
                                                    {selectedRelease.musicians && selectedRelease.musicians.length > 0 ? (
                                                        selectedRelease.musicians.map((m: any, idx: number) => (
                                                            <div key={idx} className="flex justify-between text-xs font-bold">
                                                                <span className="text-white">{m.name}</span>
                                                                <span className="text-white italic uppercase tracking-tighter">{m.instrument}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-white italic">No session musicians listed</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Media Section */}
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] border-b border-white/5 pb-3">Master Recording & Content</h4>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <p className="text-[9px] font-black text-white uppercase tracking-widest">AUDIO PLAYBACK</p>
                                            {selectedRelease.song_file ? (
                                                <div className="p-6 rounded-3xl bg-zinc-950 border border-white/5 shadow-inner">
                                                    <audio controls src={selectedRelease.song_file} className="w-full h-12 invert" />
                                                </div>
                                            ) : (
                                                <div className="p-6 text-center text-white bg-white/5 rounded-3xl border border-dashed border-white/10">No audio file available</div>
                                            )}
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-[9px] font-black text-white uppercase tracking-widest">LYRICS</p>
                                            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 min-h-[160px] max-h-[300px] overflow-y-auto no-scrollbar whitespace-pre-wrap text-sm font-medium text-white leading-relaxed italic">
                                                {selectedRelease.lyrics || "Lyrics not provided for this release."}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 border-t border-white/5 bg-black/40 flex justify-between items-center">
                                <div className="flex gap-4">
                                    <div className="flex flex-col">
                                        <p className="text-[9px] font-black text-white uppercase tracking-widest mb-0.5">Contact Email</p>
                                        <p className="text-xs font-bold text-white">{selectedRelease.contact_email}</p>
                                    </div>
                                    <div className="w-px h-8 bg-white/5 self-center mx-2" />
                                    <div className="flex flex-col">
                                        <p className="text-[9px] font-black text-white uppercase tracking-widest mb-0.5">Artist Email</p>
                                        <p className="text-xs font-bold text-white">{selectedRelease.user?.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedRelease(null)}
                                    className="px-10 py-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors shadow-xl shadow-white/10"
                                >
                                    Dismiss Details
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Create Artist Modal ─── */}
            <AnimatePresence>
                {showCreateUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCreateUser(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass rounded-[2rem] p-8 w-full max-w-md border border-white/10"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">Admin Action</p>
                                    <h3 className="text-2xl font-display uppercase italic">Create Artist</h3>
                                </div>
                                <button
                                    onClick={() => setShowCreateUser(false)}
                                    className="p-3 text-white hover:bg-white/5 rounded-2xl transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateUser} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text" required placeholder="Artist or Band Name"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-500 focus:ring-0 outline-none transition-colors font-bold"
                                        value={createUserForm.name}
                                        onChange={e => setCreateUserForm({ ...createUserForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Email Address</label>
                                    <input
                                        type="email" required placeholder="artist@example.com"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-500 focus:ring-0 outline-none transition-colors font-bold"
                                        value={createUserForm.email}
                                        onChange={e => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Password</label>
                                    <input
                                        type="password" required placeholder="Minimum 8 characters"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-500 focus:ring-0 outline-none transition-colors font-bold"
                                        value={createUserForm.password}
                                        onChange={e => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Subscription Tier</label>
                                    <select
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-500 focus:ring-0 outline-none transition-colors font-bold"
                                        value={createUserForm.subscription}
                                        onChange={e => setCreateUserForm({ ...createUserForm, subscription: e.target.value })}
                                    >
                                        <option value="basic">Basic</option>
                                        <option value="plus">Plus</option>
                                        <option value="premium">Premium</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateUser(false)}
                                        className="flex-1 py-4 text-xs font-black uppercase text-white hover:text-white transition-colors border border-white/5 rounded-2xl hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creatingUser}
                                        className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {creatingUser ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <><UserPlus className="w-4 h-4" /> Create Artist</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Edit User Modal ─── */}
            <AnimatePresence>
                {editingUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4"
                        onClick={() => setEditingUser(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass rounded-[2rem] p-8 w-full max-w-md border border-white/10"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">Admin Action</p>
                                    <h3 className="text-2xl font-display uppercase italic">Edit Artist</h3>
                                    <p className="text-xs text-white mt-1">{editingUser.email}</p>
                                </div>
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="p-3 text-white hover:bg-white/5 rounded-2xl transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateUser} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text" required placeholder="Artist or Band Name"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-500 focus:ring-0 outline-none transition-colors font-bold"
                                        value={editUserForm.name}
                                        onChange={e => setEditUserForm({ ...editUserForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Email Address</label>
                                    <input
                                        type="email" required placeholder="artist@example.com"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-500 focus:ring-0 outline-none transition-colors font-bold"
                                        value={editUserForm.email}
                                        onChange={e => setEditUserForm({ ...editUserForm, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">
                                        New Password <span className="text-white/30 normal-case font-bold">(leave blank to keep current)</span>
                                    </label>
                                    <input
                                        type="password" placeholder="Enter new password to change"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-500 focus:ring-0 outline-none transition-colors font-bold"
                                        value={editUserForm.password}
                                        onChange={e => setEditUserForm({ ...editUserForm, password: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Subscription Tier</label>
                                    <select
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-500 focus:ring-0 outline-none transition-colors font-bold"
                                        value={editUserForm.subscription}
                                        onChange={e => setEditUserForm({ ...editUserForm, subscription: e.target.value })}
                                    >
                                        <option value="basic">Basic</option>
                                        <option value="plus">Plus</option>
                                        <option value="premium">Premium</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingUser(null)}
                                        className="flex-1 py-4 text-xs font-black uppercase text-white transition-colors border border-white/5 rounded-2xl hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updatingUser}
                                        className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {updatingUser ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <><Pencil className="w-4 h-4" /> Save Changes</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {activeTicket && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-zinc-950 border border-zinc-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[80vh] max-h-[800px]"
                    >
                        <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-[#050505]">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">{activeTicket.user?.name} • {activeTicket.user?.email}</p>
                                <h3 className="text-white font-black uppercase tracking-widest text-sm">{activeTicket.subject}</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <select
                                    value={activeTicket.status}
                                    onChange={(e) => handleTicketStatus(activeTicket._id, e.target.value)}
                                    className="bg-zinc-900 border border-zinc-800 text-xs font-black uppercase tracking-widest rounded-lg px-3 py-1.5 focus:border-red-600 outline-none"
                                >
                                    <option value="Open">Open</option>
                                    <option value="Resolved">Resolved</option>
                                </select>
                                <button onClick={() => setActiveTicket(null)} className="text-white hover:text-white transition-colors bg-zinc-900 hover:bg-zinc-800 p-2 rounded-xl">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0a0a0a] bg-mesh">
                            {activeTicket.messages.map((msg, idx) => {
                                const isAdmin = msg.sender === 'admin';
                                return (
                                    <div key={idx} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                                        <div className={`flex items-center gap-2 mb-2 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-lg ${isAdmin ? 'bg-red-600/20 border-red-600/30 text-red-500' : 'bg-blue-600/20 border-blue-600/30 text-blue-500'
                                                }`}>
                                                {isAdmin ? <LayoutDashboard className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white">
                                                {isAdmin ? 'Admin (You)' : activeTicket.user?.name}
                                            </span>
                                        </div>
                                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-bold shadow-xl leading-relaxed whitespace-pre-wrap ${isAdmin
                                                ? 'bg-zinc-900 text-white rounded-tr-none border border-zinc-800'
                                                : 'glass-dark border border-white/10 text-zinc-200 rounded-tl-none'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <form onSubmit={handleTicketReply} className="p-4 bg-[#050505] border-t border-zinc-900 flex gap-3">
                            <input
                                type="text"
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="Type your reply here..."
                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-red-600/50 outline-none transition-colors font-bold text-sm shadow-inner"
                            />
                            <button
                                type="submit"
                                disabled={!replyMessage.trim() || replying}
                                className="px-6 bg-red-600 text-black hover:bg-red-500 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 flex items-center justify-center disabled:opacity-50"
                            >
                                {replying ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}      
