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
    <div className="min-h-screen bg-[#050505] bg-mesh p-4 md:p-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Hero Section */}
        <div className="glass-dark border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-black/40">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[120px] -mr-32 -mt-32 pointer-events-none" />
            <div className="relative z-10 text-center max-w-2xl mx-auto">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-4">Ayinz Help Center</p>
                <h1 className="text-4xl md:text-6xl font-display italic tracking-tight text-white uppercase leading-none mb-6 text-center">
                    How can we<br/>help you?
                </h1>
                
                <div className="relative max-w-xl mx-auto mt-8 flex border border-white/10 rounded-2xl bg-black/50 overflow-hidden shadow-2xl focus-within:border-red-600/50 transition-colors">
                    <div className="pl-4 flex items-center justify-center">
                      <Search className="w-5 h-5 text-zinc-500" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search for answers, guides, or keywords..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent py-4 pl-3 pr-4 text-white placeholder-zinc-600 focus:outline-none font-bold text-sm"
                    />
                </div>
            </div>
        </div>

        {/* Quick Links Categories */}
        <div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-red-600" /> Help Categories
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
                {CATEGORIES.map(category => (
                    <div key={category.id} className="glass-dark p-6 rounded-2xl border border-white/5 hover:border-red-600/30 transition-all cursor-pointer group flex items-start gap-4 shadow-xl shadow-black/20">
                        <div className="w-12 h-12 shrink-0 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-600/20 group-hover:scale-110 transition-transform">
                            <category.icon className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1 group-hover:text-red-400 transition-colors">{category.title}</h4>
                            <p className="text-xs font-bold text-zinc-500">{category.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
            {/* FAQs */}
            <div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-red-600" /> Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                    {FAQS.map((faq, idx) => (
                        <div key={idx} className="glass-dark border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors shadow-lg shadow-black/20">
                            <button 
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                className="w-full p-5 text-left flex justify-between items-center bg-transparent"
                            >
                                <span className="text-sm font-black text-zinc-300 pr-4 leading-relaxed">{faq.question}</span>
                                <ChevronDown className={`w-4 h-4 text-red-600 shrink-0 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {openFaq === idx && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }} 
                                        animate={{ height: 'auto', opacity: 1 }} 
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-5 pt-0 text-sm font-bold text-zinc-500 border-t border-white/5 leading-relaxed bg-black/20">
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
            <div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-red-600" /> Create a Support Ticket
                </h3>
                <div className="glass-dark p-6 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden shadow-2xl shadow-black/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[80px] pointer-events-none" />

                    <div className="mb-6 pb-6 border-b border-white/5">
                        <p className="text-xs font-bold text-zinc-400">Can't find what you're looking for?</p>
                        <p className="text-sm font-bold text-white mt-1 flex items-center gap-2">
                            Open a ticket & our team will assist you.
                        </p>
                    </div>

                    <form onSubmit={handleSupportSubmit} className="space-y-4 relative z-10">
                        <AnimatePresence>
                            {success && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 p-4 bg-red-600/10 border border-red-600/20 text-red-500 rounded-2xl text-xs font-bold shadow-lg shadow-red-600/5">
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                {success}
                            </motion.div>
                            )}
                            {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 p-4 bg-orange-600/10 border border-orange-600/20 text-orange-500 rounded-2xl text-xs font-bold">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Subject</label>
                            <input 
                                type="text" 
                                required
                                value={form.subject}
                                onChange={(e) => setForm({...form, subject: e.target.value})}
                                placeholder="What is this regarding?" 
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:border-red-600/50 outline-none transition-colors font-bold text-sm shadow-inner"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Message</label>
                            <textarea 
                                required
                                value={form.message}
                                onChange={(e) => setForm({...form, message: e.target.value})}
                                placeholder="Describe your issue in detail..." 
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:border-red-600/50 outline-none transition-colors font-bold text-sm shadow-inner h-32 resize-none"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 bg-red-600 text-black rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-500 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-red-600/20"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>Open Ticket <ArrowUpRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>

        {/* My Tickets List */}
        <div className="pt-8 border-t border-white/5">
            <h3 className="text-xl font-display uppercase italic tracking-tight text-white mb-6">Your Support Tickets</h3>
            {tickets.length === 0 ? (
                <div className="text-center py-12 glass-dark rounded-3xl border border-white/5 shadow-xl shadow-black/20">
                    <FileText className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-500 font-bold text-sm">You have no matching support tickets.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map(ticket => (
                        <div 
                            key={ticket._id} 
                            onClick={() => handleOpenTicket(ticket)}
                            className="glass-dark p-5 rounded-2xl border border-white/5 hover:border-red-600/30 transition-all cursor-pointer flex items-center justify-between group shadow-lg shadow-black/20"
                        >
                            <div className="flex flex-col">
                                <div className="flex items-center gap-3 mb-1">
                                    {ticket.unreadUser && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                                    )}
                                    <h4 className={`text-sm font-black uppercase tracking-widest ${ticket.unreadUser ? 'text-white' : 'text-zinc-300'} group-hover:text-red-400 transition-colors`}>
                                        {ticket.subject}
                                    </h4>
                                </div>
                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                                    Created: {new Date(ticket.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                                ticket.status === 'Resolved' 
                                    ? 'bg-zinc-900 border-zinc-800 text-zinc-500' 
                                    : 'bg-red-600/10 border-red-600/20 text-red-500'
                                }`}>
                                {ticket.status}
                            </div>
                        </div>
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
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                >
                    <motion.div 
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="bg-zinc-950 border border-zinc-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[80vh] max-h-[800px]"
                    >
                        {/* Chat Header */}
                        <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-[#050505]">
                            <div>
                                <h3 className="text-white font-black uppercase tracking-widest text-sm mb-1">{activeTicket.subject}</h3>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" /> Updated: {new Date(activeTicket.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${
                                    activeTicket.status === 'Resolved' ? 'bg-zinc-900 text-zinc-500 border-zinc-800' : 'bg-red-600/10 border-red-600/20 text-red-500'
                                }`}>
                                    {activeTicket.status}
                                </span>
                                <button onClick={() => setActiveTicket(null)} className="text-zinc-600 hover:text-white transition-colors bg-zinc-900 hover:bg-zinc-800 p-2 rounded-xl">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Chat History */}
                        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0a0a0a] bg-mesh scroll-smooth">
                            {activeTicket.messages.map((msg, idx) => {
                                const isUser = msg.sender === 'user';
                                return (
                                    <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                                        <div className={`flex items-center gap-2 mb-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-lg ${
                                                isUser ? 'bg-red-600/20 border-red-600/30 text-red-500' : 'bg-blue-600/20 border-blue-600/30 text-blue-500'
                                            }`}>
                                                {isUser ? <User className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                                {isUser ? 'You' : 'Ayinz Support'}
                                            </span>
                                        </div>
                                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-bold shadow-xl leading-relaxed whitespace-pre-wrap ${
                                            isUser 
                                                ? 'bg-zinc-900 text-white rounded-tr-none border border-zinc-800' 
                                                : 'glass-dark border border-white/10 text-zinc-200 rounded-tl-none'
                                        }`}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-2 px-1">
                                            {new Date(msg.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Chat Input */}
                        {activeTicket.status === 'Open' ? (
                            <form onSubmit={handleReplySubmit} className="p-4 bg-[#050505] border-t border-zinc-900 flex gap-3">
                                <input 
                                    type="text" 
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    placeholder="Type your reply here..."
                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-red-600/50 outline-none transition-colors font-bold text-sm shadow-inner"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!replyMessage.trim() || replying}
                                    className="px-6 bg-red-600 text-black hover:bg-red-500 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 flex items-center justify-center disabled:opacity-50"
                                >
                                    {replying ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </form>
                        ) : (
                            <div className="p-5 bg-zinc-950/80 border-t border-zinc-900 text-center text-xs font-bold text-zinc-500">
                                This ticket has been marked as resolved and closed to new replies.
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
}
