import React, { useState, useEffect } from 'react';
import { User, Lock, Shield, CreditCard, Save, Camera, CheckCircle, ChevronRight, AlertCircle, ArrowUpRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { PLANS } from '../config/plans';

declare const PaystackPop: any;

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
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

  const handleChangePassword = async (e: React.FormEvent) => {
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
        setMessage({ type: 'error', text: 'Payment system not loaded. Please check your connection.' });
        setPaymentLoading(false);
        return;
      }

      const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      const handler = pstack.setup({
        key: publicKey,
        email: profile.email,
        amount: selectedPlan.amount * 100,
        currency: 'NGN',
        callback: async (response: any) => {
          const reference = response.reference || response.trxref;
          try {
            const res = await api.post('/user/upgrade-subscription', {
              subscription: selectedPlan.id,
              paymentReference: reference
            });
            setUserPlan(res.data.user.subscription);
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...storedUser, subscription: res.data.user.subscription }));
            setMessage({ type: 'success', text: 'Subscription upgraded successfully!' });
          } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Upgrade failed after payment.' });
          } finally {
            setPaymentLoading(false);
          }
        },
        onClose: () => {
          setPaymentLoading(false);
        }
      });
      handler.openIframe();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Payment initialization failed.' });
      setPaymentLoading(false);
    }
  };

  const planInfo: Record<string, { label: string; desc: string; perks: string[] }> = {
    none: {
      label: 'No Active Plan', desc: 'Upgrade to start distributing',
      perks: ['Global storefront distribution', '100% royalty retention', 'Analytics dashboard', 'Priority support']
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

  const inputClass = 'w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder-zinc-700 focus:border-zinc-600 focus:outline-none transition-colors font-medium text-sm';
  const labelClass = 'block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-2';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="relative z-10 p-5 md:p-10 max-w-6xl mx-auto space-y-10">

        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="label-caps mb-2">Management Center</p>
            <h1 className="text-4xl md:text-6xl font-display italic tracking-tight text-white uppercase leading-[1.1] pb-2">
              Account<br/>
              <span className="text-gradient-red px-1">Settings</span>
            </h1>
          </motion.div>
        </div>

        {/* Alert */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl flex items-center space-x-3 text-sm font-semibold border ${
              message.type === 'success'
                ? 'bg-red-600/10 text-red-500 border-red-600/20'
                : 'bg-red-500/5 text-red-400 border-red-500/20'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <p>{message.text}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-black transition-all group ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white shadow-2xl shadow-red-600/20'
                    : 'text-white hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-white group-hover:text-white'}`} />
                  <span className="uppercase tracking-widest">{tab.label}</span>
                </div>
                {activeTab === tab.id && <motion.div layoutId="activeTab" className="w-1.5 h-1.5 rounded-full bg-white shadow-glow" />}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >

              {/* ── Profile Tab ── */}
              {activeTab === 'profile' && (
                <div className="glass-card-premium p-6 md:p-12 rounded-[2.5rem]">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-12">
                    <div className="relative group">
                       <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                       <div className="relative w-24 h-24 rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white text-3xl font-display italic overflow-hidden">
                        {profile.avatar_url
                          ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          : profile.name.charAt(0).toUpperCase()
                        }
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 text-center sm:text-left">
                       <p className="label-caps text-red-500 mb-1">Identity Verified</p>
                       <h3 className="text-3xl font-black text-white tracking-tight leading-none mb-2">{profile.name || 'ANONYMOUS'}</h3>
                       <p className="text-[11px] text-white font-black uppercase tracking-widest">Artiste Tier</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="label-caps opacity-50">Legal Full Name</label>
                          <input type="text" required className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-red-600/50 outline-none transition-all font-bold" value={profile.name}
                            onChange={e => setProfile({ ...profile, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="label-caps opacity-50">Verified Email</label>
                          <div className="relative">
                            <input type="email" readOnly className="w-full bg-white/[0.01] border border-white/5 rounded-2xl px-6 py-4 text-white italic cursor-not-allowed font-bold" value={profile.email} />
                            <Shield className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/5" />
                          </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                      <label className="label-caps opacity-50">Custom Avatar Endpoint</label>
                      <input type="text" placeholder="https://cdn.ayinz.io/avatar/v1" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-red-600/50 outline-none transition-all font-bold"
                        value={profile.avatar_url} onChange={e => setProfile({ ...profile, avatar_url: e.target.value })} />
                    </div>
                    <div className="pt-4">
                        <button type="submit" disabled={submitting}
                          className="w-full group bg-white text-black hover:bg-red-600 hover:text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-50 shadow-2xl flex items-center justify-center gap-3 active:scale-95"
                        >
                          {submitting
                            ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            : <><Save className="w-5 h-5 group-hover:scale-110 transition-transform" /> Synchronize Records</>
                          }
                        </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ── Security Tab ── */}
              {activeTab === 'security' && (
                <div className="glass-card-premium p-6 md:p-12 rounded-[2.5rem]">
                  <div className="mb-10">
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase">Security Vault</h3>
                    <p className="label-caps mt-2 opacity-60">Manage authentication protocols</p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-2">
                      <label className="label-caps opacity-50">Current Password</label>
                      <input type="password" required placeholder="••••••••" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-red-600/50 outline-none transition-all font-bold"
                        value={passwordData.currentPassword}
                        onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="label-caps opacity-50">New Password</label>
                        <input type="password" required minLength={6} placeholder="Min. 6 characters" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-red-600/50 outline-none transition-all font-bold"
                          value={passwordData.newPassword}
                          onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="label-caps opacity-50">Confirm New Password</label>
                        <input type="password" required placeholder="Repeat new password" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-red-600/50 outline-none transition-all font-bold"
                          value={passwordData.confirmPassword}
                          onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                      </div>
                    </div>
                    <div className="pt-4">
                        <button type="submit" disabled={submitting}
                          className="w-full bg-zinc-950 hover:bg-red-600/10 border border-white/5 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                          {submitting
                            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : 'Update Authentication'
                          }
                        </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ── Plan Tab ── */}
              {activeTab === 'subscription' && (
                <div className="glass-card-premium p-6 md:p-12 rounded-[2.5rem]">
                  <div className="mb-10">
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase">Tier Status</h3>
                    <p className="label-caps mt-2 opacity-60">Manage your distribution capacity</p>
                  </div>

                  <div className={`bg-gradient-to-br from-zinc-950 border rounded-[2rem] p-8 md:p-10 mb-8 relative overflow-hidden group ${userPlan === 'none' ? 'border-amber-500/20 to-amber-900/10' : 'border-red-600/20 to-red-900/10'}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl pointer-events-none" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div>
                        <p className={`label-caps mb-3 ${userPlan === 'none' ? 'text-amber-500' : 'text-red-500'}`}>Active Distribution Tier</p>
                        <h4 className="text-4xl md:text-5xl font-display italic text-white tracking-tight leading-none mb-2">{currentPlan.label}</h4>
                        <p className="text-xs text-white font-black uppercase tracking-widest">{currentPlan.desc}</p>
                      </div>
                    </div>
                  </div>

                  {userPlan === 'none' ? (
                    <div className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {PLANS.map((p) => (
                          <button key={p.id} onClick={() => setSelectedPlanId(p.id)}
                            className={`p-6 rounded-3xl border text-left transition-all relative ${selectedPlanId === p.id ? 'border-red-600 bg-red-600/10 shadow-glow-red' : 'border-white/5 bg-white/[0.02] hover:border-white/10'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black uppercase text-white/50">{p.subtitle}</p>
                                {selectedPlanId === p.id && <Check className="w-4 h-4 text-red-500" />}
                            </div>
                            <h3 className="text-lg font-black text-white mb-1 uppercase italic">{p.name}</h3>
                            <p className="text-xl font-black text-red-500">₦{p.price.toLocaleString()} <span className="text-[10px] text-white/40 uppercase">/ {p.period}</span></p>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          const p = PLANS.find(x => x.id === selectedPlanId);
                          if (p) handleUpgrade(p);
                        }}
                        disabled={paymentLoading}
                        className="w-full bg-white text-black hover:bg-red-600 hover:text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 group disabled:opacity-50 shadow-2xl"
                      >
                        {paymentLoading
                          ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          : <><CreditCard className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Authorize Distribution Plan</>
                        }
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {currentPlan.perks.map((perk, i) => (
                        <div key={i} className="flex items-center gap-4 bg-white/[0.03] border border-white/5 p-5 rounded-2xl group hover:bg-white/[0.05] transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                          </div>
                          <span className="text-[11px] font-black text-white uppercase tracking-widest">{perk}</span>
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
