import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';

let mongod;
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  process.env.JWT_ACCESS_SECRET = 'test-access';
  process.env.JWT_REFRESH_SECRET = 'test-refresh';
  process.env.CLIENT_URL = 'http://localhost:5173';
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('auth', () => {
  const app = createApp();
  const creds = { name: 'Test User', email: 'test@example.com', password: 'password123' };

  it('registers and returns token', async () => {
    const res = await request(app).post('/api/auth/register').send(creds);
    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeTruthy();
  });

  it('rejects duplicate', async () => {
    const res = await request(app).post('/api/auth/register').send(creds);
    expect(res.status).toBe(409);
  });

  it('logs in and gets me', async () => {
    const login = await request(app).post('/api/auth/login').send({ email: creds.email, password: creds.password });
    expect(login.status).toBe(200);
    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe(creds.email);
  });
});