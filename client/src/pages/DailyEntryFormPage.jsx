import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  UtensilsCrossed,
  Droplet,
  Scale,
  Smile,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  Flame,
  ArrowLeft
} from 'lucide-react';
import { entriesApi } from '../api/entriesApi';
import { routinesApi } from '../api/routinesApi';
import { mealsApi } from '../api/mealsApi';
import { Input, Select, Textarea } from '../components/ui/FormControls';
import { Button } from '../components/ui/Button';
import { Badge, Spinner } from '../components/ui/BadgesAndEmpty';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../context/ToastContext';

export const DailyEntryFormPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();

  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedDate = searchParams.get('date') || todayStr;

  const [date, setDate] = useState(selectedDate);
  const [existingEntryId, setExistingEntryId] = useState(null);

  // Form Fields
  const [bodyWeight, setBodyWeight] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [moodEnergy, setMoodEnergy] = useState(null); // 1 to 5
  const [notes, setNotes] = useState('');

  const [entryRoutines, setEntryRoutines] = useState([]);
  const [entryMeals, setEntryMeals] = useState([]);

  // Available library items to pick from
  const [savedRoutines, setSavedRoutines] = useState([]);
  const [savedMeals, setSavedMeals] = useState([]);

  const [selectedRoutineToAdd, setSelectedRoutineToAdd] = useState('');
  const [selectedMealToAdd, setSelectedMealToAdd] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load library of routines and meals
  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        const [rRes, mRes] = await Promise.all([
          routinesApi.getAll(),
          mealsApi.getAll()
        ]);
        if (rRes.data?.success) setSavedRoutines(rRes.data.data);
        if (mRes.data?.success) setSavedMeals(mRes.data.data);
      } catch (err) {
        console.error('Failed to load libraries:', err);
      }
    };
    fetchLibraries();
  }, []);

  // Check URL params for quick-adds
  const preselectedRoutineId = searchParams.get('routineId');
  const preselectedMealId = searchParams.get('mealId');

  // Load entry for chosen date
  useEffect(() => {
    const fetchDateEntry = async () => {
      setIsLoading(true);
      try {
        const res = await entriesApi.getByDate(date);
        const data = res.data?.data;

        if (data) {
          setExistingEntryId(data.id);
          setBodyWeight(data.bodyWeight !== null && data.bodyWeight !== undefined ? data.bodyWeight.toString() : '');
          setWaterIntake(data.waterIntake !== null && data.waterIntake !== undefined ? data.waterIntake.toString() : '');
          setMoodEnergy(data.moodEnergy || null);
          setNotes(data.notes || '');

          setEntryRoutines(
            (data.routines || []).map((r) => {
              let actuals = [];
              if (r.actualExercises) {
                try {
                  actuals = typeof r.actualExercises === 'string' ? JSON.parse(r.actualExercises) : r.actualExercises;
                } catch {
                  actuals = [];
                }
              }
              return {
                id: r.id,
                routineId: r.routineId,
                routineName: r.routineName,
                completed: r.completed ?? true,
                durationMinutes: r.durationMinutes ?? '',
                actualExercises: actuals
              };
            })
          );

          setEntryMeals(
            (data.meals || []).map((m) => ({
              id: m.id,
              mealId: m.mealId,
              mealName: m.mealName,
              mealType: m.mealType || 'snack',
              calories: m.calories ?? 0,
              protein: m.protein ?? 0,
              carbs: m.carbs ?? 0,
              fat: m.fat ?? 0
            }))
          );
        } else {
          // Reset to clean slate for this day
          setExistingEntryId(null);
          setBodyWeight('');
          setWaterIntake('');
          setMoodEnergy(null);
          setNotes('');
          setEntryRoutines([]);
          setEntryMeals([]);
        }
      } catch (err) {
        console.error('Error fetching date entry:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDateEntry();
  }, [date]);

  // Handle pre-selected routine or meal from query params
  useEffect(() => {
    if (!isLoading) {
      if (preselectedRoutineId && savedRoutines.length > 0) {
        const found = savedRoutines.find((r) => r.id === preselectedRoutineId);
        if (found && !entryRoutines.some((er) => er.routineId === found.id)) {
          handleAddSavedRoutine(found.id);
        }
      }
      if (preselectedMealId && savedMeals.length > 0) {
        const found = savedMeals.find((m) => m.id === preselectedMealId);
        if (found) {
          handleAddSavedMeal(found.id);
        }
      }
    }
  }, [isLoading, preselectedRoutineId, preselectedMealId, savedRoutines, savedMeals]);

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSearchParams({ date: newDate });
  };

  const handleStepDay = (delta) => {
    const current = new Date(date + 'T00:00:00');
    current.setDate(current.getDate() + delta);
    const nextDate = current.toISOString().slice(0, 10);
    handleDateChange(nextDate);
  };

  // Add Routine Handler
  const handleAddSavedRoutine = (routineId) => {
    const routine = savedRoutines.find((r) => r.id === routineId);
    if (!routine) return;

    const actuals = (routine.exercises || []).map((ex) => ({
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight || '',
      completed: true
    }));

    setEntryRoutines((prev) => [
      ...prev,
      {
        routineId: routine.id,
        routineName: routine.name,
        completed: true,
        durationMinutes: 45,
        actualExercises: actuals
      }
    ]);
    setSelectedRoutineToAdd('');
    info(`Added "${routine.name}" to today's routines.`);
  };

  const handleAddCustomRoutine = () => {
    setEntryRoutines((prev) => [
      ...prev,
      {
        routineId: null,
        routineName: '',
        completed: true,
        durationMinutes: 30,
        actualExercises: []
      }
    ]);
  };

  const handleRemoveRoutine = (index) => {
    setEntryRoutines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRoutineChange = (index, field, value) => {
    setEntryRoutines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Add Meal Handler
  const handleAddSavedMeal = (mealId) => {
    const meal = savedMeals.find((m) => m.id === mealId);
    if (!meal) return;

    setEntryMeals((prev) => [
      ...prev,
      {
        mealId: meal.id,
        mealName: meal.name,
        mealType: meal.mealType,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat
      }
    ]);
    setSelectedMealToAdd('');
    info(`Added "${meal.name}" to logged meals.`);
  };

  const handleAddCustomMeal = () => {
    setEntryMeals((prev) => [
      ...prev,
      {
        mealId: null,
        mealName: '',
        mealType: 'snack',
        calories: 200,
        protein: 10,
        carbs: 25,
        fat: 5
      }
    ]);
  };

  const handleRemoveMeal = (index) => {
    setEntryMeals((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMealChange = (index, field, value) => {
    setEntryMeals((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Compute live totals
  const totalCalories = entryMeals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
  const totalProtein = Math.round(entryMeals.reduce((sum, m) => sum + (Number(m.protein) || 0), 0) * 10) / 10;
  const totalCarbs = Math.round(entryMeals.reduce((sum, m) => sum + (Number(m.carbs) || 0), 0) * 10) / 10;
  const totalFat = Math.round(entryMeals.reduce((sum, m) => sum + (Number(m.fat) || 0), 0) * 10) / 10;
  const completedWorkoutsCount = entryRoutines.filter((r) => r.completed).length;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check validity
    for (let i = 0; i < entryRoutines.length; i++) {
      if (!entryRoutines[i].routineName.trim()) {
        toastError(`Routine #${i + 1} requires a name.`);
        return;
      }
    }
    for (let i = 0; i < entryMeals.length; i++) {
      if (!entryMeals[i].mealName.trim()) {
        toastError(`Meal #${i + 1} requires a name.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = {
        date,
        bodyWeight: bodyWeight !== '' ? Number(bodyWeight) : null,
        waterIntake: waterIntake !== '' ? Number(waterIntake) : null,
        moodEnergy: moodEnergy ? Number(moodEnergy) : null,
        notes: notes.trim() || null,
        routines: entryRoutines.map((r) => ({
          routineId: r.routineId || null,
          routineName: r.routineName.trim(),
          completed: Boolean(r.completed),
          durationMinutes: r.durationMinutes !== '' ? Number(r.durationMinutes) : null,
          actualExercises: r.actualExercises && r.actualExercises.length > 0 ? r.actualExercises : null
        })),
        meals: entryMeals.map((m) => ({
          mealId: m.mealId || null,
          mealName: m.mealName.trim(),
          mealType: m.mealType || 'snack',
          calories: Number(m.calories) || 0,
          protein: Number(m.protein) || 0,
          carbs: Number(m.carbs) || 0,
          fat: Number(m.fat) || 0
        }))
      };

      const res = await entriesApi.saveDailyEntry(payload);
      if (res.data?.success) {
        success(`Daily entry for ${date} saved successfully!`);
        setExistingEntryId(res.data.data.id);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save daily entry.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!existingEntryId) return;
    setIsDeleting(true);
    try {
      await entriesApi.deleteById(existingEntryId);
      success(`Entry for ${date} deleted.`);
      setShowDeleteModal(false);
      setExistingEntryId(null);
      setBodyWeight('');
      setWaterIntake('');
      setMoodEnergy(null);
      setNotes('');
      setEntryRoutines([]);
      setEntryMeals([]);
    } catch (err) {
      toastError('Failed to delete entry.');
    } finally {
      setIsDeleting(false);
    }
  };

  const moodOptions = [
    { score: 1, label: 'Tired', emoji: '😴' },
    { score: 2, label: 'Neutral', emoji: '😐' },
    { score: 3, label: 'Good', emoji: '🙂' },
    { score: 4, label: 'Energetic', emoji: '😄' },
    { score: 5, label: 'Unstoppable', emoji: '🔥' },
  ];

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-20">
      {/* Top Bar with Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/calendar"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Calendar
          </Link>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Daily Log
            {existingEntryId && (
              <Badge variant="brand" size="sm">
                Saved
              </Badge>
            )}
          </h2>
        </div>

        {/* Date Stepper Controls */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            type="button"
            onClick={() => handleStepDay(-1)}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none px-2 py-1 cursor-pointer"
          />

          <button
            type="button"
            onClick={() => handleStepDay(1)}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {date !== todayStr && (
            <button
              type="button"
              onClick={() => handleDateChange(todayStr)}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 px-2 py-1 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/60 transition-colors ml-1"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Live Daily Macro & Workouts Summary Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Calories</p>
            <p className="text-2xl font-black text-amber-400 flex items-baseline gap-1">
              {totalCalories} <span className="text-xs font-normal text-slate-300">kcal</span>
            </p>
          </div>
          <div className="hidden sm:block h-8 w-px bg-slate-700" />
          <div className="flex items-center gap-4 text-xs">
            <div>
              <p className="text-slate-400 uppercase text-[10px]">Protein</p>
              <p className="font-bold text-blue-300">{totalProtein}g</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase text-[10px]">Carbs</p>
              <p className="font-bold text-amber-300">{totalCarbs}g</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase text-[10px]">Fat</p>
              <p className="font-bold text-rose-300">{totalFat}g</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Workouts</p>
            <p className="text-base font-bold text-emerald-400">
              {completedWorkoutsCount} Done
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Workouts Performed */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Workouts Performed ({entryRoutines.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Log the routines you completed, duration, and exercise weights
              </p>
            </div>

            {/* Quick add dropdown */}
            <div className="flex items-center gap-2">
              {savedRoutines.length > 0 && (
                <select
                  value={selectedRoutineToAdd}
                  onChange={(e) => {
                    if (e.target.value) handleAddSavedRoutine(e.target.value);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="">+ Add From Saved Routines</option>
                  {savedRoutines.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.goalType})
                    </option>
                  ))}
                </select>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={handleAddCustomRoutine}
              >
                Custom
              </Button>
            </div>
          </div>

          {entryRoutines.length > 0 ? (
            <div className="space-y-4">
              {entryRoutines.map((routine, rIdx) => (
                <div
                  key={rIdx}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <Input
                        label="Routine Name *"
                        placeholder="e.g. Morning Push Workout"
                        value={routine.routineName}
                        onChange={(e) => handleRoutineChange(rIdx, 'routineName', e.target.value)}
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        label="Duration (mins)"
                        type="number"
                        min="0"
                        placeholder="e.g. 45"
                        value={routine.durationMinutes}
                        onChange={(e) => handleRoutineChange(rIdx, 'durationMinutes', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-4 sm:pt-6">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={routine.completed}
                          onChange={(e) => handleRoutineChange(rIdx, 'completed', e.target.checked)}
                          className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                        />
                        Completed
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveRoutine(rIdx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Remove Routine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Optional Actual Exercise Sets/Reps/Weight */}
                  {routine.actualExercises && routine.actualExercises.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Exercise Breakdown & Actual Weights
                      </p>
                      <div className="space-y-2">
                        {routine.actualExercises.map((ex, exIdx) => (
                          <div
                            key={exIdx}
                            className="flex flex-wrap items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs gap-2"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate min-w-[140px]">
                              {ex.name}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-500">
                                {ex.sets} sets × {ex.reps} reps
                              </span>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="Weight"
                                  value={ex.weight || ''}
                                  onChange={(e) => {
                                    const updated = [...entryRoutines];
                                    updated[rIdx].actualExercises[exIdx].weight = e.target.value;
                                    setEntryRoutines(updated);
                                  }}
                                  className="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-xs text-center font-bold text-indigo-600 dark:text-indigo-400"
                                />
                                <span className="text-slate-400 text-[10px]">kg</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 italic">
              No workouts logged yet. Select a routine from your library above or add a custom workout.
            </div>
          )}
        </div>

        {/* Section 2: Meals Eaten */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-amber-500" />
                Meals & Food Eaten ({entryMeals.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Log the meals you consumed to automatically compute daily calories & macros
              </p>
            </div>

            {/* Quick add dropdown */}
            <div className="flex items-center gap-2">
              {savedMeals.length > 0 && (
                <select
                  value={selectedMealToAdd}
                  onChange={(e) => {
                    if (e.target.value) handleAddSavedMeal(e.target.value);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="">+ Add From Saved Meals</option>
                  {savedMeals.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.calories} kcal)
                    </option>
                  ))}
                </select>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={handleAddCustomMeal}
              >
                Custom
              </Button>
            </div>
          </div>

          {entryMeals.length > 0 ? (
            <div className="space-y-4">
              {entryMeals.map((meal, mIdx) => (
                <div
                  key={mIdx}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                    <div className="md:col-span-2">
                      <Input
                        label="Meal Name *"
                        placeholder="e.g. Oatmeal Bowl"
                        value={meal.mealName}
                        onChange={(e) => handleMealChange(mIdx, 'mealName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Select
                        label="Type"
                        value={meal.mealType}
                        onChange={(e) => handleMealChange(mIdx, 'mealType', e.target.value)}
                        options={[
                          { value: 'breakfast', label: 'Breakfast' },
                          { value: 'lunch', label: 'Lunch' },
                          { value: 'dinner', label: 'Dinner' },
                          { value: 'snack', label: 'Snack' },
                        ]}
                      />
                    </div>
                    <div>
                      <Input
                        label="Calories (kcal)"
                        type="number"
                        min="0"
                        value={meal.calories}
                        onChange={(e) => handleMealChange(mIdx, 'calories', e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        label="Protein (g)"
                        type="number"
                        step="any"
                        min="0"
                        value={meal.protein}
                        onChange={(e) => handleMealChange(mIdx, 'protein', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          label="Carbs / Fat (g)"
                          placeholder="C/F"
                          value={`${meal.carbs || 0}c / ${meal.fat || 0}f`}
                          onChange={(e) => {
                            const val = e.target.value;
                            const parts = val.split('/');
                            if (parts[0]) handleMealChange(mIdx, 'carbs', parseFloat(parts[0]) || 0);
                            if (parts[1]) handleMealChange(mIdx, 'fat', parseFloat(parts[1]) || 0);
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMeal(mIdx)}
                        className="p-2 mb-0.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Remove Meal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 italic">
              No meals logged yet. Pick from your meal library above or add a custom meal.
            </div>
          )}
        </div>

        {/* Section 3: Vitals & Mood (Weight, Water, Energy, Notes) */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-500" />
            Body Vitals, Wellness & Notes
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Body Weight */}
            <div>
              <Input
                label="Body Weight (kg, optional)"
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 78.5"
                value={bodyWeight}
                onChange={(e) => setBodyWeight(e.target.value)}
                helperText="Track morning weigh-in"
              />
            </div>

            {/* Water Intake */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Water Intake (Liters)
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setWaterIntake((prev) => (Math.round(((Number(prev) || 0) + 0.25) * 100) / 100).toString())}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900"
                  >
                    +0.25L
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaterIntake((prev) => (Math.round(((Number(prev) || 0) + 0.5) * 100) / 100).toString())}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900"
                  >
                    +0.5L
                  </button>
                </div>
              </div>
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 2.5"
                value={waterIntake}
                onChange={(e) => setWaterIntake(e.target.value)}
              />
            </div>
          </div>

          {/* Mood & Energy scale (1 to 5) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Energy & Mood (1 to 5)
            </label>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {moodOptions.map((opt) => (
                <button
                  key={opt.score}
                  type="button"
                  onClick={() => setMoodEnergy(opt.score)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                    moodEnergy === opt.score
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-xl sm:text-2xl">{opt.emoji}</span>
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate w-full">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Free-text Notes */}
          <Textarea
            label="Daily Notes & Reflections (Optional)"
            placeholder="How did you feel today? Any PRs, recovery soreness, sleep quality, or reflections..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Submit and Delete Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div>
            {existingEntryId && (
              <Button
                type="button"
                variant="danger"
                size="md"
                icon={Trash2}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete This Day's Log
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/calendar')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              icon={Save}
              isLoading={isSaving}
            >
              Save Daily Entry
            </Button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteEntry}
        title="Delete Daily Entry"
        message={`Are you sure you want to delete the daily log for ${date}? All recorded workouts and meal logs for this day will be deleted.`}
        confirmText="Delete Entry"
        isLoading={isDeleting}
      />
    </div>
  );
};
