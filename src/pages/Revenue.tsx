import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowDownLeft, Clock, Music, Globe, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

interface Release {
  id: string;
  title: string;
  artist: string;
  streams: number;
  revenue: number;
  platformStats?: Record<string, number>;
}

interface Payout {
  _id: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: string;
  created_at: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  'Spotify': '#1DB954', 'Apple Music': '#FC3C44', 'YouTube Music': '#FF0000',
  'Amazon Music': '#00A8E1', 'Tidal': '#00d2ff', 'Deezer': '#FF0092',
  'Boomplay': '#f1c40f', 'Audiomack': '#FFA200', 'Other': '#71717a',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 shadow-2xl rounded-xl px-4 py-3 text-sm">
        <p className="font-black text-white mb-2 text-xs uppercase tracking-wider border-b border-zinc-900 pb-1.5">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center justify-between space-x-4 mt-1">
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-zinc-500 text-xs">{entry.name}:</span>
            </span>
            <span className="text-white font-mono font-black text-xs">₦{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const inputClass = 'w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder-zinc-700 focus:border-zinc-600 focus:outline-none transition-colors font-medium text-sm';
const labelClass = 'block text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2';

export default function Revenue() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ amount: 0, bankName: '', accountNumber: '', accountName: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      const results = await Promise.allSettled([api.get('/releases'), api.get('/payouts/my')]);
      if (results[0].status === 'fulfilled') setReleases(results[0].value.data.releases || []);
      if (results[1].status === 'fulfilled') setPayouts(results[1].value.data.payouts || []);
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalRevenue = releases.reduce((sum, r) => sum + (Number(r.revenue) || 0), 0);
  const netBalance = totalRevenue - payouts.filter(p => p.status !== 'Rejected').reduce((sum, p) => sum + p.amount, 0);
  const pendingWithdrawals = payouts.filter(p => p.status === 'Pending' || p.status === 'Processing').reduce((sum, p) => sum + p.amount, 0);
  const topRelease = releases.length > 0 ? releases.reduce((a, b) => Number(a.revenue) > Number(b.revenue) ? a : b) : null;

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (payoutForm.amount > netBalance) { setFormError('Amount exceeds your available balance.'); return; }
    if (payoutForm.amount < 1000) { setFormError('Minimum payout is ₦1,000.'); return; }
    setSubmitting(true);
    try {
      await api.post('/payouts/request', payoutForm);
      setShowModal(false);
      setPayoutForm({ amount: 0, bankName: '', accountNumber: '', accountName: '' });
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const revenueByPlatform: Record<string, number> = {};
  releases.forEach(r => {
    if (r.platformStats && r.revenue > 0) {
      const total = Object.values(r.platformStats).reduce((a: number, b) => a + (Number(b) || 0), 0) as number;
      Object.entries(r.platformStats).forEach(([platform, streams]) => {
        const ratio = total > 0 ? Number(streams) / total : 0;
        revenueByPlatform[platform] = (revenueByPlatform[platform] || 0) + Number(r.revenue) * ratio;
      });
    }
  });
  const pieData = Object.entries(revenueByPlatform).map(([name, value]) => ({ name, value }));

  const payoutStatusStyle = (status: string) => {
    if (status === 'Completed') return 'bg-red-600/10 text-red-500 border border-red-600/20';
    if (status === 'Rejected') return 'bg-red-500/10 text-red-400 border border-red-500/20';
    return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 pb-24">

      {/* Page header */}
      <div className="mb-8 pb-6 border-b border-zinc-900">
        <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-1.5">Financials</p>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Revenue</h1>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Balance + withdraw */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between gap-5">
          <div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Available Balance</p>
            <h2 className="text-3xl font-black text-white mb-0.5">₦{netBalance.toLocaleString()}</h2>
            {pendingWithdrawals > 0 && (
              <p className="text-[10px] text-amber-500/80 font-bold mt-1">₦{pendingWithdrawals.toLocaleString()} pending</p>
            )}
          </div>
          <button
            onClick={() => { setPayoutForm(f => ({ ...f, amount: netBalance })); setShowModal(true); }}
            className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl text-sm font-black transition-all active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw</span>
          </button>
          <p className="text-[10px] text-zinc-700 font-bold flex items-center">
            <Clock className="w-3 h-3 mr-1.5" />7 working days processing
          </p>
        </div>

        {/* Lifetime */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
            <TrendingUp className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Lifetime Earnings</p>
          <h2 className="text-2xl font-black text-white">₦{totalRevenue.toLocaleString()}</h2>
          <p className="text-xs text-red-500 font-bold flex items-center mt-1">
            <ArrowUpRight className="w-3 h-3 mr-1" />Total earned across all releases
          </p>
        </div>

        {/* Top earner */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
            <Music className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Top Earner</p>
          <h2 className="text-lg font-black text-white truncate">{topRelease?.title || '—'}</h2>
          <p className="text-xs text-zinc-600 font-bold mt-0.5">₦{topRelease?.revenue?.toLocaleString() || 0} earned</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-5">Revenue by Platform</p>
          {pieData.length > 0 ? (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={PLATFORM_COLORS[entry.name] || '#52525b'} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-5 space-y-2.5">
                {pieData.map((p) => (
                  <div key={p.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-2.5" style={{ backgroundColor: PLATFORM_COLORS[p.name] || '#52525b' }} />
                      <span className="text-xs text-zinc-500 font-bold">{p.name}</span>
                    </div>
                    <span className="text-xs text-white font-mono font-black">₦{Math.round(p.value).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-52 text-center">
              <Globe className="w-10 h-10 text-zinc-900 mb-3" />
              <p className="text-sm text-zinc-700 font-bold">No platform data yet</p>
            </div>
          )}
        </div>

        {/* Payout History */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-5">Payout History</p>
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
            {payouts.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center">
                <CreditCard className="w-10 h-10 text-zinc-900 mb-3" />
                <p className="text-sm text-zinc-700 font-bold">No payouts yet</p>
              </div>
            ) : payouts.map((payout) => (
              <div key={payout._id} className="flex items-center justify-between p-4 bg-black border border-zinc-900 rounded-xl hover:border-zinc-800 transition-all">
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${payout.status === 'Completed' ? 'bg-red-600/10' : 'bg-amber-500/10'}`}>
                    {payout.status === 'Completed'
                      ? <ArrowDownLeft className="w-4 h-4 text-red-500" />
                      : <Clock className="w-4 h-4 text-amber-400" />
                    }
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">₦{payout.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                      {new Date(payout.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {payout.bankName}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${payoutStatusStyle(payout.status)}`}>
                  {payout.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-zinc-900 rounded-2xl p-7 w-full max-w-md relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-zinc-600 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="mb-7">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Payout Request</p>
                <h3 className="text-xl font-black text-white">Withdraw Funds</h3>
                <p className="text-xs text-zinc-600 font-bold mt-0.5">Processed within 7 working days</p>
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-red-400 text-sm font-bold mb-5 bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <form onSubmit={handleRequestPayout} className="space-y-4">
                <div className="bg-black border border-zinc-900 rounded-xl p-4">
                  <label className={labelClass}>Amount (₦)</label>
                  <input
                    type="number" required min="1000" max={netBalance}
                    className="w-full bg-transparent text-3xl font-black text-white outline-none focus:text-red-500 transition-colors"
                    value={payoutForm.amount}
                    onChange={e => setPayoutForm({ ...payoutForm, amount: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-[10px] text-zinc-700 mt-2 font-bold">MIN ₦1,000 · AVAILABLE ₦{netBalance.toLocaleString()}</p>
                </div>

                <div>
                  <label className={labelClass}>Bank Name</label>
                  <input type="text" required placeholder="e.g. Zenith Bank" className={inputClass}
                    value={payoutForm.bankName} onChange={e => setPayoutForm({ ...payoutForm, bankName: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Account Number</label>
                    <input type="text" required placeholder="10 digits" maxLength={10} className={`${inputClass} font-mono`}
                      value={payoutForm.accountNumber} onChange={e => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Account Name</label>
                    <input type="text" required placeholder="Full name" className={inputClass}
                      value={payoutForm.accountName} onChange={e => setPayoutForm({ ...payoutForm, accountName: e.target.value })} />
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl font-black text-sm transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <><ArrowUpRight className="w-4 h-4" /> Request Payout</>
                    }
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
