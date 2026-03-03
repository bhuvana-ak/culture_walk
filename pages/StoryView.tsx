import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { COMMUNITIES, THEMES } from '../constants';
import { generateStoryText, generateStoryImage, generateStoryAudio } from '../services/gemini';
import { decodeBase64, decodeAudioData } from '../services/geminiUtils';
import { getCustomStoryFromCloud, getStoryFromCache, saveStoryToCache } from '../services/storage';
import { GeneratedStory } from '../types';
import { ArrowLeft, Play, Pause, Sparkles, Volume2, Loader2, QrCode, Image as ImageIcon, User, Bot, Square, Music } from 'lucide-react';
import QRCodeModal from '../components/QRCodeModal';

const StoryView: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const [story, setStory] = useState<GeneratedStory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Audio Refs for Playback Control
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);

  // Background Music Ref
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  const community = COMMUNITIES.find(c => c.id === communityId);
  const theme = community ? THEMES[community.themeId] : null;

  useEffect(() => {
    if (!community || !theme) return;

    let isMounted = true;

    const loadStory = async () => {
      setIsLoading(true);
      stopAudio(); // Reset audio when changing story

      try {
        // 1. Check for Custom Admin Story First (Firestore cloud)
        const customData = await getCustomStoryFromCloud(community.id);
        const cachedStory = await getStoryFromCache(community.id);

        if (customData) {
          // Use Custom Data
          let imageToUse = cachedStory?.imageBase64;

          if (!imageToUse) {
            // Generate just image if missing
            imageToUse = await generateStoryImage(community.name, community.objectName, theme.visualSubject);
          }

          const fullStory: GeneratedStory = {
            title: customData.title,
            content: customData.content,
            imageBase64: imageToUse,
            audioUrl: customData.audioUrl,        // HTTPS URL from Firebase Storage
            customAudioType: customData.customAudioType,
            isCustom: true
          };

          if (isMounted) {
            setStory(fullStory);
            await saveStoryToCache(community.id, fullStory);
          }
        }
        // 2. Check for Static Story from Document
        else if (community.staticStory) {
          let imageToUse = cachedStory?.imageBase64;
          if (!imageToUse) {
            imageToUse = await generateStoryImage(community.name, community.objectName, theme.visualSubject);
          }

          const fullStory: GeneratedStory = {
            title: `${community.name} Story`,
            content: community.staticStory,
            imageBase64: imageToUse,
            isCustom: false
          };

          if (isMounted) {
            setStory(fullStory);
            await saveStoryToCache(community.id, fullStory);
          }
        }
        // 3. Fallback to AI Generation / Cache
        else if (cachedStory && !cachedStory.isCustom) {
          if (isMounted) setStory(cachedStory);
        }
        else {
          // Fresh AI Generation
          const [textData, imageData] = await Promise.all([
            generateStoryText(community.name, community.objectName, theme.title),
            generateStoryImage(community.name, community.objectName, theme.visualSubject)
          ]);

          const fullStory: GeneratedStory = {
            ...textData,
            imageBase64: imageData,
            isCustom: false
          };

          if (isMounted) {
            setStory(fullStory);
            await saveStoryToCache(community.id, fullStory);
          }
        }
      } catch (error) {
        console.error("Error loading story:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadStory();

    return () => {
      isMounted = false;
      stopAudio();
    };
  }, [community, theme]);

  const stopAudio = () => {
    // Stop Web Audio
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) { }
      sourceNodeRef.current = null;
    }
    // Stop HTML Audio (Narration)
    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
      htmlAudioRef.current = null;
    }

    // Stop Background Music
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0; // Reset position
    }

    // Reset state
    setIsPlaying(false);
    setIsAudioLoading(false);
    pausedAtRef.current = 0;
    startTimeRef.current = 0;
  };

  const handleToggleAudio = async () => {
    if (!story) return;

    if (isPlaying) {
      // --- PAUSE LOGIC ---
      setIsPlaying(false);

      // Pause Background Music
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
      }

      if (story.isCustom) {
        // Handle Standard Audio Pause
        if (htmlAudioRef.current) {
          htmlAudioRef.current.pause();
          pausedAtRef.current = htmlAudioRef.current.currentTime;
        }
      } else {
        // Handle Web Audio Pause
        if (audioContextRef.current && sourceNodeRef.current) {
          sourceNodeRef.current.stop();
          const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
          pausedAtRef.current = elapsed % (audioBufferRef.current?.duration || 0);
          sourceNodeRef.current = null;
        }
      }
    } else {
      // --- PLAY / RESUME LOGIC ---
      try {
        setIsAudioLoading(true);

        // 0. Initialize Background Music if not ready
        if (community?.backgroundAudioUrl && !bgMusicRef.current) {
          bgMusicRef.current = new Audio(community.backgroundAudioUrl);
          bgMusicRef.current.loop = true;
          bgMusicRef.current.volume = 0.15; // Set volume low for background
        }

        // 1. Check & Fetch Audio Data if missing
        let currentAudioBase64 = story.audioBase64;
        // For custom stories with a Firebase Storage URL, no base64 fetch needed
        if (!currentAudioBase64 && !story.audioUrl) {
          // Generate on demand (AI story only)
          const base64 = await generateStoryAudio(story.content);
          currentAudioBase64 = base64;

          // Save to state and cache so we don't fetch again
          const updatedStory = { ...story, audioBase64: base64 };
          setStory(updatedStory);
          if (community) await saveStoryToCache(community.id, updatedStory);
        }

        // Start Background Music
        if (bgMusicRef.current) {
          // Play promise needs to be handled
          bgMusicRef.current.play().catch(e => console.warn("Background music autoplay prevented", e));
        }

        if (story.isCustom) {
          // --- Standard Audio Playback (Firebase Storage URL or base64 fallback) ---
          if (!htmlAudioRef.current) {
            let src: string;
            if (story.audioUrl) {
              // Direct HTTPS URL from Firebase Storage — simple and reliable
              src = story.audioUrl;
            } else if (currentAudioBase64) {
              const mimeType = story.customAudioType || 'audio/mpeg';
              src = currentAudioBase64.startsWith('data:')
                ? currentAudioBase64
                : `data:${mimeType};base64,${currentAudioBase64}`;
            } else {
              throw new Error('No audio source available for custom story.');
            }
            htmlAudioRef.current = new Audio(src);

            // Setup cleanup
            htmlAudioRef.current.onended = () => {
              setIsPlaying(false);
              pausedAtRef.current = 0;
              bgMusicRef.current?.pause(); // Stop music when narration ends
            };
          }

          htmlAudioRef.current.currentTime = pausedAtRef.current;
          await htmlAudioRef.current.play();

        } else {
          // --- Web Audio API Playback (AI) ---
          if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
          }

          // Resume context if suspended (browser policy)
          if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
          }

          // Decode Buffer if needed
          if (!audioBufferRef.current && currentAudioBase64) {
            const bytes = decodeBase64(currentAudioBase64);
            audioBufferRef.current = await decodeAudioData(bytes, audioContextRef.current);
          }

          if (audioBufferRef.current) {
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBufferRef.current;
            source.connect(audioContextRef.current.destination);

            // Start from paused time
            source.start(0, pausedAtRef.current);
            startTimeRef.current = audioContextRef.current.currentTime - pausedAtRef.current;
            sourceNodeRef.current = source;

            source.onended = () => {
              // Only consider it "finished" if we didn't stop it manually (which also fires onended)
              // However, since we update isPlaying immediately on pause, 
              // we can just check if we reached near the end or just reset if desired.
              // Simplest for React state sync: if the buffer duration is reached.
              // For now, we rely on the manual pause toggle to set state false.
              // This callback handles the "natural end" of the track.
              const ctx = audioContextRef.current;
              if (ctx && ctx.currentTime - startTimeRef.current >= (audioBufferRef.current?.duration || 0) - 0.1) {
                setIsPlaying(false);
                pausedAtRef.current = 0;
                bgMusicRef.current?.pause(); // Stop music when narration ends
              }
            };
          }
        }

        setIsPlaying(true);
      } catch (e) {
        console.error("Audio playback error", e);
        alert("Unable to play audio.");
        bgMusicRef.current?.pause(); // Ensure silence on error
      } finally {
        setIsAudioLoading(false);
      }
    }
  };

  if (!community || !theme) return <Navigate to="/" />;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link
          to={`/theme/${theme.id}`}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-2 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </Link>
        <button
          onClick={() => setShowQR(true)}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 transition-colors"
        >
          <QrCode size={24} />
        </button>
      </div>

      <div className="space-y-2">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${theme.colorClass}`}>
          {theme.title}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{community.emoji}</span>
          <h1 className="text-3xl font-display font-bold text-slate-800 dark:text-slate-100 leading-tight">
            {community.name}
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400" />
          Object: {community.objectName}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 transition-colors">

        {/* Visual Header */}
        <div className="w-full aspect-video bg-slate-100 dark:bg-slate-700 relative transition-colors">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-3">
              <Loader2 size={40} className="animate-spin text-indigo-500" />
              <p className="font-display animate-pulse text-sm">Painting the story...</p>
            </div>
          ) : story?.imageBase64 ? (
            <img
              src={`data:image/png;base64,${story.imageBase64}`}
              alt="Cultural Illustration"
              className="w-full h-full object-cover animate-fade-in"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-600">
              <ImageIcon size={48} />
            </div>
          )}
          {/* Overlay Gradient for Title */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-800 dark:via-slate-800/80 transition-colors" />
        </div>

        <div className="p-6 pt-0 relative z-10">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded-md w-3/4" />
              <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-md w-full" />
              <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-md w-full" />
              <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-md w-5/6" />
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold text-indigo-900 dark:text-indigo-300">
                  {story?.title}
                </h2>
                {story?.isCustom ? (
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                    <User size={12} /> Community Story
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <Bot size={12} /> AI Story
                  </span>
                )}
              </div>

              <div className="prose prose-lg prose-slate dark:prose-invert leading-relaxed font-sans text-slate-600 dark:text-slate-300">
                <p>{story?.content}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={handleToggleAudio}
                  disabled={isAudioLoading}
                  className={`
                    w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all
                    ${isPlaying
                      ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900 hover:shadow-indigo-300 dark:hover:shadow-indigo-800 transform active:scale-95'
                    }
                    ${isAudioLoading ? 'opacity-80 cursor-wait' : ''}
                  `}
                >
                  {isAudioLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Loading Audio...
                    </>
                  ) : isPlaying ? (
                    <>
                      <Pause size={20} fill="currentColor" />
                      Pause Audio
                    </>
                  ) : (
                    <>
                      <Play size={20} fill="currentColor" />
                      {pausedAtRef.current > 0 ? 'Resume Story' : (story?.isCustom ? 'Listen to Community Speaker' : 'Listen to AI Narrator')}
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-400 dark:text-slate-500">
                  {isPlaying && community?.backgroundAudioUrl && (
                    <span className="flex items-center gap-1 animate-pulse text-indigo-400">
                      <Music size={10} /> Ambience playing
                    </span>
                  )}
                  <span>•</span>
                  <span>
                    {story?.isCustom ? 'Recorded by community member' : 'Narration & Art powered by Gemini AI'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        url={window.location.href}
        title={`Story: ${community.name}`}
      />
    </div>
  );
};

export default StoryView;
