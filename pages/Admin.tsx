import React, { useState, useEffect } from 'react';
import { THEMES, COMMUNITIES } from '../constants';
import { getCustomStoryFromCloud, saveCustomStoryToCloud, deleteCustomStoryFromCloud, getAllCustomStoryIdsFromCloud, clearStoryCache, getStoryFromCache } from '../services/storage';
import { ArrowLeft, Save, Trash2, Upload, Check, Lock, Loader2, RefreshCw, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [customStoryIds, setCustomStoryIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [existingAudioUrl, setExistingAudioUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load list of custom stories on mount
  useEffect(() => {
    if (isAuthenticated) {
      refreshCustomList();
    }
  }, [isAuthenticated]);

  const refreshCustomList = async () => {
    const ids = await getAllCustomStoryIdsFromCloud();
    setCustomStoryIds(new Set(ids));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'culture') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleSelectCommunity = async (id: string) => {
    setSelectedCommunityId(id);
    setIsProcessing(true);
    setStatus('Loading...');

    try {
      // 1. Try to load Custom Story from cloud
      const existing = await getCustomStoryFromCloud(id);

      if (existing) {
        setTitle(existing.title);
        setContent(existing.content);
        setExistingAudioUrl(existing.audioUrl ?? null);
        setStatus('');
      } else {
        // 2. If no custom story, try to load AI Cached story to prefill
        const cached = await getStoryFromCache(id);
        const comm = COMMUNITIES.find(c => c.id === id);

        if (cached) {
          setTitle(cached.title);
          setContent(cached.content);
          setStatus('Prefilled with AI content');
        } else {
          setTitle(`${comm?.name} Story`);
          setContent('');
          setStatus('New story');
        }
        setExistingAudioUrl(null);
      }
      setAudioFile(null);
    } catch (error) {
      console.error(error);
      setStatus('Error loading story.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!selectedCommunityId || !title || !content) {
      setStatus('Please fill in title and content');
      return;
    }

    setIsProcessing(true);
    setStatus('Saving...');
    try {
      await saveCustomStoryToCloud(
        selectedCommunityId,
        {
          title,
          content,
          customAudioType: audioFile?.type,
        },
        audioFile,                 // new file to upload (or null)
        audioFile ? null : existingAudioUrl, // keep old URL if no new file
      );

      // Clear local AI cache so the new story loads immediately
      await clearStoryCache(selectedCommunityId);

      // Refresh state
      const saved = await getCustomStoryFromCloud(selectedCommunityId);
      setExistingAudioUrl(saved?.audioUrl ?? null);
      setStatus('Saved successfully!');
      setAudioFile(null);
      await refreshCustomList();

    } catch (e) {
      console.error(e);
      setStatus('Error saving. Check your Firebase configuration.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (selectedCommunityId && window.confirm('Are you sure you want to revert to the AI story?')) {
      setIsProcessing(true);
      try {
        await deleteCustomStoryFromCloud(selectedCommunityId);
        await clearStoryCache(selectedCommunityId);
        await handleSelectCommunity(selectedCommunityId); // Reset form
        await refreshCustomList();
        setStatus('Reverted to AI version.');
      } catch (e) {
        console.error(e);
        setStatus('Error deleting.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl w-full max-w-sm space-y-4 transition-colors">
          <div className="flex justify-center text-indigo-500 mb-4">
            <Lock size={48} />
          </div>
          <h1 className="text-2xl font-display font-bold text-center text-slate-800 dark:text-slate-100">Admin Access</h1>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
          />
          <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-700">
            Login
          </button>
          <Link to="/" className="block text-center text-slate-400 text-sm mt-4 hover:text-indigo-500">
            Return to App
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sticky top-0 z-20 flex items-center justify-between transition-colors">
        <Link to="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-bold hover:text-indigo-600 dark:hover:text-indigo-400">
          <ArrowLeft size={20} /> Exit
        </Link>
        <h1 className="font-display font-bold text-lg dark:text-slate-100">Story Manager</h1>
        <div className="w-8" />
      </div>

      <div className="max-w-4xl mx-auto p-4 flex flex-col md:flex-row gap-6">

        {/* Sidebar List */}
        <div className="md:w-1/3 space-y-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Select Community</h2>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm dark:text-slate-200 transition-colors"
            />
          </div>

          <div className="space-y-4 max-h-[60vh] md:max-h-none overflow-y-auto">
            {Object.values(THEMES).map(theme => {
              const themeCommunities = COMMUNITIES.filter(c =>
                c.themeId === theme.id &&
                (
                  c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.objectName.toLowerCase().includes(searchTerm.toLowerCase())
                )
              );

              if (themeCommunities.length === 0) return null;

              return (
                <div key={theme.id}>
                  <div className={`text-xs font-bold px-2 py-1 mb-2 rounded ${theme.colorClass} inline-block`}>
                    {theme.title}
                  </div>
                  <div className="space-y-1">
                    {themeCommunities.map(c => {
                      const hasCustom = customStoryIds.has(c.id);
                      return (
                        <button
                          key={c.id}
                          onClick={() => handleSelectCommunity(c.id)}
                          disabled={isProcessing && selectedCommunityId !== c.id}
                          className={`
                          w-full text-left p-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between
                          ${selectedCommunityId === c.id
                              ? 'bg-indigo-600 text-white shadow-lg'
                              : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                            }
                        `}
                        >
                          <span className="flex items-center gap-2">
                            <span>{c.emoji}</span> {c.name}
                          </span>
                          {hasCustom && (
                            <span className={`w-2 h-2 rounded-full ${selectedCommunityId === c.id ? 'bg-white' : 'bg-indigo-500'}`} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:w-2/3">
          {selectedCommunityId ? (
            <div className={`bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6 transition-colors ${isProcessing ? 'opacity-80 pointer-events-none' : ''}`}>
              <div>
                <h2 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  Edit Story: {COMMUNITIES.find(c => c.id === selectedCommunityId)?.name}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Upload your own content. The illustration will be preserved from the AI version unless reset.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                    placeholder="Enter story title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Story Content</label>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-xl h-60 focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed transition-colors"
                    placeholder="Write the story here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Audio Narration</label>
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors relative">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={e => setAudioFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Upload size={24} />
                      <span className="text-sm font-medium">
                        {audioFile ? audioFile.name : "Tap to upload audio (mp3, wav)"}
                      </span>
                    </div>
                  </div>
                  {existingAudioUrl && !audioFile && (
                    <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                      <Check size={12} /> Current story has custom audio saved.
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  <Trash2 size={16} /> Revert to AI
                </button>

                <div className="flex items-center gap-4">
                  {status && <span className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">{status}</span>}
                  {isProcessing && <Loader2 size={18} className="animate-spin text-indigo-500" />}
                  <button
                    onClick={handleSave}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900 flex items-center gap-2"
                  >
                    <Save size={18} /> Save Story
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 min-h-[400px] transition-colors">
              <div className="text-center">
                <ArrowLeft className="mx-auto mb-2 opacity-50" />
                <p>Select a community to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
