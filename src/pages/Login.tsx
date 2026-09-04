import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import ThemeToggle from '../components/ThemeToggle';

const inputClass = 'w-full bg-[var(--input-bg)] border border-[var(--line-2)] rounded-xl px-4 py-3.5 text-[var(--fg0)] placeholder-[var(--placeholder)] focus:border-[var(--fg0)] focus:outline-none transition-colors font-medium text-sm';
const labelClass = 'block text-[10px] font-black text-[var(--fg0)] uppercase tracking-[0.2em] mb-2';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--bg0)]">
      {/* Background */}
      <div className="absolute inset-0">
        <img src="/ref.jpeg" alt="Studio" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg0)]/90 via-[var(--bg0)]/70 to-[var(--bg0)]/90" />
      </div>

      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle variant="mobile" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="flex items-center justify-center space-x-2.5 mb-10">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-[var(--line-2)]">
              <img src="/ayinz.jpeg" alt="Ayinz" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-black text-[var(--fg0)] tracking-tight">Ayinz</span>
          </div>

          {/* Card */}
          <div className="bg-[var(--bg1)]/80 backdrop-blur-xl border border-[var(--line)] rounded-2xl p-7">
            <div className="mb-7">
              <h1 className="text-xl font-black text-[var(--fg0)] tracking-tight">Sign In</h1>
              <p className="text-xs text-[var(--fg0)] font-bold mt-0.5">Welcome back — continue distributing your music.</p>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-2 p-3.5 bg-red-500/5 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className={labelClass}>Email</label>
                <input
                  id="email" type="email" required placeholder="you@example.com" className={inputClass}
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="password" className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    id="password" type={showPassword ? 'text' : 'password'}
                    required placeholder="••••••••" className={inputClass}
                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--fg0)] hover:text-[var(--fg2)] transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <a href="#" className="text-[11px] text-[var(--fg0)] hover:text-[var(--fg2)] transition-colors font-bold">Forgot password?</a>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-black text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                style={{ background: 'var(--invert-bg)', color: 'var(--invert-fg)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--invert-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--invert-bg)')}
              >
                {loading
                  ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : <>Sign In <ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>

            <p className="text-center text-xs text-[var(--fg0)] font-bold mt-6">
              New to Ayinz?{' '}
              <Link to="/register" className="text-[var(--fg2)] hover:text-[var(--fg0)] transition-colors font-black">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
