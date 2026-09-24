const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.entryMeal.deleteMany();
  await prisma.entryRoutine.deleteMany();
  await prisma.dailyEntry.deleteMany();
  await prisma.mealItem.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.routineExercise.deleteMany();
  await prisma.routine.deleteMany();
  await prisma.user.deleteMany();

  // Create Demo User
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@workoutplanner.com',
      passwordHash,
      name: 'Alex Johnson'
    }
  });

  console.log(`👤 Created Demo User: ${demoUser.email} (Password: Password123!)`);

  // Create 3 Sample Routines
  const pushRoutine = await prisma.routine.create({
    data: {
      userId: demoUser.id,
      name: 'Push Day - Chest, Shoulders & Triceps',
      description: 'Classic hypertrophy routine focusing on upper body pushing mechanics.',
      goalType: 'strength',
      exercises: {
        create: [
          { order: 0, name: 'Barbell Flat Bench Press', sets: 4, reps: 8, weight: 80, restSeconds: 90, notes: 'Focus on full chest stretch' },
          { order: 1, name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 26, restSeconds: 75, notes: 'Set bench to 30 degrees' },
          { order: 2, name: 'Standing Overhead Barbell Press', sets: 3, reps: 8, weight: 45, restSeconds: 90, notes: 'Brace core tight' },
          { order: 3, name: 'Cable Rope Tricep Pushdown', sets: 4, reps: 12, weight: 25, restSeconds: 60, notes: 'Full squeeze at bottom lockout' }
        ]
      }
    }
  });

  const hiitRoutine = await prisma.routine.create({
    data: {
      userId: demoUser.id,
      name: 'Full Body HIIT Conditioning',
      description: 'High intensity interval session for cardiovascular endurance and metabolic burn.',
      goalType: 'HIIT',
      exercises: {
        create: [
          { order: 0, name: 'Burpees', sets: 4, reps: 15, duration: 45, restSeconds: 30, notes: 'Maximum explosive effort' },
          { order: 1, name: 'Kettlebell Swings', sets: 4, reps: 20, weight: 20, duration: 45, restSeconds: 30, notes: 'Snap hips forward' },
          { order: 2, name: 'Speed Jump Rope', sets: 4, reps: 100, duration: 60, restSeconds: 30, notes: 'Stay light on balls of feet' },
          { order: 3, name: 'Mountain Climbers', sets: 4, reps: 30, duration: 45, restSeconds: 30, notes: 'Keep hips level with shoulders' }
        ]
      }
    }
  });

  const mobilityRoutine = await prisma.routine.create({
    data: {
      userId: demoUser.id,
      name: 'Morning Mobility & Core Flow',
      description: 'Gentle joint de-compression, thoracic spine rotation, and core stability.',
      goalType: 'mobility',
      exercises: {
        create: [
          { order: 0, name: 'Cat-Cow Spinal Wave', sets: 3, reps: 10, duration: 60, restSeconds: 30, notes: 'Synchronize breathing with movement' },
          { order: 1, name: 'World\'s Greatest Stretch', sets: 3, reps: 6, duration: 45, restSeconds: 30, notes: 'Pause 3s at deep hip flexor stretch' },
          { order: 2, name: 'Standard Elbow Plank', sets: 3, reps: 1, duration: 60, restSeconds: 45, notes: 'Active glute and lat squeeze' },
          { order: 3, name: 'Bird-Dog Hold', sets: 3, reps: 10, restSeconds: 30, notes: 'Hold 2 seconds each side' }
        ]
      }
    }
  });

  console.log('💪 Created 3 Sample Routines');

  // Create 5 Sample Meals
  const oatmealMeal = await prisma.meal.create({
    data: {
      userId: demoUser.id,
      name: 'Power Protein Oatmeal Bowl',
      mealType: 'breakfast',
      description: 'Warm rolled oats stirred with whey isolate, chia seeds, and topped with berries.',
      calories: 480,
      protein: 34,
      carbs: 62,
      fat: 10,
      items: {
        create: [
          { name: 'Rolled Oats', amount: '75g', calories: 280, protein: 10, carbs: 48, fat: 5 },
          { name: 'Whey Protein Isolate (Vanilla)', amount: '30g scoop', calories: 120, protein: 24, carbs: 2, fat: 1 },
          { name: 'Fresh Blueberries', amount: '60g', calories: 35, protein: 0, carbs: 9, fat: 0 },
          { name: 'Peanut Butter', amount: '1 tbsp', calories: 45, protein: 0, carbs: 3, fat: 4 }
        ]
      }
    }
  });

  const chickenQuinoaMeal = await prisma.meal.create({
    data: {
      userId: demoUser.id,
      name: 'Grilled Herb Chicken & Quinoa',
      mealType: 'lunch',
      description: 'Tender marinated chicken breast served with fluffy tricolor quinoa and broccoli.',
      calories: 620,
      protein: 54,
      carbs: 56,
      fat: 16,
      items: {
        create: [
          { name: 'Chicken Breast Fillet', amount: '220g', calories: 330, protein: 46, carbs: 0, fat: 6 },
          { name: 'Cooked Tricolor Quinoa', amount: '180g', calories: 210, protein: 7, carbs: 38, fat: 3 },
          { name: 'Steamed Broccoli with EVOO', amount: '120g', calories: 80, protein: 1, carbs: 18, fat: 7 }
        ]
      }
    }
  });

  const salmonMeal = await prisma.meal.create({
    data: {
      userId: demoUser.id,
      name: 'Pan-Seared Salmon & Sweet Potato',
      mealType: 'dinner',
      description: 'Crispy skin wild salmon with roasted paprika sweet potatoes and asparagus.',
      calories: 670,
      protein: 45,
      carbs: 50,
      fat: 24,
      items: {
        create: [
          { name: 'Wild Atlantic Salmon', amount: '200g', calories: 380, protein: 40, carbs: 0, fat: 20 },
          { name: 'Baked Sweet Potato', amount: '220g', calories: 200, protein: 4, carbs: 46, fat: 1 },
          { name: 'Charred Asparagus Spears', amount: '100g', calories: 90, protein: 1, carbs: 4, fat: 3 }
        ]
      }
    }
  });

  const yogurtMeal = await prisma.meal.create({
    data: {
      userId: demoUser.id,
      name: 'Greek Yogurt Parfait & Honey',
      mealType: 'snack',
      description: 'Creamy zero-fat Greek yogurt drizzled with raw wildflower honey and almonds.',
      calories: 230,
      protein: 21,
      carbs: 22,
      fat: 5,
      items: {
        create: [
          { name: 'Plain Greek Yogurt 0%', amount: '180g', calories: 110, protein: 19, carbs: 6, fat: 0 },
          { name: 'Raw Honey', amount: '1 tsp', calories: 45, protein: 0, carbs: 12, fat: 0 },
          { name: 'Crushed Almonds', amount: '12g', calories: 75, protein: 2, carbs: 4, fat: 5 }
        ]
      }
    }
  });

  const shakeMeal = await prisma.meal.create({
    data: {
      userId: demoUser.id,
      name: 'Post-Workout Banana Shake',
      mealType: 'snack',
      description: 'Fast-digesting post-exercise recovery shake with fresh banana and unsweetened almond milk.',
      calories: 280,
      protein: 29,
      carbs: 34,
      fat: 3,
      items: {
        create: [
          { name: 'Chocolate Whey Protein', amount: '32g', calories: 130, protein: 26, carbs: 2, fat: 2 },
          { name: 'Fresh Banana', amount: '1 medium', calories: 105, protein: 1, carbs: 27, fat: 0 },
          { name: 'Unsweetened Almond Milk', amount: '250ml', calories: 45, protein: 2, carbs: 5, fat: 1 }
        ]
      }
    }
  });

  console.log('🥗 Created 5 Sample Meals');

  // Create Helper to get date string relative to today
  const getDateStr = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().slice(0, 10);
  };

  const todayStr = getDateStr(0);
  const yesterdayStr = getDateStr(1);
  const twoDaysAgoStr = getDateStr(2);
  const fourDaysAgoStr = getDateStr(4);

  // Daily Entry 1: 4 days ago
  await prisma.dailyEntry.create({
    data: {
      userId: demoUser.id,
      date: fourDaysAgoStr,
      bodyWeight: 78.5,
      waterIntake: 2.5,
      moodEnergy: 4,
      notes: 'Felt great, solid push day at the gym. Shoulders felt very stable on overhead press.',
      routines: {
        create: [
          {
            routineId: pushRoutine.id,
            routineName: pushRoutine.name,
            completed: true,
            durationMinutes: 55,
            actualExercises: JSON.stringify([
              { name: 'Barbell Flat Bench Press', sets: 4, reps: 8, weight: 80 },
              { name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 26 },
              { name: 'Standing Overhead Barbell Press', sets: 3, reps: 8, weight: 45 },
              { name: 'Cable Rope Tricep Pushdown', sets: 4, reps: 12, weight: 25 }
            ])
          }
        ]
      },
      meals: {
        create: [
          { mealId: oatmealMeal.id, mealName: oatmealMeal.name, mealType: 'breakfast', calories: oatmealMeal.calories, protein: oatmealMeal.protein, carbs: oatmealMeal.carbs, fat: oatmealMeal.fat },
          { mealId: chickenQuinoaMeal.id, mealName: chickenQuinoaMeal.name, mealType: 'lunch', calories: chickenQuinoaMeal.calories, protein: chickenQuinoaMeal.protein, carbs: chickenQuinoaMeal.carbs, fat: chickenQuinoaMeal.fat },
          { mealId: salmonMeal.id, mealName: salmonMeal.name, mealType: 'dinner', calories: salmonMeal.calories, protein: salmonMeal.protein, carbs: salmonMeal.carbs, fat: salmonMeal.fat }
        ]
      }
    }
  });

  // Daily Entry 2: 2 days ago
  await prisma.dailyEntry.create({
    data: {
      userId: demoUser.id,
      date: twoDaysAgoStr,
      bodyWeight: 78.2,
      waterIntake: 3.0,
      moodEnergy: 5,
      notes: 'High energy day! HIIT circuit got heart pumping to 165 bpm. Drank lots of water.',
      routines: {
        create: [
          {
            routineId: hiitRoutine.id,
            routineName: hiitRoutine.name,
            completed: true,
            durationMinutes: 35,
            actualExercises: JSON.stringify([
              { name: 'Burpees', sets: 4, reps: 15 },
              { name: 'Kettlebell Swings', sets: 4, reps: 20, weight: 20 },
              { name: 'Speed Jump Rope', sets: 4, reps: 100 },
              { name: 'Mountain Climbers', sets: 4, reps: 30 }
            ])
          }
        ]
      },
      meals: {
        create: [
          { mealId: oatmealMeal.id, mealName: oatmealMeal.name, mealType: 'breakfast', calories: oatmealMeal.calories, protein: oatmealMeal.protein, carbs: oatmealMeal.carbs, fat: oatmealMeal.fat },
          { mealId: chickenQuinoaMeal.id, mealName: chickenQuinoaMeal.name, mealType: 'lunch', calories: chickenQuinoaMeal.calories, protein: chickenQuinoaMeal.protein, carbs: chickenQuinoaMeal.carbs, fat: chickenQuinoaMeal.fat },
          { mealId: shakeMeal.id, mealName: shakeMeal.name, mealType: 'snack', calories: shakeMeal.calories, protein: shakeMeal.protein, carbs: shakeMeal.carbs, fat: shakeMeal.fat },
          { mealId: salmonMeal.id, mealName: salmonMeal.name, mealType: 'dinner', calories: salmonMeal.calories, protein: salmonMeal.protein, carbs: salmonMeal.carbs, fat: salmonMeal.fat }
        ]
      }
    }
  });

  // Daily Entry 3: Yesterday
  await prisma.dailyEntry.create({
    data: {
      userId: demoUser.id,
      date: yesterdayStr,
      bodyWeight: 78.1,
      waterIntake: 2.2,
      moodEnergy: 4,
      notes: 'Active recovery morning. Focused on thoracic spine mobility and core planks.',
      routines: {
        create: [
          {
            routineId: mobilityRoutine.id,
            routineName: mobilityRoutine.name,
            completed: true,
            durationMinutes: 25,
            actualExercises: JSON.stringify([
              { name: 'Cat-Cow Spinal Wave', sets: 3, reps: 10 },
              { name: 'World\'s Greatest Stretch', sets: 3, reps: 6 },
              { name: 'Standard Elbow Plank', sets: 3, duration: 60 },
              { name: 'Bird-Dog Hold', sets: 3, reps: 10 }
            ])
          }
        ]
      },
      meals: {
        create: [
          { mealId: oatmealMeal.id, mealName: oatmealMeal.name, mealType: 'breakfast', calories: oatmealMeal.calories, protein: oatmealMeal.protein, carbs: oatmealMeal.carbs, fat: oatmealMeal.fat },
          { mealId: yogurtMeal.id, mealName: yogurtMeal.name, mealType: 'snack', calories: yogurtMeal.calories, protein: yogurtMeal.protein, carbs: yogurtMeal.carbs, fat: yogurtMeal.fat },
          { mealId: salmonMeal.id, mealName: salmonMeal.name, mealType: 'dinner', calories: salmonMeal.calories, protein: salmonMeal.protein, carbs: salmonMeal.carbs, fat: salmonMeal.fat }
        ]
      }
    }
  });

  // Daily Entry 4: Today
  await prisma.dailyEntry.create({
    data: {
      userId: demoUser.id,
      date: todayStr,
      bodyWeight: 78.0,
      waterIntake: 2.0,
      moodEnergy: 5,
      notes: 'Crushed bench press today! Hit 80kg easily for all 4 sets.',
      routines: {
        create: [
          {
            routineId: pushRoutine.id,
            routineName: pushRoutine.name,
            completed: true,
            durationMinutes: 50,
            actualExercises: JSON.stringify([
              { name: 'Barbell Flat Bench Press', sets: 4, reps: 8, weight: 80 },
              { name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 26 },
              { name: 'Standing Overhead Barbell Press', sets: 3, reps: 8, weight: 45 },
              { name: 'Cable Rope Tricep Pushdown', sets: 4, reps: 12, weight: 25 }
            ])
          }
        ]
      },
      meals: {
        create: [
          { mealId: oatmealMeal.id, mealName: oatmealMeal.name, mealType: 'breakfast', calories: oatmealMeal.calories, protein: oatmealMeal.protein, carbs: oatmealMeal.carbs, fat: oatmealMeal.fat },
          { mealId: chickenQuinoaMeal.id, mealName: chickenQuinoaMeal.name, mealType: 'lunch', calories: chickenQuinoaMeal.calories, protein: chickenQuinoaMeal.protein, carbs: chickenQuinoaMeal.carbs, fat: chickenQuinoaMeal.fat },
          { mealId: shakeMeal.id, mealName: shakeMeal.name, mealType: 'snack', calories: shakeMeal.calories, protein: shakeMeal.protein, carbs: shakeMeal.carbs, fat: shakeMeal.fat }
        ]
      }
    }
  });

  console.log('📅 Created sample daily entries across this week');
  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
