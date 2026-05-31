import { Outlet, NavLink } from 'react-router-dom';
import { Home, Map as MapIcon, BookOpen, Briefcase, PhoneCall, Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/map', label: 'Peta', icon: MapIcon },
  { to: '/education', label: 'Edukasi', icon: BookOpen },
  { to: '/siaga', label: 'Tas Siaga', icon: Briefcase },
  { to: '/contacts', label: 'Darurat', icon: PhoneCall },
];

export default function Layout() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-[#E9EEF5] via-[#F7F8FC] to-[#ECE7F6] dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Header */}
      <header className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-b border-white/60 dark:border-slate-800/60 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shrink-0 shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-2">
          <div className="size-8 bg-bencana-siaga rounded-xl flex items-center justify-center">
            <span className="text-white font-display font-bold text-lg">S</span>
          </div>
          <h1 className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-slate-100">
            SiagaBencana
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleDarkMode} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none">
            {isDarkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 text-sm font-medium transition-colors',
                    isActive ? 'text-bencana-info' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  )
                }
              >
                <item.icon className="size-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto w-full max-w-5xl mx-auto pb-20 md:pb-6 relative">
        <AnimatePresence mode="popLayout">
          <motion.div
            key="page-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4 md:p-6"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>

        {/* Disclaimer Footer */}
        <div className="mt-8 mb-4 max-w-lg mx-auto bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 rounded-xl text-amber-700 dark:text-amber-400 px-4 py-3 text-xs md:text-sm font-medium text-center flex flex-col sm:flex-row items-center justify-center gap-2 backdrop-blur-sm transition-colors duration-200">
          <span className="shrink-0 text-amber-500">⚠️</span>
          <p><strong>Mode Simulasi — Bukan Peringatan Resmi.</strong><br className="sm:hidden" /> Sistem tidak memprediksi kejadian alam secara mandiri.</p>
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-t border-white/60 dark:border-slate-800/60 px-2 pb-safe pt-2 md:hidden z-20 shadow-[0_-8px_32px_-1px_rgba(0,0,0,0.05)] dark:shadow-[0_-8px_32px_-1px_rgba(0,0,0,0.2)] transition-colors duration-200">
        <div className="flex justify-around items-center h-14">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors',
                  isActive ? 'text-bencana-info font-medium' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn('size-5', isActive && 'fill-bencana-info/10 stroke-2')}
                  />
                  <span className="text-[10px] tracking-wide">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Side Navigation (Desktop) - Optional enhancement for larger screens */}
      {/* For simplicity we keep it centered above for all sizes but hide bottom nav on desktop and add menubar if needed */}
    </div>
  );
}
