import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Plus,
  Flame,
  UtensilsCrossed,
  Layers
} from 'lucide-react';
import { mealsApi } from '../api/mealsApi';
import { Button } from '../components/ui/Button';
import { Badge, Spinner } from '../components/ui/BadgesAndEmpty';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../context/ToastContext';

export const MealDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [meal, setMeal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const res = await mealsApi.getById(id);
        if (res.data?.success) {
          setMeal(res.data.data);
        }
      } catch (err) {
        toastError('Failed to load meal details.');
        navigate('/meals');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeal();
  }, [id, navigate]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await mealsApi.delete(id);
      success('Meal deleted successfully');
      navigate('/meals');
    } catch (err) {
      toastError('Failed to delete meal.');
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

  if (!meal) return null;

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/meals"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Meals
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Edit3}
            onClick={() => navigate(`/meals/${meal.id}/edit`)}
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

      {/* Meal Header Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={meal.mealType} size="md">
                {meal.mealType}
              </Badge>
              <span className="text-xs text-slate-400 font-medium">
                {meal.items?.length || 0} Ingredients
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {meal.name}
            </h2>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate(`/entries/log?date=${todayStr}&mealId=${meal.id}`)}
          >
            Log This Meal Today
          </Button>
        </div>

        {meal.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pb-6 border-b border-slate-100 dark:border-slate-800">
            {meal.description}
          </p>
        )}

        {/* Nutritional Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-500" /> Calories
            </p>
            <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
              {meal.calories} <span className="text-xs font-medium">kcal</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-center">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Protein
            </p>
            <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">
              {meal.protein} <span className="text-xs font-medium">g</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Carbs
            </p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
              {meal.carbs} <span className="text-xs font-medium">g</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center">
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Fat
            </p>
            <p className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">
              {meal.fat} <span className="text-xs font-medium">g</span>
            </p>
          </div>
        </div>
      </div>

      {/* Ingredients List */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-amber-500" />
          Ingredients & Portions ({meal.items?.length || 0})
        </h3>

        {meal.items && meal.items.length > 0 ? (
          <div className="space-y-3">
            {meal.items.map((item, index) => (
              <div
                key={item.id || index}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {item.name}
                    </h4>
                    {item.amount && (
                      <p className="text-xs text-slate-400">{item.amount}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  {item.calories !== null && item.calories !== undefined && (
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {item.calories} kcal
                    </span>
                  )}
                  {(item.protein || item.carbs || item.fat) && (
                    <span className="text-slate-400 text-[11px] hidden sm:inline">
                      (P: {item.protein || 0}g · C: {item.carbs || 0}g · F: {item.fat || 0}g)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            No specific ingredients breakdown saved for this meal. Macro totals are recorded directly.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Custom Meal"
        message={`Are you sure you want to delete "${meal.name}"? This action cannot be undone.`}
        confirmText="Delete Meal"
        isLoading={isDeleting}
      />
    </div>
  );
};
