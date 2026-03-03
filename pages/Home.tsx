import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { THEMES, THEME_ICONS } from '../constants';
import { Utensils, Sun, Shirt, MessageCircle, PartyPopper, Quote, ArrowRight } from 'lucide-react';

// --- Falling Icons Component ---
const FallingIcons: React.FC = () => {
  const themeValues = Object.values(THEMES);
  const icons = themeValues.map(t => THEME_ICONS[t.icon]);
  
  // Create a fixed set of "drops" with random properties
  const drops = Array.from({ length: 15 }).map((_, i) => {
    const Icon = icons[i % icons.length];
    const theme = themeValues[i % themeValues.length];
    const colorClass = theme.colorClass.split(' ')[0]; // e.g. 'text-amber-500'
    
    return {
      id: i,
      Icon,
      left: Math.random() * 90 + 5, // 5-95% to keep inside
      delay: Math.random() * 20, 
      duration: 10 + Math.random() * 20, 
      size: 14 + Math.random() * 12, 
      opacity: 0.15 + Math.random() * 0.25, 
      colorClass
    };
  });

  return (
    // Changed to absolute to stay within the app container
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      <style>
        {`
          @keyframes fall {
            0% { top: -10%; transform: rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 110%; transform: rotate(360deg); opacity: 0; }
          }
        `}
      </style>
      {drops.map((drop) => (
        <div
          key={drop.id}
          className={`absolute ${drop.colorClass}`}
          style={{
            left: `${drop.left}%`,
            top: '-10%', // Initial position off-screen
            animation: `fall ${drop.duration}s linear infinite`,
            animationDelay: `-${drop.delay}s`,
            opacity: drop.opacity,
          }}
        >
          <drop.Icon size={drop.size} />
        </div>
      ))}
    </div>
  );
};

// --- Transition Screen Component ---
const TransitionScreen: React.FC<{ themeId: string | null }> = ({ themeId }) => {
  if (!themeId) return null;
  const theme = Object.values(THEMES).find(t => t.id === themeId);
  if (!theme) return null;

  const Icon = THEME_ICONS[theme.icon];
  
  // Extract color name for background (e.g., 'amber' from 'text-amber-500')
  const colorName = theme.colorClass.split(' ')[0].split('-')[1];
  
  return (
    // Changed to absolute to fit within home page container
    <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in bg-${colorName}-50/95 backdrop-blur-sm`}>
      
      <div className="space-y-2 mb-8 animate-slide-up">
        <p className={`text-sm font-bold tracking-widest uppercase text-${colorName}-400`}>
          Let's dive into your journey of
        </p>
        <h2 className={`text-3xl md:text-4xl font-display font-bold text-${colorName}-900`}>
          {theme.title}
        </h2>
      </div>

      <div className={`
        bg-white p-6 rounded-full shadow-2xl mb-10 animate-bounce
        text-${colorName}-500 ring-4 ring-${colorName}-100
      `}>
        <Icon size={56} />
      </div>
      
      <div className="max-w-md space-y-6 animate-slide-up-delayed">
        <Quote size={32} className={`mx-auto text-${colorName}-300 opacity-50`} />
        
        <p className={`text-xl font-display font-medium text-${colorName}-800 leading-relaxed italic`}>
          "{theme.quote}"
        </p>
        
        <div className={`h-1 w-20 mx-auto bg-${colorName}-200 rounded-full`} />
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [transitionTheme, setTransitionTheme] = useState<string | null>(null);

  const handleThemeClick = (themeId: string) => {
    setTransitionTheme(themeId);
    
    // Wait for reading time, then navigate
    setTimeout(() => {
      navigate(`/theme/${themeId}`);
    }, 4000); 
  };

  return (
    <div className="space-y-8 relative h-full min-h-[80vh]">
      {/* Background Animation */}
      <FallingIcons />

      {/* Transition Overlay */}
      {transitionTheme && <TransitionScreen themeId={transitionTheme} />}

      <header className="text-center space-y-4 py-8 md:py-12 relative z-10">
        <div className="relative inline-block">
           <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-800 dark:text-slate-100 leading-tight tracking-tight drop-shadow-sm bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-3xl px-6 py-4 transition-colors duration-500">
            Community <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Cultural Walk</span>
          </h1>
        </div>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-lg mx-auto mt-4 font-medium bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm py-2 px-4 rounded-full shadow-sm border border-white dark:border-slate-700 transition-colors duration-500">
          Explore our shared stories through 5 themes.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-2 pb-20 relative z-10">
        {Object.values(THEMES).map((theme) => {
          const Icon = THEME_ICONS[theme.icon];
          return (
            <button 
              key={theme.id} 
              onClick={() => handleThemeClick(theme.id)}
              className={`
                group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 text-left w-full
                hover:shadow-2xl hover:-translate-y-1 border border-slate-100 dark:border-slate-700
                bg-white dark:bg-slate-800 shadow-md cursor-pointer flex flex-col justify-between h-full min-h-[220px]
                dark:shadow-slate-900
              `}
            >
              {/* Background Icon Watermark */}
              <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12 ${theme.colorClass.split(' ')[0]}`}>
                <Icon size={180} />
              </div>
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${theme.colorClass}`}>
                    <Icon size={28} />
                  </div>
                  <div className={`p-2 rounded-full bg-slate-50 dark:bg-slate-700 text-slate-300 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors`}>
                    <ArrowRight size={20} />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                    {theme.title}
                  </h2>
                  <p className="text-xs font-bold opacity-70 uppercase tracking-wider mt-1 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 inline-block px-2 py-1 rounded-md">
                    Object: {theme.sharedObject}
                  </p>
                </div>

                <p className="text-slate-600 dark:text-slate-300 font-sans leading-relaxed text-sm line-clamp-2">
                  {theme.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
