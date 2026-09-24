const { z } = require('zod');

const mealItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Item name is required'),
  amount: z.string().trim().nullable().optional(),
  calories: z.coerce.number().int().min(0).nullable().optional(),
  protein: z.coerce.number().min(0).nullable().optional(),
  carbs: z.coerce.number().min(0).nullable().optional(),
  fat: z.coerce.number().min(0).nullable().optional()
});

const mealSchema = z.object({
  name: z.string().trim().min(1, 'Meal name is required'),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack'], {
    errorMap: () => ({ message: 'Meal type must be breakfast, lunch, dinner, or snack' })
  }),
  description: z.string().trim().nullable().optional(),
  calories: z.coerce.number().int().min(0, 'Calories cannot be negative'),
  protein: z.coerce.number().min(0, 'Protein cannot be negative').default(0),
  carbs: z.coerce.number().min(0, 'Carbs cannot be negative').default(0),
  fat: z.coerce.number().min(0, 'Fat cannot be negative').default(0),
  items: z.array(mealItemSchema).optional().default([])
});

module.exports = {
  mealSchema,
  mealItemSchema
};
