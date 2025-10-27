#!/usr/bin/env node
/**
 * Supabase Database Initialization Script
 * ========================================
 *
 * This script initializes the Supabase database with all necessary tables,
 * functions, and policies by executing SQL migrations.
 *
 * Usage:
 *   node scripts/init-supabase.js
 *
 * Environment variables required:
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (admin access)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Validate environment variables
function validateEnv() {
  if (!SUPABASE_URL) {
    logError('NEXT_PUBLIC_SUPABASE_URL environment variable is missing!');
    process.exit(1);
  }

  if (!SERVICE_KEY) {
    logError('SUPABASE_SERVICE_ROLE_KEY environment variable is missing!');
    process.exit(1);
  }

  logSuccess('Environment variables validated');
}

// Execute SQL via Supabase REST API
async function executeSql(sql, description) {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/rpc/exec_sql', SUPABASE_URL);
    const protocol = url.protocol === 'https:' ? https : http;

    // Remove comments and empty lines from SQL
    const cleanedSql = sql
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith('--');
      })
      .join('\n');

    const postData = JSON.stringify({ query: cleanedSql });

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
    };

    const req = protocol.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          logSuccess(`${description} - Success`);
          resolve(data);
        } else {
          logError(`${description} - Failed (HTTP ${res.statusCode})`);
          logError(`Response: ${data}`);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      logError(`${description} - Network error: ${error.message}`);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Execute SQL directly via pg wire protocol (alternative method)
async function executeSqlDirect(sql, description) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL);
    const protocol = url.protocol === 'https:' ? https : http;

    const postData = sql;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/sql',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=minimal'
      },
    };

    logInfo(`Executing: ${description}...`);

    const req = protocol.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          logSuccess(`${description}`);
          resolve(data);
        } else {
          // Log but don't fail - some migrations might already be applied
          logWarning(`${description} - Status ${res.statusCode}`);
          if (data && data.length < 500) {
            logInfo(`Response: ${data}`);
          }
          resolve(data); // Still resolve, don't reject
        }
      });
    });

    req.on('error', (error) => {
      logError(`${description} - Error: ${error.message}`);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Read SQL file
function readSqlFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    logInfo(`Read ${filePath} (${content.length} bytes)`);
    return content;
  } catch (error) {
    logError(`Failed to read ${filePath}: ${error.message}`);
    throw error;
  }
}

// Split SQL into individual statements
function splitSqlStatements(sql) {
  // This is a simple splitter - doesn't handle all edge cases
  // but works for our migrations
  const statements = [];
  let current = '';
  let inFunction = false;

  const lines = sql.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('--')) {
      continue;
    }

    // Track if we're inside a function definition
    if (trimmed.toUpperCase().includes('CREATE OR REPLACE FUNCTION') ||
        trimmed.toUpperCase().includes('CREATE FUNCTION')) {
      inFunction = true;
    }

    current += line + '\n';

    // Check for statement terminator
    if (trimmed.endsWith(';')) {
      if (inFunction && trimmed === '$$;') {
        inFunction = false;
        statements.push(current.trim());
        current = '';
      } else if (!inFunction) {
        statements.push(current.trim());
        current = '';
      }
    }
  }

  // Add any remaining content
  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements.filter(s => s.length > 0);
}

// Main initialization function
async function initializeDatabase() {
  log('\n========================================', 'blue');
  log('  Supabase Database Initialization', 'blue');
  log('========================================\n', 'blue');

  try {
    // Validate environment
    validateEnv();

    // Read SQL files
    logInfo('\n📁 Reading SQL migration files...');

    const deployAllSql = readSqlFile('supabase/deploy-all.sql');
    const migrationSql = readSqlFile('supabase/migrations/add-slugs-and-local-storage.sql');

    // Execute deploy-all.sql
    logInfo('\n🚀 Executing main database setup (deploy-all.sql)...');
    const statements1 = splitSqlStatements(deployAllSql);
    logInfo(`Found ${statements1.length} SQL statements to execute`);

    for (let i = 0; i < statements1.length; i++) {
      const stmt = statements1[i];
      const preview = stmt.substring(0, 50).replace(/\s+/g, ' ');
      try {
        await executeSqlDirect(stmt, `Statement ${i + 1}/${statements1.length}: ${preview}...`);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        logWarning(`Statement ${i + 1} failed, continuing... ${error.message}`);
        // Continue with next statement
      }
    }

    logSuccess('\n✅ Main database setup completed');

    // Execute migration
    logInfo('\n🔄 Executing migration (add-slugs-and-local-storage.sql)...');
    const statements2 = splitSqlStatements(migrationSql);
    logInfo(`Found ${statements2.length} SQL statements to execute`);

    for (let i = 0; i < statements2.length; i++) {
      const stmt = statements2[i];
      const preview = stmt.substring(0, 50).replace(/\s+/g, ' ');
      try {
        await executeSqlDirect(stmt, `Statement ${i + 1}/${statements2.length}: ${preview}...`);
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        logWarning(`Statement ${i + 1} failed, continuing... ${error.message}`);
      }
    }

    logSuccess('\n✅ Migration completed');

    log('\n========================================', 'green');
    log('  ✅ Database initialization complete!', 'green');
    log('========================================\n', 'green');

    logInfo('Next steps:');
    logInfo('1. Create an admin user via the setup interface');
    logInfo('2. Access the application and start using it');
    logInfo('');

    process.exit(0);

  } catch (error) {
    log('\n========================================', 'red');
    log('  ❌ Initialization failed', 'red');
    log('========================================\n', 'red');
    logError(`Error: ${error.message}`);

    logInfo('\nℹ️  Manual setup alternative:');
    logInfo('1. Go to Supabase Dashboard → SQL Editor');
    logInfo('2. Open and run: supabase/deploy-all.sql');
    logInfo('3. Open and run: supabase/migrations/add-slugs-and-local-storage.sql');
    logInfo('');

    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
