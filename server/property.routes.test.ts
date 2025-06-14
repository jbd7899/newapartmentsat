import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

process.env.DATABASE_URL = 'postgres://localhost/test';

var mockStorage: any;
vi.mock('./storage', () => {
  mockStorage = {
    getProperties: vi.fn(),
    getProperty: vi.fn(),
    createProperty: vi.fn(),
    updateProperty: vi.fn(),
    deleteProperty: vi.fn(),
    getUnits: vi.fn(),
  };
  return { storage: mockStorage };
});
vi.mock('./db', () => ({ db: {} }));
vi.mock('./geocode-update', () => ({ updateAllPropertyCoordinates: vi.fn() }));
vi.mock('./replitAuth', () => ({
  setupAuth: vi.fn(),
  isAuthenticated: (_req: any, _res: any, next: any) => next(),
}));
vi.mock('./geocode', () => ({ geocodeAddress: vi.fn().mockResolvedValue({ lat: '1', lon: '1' }) }));

import { registerRoutes } from './routes';

let app: express.Express;

beforeEach(async () => {
  Object.values(mockStorage).forEach(fn => fn.mockReset && fn.mockReset());
  app = express();
  app.use(express.json());
  await registerRoutes(app);
});

describe('property routes', () => {
  it('GET /api/properties returns properties list', async () => {
    mockStorage.getProperties.mockResolvedValue([{ id: 1, name: 'A' }]);
    const res = await request(app).get('/api/properties');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, name: 'A' }]);
  });

  it('GET /api/properties handles failure', async () => {
    mockStorage.getProperties.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/properties');
    expect(res.status).toBe(500);
  });

  it('POST /api/properties creates property', async () => {
    const data = {
      name: 'Prop',
      address: '123 St',
      city: 'Town',
      state: 'TS',
      zipCode: '00000',
      bedrooms: 1,
      bathrooms: '1',
      totalUnits: 1,
    };
    mockStorage.createProperty.mockResolvedValue({ id: 2, ...data });
    const res = await request(app).post('/api/properties').send(data);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 2, ...data });
  });

  it('POST /api/properties returns 400 for invalid data', async () => {
    const res = await request(app).post('/api/properties').send({});
    expect(res.status).toBe(400);
  });

  it('GET /api/properties/:id returns 404 when not found', async () => {
    mockStorage.getProperty.mockResolvedValue(undefined);
    const res = await request(app).get('/api/properties/1');
    expect(res.status).toBe(404);
  });

  it('GET /api/properties/:id returns 400 for invalid id', async () => {
    const res = await request(app).get('/api/properties/abc');
    expect(res.status).toBe(400);
  });
});
