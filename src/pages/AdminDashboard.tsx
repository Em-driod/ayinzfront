
import React, { useState, useEffect } from 'react';
import { Users, Music, DollarSign, CheckCircle, Clock, TrendingUp, BarChart3, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
    type: string;
    genre: string;
    release_date: string;
    contact_email: string;
    song_file: string;
    price: number;
    status: string;
    streams: number;
    revenue: number;
    user: { name: string; email: string };
}

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
    'Overall': '#9ca3af'
};

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

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [releases, setReleases] = useState<Release[]>([]);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // For updating stats modal
    const [editingRelease, setEditingRelease] = useState<Release | null>(null);
    const [statsForm, setStatsForm] = useState({ date: '', streams: 0, revenue: 0, platform: 'Spotify' });

    // For viewing stats graph
    const [viewingRelease, setViewingRelease] = useState<Release | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // ...
    const fetchData = async () => {
        try {
            const [usersRes, releasesRes, payoutsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/releases'),
                api.get('/admin/payouts')
            ]);
            setUsers(usersRes.data.users);
            setReleases(releasesRes.data.releases);
            setPayouts(payoutsRes.data.payouts);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Access denied. You must be an admin.');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

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

    const handleUpdateStats = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRelease) return;

        try {
            const res = await api.patch(`/admin/releases/${editingRelease.id}/stats`, statsForm);
            // Update local state
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

    if (loading) return <div className="p-10 text-center">Loading Admin Panel...</div>;
    if (error) return <div className="p-10 text-center text-red-600 font-bold">{error}</div>;

    return (
        <div className="min-h-screen bg-black p-6 pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Admin Control Panel</h1>
                <p className="text-gray-400">Manage users, releases, and distribution stats.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">

                {/* USERS TABLE */}
                <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 p-6">
                    <div className="flex items-center space-x-2 mb-6">
                        <Users className="w-6 h-6 text-orange-500" />
                        <h2 className="text-xl font-bold text-white">Registered Users ({users.length})</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3 rounded-r-lg">Plan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800 transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                                        <td className="px-4 py-3 text-gray-400">{u.email}</td>
                                        <td className="px-4 py-3 uppercase text-xs font-bold text-orange-400">{u.subscription}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RELEASES TABLE */}
                <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 p-6">
                    <div className="flex items-center space-x-2 mb-6">
                        <Music className="w-6 h-6 text-orange-500" />
                        <h2 className="text-xl font-bold text-white">All Releases ({releases.length})</h2>
                    </div>
                    <div className="overflow-y-auto max-h-[600px] pr-2 space-y-4">
                        {releases.map(r => (
                            <div key={r.id} className="border border-gray-800 rounded-xl p-4 hover:border-orange-600 transition-all duration-200">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{r.title}</h3>
                                        <p className="text-sm text-gray-400">{r.artist} ({r.contact_email || r.user?.email}) • {r.type} • {r.genre}</p>
                                        <p className="text-xs text-gray-500 mt-1">Release Date: {new Date(r.release_date).toLocaleDateString()}</p>
                                        {r.song_file && (
                                            <div className="mt-3">
                                                <audio controls src={r.song_file} className="h-8 w-full max-w-sm" />
                                            </div>
                                        )}
                                    </div>
                                    <select
                                        value={r.status}
                                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                                        className={`text-xs font-bold uppercase rounded-full px-3 py-1 border outline-none cursor-pointer transition-colors ${r.status === 'approved' || r.status === 'uploaded' ? 'bg-green-900 text-green-300 border-green-700' :
                                            r.status === 'rejected' ? 'bg-red-900 text-red-300 border-red-700' :
                                                'bg-orange-900 text-orange-300 border-orange-700'
                                            }`}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="uploaded">Uploaded</option>
                                    </select>
                                </div>

                                <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-800">
                                    <div>
                                        <p className="text-xs text-gray-400">Total Streams</p>
                                        <p className="font-semibold text-white">{r.streams.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Total Revenue</p>
                                        <p className="font-semibold text-green-400">₦{r.revenue.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Price (₦)</p>
                                        <input
                                            type="number"
                                            className="w-20 text-sm border border-gray-700 rounded px-2 py-1 bg-gray-800 text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                            defaultValue={r.price || 0}
                                            onBlur={(e) => handleUpdatePrice(r.id, Number(e.target.value))}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleViewStats(r)}
                                        className="ml-auto flex items-center text-sm text-orange-400 hover:text-orange-300 font-medium mr-4 transition-colors"
                                    >
                                        <BarChart3 className="w-4 h-4 mr-1" /> View Graph
                                    </button>
                                    <button
                                        onClick={() => setEditingRelease(r)}
                                        className="text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors"
                                    >
                                        + Add Data Point
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* PAYOUT REQUESTS SECTION */}
            <div className="mt-8 bg-gray-900 rounded-2xl shadow-sm border border-gray-800 p-6">
                <div className="flex items-center space-x-2 mb-6">
                    <DollarSign className="w-6 h-6 text-orange-500" />
                    <h2 className="text-xl font-bold text-white">Withdrawal Requests ({payouts.length})</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">User</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Bank Details</th>
                                <th className="px-4 py-3 text-center">Date</th>
                                <th className="px-4 py-3 rounded-r-lg text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.map(p => (
                                <tr key={p._id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-white">{p.user?.name}</p>
                                        <p className="text-[10px] text-gray-500">{p.user?.email}</p>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-green-400 text-lg">₦{p.amount.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-gray-300">
                                        <p className="font-bold text-xs">{p.bankName}</p>
                                        <p className="text-sm font-mono">{p.accountNumber}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Holder: {p.accountName}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        <select
                                            value={p.status}
                                            onChange={(e) => handlePayoutStatus(p._id, e.target.value)}
                                            className={`text-[10px] font-bold uppercase rounded-lg px-3 py-2 border outline-none cursor-pointer transition-colors ${
                                                p.status === 'Completed' ? 'bg-green-900/20 text-green-300 border-green-700/50' :
                                                p.status === 'Rejected' ? 'bg-red-900/20 text-red-300 border-red-700/50' :
                                                'bg-orange-900/20 text-orange-300 border-orange-700'
                                            }`}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Processing">Processing</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {payouts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">No payout requests at the moment.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* STATS UPDATE MODAL */}
            {editingRelease && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800">
                        <h3 className="text-xl font-bold mb-1 text-white">Update Stats</h3>
                        <p className="text-sm text-gray-400 mb-6">For: {editingRelease.title} by {editingRelease.artist}</p>

                        <form onSubmit={handleUpdateStats} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Date Period</label>
                                <input
                                    type="text" required placeholder="e.g. March 2024 or Q1 2024"
                                    className="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-white placeholder-gray-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    value={statsForm.date} onChange={e => setStatsForm({ ...statsForm, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Streaming Platform</label>
                                <select
                                    className="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    value={statsForm.platform} onChange={e => setStatsForm({ ...statsForm, platform: e.target.value })}
                                >
                                    <option value="Spotify">Spotify</option>
                                    <option value="Apple Music">Apple Music</option>
                                    <option value="YouTube Music">YouTube Music</option>
                                    <option value="Amazon Music">Amazon Music</option>
                                    <option value="Tidal">Tidal</option>
                                    <option value="Deezer">Deezer</option>
                                    <option value="Boomplay">Boomplay</option>
                                    <option value="Audiomack">Audiomack</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">New Streams</label>
                                    <input
                                        type="number" required min="0"
                                        className="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-white placeholder-gray-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        value={statsForm.streams || ''} onChange={e => setStatsForm({ ...statsForm, streams: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">New Revenue (₦)</label>
                                    <input
                                        type="number" required min="0" step="0.01"
                                        className="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-white placeholder-gray-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        value={statsForm.revenue || ''} onChange={e => setStatsForm({ ...statsForm, revenue: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button type="button" onClick={() => setEditingRelease(null)} className="flex-1 py-2 border border-gray-700 rounded-xl font-medium hover:bg-gray-800 text-gray-300 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all">Save Data</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* STATS GRAPH MODAL */}
            {viewingRelease && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl relative border border-gray-800">
                        <button
                            onClick={() => setViewingRelease(null)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-bold mb-1 text-white">Growth Chart</h3>
                        <p className="text-sm text-gray-400 mb-6">For: {viewingRelease.title} by {viewingRelease.artist}</p>

                        {loadingHistory ? (
                            <div className="flex items-center justify-center h-48">
                                <div className="w-6 h-6 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-center bg-gray-800 rounded-xl">
                                <TrendingUp className="w-10 h-10 text-gray-600 mb-3" />
                                <p className="text-gray-400 text-sm font-medium">No history data found</p>
                                <p className="text-gray-500 text-xs mt-1">Add a data point first</p>
                            </div>
                        ) : (
                            <div className="h-64 mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart 
                                        data={Object.values(history.reduce((acc: any, curr: any) => {
                                            if (!acc[curr.date]) acc[curr.date] = { date: curr.date };
                                            acc[curr.date][curr.platform || 'Overall'] = curr.streams;
                                            return acc;
                                        }, {}))} 
                                        margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                        />
                                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
                                        {/* Dynamic Lines */}
                                        {Array.from(new Set(history.map((h: any) => h.platform || 'Overall'))).map((platform: any) => {
                                            const color = PLATFORM_COLORS[platform as string] || '#fb923c';
                                            return (
                                                <Line 
                                                    key={platform}
                                                    type="monotone" 
                                                    dataKey={platform} 
                                                    stroke={color} 
                                                    strokeWidth={3} 
                                                    dot={{ r: 4, stroke: color, strokeWidth: 2, fill: '#111827' }}
                                                    activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: '#fff' }}
                                                    name={platform} 
                                                    connectNulls
                                                />
                                            );
                                        })}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
