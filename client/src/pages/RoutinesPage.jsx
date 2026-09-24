import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, Plus, Search, Trash2, Edit3, Eye, Clock, Layers } from 'lucide-react';
import { routinesApi } from '../api/routinesApi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/FormControls';
import { Badge, Spinner, EmptyState } from '../components/ui/BadgesAndEmpty';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../context/ToastContext';

export const RoutinesPage = () => {
  const [routines, setRoutines] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const routineTypes = [
    { id: 'all', label: 'All Routines' },
    { id: 'strength', label: 'Strength' },
    { id: 'cardio', label: 'Cardio' },
    { id: 'HIIT', label: 'HIIT' },
    { id: 'mobility', label: 'Mobility' },
    { id: 'other', label: 'Other' },
  ];

  const fetchRoutines = async () => {
    setIsLoading(true);
    try {
      const res = await routinesApi.getAll({
        type: selectedType !== 'all' ? selectedType : undefined,
        search: search ? search : undefined,
      });
      if (res.data?.success) {
        setRoutines(res.data.data);
      }
    } catch (err) {
      toastError('Failed to load routines.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, [selectedType, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await routinesApi.delete(deleteTarget.id);
      success(`Routine "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchRoutines();
    } catch (err) {
      toastError('Failed to delete routine.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Workout Routines
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build and manage your personalized exercise routines
          </p>
        </div>
        <Button
          icon={Plus}
          onClick={() => navigate('/routines/new')}
        >
          Create Routine
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Type pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {routineTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedType === t.id
                  ? 'bg-brand-600 text-white shadow-sm dark:bg-brand-500'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full md:w-72">
          <Input
            placeholder="Search routines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="py-2"
          />
        </div>
      </div>

      {/* Routines Grid */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : routines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 shadow-sm transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <Badge variant={routine.goalType} size="sm">
                    {routine.goalType}
                  </Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Layers className="w-3.5 h-3.5" />
                    {routine.exercises?.length || 0} exercises
                  </span>
                </div>

                <Link
                  to={`/routines/${routine.id}`}
                  className="block group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"
                >
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {routine.name}
                  </h3>
                </Link>

                {routine.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {routine.description}
                  </p>
                )}

                {/* Exercises preview */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                  {routine.exercises?.slice(0, 3).map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300"
                    >
                      <span className="truncate pr-2">• {ex.name}</span>
                      <span className="text-slate-400 text-[11px] shrink-0 font-medium">
                        {ex.sets} × {ex.reps} {ex.weight ? `@ ${ex.weight}kg` : ''}
                      </span>
                    </div>
                  ))}
                  {(routine.exercises?.length || 0) > 3 && (
                    <p className="text-[11px] text-slate-400 italic pt-0.5">
                      + {(routine.exercises?.length || 0) - 3} more exercises
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  to={`/routines/${routine.id}`}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View Details
                </Link>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/routines/${routine.id}/edit`)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Routine"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(routine)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Routine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Dumbbell}
          title="No routines found"
          description={
            search || selectedType !== 'all'
              ? 'Try adjusting your search terms or category filter.'
              : 'You haven\'t created any workout routines yet. Build your first routine to start logging workouts.'
          }
          actionButton={
            <Button
              icon={Plus}
              onClick={() => navigate('/routines/new')}
            >
              Create First Routine
            </Button>
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Workout Routine"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? All exercises inside this routine will also be removed.`}
        confirmText="Delete Routine"
        isLoading={isDeleting}
      />
    </div>
  );
};
