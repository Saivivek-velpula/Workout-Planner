import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Moon, Sun, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const Navbar = ({ onQuickAdd }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
          <Flame className="w-4 h-4 fill-white" />
        </div>
        <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
          Workout<span className="text-brand-600 dark:text-brand-400">Planner</span>
        </span>
      </Link>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onQuickAdd}
          title="Log Entry"
          className="p-1.5 rounded-lg bg-brand-600 text-white shadow-sm flex items-center justify-center active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg"
          title="Toggle Dark Mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={handleLogout}
          className="p-2 text-rose-500 hover:text-rose-700 rounded-lg"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
