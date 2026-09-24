const prisma = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

const getMeals = async (req, res, next) => {
  try {
    const { mealType, search } = req.query;
    const where = {
      userId: req.user.id
    };

    if (mealType && mealType !== 'all') {
      where.mealType = mealType;
    }

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim() } },
        { description: { contains: search.trim() } }
      ];
    }

    const meals = await prisma.meal.findMany({
      where,
      include: {
        items: true,
        _count: {
          select: { items: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      success: true,
      data: meals
    });
  } catch (error) {
    next(error);
  }
};

const getMealById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const meal = await prisma.meal.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        items: true
      }
    });

    if (!meal) {
      throw new AppError('Meal not found or access denied', 404);
    }

    res.json({
      success: true,
      data: meal
    });
  } catch (error) {
    next(error);
  }
};

const createMeal = async (req, res, next) => {
  try {
    const { name, mealType, description, calories, protein, carbs, fat, items } = req.body;

    const meal = await prisma.$transaction(async (tx) => {
      const createdMeal = await tx.meal.create({
        data: {
          userId: req.user.id,
          name,
          mealType,
          description: description || null,
          calories: Number(calories) || 0,
          protein: Number(protein) || 0,
          carbs: Number(carbs) || 0,
          fat: Number(fat) || 0
        }
      });

      if (items && items.length > 0) {
        await tx.mealItem.createMany({
          data: items.map(item => ({
            mealId: createdMeal.id,
            name: item.name,
            amount: item.amount || null,
            calories: item.calories !== undefined && item.calories !== null ? Number(item.calories) : null,
            protein: item.protein !== undefined && item.protein !== null ? Number(item.protein) : null,
            carbs: item.carbs !== undefined && item.carbs !== null ? Number(item.carbs) : null,
            fat: item.fat !== undefined && item.fat !== null ? Number(item.fat) : null
          }))
        });
      }

      return await tx.meal.findUnique({
        where: { id: createdMeal.id },
        include: { items: true }
      });
    });

    res.status(201).json({
      success: true,
      message: 'Meal created successfully',
      data: meal
    });
  } catch (error) {
    next(error);
  }
};

const updateMeal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, mealType, description, calories, protein, carbs, fat, items } = req.body;

    const existing = await prisma.meal.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      throw new AppError('Meal not found or access denied', 404);
    }

    const updatedMeal = await prisma.$transaction(async (tx) => {
      await tx.meal.update({
        where: { id },
        data: {
          name,
          mealType,
          description: description !== undefined ? description : existing.description,
          calories: Number(calories) || 0,
          protein: Number(protein) || 0,
          carbs: Number(carbs) || 0,
          fat: Number(fat) || 0
        }
      });

      if (items && Array.isArray(items)) {
        await tx.mealItem.deleteMany({
          where: { mealId: id }
        });

        if (items.length > 0) {
          await tx.mealItem.createMany({
            data: items.map(item => ({
              mealId: id,
              name: item.name,
              amount: item.amount || null,
              calories: item.calories !== undefined && item.calories !== null ? Number(item.calories) : null,
              protein: item.protein !== undefined && item.protein !== null ? Number(item.protein) : null,
              carbs: item.carbs !== undefined && item.carbs !== null ? Number(item.carbs) : null,
              fat: item.fat !== undefined && item.fat !== null ? Number(item.fat) : null
            }))
          });
        }
      }

      return await tx.meal.findUnique({
        where: { id },
        include: { items: true }
      });
    });

    res.json({
      success: true,
      message: 'Meal updated successfully',
      data: updatedMeal
    });
  } catch (error) {
    next(error);
  }
};

const deleteMeal = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.meal.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      throw new AppError('Meal not found or access denied', 404);
    }

    await prisma.meal.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal
};
