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
              <span className="text-white text-xs">{entry.name}:</span>
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
const labelClass = 'block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-2';

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
    <div className="min-h-screen">

      <div className="relative z-10 p-5 md:p-10 space-y-10">

        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="label-caps mb-2">Financial Records</p>
            <h1 className="text-4xl md:text-6xl font-display italic tracking-tight text-white uppercase leading-[1.1] pb-2">
              Revenue<br/>
              <span className="text-gradient-red px-1">Management</span>
            </h1>
          </motion.div>
        </div>

        {/* ─── Top Cards: Balance & Highlights ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
          
          {/* THE PREMIUM BALANCE CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-amber-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative glass-card-premium rounded-[2.5rem] p-6 md:p-10 h-full overflow-hidden flex flex-col justify-between min-h-[300px]">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[80px] -mr-32 -mt-32 rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 blur-[50px] -ml-16 -mb-16 rounded-full pointer-events-none" />
                
                <div className="relative">
                    <div className="flex items-center justify-between mb-8">
                        <div className="w-14 h-9 bg-zinc-900/50 border border-white/5 rounded-lg flex items-center justify-center overflow-hidden">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-700 blur-[2px] opacity-50" />
                        </div>
                        <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <p className="label-caps opacity-50 mb-2">Available Balance</p>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                        ₦{netBalance.toLocaleString()}
                    </h2>
                    {pendingWithdrawals > 0 && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mt-4">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">₦{pendingWithdrawals.toLocaleString()} Processing</span>
                        </div>
                    )}
                </div>

                <div className="relative pt-10">
                    <button
                        onClick={() => { setPayoutForm(f => ({ ...f, amount: netBalance })); setShowModal(true); }}
                        className="w-full bg-white text-black hover:bg-red-600 hover:text-white px-8 py-5 rounded-3xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl"
                    >
                        Request Payout
                        <ArrowUpRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
          </motion.div>

          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-10">
              {/* Lifetime Earnings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card-premium p-6 md:p-10 rounded-[2.5rem] flex flex-col justify-between group"
              >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center mb-10 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="label-caps mb-2 opacity-60">Lifetime Earnings</p>
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">₦{totalRevenue.toLocaleString()}</h2>
                    <p className="text-[11px] text-white font-bold uppercase tracking-widest flex items-center">
                        <ArrowUpRight className="w-3.5 h-3.5 mr-1.5 text-red-500" /> All-time project performance
                    </p>
                  </div>
              </motion.div>

              {/* Top Earner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card-premium p-6 md:p-10 rounded-[2.5rem] flex flex-col justify-between group"
              >
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-10 shadow-2xl group-hover:bg-zinc-800 transition-colors duration-500">
                    <Music className="w-6 h-6 text-white group-hover:text-red-500 transition-colors" />
                  </div>
                  <div>
                    <p className="label-caps mb-2 opacity-60">Top Earner</p>
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight truncate leading-none mb-3">
                        {topRelease?.title.toUpperCase() || '—'}
                    </h2>
                    <p className="text-[11px] text-white font-black uppercase tracking-widest">
                        ₦{topRelease?.revenue?.toLocaleString() || 0} Generated
                    </p>
                  </div>
              </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
          {/* Revenue Distribution */}
          <div className="glass-card-premium rounded-[2.5rem] p-6 md:p-10">
            <p className="label-caps mb-8">Revenue Distribution</p>
            {pieData.length > 0 ? (
              <>
                <div className="h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={PLATFORM_COLORS[entry.name] || '#52525b'} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <p className="text-[10px] font-black text-white uppercase tracking-widest">Share</p>
                       <p className="text-xl font-black text-white leading-none">TOTAL</p>
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  {pieData.map((p) => (
                    <div key={p.name} className="flex items-center justify-between group">
                      <div className="flex items-center">
                        <div className="w-2.5 h-2.5 rounded-full mr-4 shadow-lg shadow-black/50" style={{ backgroundColor: PLATFORM_COLORS[p.name] || '#52525b' }} />
                        <span className="text-[11px] text-white font-black uppercase tracking-widest group-hover:text-white transition-colors">{p.name}</span>
                      </div>
                      <span className="text-sm font-black text-white font-mono">₦{Math.round(p.value).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Globe className="w-12 h-12 text-white mb-4" />
                <p className="text-xs text-white font-black uppercase tracking-widest">Global revenue pending...</p>
              </div>
            )}
          </div>

          {/* Payout History */}
          <div className="lg:col-span-2 glass-card-premium rounded-[2.5rem] p-6 md:p-10 flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-lg font-black text-white tracking-tight uppercase leading-none">Payout History</h2>
                   <p className="label-caps mt-2 opacity-60">Transaction Logs</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                </div>
            </div>
            
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
              {payouts.length === 0 ? (
                <div className="text-center py-24 flex flex-col items-center glass-card-premium rounded-[2rem] border-dashed border-white/5 bg-transparent">
                  <CreditCard className="w-12 h-12 text-white mb-4" />
                  <p className="text-xs text-white font-black uppercase tracking-widest">No transaction history found</p>
                </div>
              ) : payouts.map((payout, i) => (
                <motion.div 
                    key={payout._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center space-x-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 ${
                        payout.status === 'Completed' ? 'bg-red-600/10' : 
                        payout.status === 'Rejected' ? 'bg-zinc-900' : 'bg-amber-500/10'
                    }`}>
                      {payout.status === 'Completed'
                        ? <ArrowDownLeft className="w-5 h-5 text-red-500" />
                        : payout.status === 'Rejected' ? <X className="w-5 h-5 text-white" />
                        : <Clock className="w-5 h-5 text-amber-500" />
                      }
                    </div>
                    <div>
                      <p className="text-white font-black text-lg font-mono">₦{payout.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-white font-black uppercase tracking-[0.15em] mt-1">
                        {new Date(payout.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {payout.bankName.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl transition-colors ${payoutStatusStyle(payout.status)}`}>
                    {payout.status}
                  </span>
                </motion.div>
              ))}
            </div>
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
              <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-white hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="mb-7">
                <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">Payout Request</p>
                <h3 className="text-xl font-black text-white">Withdraw Funds</h3>
                <p className="text-xs text-white font-bold mt-0.5">Processed within 7 working days</p>
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
                  <p className="text-[10px] text-white mt-2 font-bold">MIN ₦1,000 · AVAILABLE ₦{netBalance.toLocaleString()}</p>
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
                    className="flex-1 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-black text-sm transition-all">
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
