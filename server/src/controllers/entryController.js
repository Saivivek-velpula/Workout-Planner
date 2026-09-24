const prisma = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

const computeEntryTotals = (entry) => {
  if (!entry) return null;
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  if (entry.meals && Array.isArray(entry.meals)) {
    for (const m of entry.meals) {
      totalCalories += Number(m.calories) || 0;
      totalProtein += Number(m.protein) || 0;
      totalCarbs += Number(m.carbs) || 0;
      totalFat += Number(m.fat) || 0;
    }
  }

  const workoutsCount = entry.routines ? entry.routines.length : 0;
  const workoutsCompleted = entry.routines ? entry.routines.filter(r => r.completed).length : 0;

  return {
    ...entry,
    totals: {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      workoutsCount,
      workoutsCompleted
    }
  };
};

const getEntries = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const where = {
      userId: req.user.id
    };

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = from;
      if (to) where.date.lte = to;
    }

    const entries = await prisma.dailyEntry.findMany({
      where,
      include: {
        routines: true,
        meals: true
      },
      orderBy: { date: 'desc' }
    });

    res.json({
      success: true,
      data: entries.map(computeEntryTotals)
    });
  } catch (error) {
    next(error);
  }
};

const getEntryByDate = async (req, res, next) => {
  try {
    const { date } = req.params;

    const entry = await prisma.dailyEntry.findFirst({
      where: {
        userId: req.user.id,
        date
      },
      include: {
        routines: true,
        meals: true
      }
    });

    res.json({
      success: true,
      data: entry ? computeEntryTotals(entry) : null
    });
  } catch (error) {
    next(error);
  }
};

const upsertEntry = async (req, res, next) => {
  try {
    const { date, bodyWeight, waterIntake, moodEnergy, notes, routines, meals } = req.body;

    const savedEntry = await prisma.$transaction(async (tx) => {
      // Find existing entry for this user and date
      const existing = await tx.dailyEntry.findUnique({
        where: {
          userId_date: {
            userId: req.user.id,
            date
          }
        }
      });

      let entryId;
      if (existing) {
        entryId = existing.id;
        await tx.dailyEntry.update({
          where: { id: entryId },
          data: {
            bodyWeight: bodyWeight !== undefined && bodyWeight !== null ? Number(bodyWeight) : null,
            waterIntake: waterIntake !== undefined && waterIntake !== null ? Number(waterIntake) : null,
            moodEnergy: moodEnergy !== undefined && moodEnergy !== null ? Number(moodEnergy) : null,
            notes: notes !== undefined ? notes : existing.notes
          }
        });

        // Clear existing routines and meals to cleanly replace with updated list
        await tx.entryRoutine.deleteMany({ where: { dailyEntryId: entryId } });
        await tx.entryMeal.deleteMany({ where: { dailyEntryId: entryId } });
      } else {
        const created = await tx.dailyEntry.create({
          data: {
            userId: req.user.id,
            date,
            bodyWeight: bodyWeight !== undefined && bodyWeight !== null ? Number(bodyWeight) : null,
            waterIntake: waterIntake !== undefined && waterIntake !== null ? Number(waterIntake) : null,
            moodEnergy: moodEnergy !== undefined && moodEnergy !== null ? Number(moodEnergy) : null,
            notes: notes || null
          }
        });
        entryId = created.id;
      }

      // Insert routines if provided
      if (routines && Array.isArray(routines) && routines.length > 0) {
        await tx.entryRoutine.createMany({
          data: routines.map(r => ({
            dailyEntryId: entryId,
            routineId: r.routineId || null,
            routineName: r.routineName,
            completed: r.completed !== undefined ? Boolean(r.completed) : true,
            durationMinutes: r.durationMinutes !== undefined && r.durationMinutes !== null ? Number(r.durationMinutes) : null,
            actualExercises: r.actualExercises ? (typeof r.actualExercises === 'string' ? r.actualExercises : JSON.stringify(r.actualExercises)) : null
          }))
        });
      }

      // Insert meals if provided
      if (meals && Array.isArray(meals) && meals.length > 0) {
        await tx.entryMeal.createMany({
          data: meals.map(m => ({
            dailyEntryId: entryId,
            mealId: m.mealId || null,
            mealName: m.mealName,
            mealType: m.mealType || 'snack',
            calories: Number(m.calories) || 0,
            protein: Number(m.protein) || 0,
            carbs: Number(m.carbs) || 0,
            fat: Number(m.fat) || 0
          }))
        });
      }

      return await tx.dailyEntry.findUnique({
        where: { id: entryId },
        include: {
          routines: true,
          meals: true
        }
      });
    });

    res.status(200).json({
      success: true,
      message: 'Daily entry saved successfully',
      data: computeEntryTotals(savedEntry)
    });
  } catch (error) {
    next(error);
  }
};

const updateEntryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, bodyWeight, waterIntake, moodEnergy, notes, routines, meals } = req.body;

    const existing = await prisma.dailyEntry.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      throw new AppError('Daily entry not found or access denied', 404);
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.dailyEntry.update({
        where: { id },
        data: {
          date: date || existing.date,
          bodyWeight: bodyWeight !== undefined && bodyWeight !== null ? Number(bodyWeight) : existing.bodyWeight,
          waterIntake: waterIntake !== undefined && waterIntake !== null ? Number(waterIntake) : existing.waterIntake,
          moodEnergy: moodEnergy !== undefined && moodEnergy !== null ? Number(moodEnergy) : existing.moodEnergy,
          notes: notes !== undefined ? notes : existing.notes
        }
      });

      if (routines !== undefined && Array.isArray(routines)) {
        await tx.entryRoutine.deleteMany({ where: { dailyEntryId: id } });
        if (routines.length > 0) {
          await tx.entryRoutine.createMany({
            data: routines.map(r => ({
              dailyEntryId: id,
              routineId: r.routineId || null,
              routineName: r.routineName,
              completed: r.completed !== undefined ? Boolean(r.completed) : true,
              durationMinutes: r.durationMinutes !== undefined && r.durationMinutes !== null ? Number(r.durationMinutes) : null,
              actualExercises: r.actualExercises ? (typeof r.actualExercises === 'string' ? r.actualExercises : JSON.stringify(r.actualExercises)) : null
            }))
          });
        }
      }

      if (meals !== undefined && Array.isArray(meals)) {
        await tx.entryMeal.deleteMany({ where: { dailyEntryId: id } });
        if (meals.length > 0) {
          await tx.entryMeal.createMany({
            data: meals.map(m => ({
              dailyEntryId: id,
              mealId: m.mealId || null,
              mealName: m.mealName,
              mealType: m.mealType || 'snack',
              calories: Number(m.calories) || 0,
              protein: Number(m.protein) || 0,
              carbs: Number(m.carbs) || 0,
              fat: Number(m.fat) || 0
            }))
          });
        }
      }

      return await tx.dailyEntry.findUnique({
        where: { id },
        include: {
          routines: true,
          meals: true
        }
      });
    });

    res.json({
      success: true,
      message: 'Daily entry updated successfully',
      data: computeEntryTotals(updated)
    });
  } catch (error) {
    next(error);
  }
};

const deleteEntry = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.dailyEntry.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      throw new AppError('Daily entry not found or access denied', 404);
    }

    await prisma.dailyEntry.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Daily entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEntries,
  getEntryByDate,
  upsertEntry,
  updateEntryById,
  deleteEntry
};
