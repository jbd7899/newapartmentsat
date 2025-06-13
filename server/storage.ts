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

export class MemStorage implements IStorage {
  private properties: Map<number, Property>;
  private units: Map<number, Unit>;
  private leadSubmissions: Map<number, LeadSubmission>;
  private users: Map<number, User>;
  private currentPropertyId: number;
  private currentUnitId: number;
  private currentLeadId: number;
  private currentUserId: number;

  constructor() {
    this.properties = new Map();
    this.units = new Map();
    this.leadSubmissions = new Map();
    this.users = new Map();
    this.currentPropertyId = 1;
    this.currentUnitId = 1;
    this.currentLeadId = 1;
    this.currentUserId = 1;

    // Initialize with some sample data
    this.initializeData();
  }

  private initializeData() {
    // Sample properties
    const sampleProperties: Property[] = [
      {
        id: 1,
        name: "The Loft District",
        address: "123 Peachtree St",
        city: "Atlanta",
        state: "GA",
        zipCode: "30309",
        bedrooms: 2,
        bathrooms: "2",
        totalUnits: 4,
        description: "Modern loft-style apartments in the heart of Midtown Atlanta",
        neighborhood: "Midtown",
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        latitude: "33.7701",
        longitude: "-84.3870",
        createdAt: new Date(),
      },
      {
        id: 2,
        name: "Skyline Studios",
        address: "456 Main St",
        city: "Dallas",
        state: "TX",
        zipCode: "75201",
        bedrooms: 0,
        bathrooms: "1",
        totalUnits: 8,
        description: "Modern studio apartments with stunning city views",
        neighborhood: "Downtown",
        images: ["https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        latitude: "32.7767",
        longitude: "-96.7970",
        createdAt: new Date(),
      }
    ];

    sampleProperties.forEach(property => {
      this.properties.set(property.id, property);
      this.currentPropertyId = Math.max(this.currentPropertyId, property.id + 1);
    });

    // Sample units
    const sampleUnits: Unit[] = [
      { id: 1, propertyId: 1, unitNumber: "101", isAvailable: true, availableDate: new Date(), rent: 185000, images: [] },
      { id: 2, propertyId: 1, unitNumber: "102", isAvailable: false, availableDate: null, rent: 185000, images: [] },
      { id: 3, propertyId: 2, unitNumber: "201", isAvailable: true, availableDate: new Date(), rent: 125000, images: [] },
    ];

    sampleUnits.forEach(unit => {
      this.units.set(unit.id, unit);
      this.currentUnitId = Math.max(this.currentUnitId, unit.id + 1);
    });
  }

  async getProperties(filters?: { city?: string; isAvailable?: boolean }): Promise<Property[]> {
    let result = Array.from(this.properties.values());
    
    if (filters?.city && filters.city !== 'all') {
      result = result.filter(p => p.city.toLowerCase() === filters.city?.toLowerCase());
    }
    
    if (filters?.isAvailable !== undefined) {
      const availablePropertyIds = new Set(
        Array.from(this.units.values())
          .filter(u => u.isAvailable === filters.isAvailable)
          .map(u => u.propertyId)
      );
      result = result.filter(p => availablePropertyIds.has(p.id));
    }
    
    return result;
  }

  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const id = this.currentPropertyId++;
    const newProperty: Property = {
      ...property,
      id,
      createdAt: new Date(),
    };
    this.properties.set(id, newProperty);
    return newProperty;
  }

  async updateProperty(id: number, updates: Partial<InsertProperty>): Promise<Property | undefined> {
    const existing = this.properties.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.properties.set(id, updated);
    return updated;
  }

  async deleteProperty(id: number): Promise<boolean> {
    return this.properties.delete(id);
  }

  async getUnits(propertyId?: number): Promise<Unit[]> {
    const units = Array.from(this.units.values());
    return propertyId ? units.filter(u => u.propertyId === propertyId) : units;
  }

  async getUnit(id: number): Promise<Unit | undefined> {
    return this.units.get(id);
  }

  async createUnit(unit: InsertUnit): Promise<Unit> {
    const id = this.currentUnitId++;
    const newUnit: Unit = { ...unit, id };
    this.units.set(id, newUnit);
    return newUnit;
  }

  async updateUnit(id: number, updates: Partial<InsertUnit>): Promise<Unit | undefined> {
    const existing = this.units.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.units.set(id, updated);
    return updated;
  }

  async deleteUnit(id: number): Promise<boolean> {
    return this.units.delete(id);
  }

  async createLeadSubmission(submission: InsertLeadSubmission): Promise<LeadSubmission> {
    const id = this.currentLeadId++;
    const newSubmission: LeadSubmission = {
      ...submission,
      id,
      submittedAt: new Date(),
    };
    this.leadSubmissions.set(id, newSubmission);
    return newSubmission;
  }

  async getLeadSubmissions(): Promise<LeadSubmission[]> {
    return Array.from(this.leadSubmissions.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }
}

export const storage = new MemStorage();
