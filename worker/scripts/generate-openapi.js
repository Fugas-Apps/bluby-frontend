const fs = require('fs');
const path = require('path');

// Define routes manually since we're using split files
const routes = [
  // Auth routes
  { method: 'POST', path: '/auth/login', summary: 'Create login', description: 'Create operation for /auth/login', tags: ['auth'] },
  { method: 'POST', path: '/auth/register', summary: 'Create register', description: 'Create operation for /auth/register', tags: ['auth'] },
  { method: 'POST', path: '/auth/logout', summary: 'Create logout', description: 'Create operation for /auth/logout', tags: ['auth'] },
  
  // Profiles routes
  { method: 'GET', path: '/v1/profiles/{userId}', summary: 'Get a user profile by ID', description: 'Retrieve operation for /v1/profiles/:userId', tags: ['profiles'] },
  { method: 'PATCH', path: '/v1/profiles/{userId}', summary: 'Update a user profile', description: 'Partially update operation for /v1/profiles/:userId', tags: ['profiles'] },
  
  // Meals routes
  { method: 'GET', path: '/v1/meals/', summary: 'Get meals', description: 'Retrieve operation for /v1/meals/', tags: ['meals'] },
  { method: 'POST', path: '/v1/meals/', summary: 'Create meals', description: 'Create operation for /v1/meals/', tags: ['meals'] },
  
  // Friends routes
  { method: 'GET', path: '/v1/friends/', summary: 'Get friends', description: 'Retrieve operation for /v1/friends/', tags: ['friends'] },
  { method: 'POST', path: '/v1/friends/request/{userId}', summary: 'Send friend request', description: 'Create operation for /v1/friends/request/:userId', tags: ['friends'] },
  { method: 'GET', path: '/v1/friends/requests', summary: 'Get friend requests', description: 'Retrieve operation for /v1/friends/requests', tags: ['friends'] },
  
  // Groups routes
  { method: 'GET', path: '/v1/groups/', summary: 'Get groups', description: 'Retrieve operation for /v1/groups/', tags: ['groups'] },
  { method: 'POST', path: '/v1/groups/', summary: 'Create groups', description: 'Create operation for /v1/groups/', tags: ['groups'] },
  { method: 'GET', path: '/v1/groups/{groupId}', summary: 'Get specific group', description: 'Retrieve operation for /v1/groups/:groupId', tags: ['groups'] },
  
  // Ingredients routes
  { method: 'GET', path: '/v1/ingredients/', summary: 'Get ingredients', description: 'Retrieve operation for /v1/ingredients/', tags: ['ingredients'] },
  { method: 'POST', path: '/v1/ingredients/', summary: 'Create ingredients', description: 'Create operation for /v1/ingredients/', tags: ['ingredients'] },
  { method: 'GET', path: '/v1/ingredients/{ingredientId}', summary: 'Get specific ingredient', description: 'Retrieve operation for /v1/ingredients/:ingredientId', tags: ['ingredients'] },
  
  // Products routes
  { method: 'GET', path: '/v1/products/', summary: 'Get products', description: 'Retrieve operation for /v1/products/', tags: ['products'] },
  { method: 'POST', path: '/v1/products/', summary: 'Create products', description: 'Create operation for /v1/products/', tags: ['products'] },
  { method: 'GET', path: '/v1/products/{productId}', summary: 'Get specific product', description: 'Retrieve operation for /v1/products/:productId', tags: ['products'] },
  
  // Preferences routes
  { method: 'GET', path: '/v1/preferences/', summary: 'Get preferences', description: 'Retrieve operation for /v1/preferences/', tags: ['preferences'] },
  { method: 'PUT', path: '/v1/preferences/', summary: 'Update preferences', description: 'Update operation for /v1/preferences/', tags: ['preferences'] },
  { method: 'POST', path: '/v1/preferences/', summary: 'Create preferences', description: 'Create operation for /v1/preferences/', tags: ['preferences'] },
  
  // Recipes routes
  { method: 'GET', path: '/v1/recipes/', summary: 'Get recipes', description: 'Retrieve operation for /v1/recipes/', tags: ['recipes'] },
  { method: 'POST', path: '/v1/recipes/', summary: 'Create recipes', description: 'Create operation for /v1/recipes/', tags: ['recipes'] },
  { method: 'GET', path: '/v1/recipes/{recipeId}', summary: 'Get specific recipe', description: 'Retrieve operation for /v1/recipes/:recipeId', tags: ['recipes'] },
  
  // Food scan routes
  { method: 'POST', path: '/food_scan/scan', summary: 'Scan food image', description: 'Create operation for /food_scan/scan', tags: ['foodScan'] },
];

