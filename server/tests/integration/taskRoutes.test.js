const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/db/prisma');

describe('Task API integration', () => {
  beforeEach(async () => {
    await prisma.task.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('POST /api/tasks creates a task', async () => {
    const response = await request(app).post('/api/tasks').send({
      title: 'Buy groceries',
      description: 'Milk and eggs',
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: 'Buy groceries',
      description: 'Milk and eggs',
      completed: false,
    });
    expect(response.body.id).toBeDefined();
  });

  it('GET /api/tasks returns all tasks', async () => {
    await request(app).post('/api/tasks').send({ title: 'Task A' });
    await request(app).post('/api/tasks').send({ title: 'Task B' });

    const response = await request(app).get('/api/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('GET /api/tasks/:id returns one task', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Read docs' });

    const response = await request(app).get(`/api/tasks/${created.body.id}`);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Read docs');
  });

  it('PUT /api/tasks/:id updates a task', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Old title' });

    const response = await request(app).put(`/api/tasks/${created.body.id}`).send({
      title: 'Updated title',
      completed: true,
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      title: 'Updated title',
      completed: true,
    });
  });

  it('DELETE /api/tasks/:id deletes a task', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Temporary task' });

    const response = await request(app).delete(`/api/tasks/${created.body.id}`);

    expect(response.status).toBe(204);

    const getResponse = await request(app).get(`/api/tasks/${created.body.id}`);
    expect(getResponse.status).toBe(404);
  });

  it('returns 400 for invalid input', async () => {
    const response = await request(app).post('/api/tasks').send({ title: '' });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toContain('Title is required');
  });
});
