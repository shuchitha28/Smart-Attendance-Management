import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`group relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200
        ${isDark
          ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-700 hover:border-slate-600'
          : 'bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
        }
        ${className}`}
    >
      {isDark ? (
        <Sun className="w-4.5 h-4.5 text-amber-400 group-hover:text-amber-300 transition-colors" />
      ) : (
        <Moon className="w-4.5 h-4.5 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
      )}
    </button>
  );
};

export default ThemeToggle;
