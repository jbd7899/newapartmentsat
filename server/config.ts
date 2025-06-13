// Production deployment configuration
export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || "5000", 10),
  host: process.env.HOST || "0.0.0.0",
  nodeEnv: process.env.NODE_ENV || "development",
  
  // Database configuration
  databaseUrl: process.env.DATABASE_URL,
  
  // Logging configuration
  enableDetailedLogging: process.env.NODE_ENV !== "production",
  
  // Static file serving
  staticPath: process.env.NODE_ENV === "production" ? "dist/public" : null,
  
  // Security headers for production
  enableSecurityHeaders: process.env.NODE_ENV === "production",
  
  // Production optimizations
  enableCompression: process.env.NODE_ENV === "production",
  trustProxy: process.env.NODE_ENV === "production",
};

// Validate required environment variables for production
export function validateProductionConfig() {
  if (config.nodeEnv === "production") {
    const requiredVars = ["DATABASE_URL"];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables for production: ${missing.join(", ")}`);
    }
    
    // Validate port is a valid number
    if (isNaN(config.port) || config.port <= 0) {
      throw new Error(`Invalid PORT environment variable: ${process.env.PORT}`);
    }
  }
}

// Security middleware for production
export function addSecurityHeaders(app: any) {
  if (config.enableSecurityHeaders) {
    // Trust proxy for Replit deployment
    if (config.trustProxy) {
      app.set('trust proxy', 1);
    }
    
    // Security headers middleware
    app.use((req: any, res: any, next: any) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      next();
    });
  }
}