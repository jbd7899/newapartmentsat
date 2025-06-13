import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, insertUnitSchema, insertLeadSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";

// Configure multer for photo uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    const { propertyId, unitId, type } = req.body;
    let uploadPath = 'photos/properties/';
    
    if (propertyId) {
      // Create property-specific folder structure
      const property = req.body.propertyName?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `property-${propertyId}`;
      uploadPath += `${property}/`;
      
      if (unitId) {
        const unitNumber = req.body.unitNumber?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `unit-${unitId}`;
        uploadPath += `unit-${unitNumber}/`;
      } else if (type) {
        uploadPath += `property-${type}/`;
      }
    }
    
    // Ensure directory exists
    if (!existsSync(uploadPath)) {
      fs.mkdir(uploadPath, { recursive: true }).catch(console.error);
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
    cb(null, `${timestamp}-${sanitizedName}`);
  }
});

const upload = multer({ 
  storage: storage_config,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve photo files statically
  app.use('/photos', express.static('photos'));
  // Properties routes
  app.get("/api/properties", async (req, res) => {
    try {
      const { city, isAvailable } = req.query;
      const filters: any = {};
      
      if (city && typeof city === 'string') {
        filters.city = city;
      }
      
      if (isAvailable !== undefined) {
        filters.isAvailable = isAvailable === 'true';
      }
      
      const properties = await storage.getProperties(filters);
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post("/api/properties", async (req, res) => {
    try {
      const validatedData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(validatedData);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.put("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPropertySchema.partial().parse(req.body);
      const property = await storage.updateProperty(id, validatedData);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProperty(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Units routes
  app.get("/api/units", async (req, res) => {
    try {
      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId as string) : undefined;
      const units = await storage.getUnits(propertyId);
      res.json(units);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch units" });
    }
  });

  app.post("/api/units", async (req, res) => {
    try {
      const validatedData = insertUnitSchema.parse(req.body);
      const unit = await storage.createUnit(validatedData);
      res.status(201).json(unit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid unit data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create unit" });
    }
  });

  app.put("/api/units/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertUnitSchema.partial().parse(req.body);
      const unit = await storage.updateUnit(id, validatedData);
      
      if (!unit) {
        return res.status(404).json({ message: "Unit not found" });
      }
      
      res.json(unit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid unit data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update unit" });
    }
  });

  app.delete("/api/units/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteUnit(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Unit not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete unit" });
    }
  });

  // Photo upload routes
  app.post("/api/photos/upload", upload.array('photos', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadedFiles = files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        url: `/photos/${file.path.replace('photos/', '')}`
      }));

      res.json({ files: uploadedFiles });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload photos" });
    }
  });

  // Get photos for a property
  app.get("/api/photos/property/:id", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      const propertyName = property.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const propertyPath = `photos/properties/${property.city.toLowerCase()}-${propertyName}`;
      
      const photos: any = {
        exterior: [],
        interior: [],
        amenities: [],
        units: {}
      };

      try {
        // Get property photos
        const categories = ['property-exterior', 'property-interior', 'property-amenities'];
        for (const category of categories) {
          const categoryPath = `${propertyPath}/${category}`;
          if (existsSync(categoryPath)) {
            const files = await fs.readdir(categoryPath);
            const imageFiles = files.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
            photos[category.replace('property-', '')] = imageFiles.map(file => 
              `/photos/properties/${property.city.toLowerCase()}-${propertyName}/${category}/${file}`
            );
          }
        }

        // Get unit photos
        const units = await storage.getUnits(propertyId);
        for (const unit of units) {
          const unitNumber = unit.unitNumber.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const unitPath = `${propertyPath}/unit-${unitNumber}`;
          if (existsSync(unitPath)) {
            const files = await fs.readdir(unitPath);
            const imageFiles = files.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
            photos.units[unit.id] = imageFiles.map(file => 
              `/photos/properties/${property.city.toLowerCase()}-${propertyName}/unit-${unitNumber}/${file}`
            );
          }
        }
      } catch (error) {
        // Directory doesn't exist, return empty photos
      }

      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  // Delete a photo
  app.delete("/api/photos", async (req, res) => {
    try {
      const { path: photoPath } = req.body;
      if (!photoPath) {
        return res.status(400).json({ message: "Photo path required" });
      }

      const fullPath = photoPath.startsWith('/photos/') ? photoPath.substring(8) : photoPath;
      if (existsSync(fullPath)) {
        await fs.unlink(fullPath);
        res.json({ message: "Photo deleted successfully" });
      } else {
        res.status(404).json({ message: "Photo not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  // Lead submissions route
  app.post("/api/lead-submissions", async (req, res) => {
    try {
      const validatedData = insertLeadSubmissionSchema.parse(req.body);
      const submission = await storage.createLeadSubmission(validatedData);
      
      // Email notification would be implemented here
      console.log("New lead submission received:", submission.name, submission.email);
      
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit lead" });
    }
  });

  app.get("/api/lead-submissions", async (req, res) => {
    try {
      const submissions = await storage.getLeadSubmissions();
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead submissions" });
    }
  });

  // File upload would be implemented here
  app.post("/api/upload", async (req, res) => {
    res.status(501).json({ message: "File upload not implemented yet" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
