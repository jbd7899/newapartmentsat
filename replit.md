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

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **File Storage**: Replit Object Storage for photo management
- **Image Processing**: Sharp for image optimization and compression
- **Geocoding**: OpenStreetMap Nominatim API for address-to-coordinates conversion

### Development Environment
- **Platform**: Replit with Node.js 20 and PostgreSQL 16 modules
- **Package Manager**: npm with lockfile version 3
- **TypeScript**: Comprehensive type checking across shared schemas

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

## Changelog

Changelog:
- June 13, 2025. Initial setup