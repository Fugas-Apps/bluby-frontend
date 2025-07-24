const fs = require('fs');
const path = require('path');

// Read the worker source code
const workerPath = path.join(__dirname, '..', 'src', 'index.ts');
const workerContent = fs.readFileSync(workerPath, 'utf8');

// Parse routes from the worker
function extractRoutes(content) {
  const routes = [];
  const routePattern = /router\.(get|post|put|patch|delete)\(['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = routePattern.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const path = match[2];
    
    // Skip internal routes
    if (path.startsWith('/food_scan/') || path === '/' || path === '/health' || path === '/hello') {
      continue;
    }
    
    routes.push({
      method,
      path,
      summary: generateSummary(method, path),
      description: generateDescription(method, path)
    });
  }
  
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

function generateOpenAPISpec(routes) {
  const paths = {};
  
  routes.forEach(route => {
    if (!paths[route.path]) {
      paths[route.path] = {};
    }
    
    // Handle path parameters
    let openapiPath = route.path;
    const parameters = [];
    
    const paramPattern = /:([^/]+)/g;
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
    
    openapiPath = openapiPath.replace(/:([^/]+)/g, '{$1}');
    
    if (!paths[openapiPath]) {
      paths[openapiPath] = {};
    }
    
    paths[openapiPath][route.method.toLowerCase()] = {
      summary: route.summary,
      description: route.description,
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
const routes = extractRoutes(workerContent);
const spec = generateOpenAPISpec(routes);

// Write to file
const outputPath = path.join(__dirname, '..', 'openapi.json');
fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2));

console.log(`OpenAPI specification generated at ${outputPath}`);
console.log(`Found ${routes.length} routes:`);
routes.forEach(route => {
  console.log(`  ${route.method} ${route.path} - ${route.summary}`);
});
