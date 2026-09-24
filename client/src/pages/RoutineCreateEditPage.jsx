import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Save,
  Dumbbell
} from 'lucide-react';
import { routinesApi } from '../api/routinesApi';
import { Input, Select, Textarea } from '../components/ui/FormControls';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/BadgesAndEmpty';
import { useToast } from '../context/ToastContext';

export const RoutineCreateEditPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goalType, setGoalType] = useState('strength');
  const [exercises, setExercises] = useState([
    { name: '', sets: 3, reps: 10, weight: '', duration: '', restSeconds: 60, notes: '' }
  ]);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchRoutine = async () => {
        try {
          const res = await routinesApi.getById(id);
          if (res.data?.success) {
            const data = res.data.data;
            setName(data.name || '');
            setDescription(data.description || '');
            setGoalType(data.goalType || 'strength');
            if (data.exercises && data.exercises.length > 0) {
              setExercises(
                data.exercises.map((e) => ({
                  id: e.id,
                  name: e.name || '',
                  sets: e.sets ?? 3,
                  reps: e.reps ?? 10,
                  weight: e.weight ?? '',
                  duration: e.duration ?? '',
                  restSeconds: e.restSeconds ?? 60,
                  notes: e.notes || ''
                }))
              );
            }
          }
        } catch (err) {
          toastError('Failed to load routine data.');
          navigate('/routines');
        } finally {
          setIsLoading(false);
        }
      };
      fetchRoutine();
    }
  }, [id, isEditing, navigate]);

  const handleAddExercise = () => {
    setExercises((prev) => [
      ...prev,
      { name: '', sets: 3, reps: 10, weight: '', duration: '', restSeconds: 60, notes: '' }
    ]);
  };

  const handleDuplicateExercise = (index) => {
    const target = exercises[index];
    const copy = { ...target, id: undefined, name: `${target.name} (Copy)` };
    const newExercises = [...exercises];
    newExercises.splice(index + 1, 0, copy);
    setExercises(newExercises);
  };

  const handleRemoveExercise = (index) => {
    if (exercises.length === 1) {
      toastError('A routine must contain at least one exercise.');
      return;
    }
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newArr = [...exercises];
    const temp = newArr[index - 1];
    newArr[index - 1] = newArr[index];
    newArr[index] = temp;
    setExercises(newArr);
  };

  const handleMoveDown = (index) => {
    if (index === exercises.length - 1) return;
    const newArr = [...exercises];
    const temp = newArr[index + 1];
    newArr[index + 1] = newArr[index];
    newArr[index] = temp;
    setExercises(newArr);
  };

  const handleExerciseChange = (index, field, value) => {
    setExercises((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const errs = {};
    if (!name.trim()) errs.name = 'Routine name is required';

    let hasExerciseError = false;
    exercises.forEach((ex, idx) => {
      if (!ex.name.trim()) {
        errs[`exercise_${idx}_name`] = 'Exercise name is required';
        hasExerciseError = true;
      }
    });

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      if (hasExerciseError) {
        toastError('Please ensure all exercises have a valid name.');
      }
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        goalType,
        exercises: exercises.map((ex, idx) => ({
          name: ex.name.trim(),
          order: idx,
          sets: Number(ex.sets) || 1,
          reps: Number(ex.reps) || 0,
          weight: ex.weight !== '' && ex.weight !== null ? Number(ex.weight) : null,
          duration: ex.duration !== '' && ex.duration !== null ? Number(ex.duration) : null,
          restSeconds: Number(ex.restSeconds) || 0,
          notes: ex.notes ? ex.notes.trim() : null
        }))
      };

      if (isEditing) {
        await routinesApi.update(id, payload);
        success('Routine updated successfully!');
      } else {
        await routinesApi.create(payload);
        success('Routine created successfully!');
      }
      navigate('/routines');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save routine.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/routines"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel & Back
        </Link>
        <Button
          type="button"
          icon={Save}
          isLoading={isSaving}
          onClick={handleSubmit}
        >
          {isEditing ? 'Update Routine' : 'Save Routine'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Details Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            {isEditing ? 'Edit Routine Details' : 'New Routine Details'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Routine Name *"
                placeholder="e.g. Upper Body Hypertrophy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
              />
            </div>
            <div>
              <Select
                label="Goal / Category"
                value={goalType}
                onChange={(e) => setGoalType(e.target.value)}
                options={[
                  { value: 'strength', label: 'Strength' },
                  { value: 'cardio', label: 'Cardio' },
                  { value: 'HIIT', label: 'HIIT' },
                  { value: 'mobility', label: 'Mobility' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </div>
          </div>

          <Textarea
            label="Description (Optional)"
            placeholder="Brief notes about target muscle groups or intensity..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        {/* Exercises Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Exercises ({exercises.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Order and configure each exercise in this workout routine
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={handleAddExercise}
            >
              Add Exercise
            </Button>
          </div>

          <div className="space-y-4">
            {exercises.map((ex, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all space-y-4"
              >
                {/* Exercise top bar: Order index, Name, and Actions */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-semibold uppercase text-slate-400">
                      Exercise #{index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-25 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === exercises.length - 1}
                      onClick={() => handleMoveDown(index)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-25 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateExercise(index)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Duplicate Exercise"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Remove Exercise"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Exercise Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <div className="md:col-span-2">
                    <Input
                      label="Exercise Name *"
                      placeholder="e.g. Barbell Squats"
                      value={ex.name}
                      onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                      error={errors[`exercise_${index}_name`]}
                    />
                  </div>
                  <div>
                    <Input
                      label="Sets"
                      type="number"
                      min="1"
                      value={ex.sets}
                      onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      label="Reps"
                      type="number"
                      min="0"
                      value={ex.reps}
                      onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      label="Weight (kg)"
                      type="number"
                      step="any"
                      min="0"
                      placeholder="Optional"
                      value={ex.weight}
                      onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      label="Rest (sec)"
                      type="number"
                      min="0"
                      value={ex.restSeconds}
                      onChange={(e) => handleExerciseChange(index, 'restSeconds', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
                  <div>
                    <Input
                      label="Duration (sec, optional)"
                      type="number"
                      min="0"
                      placeholder="For timed holds"
                      value={ex.duration}
                      onChange={(e) => handleExerciseChange(index, 'duration', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Input
                      label="Notes / Form Cue (Optional)"
                      placeholder="e.g. Pause 2s at bottom, explosive concentric..."
                      value={ex.notes}
                      onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              className="w-full py-3 border-dashed"
              icon={Plus}
              onClick={handleAddExercise}
            >
              Add Another Exercise
            </Button>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/routines')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            icon={Save}
            isLoading={isSaving}
          >
            {isEditing ? 'Update Routine' : 'Save Routine'}
          </Button>
        </div>
      </form>
    </div>
  );
};
