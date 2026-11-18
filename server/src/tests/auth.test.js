
import {
  describe,
  it,
  before,
  after
} from 'node:test';

import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { createApp } from '../app.js';

let mongod;
let app;

const credentials = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-123456789';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-123456789';
  process.env.CLIENT_URL = 'http://localhost:5173';

  mongod = await MongoMemoryServer.create();

  await mongoose.connect(mongod.getUri());

  app = createApp();
});

after(async () => {
  await mongoose.disconnect();

  if (mongod) {
    await mongod.stop();
  }
});

describe('Authentication API', () => {

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(credentials);

    assert.equal(response.status, 201);

    assert.ok(response.body.data.accessToken);
  });

  it('should reject duplicate registration', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(credentials);

    assert.equal(response.status, 409);
  });

  it('should login and return current user', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: credentials.email,
        password: credentials.password
      });

    assert.equal(loginResponse.status, 200);

    const token = loginResponse.body.data.accessToken;

    assert.ok(token);

    const userResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(userResponse.status, 200);

    assert.equal(
      userResponse.body.data.user.email,
      credentials.email
    );
  });

});
