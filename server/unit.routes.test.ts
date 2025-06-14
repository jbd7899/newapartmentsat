import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

process.env.DATABASE_URL = 'postgres://localhost/test';

var mockStorage: any;
vi.mock('./storage', () => {
  mockStorage = {
    getUnits: vi.fn(),
    createUnit: vi.fn(),
    updateUnit: vi.fn(),
    deleteUnit: vi.fn(),
    getProperties: vi.fn(),
    getProperty: vi.fn(),
  };
  return { storage: mockStorage };
});
vi.mock('./db', () => ({ db: {} }));
vi.mock('./geocode-update', () => ({ updateAllPropertyCoordinates: vi.fn() }));
vi.mock('./replitAuth', () => ({
  setupAuth: vi.fn(),
  isAuthenticated: (_req: any, _res: any, next: any) => next(),
}));

import { registerRoutes } from './routes';

let app: express.Express;

beforeEach(async () => {
  Object.values(mockStorage).forEach(fn => fn.mockReset && fn.mockReset());
  app = express();
  app.use(express.json());
  await registerRoutes(app);
});

describe('unit routes', () => {
  it('GET /api/units returns units filtered by property', async () => {
    mockStorage.getUnits.mockResolvedValue([{ id: 1, propertyId: 1 }]);
    const res = await request(app).get('/api/units?propertyId=1');
    expect(res.status).toBe(200);
    expect(mockStorage.getUnits).toHaveBeenCalledWith(1);
    expect(res.body).toEqual([{ id: 1, propertyId: 1 }]);
  });

  it('GET /api/units returns 400 for invalid property id', async () => {
    const res = await request(app).get('/api/units?propertyId=abc');
    expect(res.status).toBe(400);
  });

  it('POST /api/units creates unit', async () => {
    const payload = {
      propertyId: 1,
      unitNumber: '1A',
      bedrooms: 1,
      bathrooms: '1',
    };
    mockStorage.createUnit.mockResolvedValue({ id: 2, ...payload });
    const res = await request(app).post('/api/units').send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 2, ...payload });
  });

  it('PUT /api/units/:id returns 404 when unit missing', async () => {
    mockStorage.updateUnit.mockResolvedValue(undefined);
    const res = await request(app).put('/api/units/1').send({ bedrooms: 2 });
    expect(res.status).toBe(404);
  });

  it('DELETE /api/units/:id handles not found', async () => {
    mockStorage.deleteUnit.mockResolvedValue(false);
    const res = await request(app).delete('/api/units/1');
    expect(res.status).toBe(404);
  });
});
