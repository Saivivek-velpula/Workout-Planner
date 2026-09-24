import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
        <Flame className="w-8 h-8 fill-brand-500" />
      </div>
      <h1 className="text-4xl font-black tracking-tight mb-2">404</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Oops! The page you were looking for doesn't exist.
      </p>
      <Link to="/">
        <Button icon={Home}>Return to Dashboard</Button>
      </Link>
    </div>
  );
};
