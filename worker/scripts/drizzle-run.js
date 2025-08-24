#!/usr/bin/env node
/**
 * drizzle-run.js
 *
 * Runs unapplied SQL migrations from ./drizzle in lexicographic order
 * and records applied filenames in .drizzle_applied.json to avoid re-running.
 *
 * Usage:
 *   node scripts/drizzle-run.js [--yes] [--remote] [--db NAME]
 *
 * Flags:
 *   --yes, -y    skip interactive prompts
 *   --remote     pass --remote to wrangler d1 execute
 *   --db NAME    set D1 DB name (defaults to bluby-db or env D1_DB_NAME)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const drizzleDir = path.join(root, 'drizzle');
const appliedFileLocal = path.join(root, 'autogen', '.drizzle_applied.json');
const appliedFileRemote = path.join(root, 'autogen', 'applied_in_cf.json');
const journalFile = path.join(drizzleDir, 'meta', '_journal.json');

const argv = process.argv.slice(2);
const yes = argv.includes('--yes') || argv.includes('-y');
const remote = argv.includes('--remote');
const bootstrapRemote = argv.includes('--bootstrap-remote') || argv.includes('--bootstrap') || argv.includes('--seed-journal');
const dbArgIndex = argv.indexOf('--db');
const dbName = (dbArgIndex !== -1 && argv[dbArgIndex + 1]) || process.env.D1_DB_NAME || 'bluby-db';

function run(cmd) {
  console.log('> ' + cmd);
  execSync(cmd, { stdio: 'inherit', cwd: root });
}

if (!fs.existsSync(drizzleDir)) {
  console.error('drizzle directory not found:', drizzleDir);
  process.exit(1);
}

let files = fs.readdirSync(drizzleDir).filter(f => f.endsWith('.sql')).sort();
if (files.length === 0) {
  console.log('No migration files found in', drizzleDir);
  process.exit(0);
}

let applied = [];
const targetAppliedFile = remote ? appliedFileRemote : appliedFileLocal;
if (fs.existsSync(targetAppliedFile)) {
  try {
    applied = JSON.parse(fs.readFileSync(targetAppliedFile, 'utf8')) || [];
  } catch (err) {
    console.warn('Could not read applied-file, starting fresh:', err.message || err);
    applied = [];
  }
} else if (remote && bootstrapRemote && fs.existsSync(journalFile)) {
  // Only seed remote-applied list from journal if explicitly requested via --bootstrap-remote
  try {
    const j = JSON.parse(fs.readFileSync(journalFile, 'utf8'));
    if (Array.isArray(j.entries)) {
      applied = j.entries.map(e => `${e.tag}.sql`);
      console.log('Seeded remote-applied list from journal (explicit):', applied.join(', '));
    }
  } catch (err) {
    console.warn('Failed to read journal file to seed remote applied list:', err.message || err);
  }
} else {
  // default: start with empty applied list
}

const toApply = files.filter(f => !applied.includes(f));
if (toApply.length === 0) {
  console.log('No new migrations to apply.');
  process.exit(0);
}

console.log('Migrations to apply in order:');
toApply.forEach(f => console.log(' -', f));

const readline = require('readline');
async function ask(question) {
  if (yes) return true;
  if (!process.stdin.isTTY) return false;
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, ans => { rl.close(); resolve(/^y(es)?$/i.test(ans.trim())); });
  });
}

(async () => {
  for (const file of toApply) {
    const full = path.join(drizzleDir, file);
    const sql = fs.readFileSync(full, 'utf8');
    console.log('\n---\nPreview of', file, '(first 200 chars)\n---\n', sql.slice(0, 200));

    const ok = await ask(`Apply ${file} to D1 database ${dbName}? (y/N): `);
    if (!ok) {
      console.log('Skipping', file);
      continue;
    }

    const remoteFlag = remote ? '--remote' : '';
    try {
      run(`npx wrangler d1 execute ${dbName} --file=${path.relative(root, full)} ${remoteFlag}`);
      applied.push(file);
      try {
        fs.mkdirSync(path.dirname(targetAppliedFile), { recursive: true });
        fs.writeFileSync(targetAppliedFile, JSON.stringify(applied, null, 2), 'utf8');
      } catch (err) {
        console.warn('Failed to write applied file:', err.message || err);
      }
      console.log('Applied and recorded:', file);
    } catch (err) {
      console.error('Failed to apply', file);
      console.error(err && err.message ? err.message : err);
      process.exit(1);
    }
  }

  console.log('\nAll done.');
})();
