import React, { useState, useEffect } from 'react';
import { User, Lock, Shield, CreditCard, Save, Camera, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';

export default function Settings() {
  const [profile, setProfile] = useState({ name: '', email: '', avatar_url: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userPlan, setUserPlan] = useState('basic');
  const [activeTab, setActiveTab] = useState('profile');

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

  const planInfo: Record<string, { label: string; desc: string; perks: string[] }> = {
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
  const labelClass = 'block text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto">

        {/* Page header */}
        <div className="mb-8 pb-6 border-b border-zinc-900">
          <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-1.5">Account</p>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Settings</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Tab Navigation */}
          <div className="flex md:flex-col gap-2 overflow-x-auto pb-1 md:pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 md:w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-zinc-900 text-white border border-zinc-800'
                    : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-950'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-red-500' : 'text-zinc-700'}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="md:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >

              {/* ── Profile Tab ── */}
              {activeTab === 'profile' && (
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-8 text-center sm:text-left">
                    <div className="relative group flex-shrink-0">
                      <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white text-2xl font-black overflow-hidden">
                        {profile.avatar_url
                          ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          : profile.name.charAt(0).toUpperCase()
                        }
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm rounded-2xl">
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="pt-1">
                      <h3 className="text-lg font-black text-white mb-0.5">{profile.name || 'Your Name'}</h3>
                      <p className="text-xs text-zinc-600 font-bold uppercase tracking-wider">Artist Profile</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    <div>
                      <label className={labelClass}>Display Name</label>
                      <input type="text" required className={inputClass} value={profile.name}
                        onChange={e => setProfile({ ...profile, name: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelClass}>Account Email</label>
                      <div className="relative">
                        <input type="email" readOnly className={`${inputClass} cursor-not-allowed text-zinc-600 italic`} value={profile.email} />
                        <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800" />
                      </div>
                      <p className="text-[10px] text-zinc-700 mt-1.5 ml-1 font-bold uppercase tracking-wider">Contact support to change your email</p>
                    </div>
                    <div>
                      <label className={labelClass}>Profile Photo URL</label>
                      <input type="text" placeholder="https://example.com/photo.jpg" className={inputClass}
                        value={profile.avatar_url} onChange={e => setProfile({ ...profile, avatar_url: e.target.value })} />
                    </div>
                    <button type="submit" disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-colors disabled:opacity-50 mt-2"
                    >
                      {submitting
                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <><Save className="w-4 h-4" /> Save Changes</>
                      }
                    </button>
                  </form>
                </div>
              )}

              {/* ── Security Tab ── */}
              {activeTab === 'security' && (
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 md:p-8">
                  <div className="mb-7">
                    <h3 className="text-base font-black text-white tracking-tight">Account Security</h3>
                    <p className="text-xs text-zinc-600 font-bold mt-0.5 uppercase tracking-wider">Change your password</p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-5">
                    <div>
                      <label className={labelClass}>Current Password</label>
                      <input type="password" required placeholder="••••••••" className={inputClass}
                        value={passwordData.currentPassword}
                        onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>New Password</label>
                        <input type="password" required minLength={6} placeholder="Min. 6 characters" className={inputClass}
                          value={passwordData.newPassword}
                          onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelClass}>Confirm Password</label>
                        <input type="password" required placeholder="Repeat new password" className={inputClass}
                          value={passwordData.confirmPassword}
                          onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                      </div>
                    </div>
                    <button type="submit" disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-colors disabled:opacity-50 mt-2"
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
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 md:p-8">
                  <div className="mb-7">
                    <h3 className="text-base font-black text-white tracking-tight">Active Plan</h3>
                    <p className="text-xs text-zinc-600 font-bold mt-0.5 uppercase tracking-wider">Your current distribution tier</p>
                  </div>

                  <div className="bg-black border border-zinc-900 rounded-2xl p-5 md:p-6 mb-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div>
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.25em] mb-2">Distribution Plan</p>
                        <h4 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">{currentPlan.label}</h4>
                        <p className="text-xs text-zinc-600 font-bold uppercase tracking-wider">{currentPlan.desc}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => window.location.href = '/pricing'}
                          className="w-full md:w-auto bg-white text-black px-6 py-3 rounded-xl text-sm font-black hover:bg-zinc-100 active:scale-95 transition-all flex items-center gap-2"
                        >
                          Change Plan <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentPlan.perks.map((perk, i) => (
                      <div key={i} className="flex items-center gap-3 bg-black border border-zinc-900 p-3.5 rounded-xl">
                        <CheckCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-xs font-bold text-zinc-400">{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
