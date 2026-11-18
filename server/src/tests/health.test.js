
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import { createApp } from '../app.js';

describe('GET /api/health', () => {
  it('should return successful health response', async () => {
    const app = createApp();

    const response = await request(app)
      .get('/api/health');

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.status, 'ok');
  });
});
