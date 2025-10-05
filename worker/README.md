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

2. Create development environment variables:

```bash
npm run setup
```

This will create a `.dev.vars` file with default values. **Do not commit this file to git!**

3. Configure environment in `wrangler.toml`:

- Set up D1 database binding
- Set up R2 bucket bindings for food images and user avatars
- Enable AI binding

4. (Optional) Initialize the database by running the schema.sql if needed.

5. Run the application locally:

```bash
wrangler d1 execute bluby-db --file=src/db/schema.sql
npm run dev
```

6. Deploy to Cloudflare:

```bash
wrangler d1 execute bluby-db --file=src/db/schema.sql --remote
npm run deploy
```

## ⚠️ Important Warning

**DO NOT run EAS commands in this directory!** 

EAS is for React Native/Expo projects and should only be run from the root directory. This worker directory is specifically for Cloudflare Workers backend.

If you accidentally try to run EAS commands here, they will be blocked with an error message. The `predev` and `predeploy` scripts will prevent accidental EAS usage.

## Environment Variables

The `.dev.vars` file contains local development secrets:
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret (ask Jorge for the actual value)
- `BASE_URL`: Local development server URL

For production, configure secrets in Cloudflare Workers dashboard:

```bash
# Set production secrets
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put BASE_URL
```

## Available Scripts

- `npm run setup` - Create .dev.vars with default values
- `npm run dev` - Start local development server (with EAS protection)
- `npm run deploy` - Deploy to production (with EAS protection)
- `npm run generate` - Generate API client and database migrations
- `npm run full-local` - Full local development setup
