import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: text("bathrooms").notNull(), // e.g., "1.5", "2"
  totalUnits: integer("total_units").notNull(),
  description: text("description"),
  neighborhood: text("neighborhood"),
  amenities: text("amenities"),
  petPolicy: text("pet_policy"),
  floorPlans: text("floor_plans"),
  images: text("images").array().default([]),
  latitude: text("latitude"),
  longitude: text("longitude"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  unitNumber: text("unit_number").notNull(),
  bedrooms: integer("bedrooms").notNull().default(0),
  bathrooms: text("bathrooms").notNull().default(""),
  isAvailable: boolean("is_available").notNull().default(false),
  availableDate: timestamp("available_date"),
  rent: integer("rent"), // in cents
  images: text("images").array().default([]),
});

export const leadSubmissions = pgTable("lead_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  moveInDate: timestamp("move_in_date"),
  desiredBedrooms: text("desired_bedrooms"),
  additionalInfo: text("additional_info"),
  contacted: boolean("contacted").notNull().default(false),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
});

export const insertUnitSchema = createInsertSchema(units).omit({
  id: true,
});

export const insertLeadSubmissionSchema = createInsertSchema(leadSubmissions).omit({
  id: true,
  submittedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const branding = pgTable("branding", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull().default("UrbanLiving"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#2563eb"),
  secondaryColor: text("secondary_color").default("#4f46e5"),
  cities: text("cities").array().default([]),
  header: text("header"),
  subtitle: text("subtitle"),
  footerText: text("footer_text"),
  contactInfo: text("contact_info"),
});

export const insertBrandingSchema = createInsertSchema(branding).omit({
  id: true,
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type LeadSubmission = typeof leadSubmissions.$inferSelect;
export type InsertLeadSubmission = z.infer<typeof insertLeadSubmissionSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type Branding = typeof branding.$inferSelect;
export type InsertBranding = z.infer<typeof insertBrandingSchema>;
