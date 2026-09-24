import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  UtensilsCrossed,
  Calculator,
  Flame
} from 'lucide-react';
import { mealsApi } from '../api/mealsApi';
import { Input, Select, Textarea } from '../components/ui/FormControls';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/BadgesAndEmpty';
import { useToast } from '../context/ToastContext';

export const MealCreateEditPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();

  const [name, setName] = useState('');
  const [mealType, setMealType] = useState('lunch');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchMeal = async () => {
        try {
          const res = await mealsApi.getById(id);
          if (res.data?.success) {
            const data = res.data.data;
            setName(data.name || '');
            setMealType(data.mealType || 'lunch');
            setDescription(data.description || '');
            setCalories(data.calories?.toString() || '0');
            setProtein(data.protein?.toString() || '0');
            setCarbs(data.carbs?.toString() || '0');
            setFat(data.fat?.toString() || '0');
            if (data.items && data.items.length > 0) {
              setItems(
                data.items.map((i) => ({
                  id: i.id,
                  name: i.name || '',
                  amount: i.amount || '',
                  calories: i.calories !== null && i.calories !== undefined ? i.calories : '',
                  protein: i.protein !== null && i.protein !== undefined ? i.protein : '',
                  carbs: i.carbs !== null && i.carbs !== undefined ? i.carbs : '',
                  fat: i.fat !== null && i.fat !== undefined ? i.fat : ''
                }))
              );
            }
          }
        } catch (err) {
          toastError('Failed to load meal data.');
          navigate('/meals');
        } finally {
          setIsLoading(false);
        }
      };
      fetchMeal();
    }
  }, [id, isEditing, navigate]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { name: '', amount: '', calories: '', protein: '', carbs: '', fat: '' }
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const calculateFromIngredients = () => {
    if (items.length === 0) {
      toastError('Add ingredients below first to calculate totals.');
      return;
    }

    let totCal = 0;
    let totP = 0;
    let totC = 0;
    let totF = 0;

    items.forEach((item) => {
      totCal += Number(item.calories) || 0;
      totP += Number(item.protein) || 0;
      totC += Number(item.carbs) || 0;
      totF += Number(item.fat) || 0;
    });

    setCalories(totCal.toString());
    setProtein((Math.round(totP * 10) / 10).toString());
    setCarbs((Math.round(totC * 10) / 10).toString());
    setFat((Math.round(totF * 10) / 10).toString());
    info('Macro totals updated from ingredients!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const errs = {};
    if (!name.trim()) errs.name = 'Meal name is required';
    if (calories === '' || isNaN(Number(calories)) || Number(calories) < 0) {
      errs.calories = 'Valid calorie count required (0 or greater)';
    }

    let hasItemError = false;
    items.forEach((item, idx) => {
      if (!item.name.trim()) {
        errs[`item_${idx}_name`] = 'Ingredient name is required';
        hasItemError = true;
      }
    });

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      if (hasItemError) {
        toastError('Please ensure all ingredient items have names.');
      }
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        mealType,
        description: description.trim() || null,
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        items: items.map((i) => ({
          name: i.name.trim(),
          amount: i.amount ? i.amount.trim() : null,
          calories: i.calories !== '' ? Number(i.calories) : null,
          protein: i.protein !== '' ? Number(i.protein) : null,
          carbs: i.carbs !== '' ? Number(i.carbs) : null,
          fat: i.fat !== '' ? Number(i.fat) : null
        }))
      };

      if (isEditing) {
        await mealsApi.update(id, payload);
        success('Meal updated successfully!');
      } else {
        await mealsApi.create(payload);
        success('Meal created successfully!');
      }
      navigate('/meals');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save meal.');
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
          to="/meals"
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
          {isEditing ? 'Update Meal' : 'Save Meal'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Details Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-500" />
            {isEditing ? 'Edit Meal Details' : 'New Meal Details'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Meal Name *"
                placeholder="e.g. Grilled Chicken Quinoa Bowl"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
              />
            </div>
            <div>
              <Select
                label="Meal Type"
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                options={[
                  { value: 'breakfast', label: 'Breakfast' },
                  { value: 'lunch', label: 'Lunch' },
                  { value: 'dinner', label: 'Dinner' },
                  { value: 'snack', label: 'Snack' },
                ]}
              />
            </div>
          </div>

          <Textarea
            label="Description (Optional)"
            placeholder="Preparation notes, seasoning, or recipe details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />

          {/* Nutrition Macro Inputs */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Total Nutrition & Macros *
              </label>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={calculateFromIngredients}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  <Calculator className="w-3.5 h-3.5" /> Sum from Ingredients
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Input
                  label="Calories (kcal) *"
                  type="number"
                  min="0"
                  placeholder="e.g. 550"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  error={errors.calories}
                />
              </div>
              <div>
                <Input
                  label="Protein (g)"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="e.g. 40"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                />
              </div>
              <div>
                <Input
                  label="Carbs (g)"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="e.g. 50"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                />
              </div>
              <div>
                <Input
                  label="Fat (g)"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="e.g. 15"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Optional Ingredients Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Ingredients & Food Items ({items.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Optional: List individual ingredients with portion sizes and macros
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={handleAddItem}
            >
              Add Item
            </Button>
          </div>

          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-400">
                      Item #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div className="md:col-span-2">
                      <Input
                        label="Item / Food Name"
                        placeholder="e.g. Chicken Breast"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        error={errors[`item_${index}_name`]}
                      />
                    </div>
                    <div>
                      <Input
                        label="Portion / Amount"
                        placeholder="e.g. 150g or 1 cup"
                        value={item.amount}
                        onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        label="Calories"
                        type="number"
                        min="0"
                        placeholder="kcal"
                        value={item.calories}
                        onChange={(e) => handleItemChange(index, 'calories', e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        label="Protein (g)"
                        type="number"
                        step="any"
                        min="0"
                        placeholder="P (g)"
                        value={item.protein}
                        onChange={(e) => handleItemChange(index, 'protein', e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        label="Carbs / Fat (g)"
                        placeholder="C: 0, F: 5"
                        value={item.carbs !== '' ? `${item.carbs}c / ${item.fat || 0}f` : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const parts = val.split('/');
                          if (parts[0]) handleItemChange(index, 'carbs', parseFloat(parts[0]) || 0);
                          if (parts[1]) handleItemChange(index, 'fat', parseFloat(parts[1]) || 0);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                No individual ingredients added. You can simply specify the total meal calories and macros above.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={handleAddItem}
              >
                Add Ingredient Breakdown
              </Button>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/meals')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            icon={Save}
            isLoading={isSaving}
          >
            {isEditing ? 'Update Meal' : 'Save Meal'}
          </Button>
        </div>
      </form>
    </div>
  );
};
