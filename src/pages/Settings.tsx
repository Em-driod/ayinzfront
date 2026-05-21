import { useState, useEffect, FormEvent } from 'react';
import { User, Lock, Shield, CreditCard, Save, Camera, CheckCircle, ChevronRight, AlertCircle, ArrowUpRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { PLANS } from '../config/plans';


export default function Settings() {
  const [profile, setProfile] = useState({ name: '', email: '', avatar_url: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userPlan, setUserPlan] = useState('none');
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedPlanId, setSelectedPlanId] = useState('basic');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showPlanGrid, setShowPlanGrid] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        setProfile({
          name: res.data.user.name,
          email: res.data.user.email,
          avatar_url: res.data.user.avatar_url || ''
        });
        setUserPlan(res.data.user.subscription);
      } catch {
        console.error('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.patch('/user/profile', { name: profile.name, avatar_url: profile.avatar_url });
      setMessage({ type: 'success', text: res.data.message });
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...profile }));
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Update failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.patch('/user/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: res.data.message });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Password change failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpgrade = async (selectedPlan: typeof PLANS[0]) => {
    setPaymentLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const pstack = (window as any).PaystackPop;
      if (!pstack) {
        setMessage({ type: 'error', text: 'Payment system failed to load. Please refresh.' });
        setPaymentLoading(false);
        return;
      }
      const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      if (!publicKey) {
        setMessage({ type: 'error', text: 'Configuration error: Missing Paystack key.' });
        setPaymentLoading(false);
        return;
      }
      if (!profile.email) {
        setMessage({ type: 'error', text: 'Account error: Email not found.' });
        setPaymentLoading(false);
        return;
      }
      const handler = pstack.setup({
        key: publicKey,
        email: profile.email,
        amount: Math.round(selectedPlan.amount * 100),
        currency: 'NGN',
        callback: (response: any) => {
          const reference = response.reference || response.trxref;
          const verifyAndUpgrade = async () => {
            try {
              const res = await api.post('/user/upgrade-subscription', {
                subscription: selectedPlan.id,
                paymentReference: reference
              });
              setUserPlan(res.data.user.subscription);
              const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
              localStorage.setItem('user', JSON.stringify({ ...storedUser, subscription: res.data.user.subscription }));
              setMessage({ type: 'success', text: 'Subscription upgraded successfully!' });
              setShowPlanGrid(false);
            } catch (err: any) {
              setMessage({ type: 'error', text: err.response?.data?.error || 'Upgrade failed. Contact support.' });
            } finally {
              setPaymentLoading(false);
            }
          };
          verifyAndUpgrade();
        },
        onClose: () => { setPaymentLoading(false); }
      });
      handler.openIframe();
    } catch {
      setMessage({ type: 'error', text: 'Payment initialization failed.' });
      setPaymentLoading(false);
    }
  };

  const planInfo: Record<string, { label: string; desc: string; perks: string[] }> = {
    none: {
      label: 'No Active Plan', desc: 'Upgrade to start distributing',
      perks: ['Global distribution', '100% royalty retention', 'Analytics dashboard', 'Priority support']
    },
    basic: {
      label: 'Artiste Plan', desc: 'Basic distribution',
      perks: ['1 Artist Account', 'Unlimited releases', 'Analytics suite', '4–7 day delivery']
    },
    premium: {
      label: 'Record Label Plan', desc: 'Professional distribution',
      perks: ['10–15 Artist Accounts', 'Unlimited releases', 'Easy payouts', '4–7 day delivery']
    },
    plus: {
      label: 'Record Label Plus', desc: 'Advanced distribution',
      perks: ['20+ Artist Accounts', 'Unlimited releases', 'Easy payouts', 'Priority delivery']
    },
    standard: {
      label: 'Enterprise Edition', desc: 'Label-grade distribution',
      perks: ['Unlimited Artist Accounts', 'Unlimited releases', 'Transparent payouts', 'Priority support']
    }
  };

  const currentPlan = planInfo[userPlan] || planInfo.basic;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'subscription', label: 'Plan', icon: CreditCard }
  ];

  const inputCls = 'w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-3.5 text-white focus:border-red-600/50 outline-none transition-all font-bold text-sm';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="relative z-10 p-4 md:p-8 lg:p-10 max-w-5xl mx-auto space-y-6 md:space-y-8">

        {/* ─── Header ─── */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
          <p className="label-caps mb-1.5 text-[9px]">Management Center</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display italic tracking-tight text-white uppercase leading-[1.1] pb-1">
            Account <span className="text-gradient-red">Settings</span>
          </h1>
        </motion.div>

        {/* Alert */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3.5 rounded-xl flex items-center gap-3 text-sm font-semibold border ${
              message.type === 'success'
                ? 'bg-red-600/10 text-red-500 border-red-600/20'
                : 'bg-red-500/5 text-red-400 border-red-500/20'
            }`}
          >
            {message.type === 'success'
              ? <CheckCircle className="w-4 h-4 shrink-0" />
              : <AlertCircle className="w-4 h-4 shrink-0" />}
            <p>{message.text}</p>
          </motion.div>
        )}

        {/* ─── Horizontal Tab Bar (mobile) / Sidebar (desktop) ─── */}
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-5 lg:gap-8">

          {/* Tab Nav */}
          <div className="lg:col-span-1">
            {/* Mobile: horizontal scroll tabs */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-black transition-all whitespace-nowrap shrink-0 lg:w-full lg:justify-between ${
                    activeTab === tab.id
                      ? 'bg-red-600 text-white shadow-xl shadow-red-600/20'
                      : 'text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <tab.icon className={`w-4 h-4 shrink-0 ${activeTab === tab.id ? 'text-white' : 'text-zinc-500'}`} />
                    <span className="uppercase tracking-widest text-[11px]">{tab.label}</span>
                  </div>
                  {activeTab === tab.id && <div className="hidden lg:block w-1.5 h-1.5 rounded-full bg-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >

              {/* ── Profile Tab ── */}
              {activeTab === 'profile' && (
                <div className="glass-card-premium p-5 md:p-8 rounded-[2rem]">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                    <div className="relative group shrink-0">
                      <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                      <div className="relative w-20 h-20 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white text-2xl font-display italic overflow-hidden">
                        {profile.avatar_url
                          ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          : profile.name.charAt(0).toUpperCase()
                        }
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm">
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="pt-1 text-center sm:text-left">
                      <p className="label-caps text-red-500 mb-1 text-[9px]">Identity Verified</p>
                      <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none mb-1">{profile.name || 'ANONYMOUS'}</h3>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Artiste Tier</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="label-caps opacity-50 text-[9px]">Full Name</label>
                        <input type="text" required className={inputCls} value={profile.name}
                          onChange={e => setProfile({ ...profile, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="label-caps opacity-50 text-[9px]">Email (locked)</label>
                        <div className="relative">
                          <input type="email" readOnly className={`${inputCls} cursor-not-allowed opacity-50`} value={profile.email} />
                          <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="label-caps opacity-50 text-[9px]">Avatar URL</label>
                      <input type="text" placeholder="https://..." className={inputCls}
                        value={profile.avatar_url} onChange={e => setProfile({ ...profile, avatar_url: e.target.value })} />
                    </div>
                    <button type="submit" disabled={submitting}
                      className="w-full group bg-white text-black hover:bg-red-600 hover:text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-xl flex items-center justify-center gap-2.5 active:scale-95"
                    >
                      {submitting
                        ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        : <><Save className="w-4 h-4" /> Save Changes</>
                      }
                    </button>
                  </form>
                </div>
              )}

              {/* ── Security Tab ── */}
              {activeTab === 'security' && (
                <div className="glass-card-premium p-5 md:p-8 rounded-[2rem]">
                  <div className="mb-7">
                    <h3 className="text-xl font-black text-white tracking-tight uppercase">Security Vault</h3>
                    <p className="label-caps mt-1 opacity-60 text-[9px]">Manage authentication</p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-5">
                    <div className="space-y-2">
                      <label className="label-caps opacity-50 text-[9px]">Current Password</label>
                      <input type="password" required placeholder="••••••••" className={inputCls}
                        value={passwordData.currentPassword}
                        onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="label-caps opacity-50 text-[9px]">New Password</label>
                        <input type="password" required minLength={6} placeholder="Min. 6 chars" className={inputCls}
                          value={passwordData.newPassword}
                          onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="label-caps opacity-50 text-[9px]">Confirm Password</label>
                        <input type="password" required placeholder="Repeat new password" className={inputCls}
                          value={passwordData.confirmPassword}
                          onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                      </div>
                    </div>
                    <button type="submit" disabled={submitting}
                      className="w-full bg-zinc-950 hover:bg-red-600/10 border border-white/5 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting
                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : 'Update Password'
                      }
                    </button>
                  </form>
                </div>
              )}

              {/* ── Plan Tab ── */}
              {activeTab === 'subscription' && (
                <div className="glass-card-premium p-5 md:p-8 rounded-[2rem] space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight uppercase">Plan Status</h3>
                    <p className="label-caps mt-1 opacity-60 text-[9px]">Manage your distribution tier</p>
                  </div>

                  {/* Current plan banner */}
                  <div className={`bg-gradient-to-br from-zinc-950 border rounded-[1.5rem] p-5 md:p-7 relative overflow-hidden ${
                    userPlan === 'none' ? 'border-amber-500/20 to-amber-900/10' : 'border-red-600/20 to-red-900/10'
                  }`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 blur-2xl pointer-events-none" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className={`label-caps mb-2 text-[9px] ${userPlan === 'none' ? 'text-amber-500' : 'text-red-500'}`}>
                          Active Tier
                        </p>
                        <h4 className="text-2xl md:text-3xl font-display italic text-white tracking-tight leading-none mb-1">
                          {currentPlan.label}
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{currentPlan.desc}</p>
                      </div>
                      {userPlan !== 'none' && !showPlanGrid && (
                        <button
                          onClick={() => setShowPlanGrid(true)}
                          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                          <ChevronRight className="w-3.5 h-3.5" /> Change Plan
                        </button>
                      )}
                    </div>
                  </div>

                  {(userPlan === 'none' || showPlanGrid) ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PLANS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedPlanId(p.id);
                              handleUpgrade(p);
                            }}
                            disabled={paymentLoading}
                            className={`p-5 rounded-2xl border text-left transition-all group flex flex-col disabled:opacity-60 ${
                              selectedPlanId === p.id && paymentLoading
                                ? 'border-red-600 bg-red-600/10'
                                : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-[9px] font-black uppercase text-zinc-500">{p.subtitle}</p>
                              <div className="flex items-center gap-1.5">
                                {userPlan === p.id && <span className="text-[8px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full uppercase">Current</span>}
                                {selectedPlanId === p.id && paymentLoading && <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />}
                                {selectedPlanId === p.id && !paymentLoading && <Check className="w-3.5 h-3.5 text-red-500" />}
                              </div>
                            </div>
                            <h3 className="text-base font-black text-white mb-1 uppercase">{p.name}</h3>
                            <p className="text-lg font-black text-red-500 mb-auto">
                              ₦{p.price.toLocaleString()} <span className="text-[9px] text-zinc-600 uppercase">/ {p.period}</span>
                            </p>
                            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase text-zinc-500 group-hover:text-white transition-colors">
                                {userPlan === p.id ? 'Current Plan' : 'Subscribe Now'}
                              </span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                            </div>
                          </button>
                        ))}
                      </div>

                      {showPlanGrid && userPlan !== 'none' && (
                        <div className="flex justify-center pt-2">
                          <button
                            onClick={() => setShowPlanGrid(false)}
                            className="text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentPlan.perks.map((perk, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/5 p-4 rounded-2xl group hover:bg-white/[0.05] transition-colors">
                          <div className="w-7 h-7 rounded-lg bg-red-600/10 flex items-center justify-center shrink-0">
                            <CheckCircle className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition-transform" />
                          </div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{perk}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
