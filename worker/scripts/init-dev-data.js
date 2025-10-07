#!/usr/bin/env node
/**
 * DEV-ONLY: Initialize test users and friends in local D1 database
 * This script runs in the background when `npm run dev` is executed
 * and auto-creates test data if it doesn't exist.
 */

import { execSync } from 'child_process';
import { randomBytes } from 'crypto';

const TEST_USERS = [
  {
    email: 'testuser@blubyai.com',
    name: 'Test User',
    emailVerified: true,
  },
  {
    email: 'friend1@blubyai.com',
    name: 'Friend One',
    emailVerified: true,
  },
  {
    email: 'friend2@blubyai.com',
    name: 'Friend Two',
    emailVerified: true,
  },
  {
    email: 'friend3@blubyai.com',
    name: 'Friend Three',
    emailVerified: true,
  },
];

// Dev password: "password1234" (plain text stored for dev only)
const DEV_PASSWORD = 'password1234';
const DEV_SESSION_TOKEN = 'dummysession1234';

function generateId() {
  return randomBytes(16).toString('hex');
}

function escapeSQL(str) {
  return str.replace(/'/g, "''");
}

function executeCommand(command, silent = false) {
  try {
    const result = execSync(command, {
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function initDevData() {
  console.log('[DEV] Checking for test users...');

  // Check if test user already exists
  const checkCmd = `wrangler d1 execute bluby-db --local --command "SELECT id, email FROM users WHERE email = 'testuser@blubyai.com';"`;
  const checkResult = executeCommand(checkCmd, true);

  if (checkResult.success && checkResult.output.includes('testuser@blubyai.com')) {
    console.log('[DEV] Test users already exist, skipping initialization.');
    return;
  }

  console.log('[DEV] Creating test users...');

  let testUserId = null;

  // Create all test users
  for (const user of TEST_USERS) {
    // Use a fixed ID for the main test user so it matches the frontend
    const userId = user.email === 'testuser@blubyai.com' ? 'dev-user-id' : generateId();
    const accountId = generateId();
    const createdAt = Date.now();

    if (user.email === 'testuser@blubyai.com') {
      testUserId = userId;
    }

    // Insert user (using snake_case column names)
    const insertUserCmd = `wrangler d1 execute bluby-db --local --command "INSERT INTO users (id, email, name, email_verified, created_at, updated_at) VALUES ('${userId}', '${escapeSQL(user.email)}', '${escapeSQL(user.name)}', ${user.emailVerified ? 1 : 0}, ${createdAt}, ${createdAt});"`;

    const result = executeCommand(insertUserCmd, true); // Show output for debugging

    if (result.success) {
      console.log(`[DEV] ✓ Created user: ${user.email}`);

      // Create email/password account for this user (using snake_case column names)
      const insertAccountCmd = `wrangler d1 execute bluby-db --local --command "INSERT INTO accounts (id, account_id, provider_id, user_id, password, created_at, updated_at) VALUES ('${accountId}', '${escapeSQL(user.email)}', 'credential', '${userId}', '${DEV_PASSWORD}', ${createdAt}, ${createdAt});"`;
      const accountResult = executeCommand(insertAccountCmd, true);

      if (accountResult.success) {
        console.log(`[DEV]   ✓ Created account for: ${user.email}`);
      } else {
        console.error(`[DEV]   ✗ Failed to create account: ${accountResult.error}`);
      }

      // Create user profile with random avatar (using snake_case column names)
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`;
      const profileCmd = `wrangler d1 execute bluby-db --local --command "INSERT INTO user_profiles (user_id, goal, avatar_url) VALUES ('${userId}', 'Maintain healthy lifestyle', '${avatarUrl}');"`;
      const profileResult = executeCommand(profileCmd, true);

      if (profileResult.success) {
        console.log(`[DEV]   ✓ Created profile for: ${user.email}`);
      } else {
        console.error(`[DEV]   ✗ Failed to create profile: ${profileResult.error}`);
      }
    } else {
      console.error(`[DEV] ✗ Failed to create user: ${user.email}`);
      console.error(`[DEV]   Error: ${result.error}`);
    }
  }

  // Create session for test user (using snake_case column names)
  if (testUserId) {
    const sessionId = generateId();
    const expiresAt = Date.now() + (365 * 24 * 60 * 60 * 1000); // 1 year from now
    const createdAt = Date.now();

    const insertSessionCmd = `wrangler d1 execute bluby-db --local --command "INSERT INTO sessions (id, expires_at, token, created_at, updated_at, user_id) VALUES ('${sessionId}', ${expiresAt}, '${DEV_SESSION_TOKEN}', ${createdAt}, ${createdAt}, '${testUserId}');"`;
    const sessionResult = executeCommand(insertSessionCmd, true);

    if (sessionResult.success) {
      console.log('[DEV] ✓ Created test session with token: ' + DEV_SESSION_TOKEN);
    }
  }

  console.log('[DEV] ✓ Test data initialization complete!');
  console.log('[DEV] 📝 Login credentials:');
  console.log('[DEV]    Email: testuser@blubyai.com');
  console.log('[DEV]    Password: password1234');
  console.log('[DEV]    Session Token: dummysession1234');
}

// Run initialization
initDevData().catch(error => {
  console.error('[DEV] Error initializing test data:', error);
  process.exit(1);
});
