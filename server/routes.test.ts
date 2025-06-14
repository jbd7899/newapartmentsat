import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

process.env.DATABASE_URL = 'postgres://localhost/test';

vi.mock('./storage', () => {
  return {
    storage: {
      getProperties: vi.fn().mockResolvedValue([]),
      createProperty: vi.fn().mockImplementation(async (data: any) => ({ id: 1, ...data })),
    }
  };
});
vi.mock('./db', () => ({ db: {} }));
vi.mock('./geocode-update', () => ({ updateAllPropertyCoordinates: vi.fn() }));
vi.mock('./replitAuth', () => ({
  setupAuth: vi.fn(),
  isAuthenticated: (_req: any, _res: any, next: any) => next(),
}));

import { registerRoutes } from './routes';
import { storage } from './storage';

let app: express.Express;

beforeEach(async () => {
  app = express();
  app.use(express.json());
  await registerRoutes(app);
});

describe('property routes', () => {
  it('GET /api/properties returns 200', async () => {
    await request(app).get('/api/properties').expect(200);
  });

  it('POST /api/properties creates a property when given valid data', async () => {
    const data = {
      name: 'Test Prop',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      bedrooms: 2,
      bathrooms: '1',
      totalUnits: 1,
    };

    const res = await request(app).post('/api/properties').send(data).expect(201);
    expect(res.body).toMatchObject({ id: 1, ...data });
    expect(storage.createProperty).toHaveBeenCalledWith(data);
  });
});
