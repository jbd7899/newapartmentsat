import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPropertySchema, insertUnitSchema, insertLeadSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import sharp from "sharp";
import { geocodeAddress } from "./geocode";

async function populateMissingCoordinates() {
  try {
    const props = await storage.getProperties();
    for (const prop of props) {
      const lat = prop.latitude ? parseFloat(prop.latitude) : NaN;
      const lon = prop.longitude ? parseFloat(prop.longitude) : NaN;
      if (!prop.latitude || !prop.longitude || Number.isNaN(lat) || Number.isNaN(lon)) {
        const addr = `${prop.address}, ${prop.city}, ${prop.state} ${prop.zipCode}`;
        const geo = await geocodeAddress(addr);
        if (geo) {
          await storage.updateProperty(prop.id, { latitude: geo.lat, longitude: geo.lon });
        }
      }
    }
  } catch (err) {
    console.error('Failed to populate coordinates', err);
  }
}
// Configure multer for photo uploads - use memory storage to avoid file system issues
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB per file (will be compressed down)
    files: 10, // Max 10 files
    fieldSize: 1024 * 1024, // 1MB for form fields
    fieldNameSize: 100,
    fields: 20
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

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

  app.post("/api/properties", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPropertySchema.parse(req.body) as any;

      const lat = validatedData.latitude ? parseFloat(validatedData.latitude) : NaN;
      const lon = validatedData.longitude ? parseFloat(validatedData.longitude) : NaN;

      if (!validatedData.latitude || !validatedData.longitude || Number.isNaN(lat) || Number.isNaN(lon)) {
        const addr = `${validatedData.address}, ${validatedData.city}, ${validatedData.state} ${validatedData.zipCode}`;
        const geo = await geocodeAddress(addr);
        if (geo) {
          validatedData.latitude = geo.lat;
          validatedData.longitude = geo.lon;
        }
      }

      const property = await storage.createProperty(validatedData);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.put("/api/properties/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPropertySchema.partial().parse(req.body) as any;

      const lat = validatedData.latitude ? parseFloat(validatedData.latitude) : NaN;
      const lon = validatedData.longitude ? parseFloat(validatedData.longitude) : NaN;

      if (
        (!validatedData.latitude || !validatedData.longitude || Number.isNaN(lat) || Number.isNaN(lon)) &&
        (validatedData.address || validatedData.city || validatedData.state || validatedData.zipCode)
      ) {
        const prop = await storage.getProperty(id);
        if (prop) {
          const addr = `${validatedData.address || prop.address}, ${validatedData.city || prop.city}, ${validatedData.state || prop.state} ${validatedData.zipCode || prop.zipCode}`;
          const geo = await geocodeAddress(addr);
          if (geo) {
            validatedData.latitude = geo.lat;
            validatedData.longitude = geo.lon;
          }
        }
      }
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

  app.delete("/api/properties/:id", isAuthenticated, async (req, res) => {
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

  app.post("/api/units", isAuthenticated, async (req, res) => {
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

  app.put("/api/units/:id", isAuthenticated, async (req, res) => {
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

  app.delete("/api/units/:id", isAuthenticated, async (req, res) => {
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

  // Photo upload routes (protected)
  app.post("/api/photos/upload", isAuthenticated, (req, res) => {
    upload.array('photos', 10)(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: "File too large. Maximum size is 20MB per file." });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ message: "Too many files. Maximum is 10 files per upload." });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ message: "Unexpected file field. Use 'photos' field name." });
        }
        return res.status(400).json({ message: err.message || "Upload failed" });
      }

      const processFiles = async () => {
        try {
          const files = req.files as Express.Multer.File[];
          if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
          }

          const { propertyName, unitId, unitNumber, type } = req.body;
          
          // Process files from memory storage and save to correct location
          const uploadedFiles = [];
          for (const file of files) {
            let targetPath = 'photos/properties/';
            
            if (propertyName) {
              const cleanPropertyName = propertyName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              targetPath += `${cleanPropertyName}/`;
              
              if (unitId && unitNumber) {
                const cleanUnitNumber = unitNumber.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                targetPath += `unit-${cleanUnitNumber}/`;
              } else if (type) {
                targetPath += `property-${type}/`;
              }
            }
            
            // Ensure target directory exists
            await fs.mkdir(targetPath, { recursive: true });
            
            // Generate filename and compress image
            const timestamp = Date.now();
            const sanitizedName = file.originalname.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
            const nameWithoutExt = sanitizedName.replace(/\.[^/.]+$/, "");
            const filename = `${timestamp}-${nameWithoutExt}.jpg`; // Convert all to JPG for consistency
            const finalPath = `${targetPath}${filename}`;
            
            // Compress and convert image using Sharp
            const compressedBuffer = await sharp(file.buffer)
              .jpeg({ 
                quality: 80, // Good quality with significant compression
                progressive: true 
              })
              .resize(1920, 1080, { 
                fit: 'inside', // Maintain aspect ratio
                withoutEnlargement: true // Don't upscale small images
              })
              .toBuffer();
            
            // Write compressed file to disk
            await fs.writeFile(finalPath, compressedBuffer);
            
            uploadedFiles.push({
              filename: filename,
              originalName: file.originalname,
              path: finalPath,
              size: compressedBuffer.length, // Use compressed file size
              url: `/photos/${finalPath.replace('photos/', '')}`
            });
          }

          res.json({ files: uploadedFiles });
        } catch (error) {
          console.error('Processing error:', error);
          res.status(500).json({ message: "Failed to process uploaded photos" });
        }
      };

      processFiles();
    });
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

  app.put("/api/lead-submissions/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateLeadSubmission(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Submission not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update submission" });
    }
  });

  // File upload would be implemented here
  app.post("/api/upload", async (req, res) => {
    res.status(501).json({ message: "File upload not implemented yet" });
  });

  await populateMissingCoordinates();

  const httpServer = createServer(app);
  return httpServer;
}
