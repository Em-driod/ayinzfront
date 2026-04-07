import React, { useState, useEffect, useRef } from 'react';
import { Search, HelpCircle, Mail, MessageSquare, Play, FileText, ChevronDown, CheckCircle, AlertCircle, ArrowUpRight, Clock, User, ShieldAlert, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const CATEGORIES = [
  { id: 'account', title: 'Account & Settings', icon: HelpCircle, description: 'Manage your profile, billing, and subscription plans.' },
  { id: 'distribution', title: 'Distribution', icon: Play, description: 'Everything about releasing music to Spotify, Apple Music, etc.' },
  { id: 'royalties', title: 'Royalties & Payouts', icon: FileText, description: 'Track streams, earnings, and withdrawal processes.' },
  { id: 'guidelines', title: 'Content Guidelines', icon: MessageSquare, description: 'Audio quality, artwork specs, and copyright policies.' },
];

const FAQS = [
  { question: 'How long does it take for my release to go live?', answer: 'Releases usually take 3–5 working days to appear on major platforms. For standard plans, it can take up to 7 days depending on the store.' },
  { question: 'What is the minimum payout amount?', answer: 'The minimum payout threshold is ₦1,000. You can request a withdrawal from the Revenue page once you reach this amount.' },
  { question: 'Can I change my artist name after distribution?', answer: 'It is highly difficult to change artist names after distribution across all platforms. Please make sure your metadata is 100% correct before submitting.' },
  { question: 'How do I resolve a copyright infringement claim?', answer: 'If your release is flagged for copyright, please contact us immediately with proof of ownership (licenses, stems, or copyright documents).' },
];

interface IMessage {
  _id?: string;
  sender: 'user' | 'admin';
  content: string;
  timestamp: string;
}

interface ITicket {
  _id: string;
  subject: string;
  status: 'Open' | 'Resolved';
  messages: IMessage[];
  unreadUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Ticket States
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<ITicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);
  
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Contact Form State
  const [form, setForm] = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchTickets = async () => {
      try {
          const res = await api.get('/support/my');
          setTickets(res.data.tickets);
      } catch (err) {
          console.error('Failed to fetch tickets', err);
      }
  };

  useEffect(() => {
      fetchTickets();
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
      if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
  }, [activeTicket?.messages]);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    if (!form.subject || !form.message) {
        setError('Please fill out all fields.');
        setLoading(false);
        return;
    }

    try {
        await api.post('/support/contact', form);
        setSuccess('Your ticket has been created! View it below.');
        setForm({ subject: '', message: '' });
        fetchTickets();
    } catch (err: any) {
        console.error('Support submission error:', err);
        setError(err.response?.data?.error || 'Failed to create ticket. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  const handleOpenTicket = async (ticket: ITicket) => {
      setActiveTicket(ticket);
      // Mark as read if user opens it and it has unread messages
      if (ticket.unreadUser) {
          try {
              await api.patch(`/support/${ticket._id}/read`);
              fetchTickets();
          } catch (e) { console.error('Failed to read ticket'); }
      }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!replyMessage.trim() || !activeTicket) return;

      setReplying(true);
      try {
          const res = await api.post(`/support/${activeTicket._id}/message`, { message: replyMessage });
          setActiveTicket(res.data.ticket);
          setReplyMessage('');
          fetchTickets();
      } catch (err) {
          console.error("Failed to send reply", err);
      } finally {
          setReplying(false);
      }
  };

  return (
    <div className="min-h-screen">
      <div className="relative z-10 p-5 md:p-10 max-w-6xl mx-auto space-y-12 md:space-y-20">

        {/* Hero Section */}
        <div className="relative group overflow-hidden rounded-[3rem] p-10 md:p-20 text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 to-transparent opacity-50" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[120px] -mr-48 -mt-48 pointer-events-none" />
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 max-w-3xl mx-auto"
            >
                <p className="label-caps text-red-500 mb-6 tracking-[0.5em]">Global Support Hub</p>
                <h1 className="text-5xl md:text-8xl font-display italic tracking-tight text-white uppercase leading-[0.8] mb-10">
                    How can we<br/>
                    <span className="text-gradient-red italic">assist you?</span>
                </h1>
                
                <div className="relative max-w-2xl mx-auto group/search">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/20 to-amber-600/20 rounded-3xl blur opacity-0 group-focus-within/search:opacity-100 transition duration-500" />
                    <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl transition-all group-focus-within/search:border-red-600/50">
                        <div className="pl-6">
                          <Search className="w-5 h-5 text-white" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Query documentation, guides, or system status..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent py-6 px-4 text-white placeholder-zinc-600 focus:outline-none font-bold text-sm tracking-wide"
                        />
                    </div>
                </div>
            </motion.div>
        </div>

        {/* Help Categories */}
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/5" />
                <h3 className="label-caps opacity-50">Knowledge Clusters</h3>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/5" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {CATEGORIES.map(category => (
                    <motion.div 
                        key={category.id}
                        whileHover={{ y: -5 }}
                        className="glass-card-premium p-8 rounded-[2rem] border-white/5 hover:border-red-600/30 transition-all cursor-pointer group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-2xl">
                            <category.icon className="w-6 h-6 text-white group-hover:text-red-500 transition-colors" />
                        </div>
                        <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-2 group-hover:text-red-500 transition-colors">
                            {category.title}
                        </h4>
                        <p className="text-[11px] font-bold text-white leading-relaxed group-hover:text-white transition-colors">
                            {category.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 md:gap-20">
            {/* FAQs */}
            <div className="space-y-10">
                <div>
                   <h3 className="label-caps text-red-500 mb-2">Verified Answers</h3>
                   <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-none">Frequently Asked</h2>
                </div>
                <div className="space-y-4">
                    {FAQS.map((faq, idx) => (
                        <div key={idx} className="glass-card-premium border-white/5 rounded-[2rem] overflow-hidden hover:border-white/10 transition-all">
                            <button 
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                className="w-full p-8 text-left flex justify-between items-center bg-transparent group"
                            >
                                <span className="text-sm font-black text-white group-hover:text-white transition-colors pr-6 leading-relaxed uppercase tracking-tight">{faq.question}</span>
                                <div className={`w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center transition-transform ${openFaq === idx ? 'rotate-180 bg-red-600/10 border-red-600/20' : ''}`}>
                                    <ChevronDown className={`w-5 h-5 ${openFaq === idx ? 'text-red-500' : 'text-white'}`} />
                                </div>
                            </button>
                            <AnimatePresence>
                                {openFaq === idx && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }} 
                                        animate={{ height: 'auto', opacity: 1 }} 
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-8 pb-8 text-[13px] font-bold text-white leading-relaxed border-t border-white/5 pt-6 italic">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ticket Creation Form */}
            <div className="space-y-10">
                <div>
                   <h3 className="label-caps text-red-500 mb-2">Direct Contact</h3>
                   <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-none">Open a Ticket</h2>
                </div>
                <div className="glass-card-premium p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[80px] pointer-events-none" />

                    <form onSubmit={handleSupportSubmit} className="space-y-6 relative z-10">
                        <AnimatePresence>
                            {success && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex items-center gap-4 p-5 bg-red-600/10 border border-red-600/20 text-red-500 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl">
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                {success}
                            </motion.div>
                            )}
                            {error && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex items-center gap-4 p-5 bg-amber-600/10 border border-amber-600/20 text-amber-500 rounded-2xl text-[11px] font-black uppercase tracking-widest">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="label-caps opacity-50">Problem Categorization</label>
                            <input 
                                type="text" 
                                required
                                value={form.subject}
                                onChange={(e) => setForm({...form, subject: e.target.value})}
                                placeholder="e.g. Distribution Delay, Payout Issue" 
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-red-600/50 outline-none transition-all font-bold text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="label-caps opacity-50">Detailed Briefing</label>
                            <textarea 
                                required
                                value={form.message}
                                onChange={(e) => setForm({...form, message: e.target.value})}
                                placeholder="Provide as much context as possible for a faster resolution..." 
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-red-600/50 outline-none transition-all font-bold text-sm h-40 resize-none"
                            />
                        </div>
                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full group bg-white text-black hover:bg-red-600 hover:text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 shadow-2xl"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>Initialize Resolution <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        {/* My Tickets List */}
        <div className="pt-20 border-t border-white/5 space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="label-caps text-red-500 mb-2">Active Communications</h3>
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-none">Your Tickets</h2>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                </div>
            </div>

            {tickets.length === 0 ? (
                <div className="text-center py-20 glass-card-premium rounded-[3rem] border-dashed border-white/5 bg-transparent">
                    <MessageSquare className="w-16 h-16 text-white mx-auto mb-6" />
                    <p className="text-white font-black uppercase tracking-widest text-[11px]">No active support threads detected</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tickets.map((ticket, i) => (
                        <motion.div 
                            key={ticket._id} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => handleOpenTicket(ticket)}
                            className="glass-card-premium p-8 rounded-[2.5rem] border-white/5 hover:border-red-600/30 transition-all cursor-pointer flex flex-col justify-between group h-48"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    {ticket.unreadUser && (
                                        <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
                                    )}
                                    <h4 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-red-500 transition-colors line-clamp-1">
                                        {ticket.subject}
                                    </h4>
                                </div>
                                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                    ticket.status === 'Resolved' 
                                        ? 'bg-zinc-900 border-zinc-800 text-white' 
                                        : 'bg-red-600/10 border-red-600/20 text-red-500 group-hover:bg-red-600 group-hover:text-white'
                                    }`}>
                                    {ticket.status}
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                                         <Clock className="w-4 h-4 text-white" />
                                    </div>
                                    <p className="text-[10px] text-white font-black uppercase tracking-[0.15em]">
                                        Ref: {ticket._id.slice(-8).toUpperCase()} · {new Date(ticket.createdAt).toLocaleDateString('en-GB')}
                                    </p>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-white group-hover:text-red-500 transition-colors" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>

        {/* Chat Modal */}
        <AnimatePresence>
            {activeTicket && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 40 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 40 }}
                        className="bg-zinc-950 border border-white/10 w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col h-[85vh] relative"
                    >
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-[120px] pointer-events-none" />

                        {/* Chat Header */}
                        <div className="p-8 border-b border-white/5 flex justify-between items-center relative z-10">
                            <div>
                                <div className="flex items-center gap-4 mb-2">
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-white">{activeTicket.subject}</h3>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xl ${
                                        activeTicket.status === 'Resolved' ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-red-600/10 border-red-600/20 text-red-500'
                                    }`}>
                                        {activeTicket.status}
                                    </span>
                                </div>
                                <p className="label-caps opacity-50 flex items-center gap-3">
                                    Ticket ID: <span className="font-mono text-white/40">{activeTicket._id.toUpperCase()}</span>
                                    <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                    Updated {new Date(activeTicket.updatedAt).toLocaleString()}
                                </p>
                            </div>
                            <button onClick={() => setActiveTicket(null)} className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-white hover:text-white hover:bg-red-600 hover:border-red-600 transition-all active:scale-90 group">
                                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        {/* Chat History */}
                        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar relative z-10">
                            {activeTicket.messages.map((msg, idx) => {
                                const isUser = msg.sender === 'user';
                                return (
                                    <motion.div 
                                        key={idx} 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className={`flex items-center gap-4 mb-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xl ${
                                                isUser ? 'bg-red-600/20 border-red-600/30 text-red-500' : 'bg-zinc-900 border-white/10 text-white'
                                            }`}>
                                                {isUser ? <User className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                                            </div>
                                            <span className="label-caps opacity-40">
                                                {isUser ? 'Authorized Artiste' : 'System Administrator'}
                                            </span>
                                        </div>
                                        <div className={`max-w-[75%] p-6 rounded-3xl text-sm font-bold shadow-2xl leading-relaxed whitespace-pre-wrap ${
                                            isUser 
                                                ? 'bg-red-600 text-white rounded-tr-none border border-red-500 shadow-red-900/20' 
                                                : 'glass-card-premium border-white/10 text-zinc-200 rounded-tl-none'
                                        }`}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[9px] text-white font-black uppercase tracking-widest mt-3 px-2">
                                            {new Date(msg.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Chat Input */}
                        <div className="p-8 border-t border-white/5 relative z-10">
                             {activeTicket.status === 'Open' ? (
                                <form onSubmit={handleReplySubmit} className="flex gap-4">
                                    <input 
                                        type="text" 
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="Formulate your response..."
                                        className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl px-8 py-5 text-white placeholder-zinc-600 focus:border-red-600/50 outline-none transition-all font-bold text-sm shadow-inner"
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={!replyMessage.trim() || replying}
                                        className="w-20 bg-white text-black hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-2xl flex items-center justify-center disabled:opacity-50 active:scale-95 group"
                                    >
                                        {replying 
                                          ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> 
                                          : <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        }
                                    </button>
                                </form>
                            ) : (
                                <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-[2rem] text-center text-[10px] font-black uppercase tracking-[0.3em] text-white italic">
                                    Transmission terminated · Ticket marked as resolved
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
}
