import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
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
  images: text("images").array().default([]),
  latitude: text("latitude"),
  longitude: text("longitude"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  unitNumber: text("unit_number").notNull(),
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
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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
