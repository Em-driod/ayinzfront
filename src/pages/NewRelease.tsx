import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Upload, ArrowLeft, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const PLAN_TYPES: Record<string, string[]> = {
  basic: ['Single', 'EP', 'Album'],
  premium: ['Single', 'EP', 'Album'],
  premium_plus: ['Single', 'EP', 'Album'],
  standard: ['Single', 'EP', 'Album'],
};

const inputClass = 'w-full bg-black border border-zinc-900 rounded-xl px-4 py-3.5 text-white placeholder-zinc-700 focus:border-zinc-700 focus:outline-none transition-colors font-medium text-sm';
const labelClass = 'block text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2';

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
  });
  const [songFile, setSongFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    data.append('title', formData.title);
    data.append('artist', formData.artist);
    data.append('type', formData.type);
    data.append('genre', formData.genre);
    data.append('release_date', formData.release_date);
    data.append('contact_email', formData.contact_email);
    data.append('song', songFile);
    if (coverImageFile) data.append('coverImage', coverImageFile);

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
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 pb-24">
      <div className="max-w-xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-zinc-600 hover:text-white mb-7 transition-colors text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 md:p-8"
        >
          {/* Header */}
          <div className="mb-7 pb-6 border-b border-zinc-900">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-1">New Submission</p>
            <h1 className="text-2xl font-black text-white tracking-tight">Submit a Release</h1>
            <p className="text-xs text-zinc-600 font-bold mt-0.5 uppercase tracking-wider capitalize">{plan} Plan</p>
          </div>

          {/* Alerts */}
          {success && (
            <div className="mb-5 flex items-center gap-2 p-3.5 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}
          {error && (
            <div className="mb-5 flex items-center gap-2 p-3.5 bg-red-500/5 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClass}>Track Title</label>
              <input type="text" required placeholder="Track name" className={inputClass}
                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>

            <div>
              <label className={labelClass}>Artist Name</label>
              <input type="text" required placeholder="Your artist name" className={inputClass}
                value={formData.artist} onChange={e => setFormData({ ...formData, artist: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Genre</label>
                <input type="text" required placeholder="e.g. Afrobeats" className={inputClass}
                  value={formData.genre} onChange={e => setFormData({ ...formData, genre: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Release Date</label>
                <input type="date" required className={inputClass}
                  value={formData.release_date} onChange={e => setFormData({ ...formData, release_date: e.target.value })} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Contact Email</label>
              <input type="email" required placeholder="your@email.com" className={inputClass}
                value={formData.contact_email} onChange={e => setFormData({ ...formData, contact_email: e.target.value })} />
            </div>

            {/* Release Type */}
            <div>
              <label className={labelClass}>Release Type</label>
              <div className="grid grid-cols-3 gap-2.5">
                {allTypes.map((type) => {
                  const isLocked = !allowedTypes.includes(type);
                  const isSelected = formData.type === type && !isLocked;
                  return (
                    <button
                      key={type}
                      type="button"
                      disabled={isLocked}
                      onClick={() => !isLocked && setFormData({ ...formData, type })}
                      className={`p-3.5 rounded-xl border transition-all text-center relative ${
                        isSelected
                          ? 'border-red-600 bg-red-600/10 text-white'
                          : isLocked
                          ? 'border-zinc-900 bg-zinc-950 text-zinc-800 cursor-not-allowed'
                          : 'border-zinc-900 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400'
                      }`}
                    >
                      {isLocked && <Lock className="w-2.5 h-2.5 absolute top-2 right-2 text-zinc-800" />}
                      <Music className={`w-4 h-4 mx-auto mb-1.5 ${isLocked ? 'text-zinc-800' : isSelected ? 'text-red-500' : 'text-zinc-600'}`} />
                      <span className="text-xs font-black">{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Song Upload */}
            <div>
              <label className={labelClass}>Song File <span className="text-red-500">*</span></label>
              <div
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-900 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors"
                onClick={() => document.getElementById('song-file-upload')?.click()}
              >
                <Music className="w-8 h-8 text-zinc-800 mb-3" />
                <p className="text-sm text-zinc-500 font-bold text-center">
                  {songFile ? songFile.name : 'Click to upload audio'}
                </p>
                <p className="text-xs text-zinc-700 mt-1 font-bold">MP3, WAV, FLAC — max 100 MB</p>
                <input id="song-file-upload" type="file" required className="sr-only" accept="audio/*"
                  onChange={e => { if (e.target.files?.[0]) setSongFile(e.target.files[0]); }} />
              </div>
            </div>

            {/* Cover Art Upload */}
            <div>
              <label className={labelClass}>Cover Art <span className="text-zinc-700">Optional</span></label>
              <div
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-900 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors overflow-hidden"
                onClick={() => document.getElementById('cover-art-upload')?.click()}
              >
                {coverImageFile ? (
                  <img src={URL.createObjectURL(coverImageFile)} alt="Cover preview" className="w-24 h-24 object-cover rounded-lg mb-2" />
                ) : (
                  <Upload className="w-8 h-8 text-zinc-800 mb-3" />
                )}
                <p className="text-sm text-zinc-500 font-bold">{coverImageFile ? coverImageFile.name : 'Click to upload artwork'}</p>
                <p className="text-xs text-zinc-700 mt-1 font-bold">PNG or JPG — min 1400×1400 px</p>
                <input id="cover-art-upload" type="file" className="sr-only" accept="image/*"
                  onChange={e => { if (e.target.files?.[0]) setCoverImageFile(e.target.files[0]); }} />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-black text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Upload className="w-4 h-4" /> Submit for Distribution</>
              }
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
