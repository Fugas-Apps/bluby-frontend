#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const devVarsPath = path.join(__dirname, '../.dev.vars');
const defaultContent = `# Local development secrets for Wrangler
# DO NOT commit this file to git!
GOOGLE_CLIENT_SECRET=ask-jorge-if-very-important
BASE_URL=http://localhost:8787
`;

if (!fs.existsSync(devVarsPath)) {
  fs.writeFileSync(devVarsPath, defaultContent.trim() + '\n');
  console.log('✅ Created .dev.vars with default values');
  console.log('⚠️  Remember to update GOOGLE_CLIENT_SECRET with the actual value');
}