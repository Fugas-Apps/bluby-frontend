# BlubyAI Worker Backend

This is the Cloudflare Worker backend for BlubyAI, a smart social food planner. This implementation uses Cloudflare Workers with itty-router for routing, D1 for database, R2 for storage, and Workers AI for image analysis.

## Features

- Cloudflare Workers for serverless deployment
- itty-router for API routing
- D1 Database for SQL storage
- R2 for object storage (food images and user avatars)
- Workers AI for food scanning with Gemini Pro Vision
- TypeScript for type-safe development

## New Features

### Food Scanning with AI

The BlubyAI backend now supports food scanning functionality using Workers AI. Users can send a base64-encoded photo of their food, and the system will:

1. Analyze the image using Workers AI with Gemini Pro Vision
2. Identify the food items
3. Estimate nutritional information (calories, macronutrients)
4. Return detailed information about the food

#### How to use:

1. Take a photo of your food from the front-end application
2. Send the base64-encoded image to the `/food_scan/scan` endpoint via POST
3. Receive the nutritional information as a JSON response

#### Requirements:

- Workers AI binding configured in wrangler.toml

## Project Structure

```
worker/
├── src/
│   ├── db/
│   │   └── schema.sql
│   ├── index.ts
│   └── types.d.ts
├── dist/
├── node_modules/
├── package-lock.json
├── package.json
├── tsconfig.json
└── wrangler.toml
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment in `wrangler.toml`:

- Set up D1 database binding
- Set up R2 bucket bindings for food images and user avatars
- Enable AI binding

3. (Optional) Initialize the database by running the schema.sql if needed.

4. Run the application locally:

```bash
npm run dev
```

5. Deploy to Cloudflare:

```bash
npm run deploy
```

## API Documentation

Access the worker at the deployed URL. Currently, endpoints include:

- GET / : API info
- GET /health : Health check
- GET /hello : Test endpoint
- POST /food_scan/scan : Food scanning endpoint

Full API documentation coming soon. Check src/index.ts for implemented routes.

## Authentication

Authentication is planned to be handled through Supabase. The frontend application will directly authenticate with Supabase and obtain a JWT token, which should be included in the Authorization header of requests to this backend:

```
Authorization: Bearer <token>
```

Note: JWT verification is TODO in the middleware.

## Frontend Integration

This backend is designed to work with React Native + Expo Router frontend applications. The frontend will handle authentication directly with Supabase and then communicate with this Cloudflare Worker backend using the JWT token.
