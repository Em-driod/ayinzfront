import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Music, Users, Globe, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    id: 'basic',
    name: 'Artiste Plan',
    subtitle: 'Basic',
    price: 35_000,
    original: 45_000,
    accounts: '1 Artist Account',
    icon: Music,
    popular: false,
    features: [
      '1 Artist Account',
      'Unlimited releases',
      'Analytics suite',
      '4–7 day delivery',
      'Single, Album, EP support',
    ],
  },
  {
    id: 'premium',
    name: 'Record Label Plan',
    subtitle: 'Premium',
    price: 50_000,
    original: 65_000,
    accounts: '10–15 Artist Accounts',
    icon: Users,
    popular: true,
    features: [
      '10–15 Artist Accounts',
      'Unlimited releases',
      'Single, Album, EP upload',
      'Easy payouts',
      '4–7 day delivery',
    ],
  },
  {
    id: 'plus',
    name: 'Record Label Plus',
    subtitle: 'Plus',
    price: 85_000,
    original: 110_000,
    accounts: '20+ Artist Accounts',
    icon: Users,
    popular: false,
    features: [
      '20+ Artist Accounts',
      'Unlimited releases',
      'Single, EP, Album support',
      'Easy payouts',
      'Priority delivery',
    ],
  },
  {
    id: 'standard',
    name: 'Enterprise Edition',
    subtitle: 'Standard',
    price: 350_000,
    original: 450_000,
    accounts: 'Unlimited Accounts',
    icon: Globe,
    popular: false,
    features: [
      'Unlimited Artist Accounts',
      'Unlimited releases',
      'Single, EP, Album support',
      'Transparent royalty payouts',
      'Priority support',
    ],
  },
  {
    id: 'plan500',
    name: 'Sonic 500 Plan',
    subtitle: 'Test Plan',
    price: 500,
    original: 1000,
    accounts: '1 Artist Account',
    icon: Zap, // Added missing icon import in thought
    popular: false,
    features: [
      '1 Artist Account',
      'Test distribution',
      'Basic analytics',
      'Temporary plan',
    ],
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Subtle top gradient */}
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-red-950/10 to-transparent pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-zinc-900">
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl overflow-hidden border border-zinc-800">
            <img src="/ayinz.jpeg" alt="Ayinz" className="w-full h-full object-cover" />
          </div>
          <span className="text-lg font-black text-white tracking-tight">Ayinz</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-xs font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-[0.15em]">Sign In</Link>
          <Link to="/register" className="bg-white text-black text-xs font-black px-4 py-2 rounded-xl hover:bg-zinc-100 active:scale-95 transition-all">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 text-center pt-16 pb-14 px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-4">Distribution Plans</p>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
            Simple, Transparent<br />Pricing
          </h1>
          <p className="text-zinc-500 text-sm md:text-base font-bold max-w-lg mx-auto">
            No hidden fees. No long-term contracts. Keep 100% of your royalties.
          </p>
        </motion.div>
      </div>

      {/* Plans Grid */}
      <div className="relative z-10 px-5 md:px-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`relative rounded-2xl border flex flex-col ${
                plan.popular
                  ? 'bg-white border-white text-black'
                  : 'bg-zinc-950 border-zinc-900 text-white'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-6 flex-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 ${plan.popular ? 'text-zinc-500' : 'text-zinc-700'}`}>
                      {plan.subtitle}
                    </p>
                    <h3 className={`text-lg font-black tracking-tight ${plan.popular ? 'text-black' : 'text-white'}`}>{plan.name}</h3>
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${plan.popular ? 'bg-black/10' : 'bg-zinc-900 border border-zinc-800'}`}>
                    <plan.icon className={`w-4 h-4 ${plan.popular ? 'text-black' : 'text-zinc-600'}`} />
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-1.5 mb-0.5">
                    <span className={`text-3xl font-black tracking-tight ${plan.popular ? 'text-black' : 'text-white'}`}>
                      ₦{plan.price.toLocaleString()}
                    </span>
                    <span className={`text-xs font-bold pb-1 ${plan.popular ? 'text-zinc-500' : 'text-zinc-700'}`}>/ Annually</span>
                  </div>
                  <p className={`text-[10px] font-black line-through ${plan.popular ? 'text-zinc-400' : 'text-zinc-700'}`}>
                    ₦{plan.original.toLocaleString()}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-2.5 mb-6">
                  {plan.features.map((feature, fi) => (
                    <div key={fi} className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        plan.popular ? 'bg-black/10' : 'bg-zinc-900 border border-zinc-800'
                      }`}>
                        <Check className={`w-2.5 h-2.5 ${plan.popular ? 'text-black' : 'text-red-500'}`} />
                      </div>
                      <span className={`text-xs font-bold ${plan.popular ? 'text-zinc-700' : 'text-zinc-500'}`}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="p-5 pt-0">
                <Link
                  to={`/register?plan=${plan.id}`}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all active:scale-95 ${
                    plan.popular
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800'
                  }`}
                >
                  Get Started <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-zinc-700 font-bold mt-10">
          Join thousands of artists distributing their music worldwide with Ayinz.
          <br />All plans include 100% royalty retention and no lock-in contracts.
        </p>
      </div>
    </div>
  );
}
