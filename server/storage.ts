import { 
  properties, 
  units, 
  leadSubmissions, 
  users, 
  type Property, 
  type Unit, 
  type LeadSubmission,
  type User,
  type InsertProperty,
  type InsertUnit,
  type InsertLeadSubmission,
  type InsertUser,
  type UpsertUser,
  branding,
  type Branding,
  type InsertBranding
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export async function initStorage() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS properties (
      id serial PRIMARY KEY,
      name text NOT NULL,
      address text NOT NULL,
      city text NOT NULL,
      state text NOT NULL,
      zip_code text NOT NULL,
      bedrooms integer NOT NULL,
      bathrooms text NOT NULL,
      total_units integer NOT NULL,
      description text,
      neighborhood text,
      amenities text,
      pet_policy text,
      floor_plans text,
      images text[],
      latitude text,
      longitude text,
      created_at timestamp DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS units (
      id serial PRIMARY KEY,
      property_id integer NOT NULL REFERENCES properties(id),
      unit_number text NOT NULL,
      bedrooms integer NOT NULL DEFAULT 0,
      bathrooms text NOT NULL DEFAULT '',
      is_available boolean NOT NULL DEFAULT false,
      available_date timestamp,
      rent integer,
      images text[]
    );

    CREATE TABLE IF NOT EXISTS lead_submissions (
      id serial PRIMARY KEY,
      name text NOT NULL,
      email text NOT NULL,
      move_in_date timestamp,
      desired_bedrooms text,
      additional_info text,
      contacted boolean NOT NULL DEFAULT false,
      submitted_at timestamp DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS users (
      id varchar PRIMARY KEY,
      email varchar UNIQUE,
      first_name varchar,
      last_name varchar,
      profile_image_url varchar,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS sessions (
      sid varchar PRIMARY KEY,
      sess jsonb NOT NULL,
      expire timestamp NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions(expire);

    CREATE TABLE IF NOT EXISTS branding (
      id serial PRIMARY KEY,
      company_name text NOT NULL DEFAULT 'UrbanLiving',
      logo_url text,
      primary_color text DEFAULT '#2563eb',
      secondary_color text DEFAULT '#4f46e5',
      cities text[],
      header text,
      subtitle text,
      footer_text text,
      contact_info text
    );
  `);
}

function formatCoordinate(value: string | number | null | undefined): string | undefined {
  if (value === undefined || value === null) return undefined;
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (Number.isNaN(num)) return undefined;
  return num.toFixed(5);
}

export interface IStorage {
  // Properties
  getProperties(filters?: { city?: string; isAvailable?: boolean }): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, updates: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;

  // Units
  getUnits(propertyId?: number): Promise<Unit[]>;
  getUnit(id: number): Promise<Unit | undefined>;
  createUnit(unit: InsertUnit): Promise<Unit>;
  updateUnit(id: number, updates: Partial<InsertUnit>): Promise<Unit | undefined>;
  deleteUnit(id: number): Promise<boolean>;

  // Lead Submissions
  createLeadSubmission(submission: InsertLeadSubmission): Promise<LeadSubmission>;
  getLeadSubmissions(): Promise<LeadSubmission[]>;

  // Users (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Branding
  getBranding(): Promise<Branding | undefined>;
  updateBranding(data: InsertBranding): Promise<Branding>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getProperties(filters?: { city?: string; isAvailable?: boolean }): Promise<Property[]> {
    let query = db.select().from(properties);
    
    if (filters?.city) {
      // Handle case-insensitive city filtering
      const cityName = filters.city.charAt(0).toUpperCase() + filters.city.slice(1).toLowerCase();
      query = query.where(eq(properties.city, cityName)) as typeof query;
    }
    
    const allProperties = await query;

    // If availability filter is specified, filter by properties that have available units
    if (filters?.isAvailable !== undefined) {
      const propertiesWithAvailability: Property[] = [];

      for (const property of allProperties) {
        const propertyUnits = await db
          .select()
          .from(units)
          .where(eq(units.propertyId, property.id));
        const hasAvailableUnits = propertyUnits.some((unit) => unit.isAvailable);

        if ((filters.isAvailable && hasAvailableUnits) ||
            (!filters.isAvailable && !hasAvailableUnits)) {
          propertiesWithAvailability.push(property);
        }
      }

      return propertiesWithAvailability;
    }

    return allProperties;
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property || undefined;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db
      .insert(properties)
      .values({
        ...property,
        latitude: formatCoordinate(property.latitude) as any,
        longitude: formatCoordinate(property.longitude) as any,
      })
      .returning();
    return newProperty;
  }

  async updateProperty(id: number, updates: Partial<InsertProperty>): Promise<Property | undefined> {
    const [updated] = await db
      .update(properties)
      .set({
        ...updates,
        latitude: formatCoordinate(updates.latitude) as any,
        longitude: formatCoordinate(updates.longitude) as any,
      })
      .where(eq(properties.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const result = await db.delete(properties).where(eq(properties.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getUnits(propertyId?: number): Promise<Unit[]> {
    let query = db.select().from(units);
    
    if (propertyId) {
      query = query.where(eq(units.propertyId, propertyId)) as typeof query;
    }
    
    return await query;
  }

  async getUnit(id: number): Promise<Unit | undefined> {
    const [unit] = await db.select().from(units).where(eq(units.id, id));
    return unit || undefined;
  }

  async createUnit(unit: InsertUnit): Promise<Unit> {
    const [newUnit] = await db
      .insert(units)
      .values(unit)
      .returning();
    return newUnit;
  }

  async updateUnit(id: number, updates: Partial<InsertUnit>): Promise<Unit | undefined> {
    const [updated] = await db
      .update(units)
      .set(updates)
      .where(eq(units.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteUnit(id: number): Promise<boolean> {
    const result = await db.delete(units).where(eq(units.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async createLeadSubmission(submission: InsertLeadSubmission): Promise<LeadSubmission> {
    const [newSubmission] = await db
      .insert(leadSubmissions)
      .values(submission)
      .returning();
    return newSubmission;
  }

  async getLeadSubmissions(): Promise<LeadSubmission[]> {
    return await db.select().from(leadSubmissions);
  }

  async updateLeadSubmission(id: number, updates: Partial<InsertLeadSubmission>): Promise<LeadSubmission | undefined> {
    const [updated] = await db
      .update(leadSubmissions)
      .set(updates)
      .where(eq(leadSubmissions.id, id))
      .returning();
    return updated || undefined;
  }

  async getBranding(): Promise<Branding | undefined> {
    const [record] = await db.select().from(branding).limit(1);
    return record || undefined;
  }

  async updateBranding(data: InsertBranding): Promise<Branding> {
    const existing = await this.getBranding();
    if (existing) {
      const [updated] = await db
        .update(branding)
        .set(data)
        .where(eq(branding.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(branding).values(data).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
