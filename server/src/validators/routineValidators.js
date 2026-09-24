const { z } = require('zod');

const exerciseSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Exercise name is required'),
  sets: z.coerce.number().int().min(1, 'Sets must be at least 1').default(3),
  reps: z.coerce.number().int().min(0, 'Reps cannot be negative').default(10),
  weight: z.coerce.number().min(0, 'Weight cannot be negative').nullable().optional(),
  duration: z.coerce.number().int().min(0, 'Duration cannot be negative').nullable().optional(),
  restSeconds: z.coerce.number().int().min(0, 'Rest seconds cannot be negative').default(60),
  notes: z.string().trim().nullable().optional(),
  order: z.coerce.number().int().min(0).optional()
});

const routineSchema = z.object({
  name: z.string().trim().min(1, 'Routine name is required'),
  description: z.string().trim().nullable().optional(),
  goalType: z.enum(['strength', 'cardio', 'HIIT', 'mobility', 'other'], {
    errorMap: () => ({ message: 'Goal type must be strength, cardio, HIIT, mobility, or other' })
  }).default('strength'),
  exercises: z.array(exerciseSchema).min(1, 'Routine must contain at least one exercise')
});

module.exports = {
  routineSchema,
  exerciseSchema
};