// No need to extract routes anymore, use predefined ones
function extractRoutes() {
  return routes;
}

function generateSummary(method, path) {
  const pathParts = path.split('/').filter(p => p);
  const resource = pathParts[1] || 'resource';
  const action = method.toLowerCase();
  
  const summaries = {
    'GET': `Get ${resource}`,
    'POST': `Create ${resource}`,
    'PUT': `Update ${resource}`,
    'PATCH': `Update ${resource}`,
    'DELETE': `Delete ${resource}`
  };
  
  // Handle specific cases
  if (path.includes(':userId')) {
    if (method === 'GET') return 'Get a user profile by ID';
    if (method === 'PATCH') return 'Update a user profile';
  }
  
  if (path.includes(':mealId')) {
    if (method === 'GET') return 'Get specific meal';
  }
  
  if (path.includes(':planId')) {
    if (method === 'GET') return 'Get specific meal plan';
  }
  
  if (path.includes(':itemId')) {
    if (method === 'DELETE') return 'Remove a pantry item';
  }
  
  if (path.includes(':userId')) {
    if (method === 'POST') return 'Send friend request';
  }
  
  if (path.includes(':groupId')) {
    if (method === 'GET') return 'Get specific group';
  }
  
  if (path.includes(':ingredientId')) {
    if (method === 'GET') return 'Get specific ingredient';
  }
  
  if (path.includes(':productId')) {
    if (method === 'GET') return 'Get specific product';
  }
  
  if (path.includes(':recipeId')) {
    if (method === 'GET') return 'Get specific recipe';
  }
  
  return summaries[method] || `Handle ${method} request for ${resource}`;
}

function generateDescription(method, path) {
  const summaries = {
    'GET': 'Retrieve',
    'POST': 'Create',
    'PUT': 'Update',
    'PATCH': 'Partially update',
    'DELETE': 'Delete'
  };
  
  const action = summaries[method] || method;
  return `${action} operation for ${path}`;
}

function generateOpenAPISpec(routesList) {
  const paths = {};
  
  routesList.forEach(route => {
    if (!paths[route.path]) {
      paths[route.path] = {};
    }
    
    // Handle path parameters
    const parameters = [];
    
    const paramPattern = /\{([^}]+)\}/g;
    let paramMatch;
    while ((paramMatch = paramPattern.exec(route.path)) !== null) {
      const paramName = paramMatch[1];
      parameters.push({
        name: paramName,
        in: 'path',
        required: true,
        schema: {
          type: 'integer'
        }
      });
    }
    
    paths[route.path][route.method.toLowerCase()] = {
      summary: route.summary,
      description: route.description,
      tags: route.tags,
      parameters: parameters.length > 0 ? parameters : undefined,
      responses: {
        '200': {
          description: 'Successful response'
        },
        '400': {
          description: 'Bad request'
        },
        '404': {
          description: 'Not found'
        },
        '500': {
          description: 'Internal server error'
        }
      }
    };
  });
  
  return {
    openapi: '3.0.0',
    info: {
      title: 'Bluby API',
      version: '1.0.0',
      description: 'Cloudflare Worker backend for the BlubyAI application'
    },
    servers: [
      {
        url: 'http://localhost:8787',
        description: 'Local development server'
      }
    ],
    paths: paths,
    components: {
      schemas: {
        // Add common schemas here
        ProfileDetails: {
          type: 'object',
          properties: {
            user_id: {
              type: 'integer'
            },
            username: {
              type: 'string'
            },
            bio: {
              type: 'string'
            },
            private: {
              type: 'boolean'
            },
            allow_contact_search: {
              type: 'boolean'
            }
          }
        },
        SuccessResponseProfileDetails: {
          type: 'object',
          properties: {
            status: {
              type: 'string'
            },
            body: {
              $ref: '#/components/schemas/ProfileDetails'
            }
          }
        }
      }
    }
  };
}

// Generate the OpenAPI spec
const routesList = extractRoutes();
const spec = generateOpenAPISpec(routesList);

// Write to file
const outputPath = path.join(__dirname, '..', 'openapi.json');
fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2));

console.log(`OpenAPI specification generated at ${outputPath}`);
console.log(`Found ${routesList.length} routes:`);
routesList.forEach(route => {
  console.log(`  ${route.method} ${route.path} - ${route.summary}`);
});
