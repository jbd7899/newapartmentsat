# UrbanLiving Property Management Platform

A comprehensive property management and rental platform designed for family-owned real estate companies operating in urban markets. The application provides a complete solution for showcasing rental properties, managing units, and capturing prospective tenant leads across multiple cities (Atlanta and Dallas).

## Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** build tool with HMR for development
- **Radix UI** components styled with Tailwind CSS and shadcn/ui design system
- **TanStack Query (React Query)** for server state management
- **Wouter** for lightweight client-side routing
- **React Hook Form** with Zod validation
- **Replit Auth** for session-based authentication

### Backend
- **Node.js 20** with Express.js framework
- **PostgreSQL 16** database with Drizzle ORM for type-safe operations
- **Replit Auth** with PostgreSQL session storage
- **Replit Object Storage** for photo management
- **Sharp** for image optimization and compression
- **Google Maps Geocoding API** for precise coordinate generation (5 decimal places)

### Development Environment
- **Platform**: Replit with Node.js 20 and PostgreSQL 16 modules
- **Package Manager**: npm with lockfile version 3
- **TypeScript**: Comprehensive type checking across shared schemas
- **Hot Reload**: Vite HMR for frontend, tsx watch mode for backend

## Key Features
- **Property Management**: Full CRUD operations for properties with geocoding
- **Unit Management**: Individual unit tracking with availability and pricing
- **Photo Organization**: Structured storage by property and unit categories
- **Lead Generation**: Contact forms with move-in date preferences and tracking
- **Interactive Maps**: Google Maps integration with city filtering and availability overlays
- **Admin Dashboard**: Comprehensive management interface for properties, units, photos, and leads
- **Branding Customization**: Configurable company branding and content

## Development Commands
Run these from the repository root:

```bash
npm install      # install dependencies
npm run dev      # start the development server
npm run build    # build the production output
npm run start    # run the compiled server
```

## Database Schema

The application uses PostgreSQL with these core tables:

### Properties Table
- `id`: Primary key (auto-increment)
- `name`: Property name
- `address`: Full address
- `city`: City (Atlanta or Dallas)
- `state`: State abbreviation
- `zipCode`: ZIP code
- `lat`: Latitude (5 decimal places)
- `lng`: Longitude (5 decimal places)
- `bedrooms`: Number of bedrooms
- `bathrooms`: Number of bathrooms
- `squareFootage`: Square footage
- `rent`: Monthly rent amount
- `isAvailable`: Availability status
- `description`: Property description
- `amenities`: JSON array of amenities
- `petPolicy`: Pet policy details
- `floorPlans`: JSON array of floor plans

### Units Table
- `id`: Primary key (auto-increment)
- `propertyId`: Foreign key to properties
- `unitNumber`: Unit identifier
- `bedrooms`: Number of bedrooms
- `bathrooms`: Number of bathrooms
- `squareFootage`: Square footage
- `rent`: Monthly rent
- `isAvailable`: Availability status
- `description`: Unit description

### Lead Submissions Table
- `id`: Primary key (auto-increment)
- `name`: Contact name
- `email`: Contact email
- `phone`: Phone number (optional)
- `preferredMoveInDate`: Preferred move-in date
- `message`: Additional message
- `propertyId`: Property of interest (optional)
- `contacted`: Contact status tracking
- `submittedAt`: Timestamp

### Branding Table
- `id`: Primary key (auto-increment)
- `companyName`: Company name
- `logoUrl`: Logo URL
- `primaryColor`: Primary brand color
- `secondaryColor`: Secondary brand color
- `cities`: JSON array of cities
- `header`: Main heading text
- `subtitle`: Subtitle text
- `footerText`: Footer content
- `contactInfo`: Contact information displayed in the footer

## API Endpoints

### Properties
- `GET /api/properties` - List all properties (supports ?city and ?isAvailable filters)
- `POST /api/properties` - Create new property
- `GET /api/properties/:id` - Get specific property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Units
- `GET /api/units` - List all units (supports ?propertyId filter)
- `POST /api/units` - Create new unit
- `GET /api/units/:id` - Get specific unit
- `PUT /api/units/:id` - Update unit
- `DELETE /api/units/:id` - Delete unit

### Lead Submissions
- `GET /api/lead-submissions` - List all leads
- `POST /api/lead-submissions` - Create new lead
- `PUT /api/lead-submissions/:id` - Update lead (for contact status)

### Branding
- `GET /api/branding` - Get branding configuration
- `PUT /api/branding` - Update branding configuration

### Photos
- `GET /api/photos/property/:id` - Get property photos organized by category
- `POST /api/photos/upload` - Upload photos (multipart form data)

### Authentication
- `/api/auth/login` - Replit Auth login
- `/api/auth/logout` - Logout
- `/api/auth/user` - Get current user

