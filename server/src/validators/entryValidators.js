const { z } = require('zod');

const entryRoutineSchema = z.object({
  id: z.string().optional(),
  routineId: z.string().nullable().optional(),
  routineName: z.string().trim().min(1, 'Routine name is required'),
  completed: z.boolean().default(true),
  durationMinutes: z.coerce.number().int().min(0).nullable().optional(),
  actualExercises: z.union([z.string(), z.array(z.any()), z.record(z.any())]).nullable().optional()
});

const entryMealSchema = z.object({
  id: z.string().optional(),
  mealId: z.string().nullable().optional(),
  mealName: z.string().trim().min(1, 'Meal name is required'),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  calories: z.coerce.number().int().min(0).default(0),
  protein: z.coerce.number().min(0).default(0),
  carbs: z.coerce.number().min(0).default(0),
  fat: z.coerce.number().min(0).default(0)
});

const entrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  bodyWeight: z.coerce.number().min(0).nullable().optional(),
  waterIntake: z.coerce.number().min(0).nullable().optional(),
  moodEnergy: z.coerce.number().int().min(1).max(5).nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  routines: z.array(entryRoutineSchema).optional().default([]),
  meals: z.array(entryMealSchema).optional().default([])
});

module.exports = {
  entrySchema,
  entryRoutineSchema,
  entryMealSchema
};
