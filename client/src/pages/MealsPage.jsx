import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Plus, Search, Trash2, Edit3, Eye, Flame } from 'lucide-react';
import { mealsApi } from '../api/mealsApi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/FormControls';
import { Badge, Spinner, EmptyState } from '../components/ui/BadgesAndEmpty';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../context/ToastContext';

export const MealsPage = () => {
  const [meals, setMeals] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const mealTypes = [
    { id: 'all', label: 'All Meals' },
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'snack', label: 'Snacks' },
  ];

  const fetchMeals = async () => {
    setIsLoading(true);
    try {
      const res = await mealsApi.getAll({
        mealType: selectedType !== 'all' ? selectedType : undefined,
        search: search ? search : undefined,
      });
      if (res.data?.success) {
        setMeals(res.data.data);
      }
    } catch (err) {
      toastError('Failed to load meals.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [selectedType, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await mealsApi.delete(deleteTarget.id);
      success(`Meal "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchMeals();
    } catch (err) {
      toastError('Failed to delete meal.');
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
            Custom Meals & Nutrition
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build your library of meals and track calories and macronutrients
          </p>
        </div>
        <Button
          icon={Plus}
          onClick={() => navigate('/meals/new')}
        >
          Create Meal
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Meal Type pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {mealTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedType === t.id
                  ? 'bg-amber-600 text-white shadow-sm dark:bg-amber-500'
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
            placeholder="Search meals or ingredients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="py-2"
          />
        </div>
      </div>

      {/* Meals Grid */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : meals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 shadow-sm transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <Badge variant={meal.mealType} size="sm">
                    {meal.mealType}
                  </Badge>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {meal.calories} kcal
                  </span>
                </div>

                <Link
                  to={`/meals/${meal.id}`}
                  className="block group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors"
                >
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {meal.name}
                  </h3>
                </Link>

                {meal.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {meal.description}
                  </p>
                )}

                {/* Macro Pills Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs">
                  <div className="flex-1 px-2.5 py-1.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-center">
                    <p className="text-[10px] text-blue-500 font-semibold uppercase">Protein</p>
                    <p className="font-bold text-blue-700 dark:text-blue-300">{meal.protein}g</p>
                  </div>
                  <div className="flex-1 px-2.5 py-1.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 text-center">
                    <p className="text-[10px] text-amber-500 font-semibold uppercase">Carbs</p>
                    <p className="font-bold text-amber-700 dark:text-amber-300">{meal.carbs}g</p>
                  </div>
                  <div className="flex-1 px-2.5 py-1.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 text-center">
                    <p className="text-[10px] text-rose-500 font-semibold uppercase">Fat</p>
                    <p className="font-bold text-rose-700 dark:text-rose-300">{meal.fat}g</p>
                  </div>
                </div>

                {/* Ingredients count preview */}
                {meal.items && meal.items.length > 0 && (
                  <p className="text-[11px] text-slate-400 mt-2.5">
                    Includes {meal.items.length} food items/ingredients
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  to={`/meals/${meal.id}`}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View Details
                </Link>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/meals/${meal.id}/edit`)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Meal"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(meal)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Meal"
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
          icon={UtensilsCrossed}
          title="No meals found"
          description={
            search || selectedType !== 'all'
              ? 'Try adjusting your search terms or meal type filter.'
              : 'You haven\'t created any meals yet. Add your favorite meals to easily log them in daily entries.'
          }
          actionButton={
            <Button
              icon={Plus}
              onClick={() => navigate('/meals/new')}
            >
              Create First Meal
            </Button>
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Custom Meal"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete Meal"
        isLoading={isDeleting}
      />
    </div>
  );
};
