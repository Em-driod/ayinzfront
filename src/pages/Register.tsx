import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Music, Zap, Star, Globe, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const inputClass = 'w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder-white focus:border-white focus:outline-none transition-colors font-medium text-sm';
const labelClass = 'block text-[10px] font-black text-white uppercase tracking-[0.2em] mb-2';

const plans = [
  { id: 'basic', name: 'Artiste', price: '₦35,000/yr', icon: Music, amount: 35000 },
  { id: 'premium', name: 'Record Label', price: '₦50,000/yr', icon: Zap, amount: 50000 },
  { id: 'plus', name: 'Label Plus', price: '₦85,000/yr', icon: Star, amount: 85000 },
  { id: 'standard', name: 'Enterprise', price: '₦350,000/yr', icon: Globe, amount: 350000 },
  { id: 'plan500', name: 'Ayinz 500', price: '₦500/yr', icon: Zap, amount: 500 },
];

declare const PaystackPop: any;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planFromUrl = searchParams.get('plan') || 'basic';

  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    subscription: planFromUrl, agreeToTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeToTerms) { setError('Please agree to the Terms of Service.'); return; }
    setError('');
    
    const selectedPlan = plans.find(p => p.id === formData.subscription);
    if (!selectedPlan) return;

    setLoading(true);

    try {
      const pstack = (window as any).PaystackPop;
      if (!pstack) {
        setError('Payment system (Paystack) not loaded. Please refresh or check your internet.');
        setLoading(false);
        return;
      }

      const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      if (!publicKey) {
        setError('Payment system error: Public key missing. Please contact support.');
        setLoading(false);
        return;
      }

      const handler = pstack.setup({
        key: publicKey,
        email: formData.email,
        amount: selectedPlan.amount * 100, // kobo
        currency: 'NGN',
        callback: (response: any) => {
          console.log('Paystack payment complete. Response:', response);
          // Payment successful! Now register.
          const reference = response.reference || response.trxref || (typeof response === 'string' ? response : null);
          
          const registerUser = async () => {
            try {
              const res = await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                subscription: formData.subscription,
                paymentReference: reference
              });
              localStorage.setItem('token', res.data.token);
              localStorage.setItem('user', JSON.stringify(res.data.user));
              navigate('/dashboard');
            } catch (err: any) {
              console.error('Registration API error:', err.response?.data || err.message);
              setError(err.response?.data?.error || 'Registration failed after payment. Please contact support.');
              setLoading(false);
            }
          };
          registerUser();
        },
        onClose: () => {
          setLoading(false);
          setError('Payment cancelled. You must pay to create an account.');
        }
      });
      handler.openIframe();
    } catch (err: any) {
      console.error('Paystack initialization error:', err);
      setError('Payment initialization failed. Please ensure you have a stable internet connection.');
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

              {/* Plan Select */}
              <div>
                <label className={labelClass}>Choose Plan</label>
                <div className="grid grid-cols-2 gap-2">
                  {plans.map((plan) => {
                    const isSelected = formData.subscription === plan.id;
                    return (
                      <button key={plan.id} type="button"
                        onClick={() => setFormData({ ...formData, subscription: plan.id })}
                        className={`p-3 rounded-xl border transition-all text-center ${
                          isSelected
                            ? 'border-red-600 bg-red-600/10 text-white'
                            : 'border-zinc-900 text-white hover:border-zinc-700 hover:text-zinc-400'
                        }`}
                      >
                        <plan.icon className={`w-4 h-4 mx-auto mb-1 ${isSelected ? 'text-red-500' : 'text-white'}`} />
                        <div className="text-[11px] font-black">{plan.name}</div>
                        <div className="text-[9px] text-white font-bold mt-0.5">{plan.price}</div>
                      </button>
                    );
                  })}
                </div>
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
