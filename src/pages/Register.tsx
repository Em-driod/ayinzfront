import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const inputClass = 'w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder-white focus:border-white focus:outline-none transition-colors font-medium text-sm';
const labelClass = 'block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-2';

// Removed plans and PaystackPop

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    artisteName: '', phone: '', whatsapp: '',
    stateOfOrigin: '', nationality: '', socialLink: '',
    agreeToTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeToTerms) { setError('Please agree to the Terms of Service.'); return; }
    setError('');

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        artisteName: formData.artisteName,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        stateOfOrigin: formData.stateOfOrigin,
        nationality: formData.nationality,
        socialLink: formData.socialLink,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration API error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a]">
      {/* Background */}
      <div className="absolute inset-0">
        <img src="/ref.jpeg" alt="Studio" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a]/90 via-[#0a0a0a]/70 to-[#0a0a0a]/90" />
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
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-zinc-800">
              <img src="/ayinz.jpeg" alt="Ayinz" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">Ayinz</span>
          </div>

          {/* Card */}
          <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-900 rounded-2xl p-7">
            <div className="mb-7">
              <h1 className="text-xl font-black text-white tracking-tight">Create Account</h1>
              <p className="text-xs text-white font-bold mt-0.5">Start distributing your music to every major store.</p>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-2 p-3.5 bg-red-500/5 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className={labelClass}>Full Name</label>
                <input id="name" type="text" required placeholder="Your name" className={inputClass}
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>Email</label>
                <input id="email" type="email" required placeholder="you@example.com" className={inputClass}
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>

              <div>
                <label htmlFor="password" className={labelClass}>Password</label>
                <div className="relative">
                  <input id="password" type={showPassword ? 'text' : 'password'} required minLength={8}
                    placeholder="Min. 8 characters" className={inputClass}
                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white hover:text-zinc-400 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="artisteName" className={labelClass}>Artiste Name</label>
                <input id="artisteName" type="text" placeholder="Your stage name" className={inputClass}
                  value={formData.artisteName} onChange={e => setFormData({ ...formData, artisteName: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="phone" className={labelClass}>Phone Number</label>
                  <input id="phone" type="tel" placeholder="+234 800 000 0000" className={inputClass}
                    value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="whatsapp" className={labelClass}>WhatsApp</label>
                  <input id="whatsapp" type="tel" placeholder="+234 800 000 0000" className={inputClass}
                    value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="stateOfOrigin" className={labelClass}>State of Origin</label>
                  <input id="stateOfOrigin" type="text" placeholder="Lagos" className={inputClass}
                    value={formData.stateOfOrigin} onChange={e => setFormData({ ...formData, stateOfOrigin: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="nationality" className={labelClass}>Nationality</label>
                  <input id="nationality" type="text" placeholder="Nigerian" className={inputClass}
                    value={formData.nationality} onChange={e => setFormData({ ...formData, nationality: e.target.value })} />
                </div>
              </div>

              <div>
                <label htmlFor="socialLink" className={labelClass}>IG / FB Profile Link</label>
                <input id="socialLink" type="url" placeholder="https://instagram.com/yourname" className={inputClass}
                  value={formData.socialLink} onChange={e => setFormData({ ...formData, socialLink: e.target.value })} />
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2.5 pt-1">
                <input id="terms" type="checkbox" required
                  className="mt-0.5 w-4 h-4 bg-zinc-900 border border-zinc-800 rounded"
                  checked={formData.agreeToTerms}
                  onChange={e => setFormData({ ...formData, agreeToTerms: e.target.checked })} />
                <label htmlFor="terms" className="text-xs text-white font-bold leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-white hover:text-white transition-colors">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-white hover:text-white transition-colors">Privacy Policy</a>
                </label>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-white hover:bg-zinc-100 text-black py-3.5 rounded-xl font-black text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading
                  ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  : <>Create Account <ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>

            <p className="text-center text-xs text-white font-bold mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-white hover:text-white transition-colors font-black">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
