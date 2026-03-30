import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Upload, ArrowLeft, Lock, CheckCircle, AlertCircle, Plus, X, User as UserIcon, Settings, Info, Calendar, Hash, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const PLAN_TYPES: Record<string, string[]> = {
  basic: ['Single', 'EP', 'Album'],
  premium: ['Single', 'EP', 'Album'],
  premium_plus: ['Single', 'EP', 'Album'],
  standard: ['Single', 'EP', 'Album'],
};

const inputClass = 'w-full bg-black border border-zinc-900 rounded-xl px-4 py-3.5 text-white placeholder-zinc-700 focus:border-red-600 focus:outline-none transition-colors font-medium text-sm';
const labelClass = 'block text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2';

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
    // Basic Info
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value.toString());
    });
    
    // Files
    data.append('song', songFile);
    if (coverImageFile) data.append('coverImage', coverImageFile);

    // Complex Metadata
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
    <div className="min-h-screen bg-[#050505] bg-mesh p-4 md:p-8 pb-32">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-zinc-600 hover:text-white mb-7 transition-colors text-xs font-black uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-dark border border-white/5 rounded-3xl p-6 md:p-10 relative overflow-hidden"
        >
          {/* Header */}
          <div className="mb-10 pb-8 border-b border-white/5">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-2">Release Submission</p>
            <h1 className="text-4xl md:text-5xl font-display italic tracking-tight text-white uppercase leading-none">Global<br/>Distribution</h1>
            <div className="flex items-center gap-2 mt-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">Tier: {plan}</span>
            </div>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 flex items-center gap-3 p-4 bg-red-600/10 border border-red-600/20 text-red-500 rounded-2xl text-sm font-bold">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                {success}
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 flex items-center gap-3 p-4 bg-red-600/10 border border-red-600/20 text-red-500 rounded-2xl text-sm font-bold">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Section: Basic Info */}
            <div className="space-y-6">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-red-600" /> Basic Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Track Title</label>
                        <input type="text" required placeholder="Masterpiece Name" className={inputClass}
                            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    <div>
                        <label className={labelClass}>Main Artist</label>
                        <input type="text" required placeholder="Artist or Band" className={inputClass}
                            value={formData.artist} onChange={e => setFormData({ ...formData, artist: e.target.value })} />
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Primary Genre</label>
                        <input type="text" required placeholder="e.g. Afrobeats, Hip-Hop" className={inputClass}
                            value={formData.genre} onChange={e => setFormData({ ...formData, genre: e.target.value })} />
                    </div>
                    <div>
                        <label className={labelClass}>Target Release Date</label>
                        <input type="date" required className={inputClass}
                            value={formData.release_date} onChange={e => setFormData({ ...formData, release_date: e.target.value })} />
                    </div>
                </div>
                <div>
                  <label className={labelClass}>Contact Email</label>
                  <input type="email" required placeholder="for delivery notifications" className={inputClass}
                    value={formData.contact_email} onChange={e => setFormData({ ...formData, contact_email: e.target.value })} />
                </div>
            </div>

            {/* Section: Release Type */}
            <div className="space-y-6">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Music className="w-3.5 h-3.5 text-red-600" /> Release Type
                </h3>
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
                        className={`p-5 rounded-2xl border transition-all text-center relative group min-h-[100px] flex flex-col items-center justify-center ${
                            isSelected
                            ? 'border-red-600 bg-red-600/10 text-white shadow-lg shadow-red-600/10'
                            : isLocked
                            ? 'border-zinc-950 bg-black/40 text-zinc-800 cursor-not-allowed'
                            : 'border-white/5 bg-black/40 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
                        }`}
                        >
                        {isLocked && <Lock className="w-3 h-3 absolute top-3 right-3 text-zinc-800" />}
                        <Music className={`w-5 h-5 mb-2 transition-transform group-hover:scale-110 ${isLocked ? 'text-zinc-800' : isSelected ? 'text-red-500' : 'text-zinc-700'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{type}</span>
                        </button>
                    );
                    })}
                </div>
            </div>

            {/* Section: Contributions & Credits */}
            <div className="space-y-8 p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-2 -mt-2">
                    <UserIcon className="w-3.5 h-3.5 text-red-600" /> Credits & Contributions
                </h3>

                {/* Contributors */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className={labelClass}>Artists, Producers & Engineers</label>
                        <button type="button" onClick={addContributor} className="flex items-center gap-1.5 text-[9px] font-black uppercase text-red-600 hover:text-red-500 transition-colors">
                            <Plus className="w-3 h-3" /> Add Contributor
                        </button>
                    </div>
                    <div className="space-y-3">
                        <AnimatePresence>
                        {contributors.map((c, i) => (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} key={i} className="flex gap-3 items-center">
                                <input type="text" placeholder="Name" className={inputClass} value={c.name} onChange={e => updateContributor(i, 'name', e.target.value)} />
                                <select className={inputClass} value={c.role} onChange={e => updateContributor(i, 'role', e.target.value)}>
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <button type="button" onClick={() => removeContributor(i)} className="p-3 text-zinc-700 hover:text-red-600 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Songwriters */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className={labelClass}>Songwriters</label>
                        <button type="button" onClick={addSongwriter} className="flex items-center gap-1.5 text-[9px] font-black uppercase text-red-600 hover:text-red-500 transition-colors">
                            <Plus className="w-3 h-3" /> Add songwriter
                        </button>
                    </div>
                    <div className="space-y-3">
                        <AnimatePresence>
                        {songwriters.map((s, i) => (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} key={i} className="flex gap-3 items-center">
                                <input type="text" placeholder="Songwriter legal name" className={inputClass} value={s} onChange={e => updateSongwriter(i, e.target.value)} />
                                <button type="button" onClick={() => removeSongwriter(i)} className="p-3 text-zinc-700 hover:text-red-600 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Musicians */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className={labelClass}>Studio Musicians</label>
                        <button type="button" onClick={addMusician} className="flex items-center gap-1.5 text-[9px] font-black uppercase text-red-600 hover:text-red-500 transition-colors">
                            <Plus className="w-3 h-3" /> Add Musician
                        </button>
                    </div>
                    <div className="space-y-3">
                        <AnimatePresence>
                        {musicians.map((m, i) => (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} key={i} className="flex gap-3 items-center">
                                <input type="text" placeholder="Name" className={inputClass} value={m.name} onChange={e => updateMusician(i, 'name', e.target.value)} />
                                <input type="text" placeholder="Instrument (e.g. Bass Guitar)" className={inputClass} value={m.instrument} onChange={e => updateMusician(i, 'instrument', e.target.value)} />
                                <button type="button" onClick={() => removeMusician(i)} className="p-3 text-zinc-700 hover:text-red-600 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Section: Technical Details */}
            <div className="space-y-8">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5 text-red-600" /> Technical Details
                </h3>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>AI Assisted Material</label>
                            <select className={inputClass} value={formData.ai_assisted} onChange={e => setFormData({...formData, ai_assisted: e.target.value})}>
                                {AI_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Track Language</label>
                            <select className={inputClass} value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})}>
                                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>Explicit Content</label>
                            <div className="flex gap-4">
                                {['No', 'Yes'].map(opt => (
                                    <button key={opt} type="button" onClick={() => setFormData({...formData, explicit: opt})}
                                        className={`flex-1 py-3 px-4 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${formData.explicit === opt ? 'bg-red-600 border-red-600 text-black' : 'bg-black/40 border-white/5 text-zinc-600'}`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                             <input type="checkbox" id="instr" className="w-4 h-4 rounded border-white/10 bg-black text-red-600 focus:ring-red-600/20" checked={formData.is_instrumental} onChange={e => setFormData({...formData, is_instrumental: e.target.checked})} />
                             <label htmlFor="instr" className="text-xs font-black uppercase text-zinc-400 tracking-wider cursor-pointer select-none">This is an instrumental track</label>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>ISRC (Optional)</label>
                        <input type="text" placeholder="e.g. US-ABC-21-00001" className={inputClass} value={formData.isrc} onChange={e => setFormData({...formData, isrc: e.target.value})} />
                    </div>
                    <div>
                         <label className={labelClass}>Label Name</label>
                         <input type="text" placeholder="Independent Artist" className={inputClass} value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Lyrics (Optional)</label>
                    <textarea placeholder="Paste your lyrics here..." className={`${inputClass} h-32 resize-none`} value={formData.lyrics} onChange={e => setFormData({...formData, lyrics: e.target.value})} />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Copyright Release</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800" />
                            <input type="text" placeholder="2024 Artist Name" className={`${inputClass} pl-11`} value={formData.copyright_date_release} onChange={e => setFormData({...formData, copyright_date_release: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Copyright Recording</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800" />
                            <input type="text" placeholder="2024 Artist Name" className={`${inputClass} pl-11`} value={formData.copyright_date_recording} onChange={e => setFormData({...formData, copyright_date_recording: e.target.value})} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section: Assets */}
            <div className="space-y-8">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5 text-red-600" /> Digital Assets
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Song Upload */}
                    <div className="space-y-3">
                        <label className={labelClass}>Master Audio <span className="text-red-600">*</span></label>
                        <div
                            className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-white/5 hover:border-red-600/30 bg-white/[0.02] rounded-3xl cursor-pointer transition-all group overflow-hidden"
                            onClick={() => document.getElementById('song-file-upload')?.click()}
                        >
                            <Music className="w-10 h-10 text-zinc-800 group-hover:text-red-500/50 mb-3 transition-colors" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">
                                {songFile ? songFile.name : 'Choose Audio File'}
                            </p>
                            <p className="text-[8px] font-black text-zinc-700 mt-2 uppercase tracking-widest group-hover:text-zinc-600">Lossless WAV / FLAC / MP3</p>
                            <input id="song-file-upload" type="file" required className="sr-only" accept=".mp3,.wav"
                                onChange={e => { if (e.target.files?.[0]) setSongFile(e.target.files[0]); }} />
                        </div>
                    </div>

                    {/* Cover Art Upload */}
                    <div className="space-y-3">
                        <label className={labelClass}>Cover Artwork <span className="text-zinc-700">Optional</span></label>
                        <div
                            className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-white/5 hover:border-red-600/30 bg-white/[0.02] rounded-3xl cursor-pointer transition-all group overflow-hidden relative"
                            onClick={() => document.getElementById('cover-art-upload')?.click()}
                        >
                            {coverImageFile ? (
                                <>
                                    <img src={URL.createObjectURL(coverImageFile)} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                                    <div className="relative z-10 flex flex-col items-center">
                                         <Upload className="w-8 h-8 text-white mb-2" />
                                         <p className="text-[10px] font-black uppercase text-white tracking-widest">Update Artwork</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-10 h-10 text-zinc-800 group-hover:text-red-500/50 mb-3 transition-colors" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">Choose Image</p>
                                    <p className="text-[8px] font-black text-zinc-700 mt-2 uppercase tracking-widest group-hover:text-zinc-600">High-Res PNG or JPG</p>
                                </>
                            )}
                            <input id="cover-art-upload" type="file" className="sr-only" accept=".jpeg,.jpg,.png"
                                onChange={e => { if (e.target.files?.[0]) setCoverImageFile(e.target.files[0]); }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit */}
            <div className="pt-8">
                <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-red-600/20"
                >
                {loading
                    ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    : <><Upload className="w-4 h-4" /> Ship to Digital Platforms</>
                }
                </button>
                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest text-center mt-6">By clicking ship, you agree to our distribution terms & copyright policies.</p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
