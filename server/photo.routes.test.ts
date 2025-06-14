import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { existsSync } from 'fs';

process.env.DATABASE_URL = 'postgres://localhost/test';

var mockStorage: any;
var fsPromises: any;

vi.mock('./storage', () => {
  mockStorage = {
    getProperty: vi.fn(),
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
vi.mock('fs/promises', () => {
  fsPromises = {
    unlink: vi.fn(),
  };
  return { default: fsPromises };
});
vi.mock('fs', () => ({ existsSync: vi.fn().mockReturnValue(false) }));

import { registerRoutes } from './routes';

let app: express.Express;

beforeEach(async () => {
  Object.values(mockStorage).forEach(fn => fn.mockReset && fn.mockReset());
  fsPromises.unlink.mockReset();
  app = express();
  app.use(express.json());
  await registerRoutes(app);
});

describe('photo routes', () => {
  it('GET /api/photos/property/:id returns 404 when property missing', async () => {
    mockStorage.getProperty.mockResolvedValue(undefined);
    const res = await request(app).get('/api/photos/property/1');
    expect(res.status).toBe(404);
  });

  it('GET /api/photos/property/:id success with empty arrays', async () => {
    mockStorage.getProperty.mockResolvedValue({ id: 1, name: 'Prop', city: 'Town' });
    mockStorage.getUnits.mockResolvedValue([]);
    const res = await request(app).get('/api/photos/property/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ exterior: [], interior: [], amenities: [], units: {} });
  });

  it('DELETE /api/photos returns 400 without path', async () => {
    const res = await request(app).delete('/api/photos').send({});
    expect(res.status).toBe(400);
  });

  it('DELETE /api/photos returns 404 when file missing', async () => {
    (existsSync as unknown as vi.Mock).mockReturnValue(false);
    const res = await request(app).delete('/api/photos').send({ path: 'x.jpg' });
    expect(res.status).toBe(404);
  });

  it('DELETE /api/photos success', async () => {
    (existsSync as unknown as vi.Mock).mockReturnValue(true);
    fsPromises.unlink.mockResolvedValue(undefined);
    const res = await request(app).delete('/api/photos').send({ path: 'x.jpg' });
    expect(res.status).toBe(200);
    expect(fsPromises.unlink).toHaveBeenCalled();
  });
});
