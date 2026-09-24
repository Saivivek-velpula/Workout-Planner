const prisma = require('../config/db');

const getWeeklyStats = async (req, res, next) => {
  try {
    const today = new Date();
    // Generate dates for the past 7 days (YYYY-MM-DD)
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const startDate = dates[0];
    const endDate = dates[dates.length - 1];

    const entries = await prisma.dailyEntry.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        routines: true,
        meals: true
      },
      orderBy: { date: 'asc' }
    });

    const entryMap = new Map();
    entries.forEach(e => entryMap.set(e.date, e));

    let totalWorkoutsCompleted = 0;
    let totalWorkoutMinutes = 0;
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let daysWithMeals = 0;

    const dayBreakdown = dates.map(dateStr => {
      const entry = entryMap.get(dateStr);
      let dayCal = 0;
      let dayProtein = 0;
      let dayCarbs = 0;
      let dayFat = 0;
      let dayWorkouts = 0;
      let dayMinutes = 0;

      if (entry) {
        if (entry.meals && entry.meals.length > 0) {
          daysWithMeals++;
          entry.meals.forEach(m => {
            dayCal += m.calories || 0;
            dayProtein += m.protein || 0;
            dayCarbs += m.carbs || 0;
            dayFat += m.fat || 0;
          });
        }

        if (entry.routines && entry.routines.length > 0) {
          entry.routines.forEach(r => {
            if (r.completed) {
              dayWorkouts++;
              totalWorkoutsCompleted++;
            }
            if (r.durationMinutes) {
              dayMinutes += r.durationMinutes;
              totalWorkoutMinutes += r.durationMinutes;
            }
          });
        }

        totalCalories += dayCal;
        totalProtein += dayProtein;
        totalCarbs += dayCarbs;
        totalFat += dayFat;
      }

      const dateObj = new Date(dateStr + 'T00:00:00');
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

      return {
        date: dateStr,
        dayName,
        calories: Math.round(dayCal),
        protein: Math.round(dayProtein * 10) / 10,
        carbs: Math.round(dayCarbs * 10) / 10,
        fat: Math.round(dayFat * 10) / 10,
        workoutsCompleted: dayWorkouts,
        workoutMinutes: dayMinutes,
        waterIntake: entry?.waterIntake || 0,
        bodyWeight: entry?.bodyWeight || null,
        hasEntry: !!entry
      };
    });

    const averageCalories = daysWithMeals > 0 ? Math.round(totalCalories / daysWithMeals) : 0;
    const averageProtein = daysWithMeals > 0 ? Math.round((totalProtein / daysWithMeals) * 10) / 10 : 0;
    const averageCarbs = daysWithMeals > 0 ? Math.round((totalCarbs / daysWithMeals) * 10) / 10 : 0;
    const averageFat = daysWithMeals > 0 ? Math.round((totalFat / daysWithMeals) * 10) / 10 : 0;

    const todayEntry = entryMap.get(endDate);

    res.json({
      success: true,
      data: {
        startDate,
        endDate,
        totalWorkoutsCompleted,
        totalWorkoutMinutes,
        averageCalories,
        totalCalories,
        averages: {
          protein: averageProtein,
          carbs: averageCarbs,
          fat: averageFat
        },
        daysLoggedCount: entries.length,
        dayBreakdown,
        todayEntry: todayEntry ? {
          ...todayEntry,
          totals: {
            calories: todayBreakdownCal(todayEntry),
            workoutsCompleted: todayEntry.routines?.filter(r => r.completed)?.length || 0
          }
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

const todayBreakdownCal = (entry) => {
  if (!entry?.meals) return 0;
  return entry.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
};

module.exports = {
  getWeeklyStats
};
