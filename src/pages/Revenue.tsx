import { useState, useEffect, FormEvent } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, CreditCard, ArrowUpRight, ArrowDownLeft, Clock, Music, Globe, X, AlertCircle } from 'lucide-react';
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
      <div className="bg-zinc-950 border border-zinc-800 shadow-2xl rounded-xl px-3 py-2.5">
        <p className="font-black text-white mb-1 text-[10px] uppercase tracking-wider border-b border-zinc-900 pb-1">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center justify-between gap-4 mt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-zinc-400 text-[10px]">{entry.name}:</span>
            </span>
            <span className="text-white font-mono font-black text-[10px]">₦{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const inputClass = 'w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder-zinc-700 focus:border-zinc-600 focus:outline-none transition-colors font-medium text-sm';
const labelClass = 'block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2';

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

  const handleRequestPayout = async (e: FormEvent) => {
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
    if (status === 'Rejected') return 'bg-zinc-800 text-zinc-400 border border-zinc-700';
    return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="relative z-10 p-4 md:p-8 lg:p-10 space-y-6 md:space-y-8">

        {/* ─── Header ─── */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
          <p className="label-caps mb-1.5 text-[9px]">Financial Records</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display italic tracking-tight text-white uppercase leading-[1.1] pb-1">
            Revenue <span className="text-gradient-red">Management</span>
          </h1>
        </motion.div>

        {/* ─── Balance Card + Stats ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-amber-600 rounded-[2rem] blur opacity-15 group-hover:opacity-30 transition duration-700" />
            <div className="relative glass-card-premium rounded-[2rem] p-5 md:p-7 flex flex-col justify-between min-h-[220px] md:min-h-[260px] overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 blur-[60px] -mr-24 -mt-24 rounded-full pointer-events-none" />

              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-8 bg-zinc-900/60 border border-white/5 rounded-lg flex items-center justify-center overflow-hidden">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-700 blur-sm opacity-50" />
                  </div>
                  <CreditCard className="w-5 h-5 text-zinc-600" />
                </div>
                <p className="label-caps opacity-50 mb-1 text-[9px]">Available Balance</p>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none">
                  ₦{netBalance.toLocaleString()}
                </h2>
                {pendingWithdrawals > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mt-3">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest">₦{pendingWithdrawals.toLocaleString()} Processing</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => { setPayoutForm(f => ({ ...f, amount: netBalance })); setShowModal(true); }}
                className="relative w-full bg-white text-black hover:bg-red-600 hover:text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl mt-4"
              >
                Request Payout <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Lifetime + Top Earner */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card-premium rounded-[2rem] p-5 md:p-7 flex flex-col justify-between group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center mb-auto shadow-xl group-hover:scale-105 transition-transform duration-500">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="mt-8">
              <p className="label-caps mb-1.5 opacity-60 text-[9px]">Lifetime Earnings</p>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">₦{totalRevenue.toLocaleString()}</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-red-500" /> All-time performance
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card-premium rounded-[2rem] p-5 md:p-7 flex flex-col justify-between group"
          >
            <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-auto shadow-xl group-hover:bg-zinc-800 transition-colors duration-500">
              <Music className="w-5 h-5 text-white group-hover:text-red-500 transition-colors" />
            </div>
            <div className="mt-8">
              <p className="label-caps mb-1.5 opacity-60 text-[9px]">Top Earner</p>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight truncate leading-none mb-1">
                {topRelease?.title.toUpperCase() || '—'}
              </h2>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">
                ₦{topRelease?.revenue?.toLocaleString() || 0} Generated
              </p>
            </div>
          </motion.div>
        </div>

        {/* ─── Revenue Distribution + Payout History ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">

          {/* Revenue Distribution Donut */}
          <div className="glass-card-premium rounded-[2rem] p-5 md:p-7">
            <p className="label-caps mb-5 text-[9px]">Revenue Distribution</p>
            {pieData.length > 0 ? (
              <>
                <div className="h-52 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={78} paddingAngle={3} dataKey="value" stroke="none">
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={PLATFORM_COLORS[entry.name] || '#52525b'} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Share</p>
                    <p className="text-lg font-black text-white leading-none">TOTAL</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {pieData.map(p => (
                    <div key={p.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[p.name] || '#52525b' }} />
                        <span className="text-[10px] text-white font-black uppercase tracking-widest">{p.name}</span>
                      </div>
                      <span className="text-sm font-black text-white font-mono">₦{Math.round(p.value).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Globe className="w-10 h-10 text-zinc-700 mb-3" />
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Revenue data pending…</p>
              </div>
            )}
          </div>

          {/* Payout History */}
          <div className="lg:col-span-2 glass-card-premium rounded-[2rem] p-5 md:p-7 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm md:text-base font-black text-white tracking-tight uppercase">Payout History</h2>
                <p className="label-caps mt-0.5 text-[8px] opacity-60">Transaction Logs</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center">
                <Clock className="w-4 h-4 text-zinc-600" />
              </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {payouts.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center">
                  <CreditCard className="w-10 h-10 text-zinc-700 mb-3" />
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">No transactions yet</p>
                </div>
              ) : payouts.map((payout, i) => (
                <motion.div
                  key={payout._id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      payout.status === 'Completed' ? 'bg-red-600/10' :
                      payout.status === 'Rejected' ? 'bg-zinc-900' : 'bg-amber-500/10'
                    }`}>
                      {payout.status === 'Completed'
                        ? <ArrowDownLeft className="w-4 h-4 text-red-500" />
                        : payout.status === 'Rejected' ? <X className="w-4 h-4 text-zinc-500" />
                        : <Clock className="w-4 h-4 text-amber-500" />
                      }
                    </div>
                    <div>
                      <p className="text-white font-black text-base font-mono">₦{payout.amount.toLocaleString()}</p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                        {new Date(payout.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {payout.bankName.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${payoutStatusStyle(payout.status)}`}>
                    {payout.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Withdrawal Modal ─── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-zinc-950 border border-zinc-900 rounded-t-[2rem] sm:rounded-[2rem] p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto"
            >
              <div className="w-10 h-1 bg-zinc-800 rounded-full mx-auto mb-5 sm:hidden" />

              <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-zinc-600 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Payout Request</p>
                <h3 className="text-xl font-black text-white">Withdraw Funds</h3>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">Processed within 7 working days</p>
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-red-400 text-sm font-bold mb-5 bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
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
                  <p className="text-[9px] text-zinc-600 mt-2 font-bold uppercase tracking-wider">Min ₦1,000 · Available ₦{netBalance.toLocaleString()}</p>
                </div>

                <div>
                  <label className={labelClass}>Bank Name</label>
                  <input type="text" required placeholder="e.g. Zenith Bank" className={inputClass}
                    value={payoutForm.bankName} onChange={e => setPayoutForm({ ...payoutForm, bankName: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-3">
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

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-black text-sm transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <><ArrowUpRight className="w-4 h-4" /> Request</>
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
