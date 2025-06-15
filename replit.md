# UrbanLiving Property Management Platform

## Overview

UrbanLiving is a modern property management and rental platform designed for family-owned real estate companies operating in urban markets. The application provides a comprehensive solution for showcasing rental properties, managing units, and capturing prospective tenant leads across multiple cities (Atlanta and Dallas).

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Replit Auth with session-based authentication

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with PostgreSQL session storage
- **File Storage**: Replit Object Storage for photo management
- **Image Processing**: Sharp for image optimization and compression
- **Geocoding**: Google Maps Geocoding API for precise coordinates (5 decimal places)

### Development Environment
- **Platform**: Replit with Node.js 20 and PostgreSQL 16 modules
- **Package Manager**: npm with lockfile version 3
- **TypeScript**: Comprehensive type checking across shared schemas
- **Hot Reload**: Vite HMR for frontend, tsx watch mode for backend

## Key Components

### Property Management
- **Property CRUD**: Full create, read, update, delete operations for properties
- **Unit Management**: Individual unit tracking with availability status and pricing
- **Photo Management**: Organized photo storage by property and unit categories
- **Geocoding Integration**: Automatic coordinate generation for map display

### Photo Organization System
- **Structured Storage**: Property photos organized in categorized folders
  - `property-exterior/`: Building facades and outdoor areas
  - `property-interior/`: Common areas and lobbies
  - `property-amenities/`: Shared facilities and parking
  - `unit-{identifier}/`: Individual unit photos
- **Upload Processing**: Multi-file uploads with automatic compression and format optimization
- **Gallery Features**: Interactive photo galleries with lightbox functionality

### Lead Generation
- **Contact Forms**: Prospective tenant inquiry system with move-in date preferences
- **Lead Tracking**: Storage and management of all lead submissions
- **Form Validation**: Comprehensive client and server-side validation

### Map Integration
- **Google Maps**: Interactive property location display
- **City Filtering**: Toggle between Atlanta and Dallas property views
- **Availability Overlay**: Visual indicators for available properties

### Admin Interface
- **Property Management**: Comprehensive admin dashboard for property CRUD operations
- **Unit Management**: Individual unit availability and pricing management
- **Photo Management**: Drag-and-drop photo upload with category organization
- **Lead Dashboard**: View and manage prospective tenant inquiries

## Data Flow

### Property Data
1. **Storage**: Properties stored in PostgreSQL with full property details
2. **Geocoding**: Addresses automatically converted to coordinates via Nominatim API
3. **Photo Association**: Photos stored in Replit Object Storage with filesystem organization
4. **API Exposure**: RESTful endpoints for property CRUD operations

### Photo Management
1. **Upload**: Multi-file uploads processed through Express.js with Multer
2. **Processing**: Images compressed and optimized using Sharp
3. **Storage**: Files organized in categorized directory structure
4. **Retrieval**: Static file serving with proper error handling

### Lead Processing
1. **Capture**: Form submissions validated with Zod schemas
2. **Storage**: Lead data persisted to PostgreSQL
3. **Notification**: Admin dashboard provides lead management interface

## External Dependencies

### Core Infrastructure
- **Database**: PostgreSQL 16 (provisioned via Replit)
- **Object Storage**: Replit Object Storage for photo management
- **Maps**: Google Maps JavaScript API for interactive mapping
- **Geocoding**: OpenStreetMap Nominatim for address resolution

### Development Tools
- **Deployment**: Replit autoscale deployment target
- **Build Pipeline**: Vite for frontend, esbuild for backend bundling
- **Testing**: Vitest for unit testing with supertest for API testing

### UI Dependencies
- **Component Library**: Comprehensive Radix UI primitive components
- **Icons**: Lucide React for consistent iconography
- **Styling**: Tailwind CSS with custom design tokens

## Deployment Strategy

### Production Build
- **Frontend**: Vite production build with tree-shaking and minification
- **Backend**: esbuild compilation to ESM format with external package handling
- **Static Assets**: Optimized asset serving through Express.js

### Environment Configuration
- **Development**: Hot module replacement with Vite dev server
- **Production**: Compiled backend serving static frontend assets
- **Database**: Environment-based PostgreSQL connection strings

### File Organization
- **Photos**: Organized filesystem structure in `/photos/properties/`
- **Build Output**: Frontend assets compiled to `/dist/public/`
- **Server**: Backend compiled to `/dist/index.js`

## User Preferences

Preferred communication style: Simple, everyday language.

## Development Guidelines for AI Collaborators

### Safe Development Practices
- **Database**: Use `execute_sql_tool` for schema inspection and modifications
- **Testing**: Always test API endpoints with curl before making frontend changes
- **Authentication**: Respect existing Replit Auth implementation - don't modify auth flows
- **Hot Reload**: Use Vite HMR for frontend changes, backend auto-restarts via tsx
- **Error Handling**: Check both browser console and server logs for debugging

### Critical Database Schema
The application uses PostgreSQL with these core tables:
- `properties`: Main property data with coordinates (lat/lng to 5 decimal places)
- `units`: Individual rental units linked to properties
- `lead_submissions`: Prospect inquiries with contact status tracking
- `branding`: Customizable company branding and content
- `users`: Replit Auth user data
- `sessions`: Session storage for authentication

### API Endpoint Structure
- `GET/POST /api/properties` - Property CRUD operations
- `GET/POST /api/units` - Unit management
- `GET/POST /api/lead-submissions` - Lead capture and management
- `GET/PUT /api/branding` - Branding customization
- `/api/auth/*` - Replit Auth integration
- `/api/photos/*` - Photo upload and serving

### Component Architecture
- **Pages**: `/client/src/pages/` - Route components
- **Components**: `/client/src/components/` - Reusable UI components
- **Admin Components**: `/client/src/components/admin/` - Admin-specific components
- **Hooks**: `/client/src/hooks/` - Custom React hooks
- **Shared**: `/shared/schema.ts` - Database schema and types

### Environment Requirements
- `GOOGLE_API_KEY` or `GOOGLE_MAPS_API_KEY` for geocoding
- `DATABASE_URL` for PostgreSQL connection
- Replit Auth handles user authentication automatically

## Recent Changes

- **June 14, 2025**: Updated all property coordinates with Google Maps API precision
  - Implemented Google Maps Geocoding API integration for precise coordinates
  - Updated all 23 properties (Atlanta and Dallas) with 5-decimal-place accuracy
  - Created coordinate update script using authentic Google Maps data
  - Fixed database schema issues (added missing amenities, pet_policy, floor_plans columns)
  - Resolved JSX syntax errors in admin interface
  - Enhanced geocoding system with proper rate limiting and error handling
  - Fixed 500 internal server errors across the application
  - Added missing contacted column to lead_submissions table
  - Created default branding record and synchronized schema
  - Updated landing page heading to "Modern Property Management Marketing"
  - Fixed branding tab error in admin dashboard with improved form validation

- **June 13, 2025**: Applied comprehensive deployment fixes to resolve initialization failures
  - Added NODE_ENV environment variable handling with proper defaults
  - Implemented production configuration validation system
  - Added security headers middleware for production deployments
  - Enhanced error handling with proper logging and graceful shutdown
  - Fixed server binding configuration for all network interfaces
  - Created deployment validation script to verify configuration
  - Updated server startup to handle both development and production modes

## Changelog

Changelog:
- June 13, 2025. Initial setup
- June 13, 2025. Deployment configuration fixes applied