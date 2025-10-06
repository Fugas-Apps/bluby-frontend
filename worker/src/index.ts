import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { HTTPException } from 'hono/http-exception';
import { Env } from './auth';
import { ALLOWED_ORIGIN_PATTERNS } from './utils/cors';

// Import routes
import auth from './routes/auth';
import profiles from './routes/profiles';
import meals from './routes/meals';
import friends from './routes/friends';
import groups from './routes/groups';
import foodScan from './routes/food-scan';
import other from './routes/other';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: (origin, c) => {
    // Mobile apps often send null origin - allow it
    if (!origin) return '*';
    if (ALLOWED_ORIGIN_PATTERNS.some(pattern => pattern.test(origin))) {
      return origin;
    }
    return null;
  },
  allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Error handler
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  console.error(err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

// Routes
app.route('/auth', auth);
app.route('/api/auth', auth);
app.route('/api', auth); // For /api/delete-session
app.route('/v1/profiles', profiles);
app.route('/v1/meals', meals);
app.route('/v1/friends', friends);
app.route('/v1/groups', groups);
app.route('/food_scan', foodScan);
app.route('/v1', other);

// Health check endpoint
app.get('/health', (c) => c.json({ status: 'ok' }));

// Hello world endpoint
app.get('/hello', (c) => c.json({ 
  message: 'Hello from Bluby API! 🥗',
  timestamp: new Date().toISOString()
}));

// Root endpoint - shows all routes
app.get('/', (c) => {
  const routes = app.routes.reduce((acc: Record<string, string[]>, route: any) => {
    if (!acc[route.path]) {
      acc[route.path] = [];
    }
    acc[route.path].push(route.method);
    return acc;
  }, {});

  return c.json({
    name: 'Bluby API',
    version: '1.0',
    routes: routes
  });
});

export default app;
