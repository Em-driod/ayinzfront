import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Upload, ArrowLeft, Lock, CheckCircle, AlertCircle, Plus, X, User as UserIcon, Settings, Info, Calendar, Hash, Type, ShieldAlert, ArrowUpRight, Clock, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const PLAN_TYPES: Record<string, string[]> = {
  basic: ['Single', 'EP', 'Album'],
  premium: ['Single', 'EP', 'Album'],
  plus: ['Single', 'EP', 'Album'],
  standard: ['Single', 'EP', 'Album'],
};

const ROLES = ['Main Artist', 'Featured Artist', 'Producer', 'Engineer', 'Remixer', 'Composer'];
const AI_OPTIONS = ['No AI used', 'AI assisted lyrics', 'AI assisted melody', 'AI generated vocals', 'Full AI generation'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Yoruba', 'Igbo', 'Hausa', 'Swahili', 'Portuguese', 'Japanese', 'Chinese'];

export default function NewRelease() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const plan: string = user.subscription || 'basic';
  const allowedTypes = PLAN_TYPES[plan] || ['Single'];

  const [formData, setFormData] = useState({
    title: '',
    artist: user.name || '',
    type: 'Single',
    genre: '',
    release_date: '',
    contact_email: user.email || '',
    ai_assisted: 'No AI used',
    is_instrumental: false,
    language: 'English',
    explicit: 'No',
    isrc: '',
    lyrics: '',
    label: user.name || '',
    copyright_date_release: new Date().getFullYear().toString() + ' ' + (user.name || ''),
    copyright_date_recording: new Date().getFullYear().toString() + ' ' + (user.name || ''),
  });

  const [contributors, setContributors] = useState<{name: string, role: string}[]>([]);
  const [songwriters, setSongwriters] = useState<string[]>([]);
  const [musicians, setMusicians] = useState<{name: string, instrument: string}[]>([]);

  const [songFile, setSongFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addContributor = () => setContributors([...contributors, { name: '', role: 'Producer' }]);
  const removeContributor = (index: number) => setContributors(contributors.filter((_, i) => i !== index));
  const updateContributor = (index: number, field: 'name' | 'role', value: string) => {
    const next = [...contributors];
    next[index][field] = value;
    setContributors(next);
  };

  const addSongwriter = () => setSongwriters([...songwriters, '']);
  const removeSongwriter = (index: number) => setSongwriters(songwriters.filter((_, i) => i !== index));
  const updateSongwriter = (index: number, value: string) => {
    const next = [...songwriters];
    next[index] = value;
    setSongwriters(next);
  };

  const addMusician = () => setMusicians([...musicians, { name: '', instrument: '' }]);
  const removeMusician = (index: number) => setMusicians(musicians.filter((_, i) => i !== index));
  const updateMusician = (index: number, field: 'name' | 'instrument', value: string) => {
    const next = [...musicians];
    next[index][field] = value;
    setMusicians(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!songFile) {
      setError('Please select a song file to upload.');
      setLoading(false);
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value.toString());
    });
    
    data.append('song', songFile);
    if (coverImageFile) data.append('coverImage', coverImageFile);
    data.append('contributors', JSON.stringify(contributors.filter(c => c.name.trim())));
    data.append('songwriters', JSON.stringify(songwriters.filter(s => s.trim())));
    data.append('musicians', JSON.stringify(musicians.filter(m => m.name.trim())));

    try {
      await api.post('/releases', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Release submitted — we\'ll begin distribution shortly.');
      setTimeout(() => navigate('/releases'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit release. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const allTypes = ['Single', 'EP', 'Album'];

  return (
    <div className="min-h-screen bg-mesh-main">
      <div className="relative z-10 p-5 md:p-10 max-w-7xl mx-auto space-y-12">

        {/* ─── Back & Progress ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <button
              onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
              className="flex items-center text-white hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em] group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
              {step > 1 ? 'Previous Phase' : 'Exit Submission'}
            </button>
            
            <div className="flex items-center gap-3">
                {[1, 2, 3, 4].map(s => (
                    <div key={s} className="flex items-center gap-1.5">
                        <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-red-600 shadow-glow-red' : 'bg-white/5'}`} />
                    </div>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* ─── Left Panel: Context ─── */}
            <div className="lg:col-span-4 space-y-8">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <p className="label-caps text-red-500 mb-2">Phase 0{step} of 04</p>
                    <h1 className="text-4xl md:text-5xl font-display italic tracking-tight text-white uppercase leading-[1.1] mb-6 pb-2">
                        {step === 1 && <>Release<br/><span className="text-gradient-red px-1">Identity</span></>}
                        {step === 2 && <>Technical<br/><span className="text-gradient-red px-1">Metadata</span></>}
                        {step === 3 && <>Production<br/><span className="text-gradient-red px-1">Credits</span></>}
                        {step === 4 && <>Digital<br/><span className="text-gradient-red px-1">Assets</span></>}
                    </h1>
                    <p className="text-xs text-white font-bold leading-relaxed">
                        {step === 1 && "Establish the foundation of your release. Define the title, primary artist, and distribution tier."}
                        {step === 2 && "Configure the underlying DNA of your audio. Languages, explicit status, and legal copyright records."}
                        {step === 3 && "Credit your collaborators. Producers, session musicians, and the architects of your sound."}
                        {step === 4 && "Finalize the submission. Upload your master recording and high-fidelity artwork."}
                    </p>
                </motion.div>

                <div className="glass-card-premium p-6 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                         <p className="label-caps opacity-40">Active Tier</p>
                         <span className="text-[10px] font-black uppercase text-red-500 bg-red-600/10 px-3 py-1 rounded-full border border-red-600/20">{plan}</span>
                    </div>
                    <div className="flex items-center justify-between">
                         <p className="label-caps opacity-40">Verification</p>
                         <ShieldAlert className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>

            {/* ─── Right Panel: Form ─── */}
            <div className="lg:col-span-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="glass-card-premium rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] pointer-events-none" />
                        
                        {/* Status Messages */}
                        {error && (
                          <div className="mb-8 flex items-center gap-4 p-5 bg-red-600/10 border border-red-600/20 text-red-500 rounded-2xl text-[11px] font-black uppercase tracking-widest">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                          </div>
                        )}
                        {success && (
                          <div className="mb-8 flex items-center gap-4 p-5 bg-red-600/10 border border-red-600/20 text-red-500 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            {success}
                          </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="label-caps opacity-50">Track Title</label>
                                            <input type="text" required placeholder="Masterpiece Name" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-red-600/50 outline-none transition-all font-bold text-sm"
                                                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="label-caps opacity-50">Main Artist</label>
                                            <input type="text" required placeholder="Artist or Band" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-red-600/50 outline-none transition-all font-bold text-sm"
                                                value={formData.artist} onChange={e => setFormData({ ...formData, artist: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="label-caps opacity-50">Primary Genre</label>
                                            <input type="text" required placeholder="e.g. Afrobeats, Hip-Hop" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-red-600/50 outline-none transition-all font-bold text-sm"
                                                value={formData.genre} onChange={e => setFormData({ ...formData, genre: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="label-caps opacity-50">Launch Date</label>
                                            <input type="date" required className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-red-600/50 outline-none transition-all font-bold text-sm [color-scheme:dark]"
                                                value={formData.release_date} onChange={e => setFormData({ ...formData, release_date: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <label className="label-caps opacity-50">Release Configuration</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {allTypes.map((type) => {
                                            const isLocked = !allowedTypes.includes(type);
                                            const isSelected = formData.type === type && !isLocked;
                                            return (
                                                <button
                                                key={type}
                                                type="button"
                                                disabled={isLocked}
                                                onClick={() => !isLocked && setFormData({ ...formData, type })}
                                                className={`p-6 rounded-3xl border transition-all text-center relative group flex flex-col items-center justify-center gap-3 ${
                                                    isSelected
                                                    ? 'border-red-600 bg-red-600/10 text-white shadow-[0_0_20px_rgba(220,38,38,0.1)]'
                                                    : isLocked
                                                    ? 'border-zinc-900 bg-black/40 text-white cursor-not-allowed opacity-50'
                                                    : 'border-white/5 bg-white/[0.02] text-white hover:border-white/10 hover:text-zinc-300'
                                                }`}
                                                >
                                                {isLocked && <Lock className="w-3 h-3 absolute top-4 right-4 text-white" />}
                                                <Music className={`w-5 h-5 transition-transform group-hover:scale-110 ${isSelected ? 'text-red-500' : 'text-white'}`} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{type}</span>
                                                </button>
                                            );
                                            })}
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <button type="button" onClick={() => setStep(2)} className="w-full bg-white text-black hover:bg-red-600 hover:text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-3 group active:scale-95">
                                            Proceed to Metadata <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="label-caps opacity-50">Track Language</label>
                                            <select className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-red-600/50 outline-none transition-all font-bold text-sm" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})}>
                                                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="label-caps opacity-50">Label Designation</label>
                                            <input type="text" placeholder="Independent Artist" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-red-600/50 outline-none transition-all font-bold text-sm" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="label-caps opacity-50">Content Advisory</label>
                                            <div className="flex gap-4">
                                                {['No', 'Yes'].map(opt => (
                                                    <button key={opt} type="button" onClick={() => setFormData({...formData, explicit: opt})}
                                                        className={`flex-1 py-4 px-4 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${formData.explicit === opt ? 'bg-red-600 border-red-600 text-black shadow-glow-red' : 'bg-white/[0.02] border-white/5 text-white hover:border-white/10'}`}>
                                                        {opt === 'Yes' ? 'Explicit' : 'Clean'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="label-caps opacity-50">ISRC Identifier</label>
                                            <input type="text" placeholder="e.g. US-ABC-21-00001" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-red-600/50 outline-none transition-all font-bold text-sm" value={formData.isrc} onChange={e => setFormData({...formData, isrc: e.target.value})} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                         <label className="label-caps opacity-50">AI Utilization</label>
                                         <select className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-red-600/50 outline-none transition-all font-bold text-sm" value={formData.ai_assisted} onChange={e => setFormData({...formData, ai_assisted: e.target.value})}>
                                            {AI_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="label-caps opacity-50">Copyright Release (P)</label>
                                            <input type="text" placeholder="2024 Artist Name" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-red-600/50 outline-none transition-all font-bold text-sm" value={formData.copyright_date_release} onChange={e => setFormData({...formData, copyright_date_release: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="label-caps opacity-50">Copyright Recording (C)</label>
                                            <input type="text" placeholder="2024 Artist Name" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-red-600/50 outline-none transition-all font-bold text-sm" value={formData.copyright_date_recording} onChange={e => setFormData({...formData, copyright_date_recording: e.target.value})} />
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <button type="button" onClick={() => setStep(3)} className="w-full bg-white text-black hover:bg-red-600 hover:text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-3 group active:scale-95">
                                            Configure Credits <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <label className="label-caps opacity-50">Authorized Contributors</label>
                                            <button type="button" onClick={addContributor} className="flex items-center gap-2 text-[10px] font-black uppercase text-red-500 hover:text-white transition-colors group">
                                                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Add Artist
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            <AnimatePresence>
                                            {contributors.map((c, i) => (
                                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key={i} className="flex gap-4 items-center group/item">
                                                    <input type="text" placeholder="Legal Name" className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-red-600/50 outline-none transition-all font-bold text-sm" value={c.name} onChange={e => updateContributor(i, 'name', e.target.value)} />
                                                    <select className="w-48 bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-red-600/50 outline-none transition-all font-bold text-sm" value={c.role} onChange={e => updateContributor(i, 'role', e.target.value)}>
                                                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                                    </select>
                                                    <button type="button" onClick={() => removeContributor(i)} className="w-12 h-12 rounded-xl border border-white/5 flex items-center justify-center text-white hover:bg-red-600/10 hover:text-red-500 transition-all">
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <label className="label-caps opacity-50">Lyricists & Songwriters</label>
                                            <button type="button" onClick={addSongwriter} className="flex items-center gap-2 text-[10px] font-black uppercase text-red-500 hover:text-white transition-colors group">
                                                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Add Writer
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            <AnimatePresence>
                                            {songwriters.map((s, i) => (
                                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key={i} className="flex gap-4 items-center">
                                                    <input type="text" placeholder="Full Legal Name" className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-red-600/50 outline-none transition-all font-bold text-sm" value={s} onChange={e => updateSongwriter(i, e.target.value)} />
                                                    <button type="button" onClick={() => removeSongwriter(i)} className="w-12 h-12 rounded-xl border border-white/5 flex items-center justify-center text-white hover:bg-red-600/10 hover:text-red-500 transition-all">
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <button type="button" onClick={() => setStep(4)} className="w-full bg-white text-black hover:bg-red-600 hover:text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-3 group active:scale-95">
                                            Sync Digital Assets <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="label-caps opacity-50">Master Audio (WAV/FLAC)</label>
                                            <div
                                                onClick={() => document.getElementById('song-file-upload')?.click()}
                                                className="h-64 rounded-[2rem] border-2 border-dashed border-white/5 bg-white/[0.02] hover:bg-red-600/5 hover:border-red-600/30 transition-all cursor-pointer group flex flex-col items-center justify-center text-center p-8 relative overflow-hidden"
                                            >
                                                <div className="p-5 rounded-2xl bg-zinc-900 border border-white/5 mb-6 group-hover:scale-110 transition-transform shadow-2xl">
                                                    <Music className={`w-8 h-8 ${songFile ? 'text-red-500' : 'text-white'}`} />
                                                </div>
                                                <p className="text-xs font-black uppercase tracking-widest text-white group-hover:text-white transition-colors">
                                                    {songFile ? songFile.name : 'Choose Master Audio'}
                                                </p>
                                                <p className="text-[10px] font-bold text-white mt-2 italic">Lossless high-fidelity expected</p>
                                                <input id="song-file-upload" type="file" required className="sr-only" accept=".mp3,.wav"
                                                    onChange={e => { if (e.target.files?.[0]) setSongFile(e.target.files[0]); }} />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="label-caps opacity-50">Visual Identity (Cover Art)</label>
                                            <div
                                                onClick={() => document.getElementById('cover-art-upload')?.click()}
                                                className="h-64 rounded-[2rem] border-2 border-dashed border-white/5 bg-white/[0.02] hover:bg-red-600/5 hover:border-red-600/30 transition-all cursor-pointer group relative overflow-hidden flex items-center justify-center"
                                            >
                                                {coverImageFile ? (
                                                    <>
                                                        <img src={URL.createObjectURL(coverImageFile)} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                                                        <div className="relative z-10 flex flex-col items-center gap-3">
                                                             <div className="w-12 h-12 rounded-xl bg-black/50 backdrop-blur-md flex items-center justify-center">
                                                                <Upload className="w-6 h-6 text-white" />
                                                             </div>
                                                             <p className="text-[10px] font-black uppercase text-white tracking-widest">Update Artwork</p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        <div className="p-5 rounded-2xl bg-zinc-900 border border-white/5 mb-6 group-hover:scale-110 transition-transform shadow-2xl">
                                                            <Upload className="w-8 h-8 text-white group-hover:text-red-500 transition-colors" />
                                                        </div>
                                                        <p className="text-xs font-black uppercase text-white group-hover:text-white tracking-widest">Choose Image</p>
                                                        <p className="text-[10px] font-bold text-white mt-2 italic">3000x3000px Recommended</p>
                                                    </div>
                                                )}
                                                <input id="cover-art-upload" type="file" className="sr-only" accept=".jpeg,.jpg,.png"
                                                    onChange={e => { if (e.target.files?.[0]) setCoverImageFile(e.target.files[0]); }} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/5">
                                        <button
                                            type="submit"
                                            disabled={loading || !songFile}
                                            className="w-full bg-red-600 hover:bg-red-500 text-black py-6 rounded-2xl font-black text-sm uppercase tracking-[0.4em] transition-all shadow-[0_0_50px_rgba(220,38,38,0.2)] flex items-center justify-center gap-4 group disabled:opacity-50 active:scale-[0.98]"
                                        >
                                            {loading ? (
                                                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>Ship to Digital Platforms <Upload className="w-6 h-6 group-hover:-translate-y-1 transition-transform" /></>
                                            )}
                                        </button>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest text-center mt-8 px-10 leading-relaxed">
                                            By facilitating this transmission, you authorize Ayinz to distribute your intellectual property to global stores.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </form>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  );
}
