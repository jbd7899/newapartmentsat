# UrbanLiving Property Management Platform

UrbanLiving is a full stack property management and rental application aimed at small real estate companies. It showcases available properties, manages individual units and tracks prospective tenant leads across multiple cities.

## Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** build tool
- **Radix UI** components styled with Tailwind CSS and the shadcn/ui design system
- **TanStack Query** for server state
- **Wouter** for routing
- **React Hook Form** with Zod validation

### Backend
- **Node.js** and **Express**
- **PostgreSQL** database accessed via Drizzle ORM
- **Replit Object Storage** for photos
- **Sharp** for image optimization
- **OpenStreetMap Nominatim** for geocoding

### Development Environment
- Runs on Node.js 20 and PostgreSQL 16 in Replit
- Uses Vite for the frontend and esbuild for the backend

## Key Features
- Property and unit CRUD operations
- Photo management with automatic compression and categorized folders
- Automatic coordinate generation for map displays
- Lead capture forms with comprehensive validation
- Google Maps integration with city filtering and availability overlays
- Admin dashboard for managing properties, units, photos and leads

## Development Commands
Run these from the repository root:

```bash
npm install      # install dependencies
npm run dev      # start the development server
npm run build    # build the production output
npm run start    # run the compiled server
```

## Environment Variables
Copy `.env.example` to `.env` and provide the following values:

- `REPLIT_DOMAINS` – your Replit domain used for OIDC authentication
- `ISSUER_URL` – Replit OIDC issuer URL
- `REPL_ID` – Replit project identifier
- `SESSION_SECRET` – session cookie secret for Express
- `DATABASE_URL` – PostgreSQL connection string
- `VITE_GOOGLE_API_KEY` – client-side Google Maps API key
- `GOOGLE_GEOCODING_API_KEY` – server-side geocoding API key

These variables are required for both development and production builds.
