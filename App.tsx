import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import Home from './pages/Home';
import ThemeView from './pages/ThemeView';
import StoryView from './pages/StoryView';
import Admin from './pages/Admin';
import { Map, Settings, Moon, Sun } from 'lucide-react';

// --- Theme Context ---
type ThemeContextType = {
  isNight: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isNight: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNight, setIsNight] = useState(() => {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
  });

  useEffect(() => {
    if (isNight) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isNight]);

  const toggleTheme = () => setIsNight(!isNight);

  return (
    <ThemeContext.Provider value={{ isNight, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// --- Star Field Component ---
const StarField = () => {
  // Generate static stars to avoid re-renders causing flickering
  const [stars] = useState(() => Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    duration: `${Math.random() * 3 + 2}s`,
    opacity: Math.random() * 0.5 + 0.3
  })));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            '--duration': star.duration,
            '--opacity': star.opacity
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent: React.FC = () => {
  const { isNight, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-500 flex flex-col items-center justify-center py-0 md:py-8 ${isNight ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <ScrollToTop />
      
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/20 transition-all text-white"
        aria-label="Toggle theme"
      >
        {isNight ? <Sun size={24} className="text-yellow-300" /> : <Moon size={24} className="text-slate-700" />}
      </button>

      {/* Increased max-width from max-w-md to max-w-2xl for wider home page */}
      <div className={`w-full max-w-2xl transition-colors duration-500 md:min-h-[90vh] min-h-screen shadow-2xl overflow-hidden relative flex flex-col md:rounded-[2.5rem] border ${isNight ? 'bg-slate-800 border-slate-700 shadow-slate-900' : 'bg-white border-slate-100 shadow-slate-200'}`}>
        
        {/* Starry Background Layer */}
        {isNight && <StarField />}

        {/* Top Decorative Bar */}
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full shrink-0 relative z-10" />
        
        {/* Main Content Area */}
        <main className="flex-1 px-6 py-4 overflow-y-auto relative scroll-smooth z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/theme/:themeId" element={<ThemeView />} />
            <Route path="/story/:communityId" element={<StoryView />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        {/* Bottom Navigation */}
        <div className={`backdrop-blur-md border-t sticky bottom-0 z-30 shrink-0 transition-colors duration-500 ${isNight ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-100'}`}>
           
           {/* Theme Emojis Animation Track */}
           <div className={`overflow-hidden relative h-8 border-b transition-colors duration-500 ${isNight ? 'border-slate-700 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
              <style>{`
                @keyframes scroll {
                  0% { transform: translateX(100%); }
                  100% { transform: translateX(-100%); }
                }
              `}</style>
              <div 
                className="absolute top-0 h-full flex items-center whitespace-nowrap"
                style={{ animation: 'scroll 20s linear infinite' }}
              >
                 <span className="text-xl px-4 filter drop-shadow-sm opacity-90 tracking-[1em]">
                   🍚 🪔 👒 🚪 👋 🍚 🪔 👒 🚪 👋 🍚 🪔 👒 🚪 👋
                 </span>
              </div>
           </div>

           <div className="p-4 flex justify-between items-center text-xs font-medium uppercase tracking-widest text-slate-400">
             <div className="flex items-center gap-2">
               <Map size={14} /> Culture Walk
             </div>
             
             <Link to="/admin" className="hover:text-indigo-500 transition-colors p-2">
               <Settings size={14} />
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;