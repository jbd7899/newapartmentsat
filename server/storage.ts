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
  type UpsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
      const propertiesWithAvailability = await Promise.all(
        allProperties.map(async (property) => {
          const propertyUnits = await db.select().from(units).where(eq(units.propertyId, property.id));
          const hasAvailableUnits = propertyUnits.some(unit => unit.isAvailable);
          
          if (filters.isAvailable && hasAvailableUnits) {
            return property;
          } else if (!filters.isAvailable && !hasAvailableUnits) {
            return property;
          }
          return null;
        })
      );
      
      return propertiesWithAvailability.filter(property => property !== null) as Property[];
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
}

export const storage = new DatabaseStorage();