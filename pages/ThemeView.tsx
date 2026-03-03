import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { THEMES, COMMUNITIES, THEME_ICONS } from '../constants';
import { ThemeId } from '../types';
import QRCodeModal from '../components/QRCodeModal';
import { QrCode, ArrowLeft } from 'lucide-react';

const ThemeView: React.FC = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const [showQR, setShowQR] = useState(false);

  // Validation
  const theme = Object.values(THEMES).find(t => t.id === themeId);
  if (!theme) return <Navigate to="/" />;

  const themeCommunities = COMMUNITIES.filter(c => c.themeId === theme.id);
  const Icon = THEME_ICONS[theme.icon];

  // Helper to get a background gradient based on theme color
  const getGradient = (color: string) => {
    // Basic mapping or dynamic usage
    if (color.includes('amber')) return 'from-amber-400 to-orange-500';
    if (color.includes('violet')) return 'from-violet-400 to-purple-600';
    if (color.includes('pink')) return 'from-pink-400 to-rose-500';
    if (color.includes('cyan')) return 'from-cyan-400 to-blue-500';
    if (color.includes('emerald')) return 'from-emerald-400 to-green-600';
    return 'from-slate-400 to-slate-600';
  };
  
  // Extract main color name for gradient construction
  const colorName = theme.colorClass.split(' ')[0].split('-')[1]; // e.g., 'amber'
  const gradientClass = `bg-gradient-to-br from-${colorName}-400 to-${colorName}-600`;

  return (
    <div className="space-y-6 min-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between z-10 relative">
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-white/20 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <button 
          onClick={() => setShowQR(true)}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <QrCode size={24} />
        </button>
      </div>

      {/* Colorful Header Card */}
      <div className={`rounded-3xl p-8 text-white shadow-lg relative overflow-hidden ${gradientClass}`}>
        <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4">
           <Icon size={140} />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Icon size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold">{theme.title}</h1>
          <p className="font-medium opacity-90 text-sm uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">
            Shared Object: {theme.sharedObject}
          </p>
          <p className="text-white/90 font-sans leading-relaxed max-w-xs text-sm">
            {theme.description}
          </p>
          
          {/* Bouncing Animated Icon for All Themes */}
          <div className="text-5xl pt-4 animate-bounce filter drop-shadow-md">
            {theme.bouncingIcon}
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-xs px-1">
          Select a Community Story
        </h2>
        {themeCommunities.map((community, index) => (
          <Link
            key={community.id}
            to={`/story/${community.id}`}
            className="block group"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:shadow-md dark:hover:shadow-slate-900 transition-all flex items-center gap-4">
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm
                bg-slate-50 dark:bg-slate-700 group-hover:scale-110 transition-transform duration-300
              `}>
                {community.emoji}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">
                  {community.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  <span className="opacity-75">Connects via:</span> {community.objectName}
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-indigo-400">
                &rarr;
              </div>
            </div>
          </Link>
        ))}
      </div>

      <QRCodeModal 
        isOpen={showQR} 
        onClose={() => setShowQR(false)} 
        url={window.location.href}
        title={`Theme: ${theme.title}`}
      />
    </div>
  );
};

export default ThemeView;
