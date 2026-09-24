const prisma = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

const getRoutines = async (req, res, next) => {
  try {
    const { type, search } = req.query;
    const where = {
      userId: req.user.id
    };

    if (type && type !== 'all') {
      where.goalType = type;
    }

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim() } },
        { description: { contains: search.trim() } }
      ];
    }

    const routines = await prisma.routine.findMany({
      where,
      include: {
        exercises: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { exercises: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      success: true,
      data: routines
    });
  } catch (error) {
    next(error);
  }
};

const getRoutineById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const routine = await prisma.routine.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        exercises: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!routine) {
      throw new AppError('Routine not found or you do not have permission to view it', 404);
    }

    res.json({
      success: true,
      data: routine
    });
  } catch (error) {
    next(error);
  }
};

const createRoutine = async (req, res, next) => {
  try {
    const { name, description, goalType, exercises } = req.body;

    const routine = await prisma.$transaction(async (tx) => {
      const createdRoutine = await tx.routine.create({
        data: {
          userId: req.user.id,
          name,
          description: description || null,
          goalType: goalType || 'strength'
        }
      });

      if (exercises && exercises.length > 0) {
        await tx.routineExercise.createMany({
          data: exercises.map((ex, idx) => ({
            routineId: createdRoutine.id,
            order: ex.order !== undefined ? ex.order : idx,
            name: ex.name,
            sets: Number(ex.sets) || 3,
            reps: Number(ex.reps) || 10,
            weight: ex.weight !== undefined && ex.weight !== null ? Number(ex.weight) : null,
            duration: ex.duration !== undefined && ex.duration !== null ? Number(ex.duration) : null,
            restSeconds: ex.restSeconds !== undefined ? Number(ex.restSeconds) : 60,
            notes: ex.notes || null
          }))
        });
      }

      return await tx.routine.findUnique({
        where: { id: createdRoutine.id },
        include: {
          exercises: {
            orderBy: { order: 'asc' }
          }
        }
      });
    });

    res.status(201).json({
      success: true,
      message: 'Routine created successfully',
      data: routine
    });
  } catch (error) {
    next(error);
  }
};

const updateRoutine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, goalType, exercises } = req.body;

    const existing = await prisma.routine.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      throw new AppError('Routine not found or access denied', 404);
    }

    const updatedRoutine = await prisma.$transaction(async (tx) => {
      await tx.routine.update({
        where: { id },
        data: {
          name,
          description: description !== undefined ? description : existing.description,
          goalType: goalType || existing.goalType
        }
      });

      if (exercises && Array.isArray(exercises)) {
        // Delete previous exercises and re-insert to cleanly handle re-ordering, additions, and removals
        await tx.routineExercise.deleteMany({
          where: { routineId: id }
        });

        await tx.routineExercise.createMany({
          data: exercises.map((ex, idx) => ({
            routineId: id,
            order: ex.order !== undefined ? ex.order : idx,
            name: ex.name,
            sets: Number(ex.sets) || 3,
            reps: Number(ex.reps) || 10,
            weight: ex.weight !== undefined && ex.weight !== null ? Number(ex.weight) : null,
            duration: ex.duration !== undefined && ex.duration !== null ? Number(ex.duration) : null,
            restSeconds: ex.restSeconds !== undefined ? Number(ex.restSeconds) : 60,
            notes: ex.notes || null
          }))
        });
      }

      return await tx.routine.findUnique({
        where: { id },
        include: {
          exercises: {
            orderBy: { order: 'asc' }
          }
        }
      });
    });

    res.json({
      success: true,
      message: 'Routine updated successfully',
      data: updatedRoutine
    });
  } catch (error) {
    next(error);
  }
};

const deleteRoutine = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.routine.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      throw new AppError('Routine not found or access denied', 404);
    }

    await prisma.routine.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Routine deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine
};
