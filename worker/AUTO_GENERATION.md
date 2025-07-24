# Auto-Generation System

This document explains how the auto-generation system works in the Bluby project.

## Overview

The auto-generation system automatically creates TypeScript API clients from the Cloudflare Worker backend. This ensures that the frontend always stays in sync with the backend API.

## How It Works

1. **OpenAPI Generation**: The Cloudflare Worker exposes an OpenAPI specification that describes all available endpoints
2. **Client Generation**: Orval generates TypeScript clients with React Query hooks from the OpenAPI spec
3. **Type Safety**: Full type safety is maintained between frontend and backend
4. **Authentication**: JWT-based authentication is handled automatically

## Authentication Endpoints

The system now includes built-in authentication endpoints:

- `POST /auth/login` - User login
- `POST /auth/register` - User registration  
- `POST /auth/logout` - User logout

## Usage

To regenerate the API client after making changes to the backend:

```bash
cd worker
npm run generate
```

This will:
1. Generate the OpenAPI specification from the worker routes
2. Generate TypeScript API clients using Orval
3. Update all frontend hooks automatically

## Benefits

- **Zero Manual API Code**: No manual API client code to maintain
- **Always Up-to-Date**: API changes are automatically reflected in the frontend
- **Type Safety**: Full TypeScript support with automatic type generation
- **React Query Integration**: Built-in React Query hooks for state management
- **Authentication Handling**: Automatic JWT token management

## Custom Authentication System (Melody Auth)

The system uses a custom JWT-based authentication system called "Melody Auth" instead of Supabase:

- Tokens are stored in AsyncStorage
- Automatic token attachment to API requests
- Simple login/register/logout flows
- User session management

## File Structure

```
worker/
├── scripts/generate-openapi.js    # Generates OpenAPI spec
├── orval.config.js               # Orval configuration
├── openapi.json                  # Generated OpenAPI spec
└── src/index.ts                  # Worker with all endpoints

src/api/                          # Generated API clients
├── default/                     # Authentication endpoints
├── profiles/                    # Profile endpoints
├── meals/                       # Meal endpoints
└── ...                          # Other endpoints
```

## Testing

The system includes a test screen (`app/(tabs)/test-auth.tsx`) to verify authentication functionality.
