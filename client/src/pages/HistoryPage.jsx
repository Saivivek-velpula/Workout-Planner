import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Calendar,
  Dumbbell,
  UtensilsCrossed,
  Flame,
  Droplet,
  Scale,
  Edit3,
  Trash2,
  Plus
} from 'lucide-react';
import { entriesApi } from '../api/entriesApi';
import { Input } from '../components/ui/FormControls';
import { Button } from '../components/ui/Button';
import { Badge, Spinner, EmptyState } from '../components/ui/BadgesAndEmpty';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../context/ToastContext';

export const HistoryPage = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [entries, setEntries] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const res = await entriesApi.getAll({
        from: fromDate || undefined,
        to: toDate || undefined
      });
      if (res.data?.success) {
        setEntries(res.data.data);
      }
    } catch (err) {
      toastError('Failed to load history entries.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [fromDate, toDate]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await entriesApi.deleteById(deleteTarget.id);
      success(`Daily entry for ${deleteTarget.date} deleted.`);
      setDeleteTarget(null);
      fetchEntries();
    } catch (err) {
      toastError('Failed to delete daily entry.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEntries = entries.filter((e) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const matchesNotes = e.notes?.toLowerCase().includes(term);
    const matchesRoutines = e.routines?.some((r) => r.routineName.toLowerCase().includes(term));
    const matchesMeals = e.meals?.some((m) => m.mealName.toLowerCase().includes(term));
    return matchesNotes || matchesRoutines || matchesMeals;
  });

  const moodEmojis = ['', '😴 Tired', '😐 Neutral', '🙂 Good', '😄 Energetic', '🔥 Unstoppable'];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            Activity History Log
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse all past workout and nutrition logs with custom date filters
          </p>
        </div>

        <Button
          icon={Plus}
          onClick={() => navigate(`/entries/log?date=${new Date().toISOString().slice(0, 10)}`)}
        >
          New Daily Log
        </Button>
      </div>

      {/* Date Filter & Search Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-end gap-3">
        <div className="flex-1">
          <Input
            label="Search entries / meals / routines"
            placeholder="e.g. Bench press, oatmeal, sore..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-44">
          <Input
            label="From Date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="w-full md:w-44">
          <Input
            label="To Date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        {(fromDate || toDate || search) && (
          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              setFromDate('');
              setToDate('');
              setSearch('');
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Entries List */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredEntries.length > 0 ? (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const dateObj = new Date(entry.date + 'T00:00:00');
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <div
                key={entry.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 shadow-sm transition-all"
              >
                {/* Entry Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold text-sm flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {dayName}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">{entry.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Edit3}
                      onClick={() => navigate(`/entries/log?date=${entry.date}`)}
                    >
                      Edit
                    </Button>
                    <button
                      onClick={() => setDeleteTarget(entry)}
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Macro & Vitals Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/60">
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">Total Calories</span>
                    <span className="font-extrabold text-sm text-amber-700 dark:text-amber-300">
                      {entry.totals?.calories || 0} kcal
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60">
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">Macros</span>
                    <span className="font-semibold text-blue-700 dark:text-blue-300 text-[11px]">
                      P: {entry.totals?.protein || 0}g · C: {entry.totals?.carbs || 0}g · F: {entry.totals?.fat || 0}g
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Weight / Water</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 text-xs">
                      {entry.bodyWeight ? `${entry.bodyWeight}kg` : '—'} · {entry.waterIntake ? `${entry.waterIntake}L` : '—'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Mood / Energy</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 text-xs">
                      {entry.moodEnergy ? moodEmojis[entry.moodEnergy] : '—'}
                    </span>
                  </div>
                </div>

                {/* Workouts and Meals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {/* Workouts */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5 text-indigo-500" />
                      Workouts Logged ({entry.routines?.length || 0})
                    </h4>
                    {entry.routines && entry.routines.length > 0 ? (
                      <div className="space-y-1.5">
                        {entry.routines.map((r, idx) => (
                          <div
                            key={r.id || idx}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs"
                          >
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                              {r.routineName}
                            </span>
                            <span className="text-slate-400 shrink-0 font-medium">
                              {r.durationMinutes ? `${r.durationMinutes}m` : 'Done'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No workout logged</p>
                    )}
                  </div>

                  {/* Meals */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />
                      Meals Logged ({entry.meals?.length || 0})
                    </h4>
                    {entry.meals && entry.meals.length > 0 ? (
                      <div className="space-y-1.5">
                        {entry.meals.map((m, idx) => (
                          <div
                            key={m.id || idx}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <Badge variant={m.mealType} size="sm">{m.mealType}</Badge>
                              <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                {m.mealName}
                              </span>
                            </div>
                            <span className="font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                              {m.calories} kcal
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No meals logged</p>
                    )}
                  </div>
                </div>

                {/* Notes if any */}
                {entry.notes && (
                  <p className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 italic">
                    "{entry.notes}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={HistoryIcon}
          title="No history entries found"
          description={
            fromDate || toDate || search
              ? 'Try widening your date range or clearing search filters.'
              : 'You haven\'t logged any daily entries yet. Use the button below to record your first day.'
          }
          actionButton={
            <Button
              icon={Plus}
              onClick={() => navigate(`/entries/log?date=${new Date().toISOString().slice(0, 10)}`)}
            >
              Log Today's Entry
            </Button>
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Daily Log"
        message={`Are you sure you want to delete the daily log for ${deleteTarget?.date}? This will delete all logged workout sessions and meal records for this day.`}
        confirmText="Delete Log"
        isLoading={isDeleting}
      />
    </div>
  );
};
