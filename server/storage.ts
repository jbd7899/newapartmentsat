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
  type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProperties(filters?: { city?: string; isAvailable?: boolean }): Promise<Property[]> {
    let query = db.select().from(properties);
    
    if (filters?.city) {
      query = query.where(eq(properties.city, filters.city));
    }
    
    return await query;
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property || undefined;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db
      .insert(properties)
      .values(property)
      .returning();
    return newProperty;
  }

  async updateProperty(id: number, updates: Partial<InsertProperty>): Promise<Property | undefined> {
    const [updated] = await db
      .update(properties)
      .set(updates)
      .where(eq(properties.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const result = await db.delete(properties).where(eq(properties.id, id));
    return result.rowCount > 0;
  }

  async getUnits(propertyId?: number): Promise<Unit[]> {
    let query = db.select().from(units);
    
    if (propertyId) {
      query = query.where(eq(units.propertyId, propertyId));
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
    return result.rowCount > 0;
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
}

export const storage = new DatabaseStorage();