## Environment Variables
Copy `.env.example` to `.env` and provide the following values:

- `DATABASE_URL` – PostgreSQL connection string (automatically provided in Replit)
- `GOOGLE_API_KEY` or `GOOGLE_MAPS_API_KEY` – Google Maps API key for geocoding
- `SESSION_SECRET` – Session cookie secret (automatically generated in Replit)
- `NODE_ENV` – Environment mode (development/production)

Additional Replit-specific variables are automatically provided:
- `REPLIT_DOMAINS` – Replit domain for OIDC authentication
- `ISSUER_URL` – Replit OIDC issuer URL
- `REPL_ID` – Replit project identifier

## Development Guidelines for AI Collaborators

### Safe Development Practices

1. **Database Operations**
   - Use the `execute_sql_tool` for database schema inspection and modifications
   - Never use destructive operations (DELETE, DROP) unless explicitly requested
   - Always backup data before schema changes
   - Use `npm run db:push` for schema migrations, never write manual SQL migrations

2. **Testing API Changes**
   - Test all API endpoints with curl before making frontend changes
   - Example: `curl -X GET http://localhost:5000/api/properties`
   - Check both success and error responses
   - Verify database state after mutations

3. **Authentication System**
   - Do not modify the existing Replit Auth implementation
   - Respect protected routes in the admin dashboard
   - User authentication is handled automatically by Replit Auth

4. **Hot Reload and Development**
   - Frontend changes use Vite HMR (instant updates)
   - Backend changes trigger automatic restarts via tsx
   - Use the "Start application" workflow for development server

5. **Error Handling and Debugging**
   - Check browser console for frontend errors
   - Check server logs in workflow console for backend errors
   - Add logging statements for complex debugging
   - Always handle edge cases in form validation

### Project Structure

```
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   └── admin/       # Admin-specific components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Route components
│   │   └── main.tsx        # App entry point
├── server/                   # Express backend
│   ├── db.ts              # Database connection
│   ├── storage.ts         # Database operations
│   ├── routes.ts          # API routes
│   └── index.ts           # Server entry point
├── shared/
│   └── schema.ts          # Database schema and types
└── photos/               # Photo storage directory
```

### Making Changes Safely

1. **Adding New Features**
   - Start by updating `shared/schema.ts` with new types
   - Add database operations to `server/storage.ts`
   - Create API routes in `server/routes.ts`
   - Build frontend components in `client/src/components/`
   - Add routes to `client/src/App.tsx`

2. **Database Schema Changes**
   - Update tables in `shared/schema.ts`
   - Run `npm run db:push` to apply changes
   - Update storage interface in `server/storage.ts`
   - Test with sample data

3. **Photo Management**
   - Photos are stored in `/photos/properties/` with organized structure
   - Categories: `property-exterior/`, `property-interior/`, `property-amenities/`, `unit-{id}/`
   - Use Sharp for image processing and optimization
   - Always handle file upload errors gracefully

### Common Pitfalls to Avoid

1. **Form Validation Errors**
   - Always provide default values for forms
   - Use proper Zod schemas for validation
   - Handle edge cases in `setValueAs` transformations
   - Log `form.formState.errors` when debugging

2. **Database Queries**
   - Use Drizzle ORM syntax correctly
   - Always handle null/undefined results
   - Use proper filtering with `eq()`, `and()`, `or()` operators
   - Test queries with different data sets

3. **State Management**
   - Use TanStack Query for server state
   - Invalidate cache after mutations
   - Use array-based query keys for hierarchical data
   - Handle loading and error states properly

### Testing Procedures

1. **API Testing**
   ```bash
   # Test property creation
   curl -X POST http://localhost:5000/api/properties \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Property","address":"123 Test St","city":"Atlanta"}'
   
   # Test property retrieval
   curl http://localhost:5000/api/properties
   
   # Test with filters
   curl "http://localhost:5000/api/properties?city=Atlanta&isAvailable=true"
   ```

2. **Frontend Testing**
   - Test all form submissions
   - Verify data displays correctly
   - Test admin authentication flows
   - Check responsive design on different screen sizes

3. **Integration Testing**
   - Test complete user workflows
   - Verify photo uploads work end-to-end
   - Test lead submission and admin review process
   - Confirm map integration displays properties correctly

### Current Data State

The application currently contains:
- **23 properties** across Atlanta and Dallas with precise coordinates
- **Sample units** for each property with realistic pricing
- **Branding configuration** set to "ApartmentsATL"
- **Lead submissions** for testing admin workflows

### Deployment Considerations

- Application runs on Replit with automatic scaling
- PostgreSQL database is provisioned and configured
- Environment variables are managed through Replit secrets
- Static files are served through Express.js
- Frontend assets are built with Vite for production
