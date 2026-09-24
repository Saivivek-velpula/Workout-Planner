import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Plus,
  Clock,
  Dumbbell,
  Timer,
  FileText
} from 'lucide-react';
import { routinesApi } from '../api/routinesApi';
import { Button } from '../components/ui/Button';
import { Badge, Spinner } from '../components/ui/BadgesAndEmpty';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../context/ToastContext';

export const RoutineDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [routine, setRoutine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const res = await routinesApi.getById(id);
        if (res.data?.success) {
          setRoutine(res.data.data);
        }
      } catch (err) {
        toastError('Failed to load routine details.');
        navigate('/routines');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutine();
  }, [id, navigate]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await routinesApi.delete(id);
      success('Routine deleted successfully');
      navigate('/routines');
    } catch (err) {
      toastError('Failed to delete routine.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!routine) return null;

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/routines"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Routines
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Edit3}
            onClick={() => navigate(`/routines/${routine.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Routine Header Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={routine.goalType} size="md">
                {routine.goalType}
              </Badge>
              <span className="text-xs text-slate-400 font-medium">
                {routine.exercises?.length || 0} Exercises Total
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {routine.name}
            </h2>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate(`/entries/log?date=${todayStr}&routineId=${routine.id}`)}
          >
            Log This Workout Today
          </Button>
        </div>

        {routine.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
            {routine.description}
          </p>
        )}
      </div>

      {/* Exercises Breakdown */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          Ordered Exercise List
        </h3>

        <div className="space-y-3">
          {routine.exercises?.map((ex, index) => (
            <div
              key={ex.id || index}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center shrink-0">
                  {index + 1}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {ex.name}
                  </h4>
                  {ex.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {ex.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 font-semibold text-slate-700 dark:text-slate-200">
                  {ex.sets} Sets × {ex.reps} Reps
                </div>

                {ex.weight !== null && ex.weight !== undefined && (
                  <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 font-semibold text-indigo-700 dark:text-indigo-300">
                    {ex.weight} kg
                  </div>
                )}

                {ex.duration !== null && ex.duration !== undefined && (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {ex.duration}s
                  </div>
                )}

                <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 flex items-center gap-1 text-xs">
                  <Timer className="w-3.5 h-3.5" />
                  Rest: {ex.restSeconds}s
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Workout Routine"
        message={`Are you sure you want to delete "${routine.name}"? This action cannot be undone.`}
        confirmText="Delete Routine"
        isLoading={isDeleting}
      />
    </div>
  );
};
