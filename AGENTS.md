# Maintenance Guidelines for newapartmentsat

This repository contains a TypeScript full stack application built with React, Express and Drizzle ORM. Use the following tips when updating the project.

## Development Commands

- **Install dependencies**: `npm install`
- **Start development**: `npm run dev`
- **Type check**: `npm run check`
- **Run tests**: `npm test`
  - Tests are powered by `vitest`. Some tests require Replit auth environment variables. Set `REPLIT_DOMAINS`, `ISSUER_URL` and `REPL_ID` when running tests locally.
- **Build for production**: `npm run build`
- **Start production build**: `npm run start`

## Project Structure

- `client/` – React frontend
- `server/` – Express backend
- `shared/` – TypeScript schemas shared by client and server
- `photos/` – Uploaded and processed property images

## Coding Guidelines

- Use TypeScript and keep strict checks enabled.
- Prefer ES module syntax.
- Keep commit messages concise and in the imperative mood ("Add property routes", "Fix lead submission")
- Format code consistently (Prettier is recommended).
- After modifying server configuration or build scripts, run `node validate-deployment.js` to ensure the deployment setup is correct.

