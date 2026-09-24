const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

describe('Routines CRUD & Isolation Tests', () => {
  let userA = { email: `usera_${Date.now()}@example.com`, password: 'Password123!', token: null, id: null };
  let userB = { email: `userb_${Date.now()}@example.com`, password: 'Password123!', token: null, id: null };
  let createdRoutineId = null;

  beforeAll(async () => {
    // Register user A
    const resA = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User A', email: userA.email, password: userA.password });
    userA.token = resA.body.data.token;
    userA.id = resA.body.data.user.id;

    // Register user B
    const resB = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User B', email: userB.email, password: userB.password });
    userB.token = resB.body.data.token;
    userB.id = resB.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.routine.deleteMany({
      where: { userId: { in: [userA.id, userB.id] } }
    });
    await prisma.user.deleteMany({
      where: { id: { in: [userA.id, userB.id] } }
    });
    await prisma.$disconnect();
  });

  it('should create a new routine with ordered exercises for User A', async () => {
    const res = await request(app)
      .post('/api/routines')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        name: 'Leg Day Blast',
        description: 'Quads and hamstrings workout',
        goalType: 'strength',
        exercises: [
          { order: 0, name: 'Barbell Squat', sets: 4, reps: 6, weight: 100, restSeconds: 120 },
          { order: 1, name: 'Romanian Deadlift', sets: 3, reps: 10, weight: 80, restSeconds: 90 }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Leg Day Blast');
    expect(res.body.data.exercises).toHaveLength(2);
    expect(res.body.data.exercises[0].name).toBe('Barbell Squat');
    createdRoutineId = res.body.data.id;
  });

  it('should list routines for User A', async () => {
    const res = await request(app)
      .get('/api/routines')
      .set('Authorization', `Bearer ${userA.token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.some(r => r.id === createdRoutineId)).toBe(true);
  });

  it('User B should NOT see User A routines (Data Isolation)', async () => {
    const res = await request(app)
      .get('/api/routines')
      .set('Authorization', `Bearer ${userB.token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.some(r => r.id === createdRoutineId)).toBe(false);
  });

  it('User B cannot retrieve User A routine by ID', async () => {
    const res = await request(app)
      .get(`/api/routines/${createdRoutineId}`)
      .set('Authorization', `Bearer ${userB.token}`);

    expect(res.status).toBe(404);
  });

  it('should update routine and reorder exercises for User A', async () => {
    const res = await request(app)
      .put(`/api/routines/${createdRoutineId}`)
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        name: 'Heavy Leg Day',
        description: 'Updated legs routine',
        goalType: 'strength',
        exercises: [
          { order: 0, name: 'Romanian Deadlift', sets: 4, reps: 8, weight: 90, restSeconds: 90 },
          { order: 1, name: 'Barbell Squat', sets: 5, reps: 5, weight: 110, restSeconds: 120 },
          { order: 2, name: 'Calf Raises', sets: 3, reps: 15, weight: 40, restSeconds: 60 }
        ]
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Heavy Leg Day');
    expect(res.body.data.exercises).toHaveLength(3);
    expect(res.body.data.exercises[0].name).toBe('Romanian Deadlift');
  });

  it('should delete routine for User A', async () => {
    const res = await request(app)
      .delete(`/api/routines/${createdRoutineId}`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const getRes = await request(app)
      .get(`/api/routines/${createdRoutineId}`)
      .set('Authorization', `Bearer ${userA.token}`);
    expect(getRes.status).toBe(404);
  });
});
