/**
 * Migration Script: Supabase Cloud → Local PostgreSQL
 *
 * This script migrates all data from Supabase cloud database to local PostgreSQL.
 *
 * Usage:
 *   node scripts/migrate-from-supabase.js
 *
 * Prerequisites:
 *   - Set SUPABASE_CONNECTION_STRING environment variable
 *   - Local PostgreSQL must be running and accessible via DATABASE_URL
 */

const { Client } = require('pg');

// Configuration
const SUPABASE_CONNECTION_STRING = process.env.SUPABASE_CONNECTION_STRING || process.env.DATABASE_URL_SUPABASE;
const LOCAL_CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/building_survey';

// Tables to migrate (in order to respect foreign keys)
const TABLES = [
  'profiles',
  'projects',
  'drawings',
  'photos',
  'forms_data'
];

async function migrate() {
  console.log('🚀 Starting migration from Supabase to Local PostgreSQL...\n');

  if (!SUPABASE_CONNECTION_STRING) {
    console.error('❌ ERROR: SUPABASE_CONNECTION_STRING environment variable is not set!');
    console.error('   Set it with: export SUPABASE_CONNECTION_STRING="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"');
    process.exit(1);
  }

  // Connect to both databases
  const supabaseClient = new Client({
    connectionString: SUPABASE_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });

  const localClient = new Client({
    connectionString: LOCAL_CONNECTION_STRING
  });

  try {
    console.log('📡 Connecting to Supabase...');
    await supabaseClient.connect();
    console.log('✅ Connected to Supabase\n');

    console.log('📡 Connecting to Local PostgreSQL...');
    await localClient.connect();
    console.log('✅ Connected to Local PostgreSQL\n');

    // Migrate each table
    for (const table of TABLES) {
      await migrateTable(supabaseClient, localClient, table);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Migrated ${TABLES.length} tables`);
    console.log(`   - Tables: ${TABLES.join(', ')}`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await supabaseClient.end();
    await localClient.end();
  }
}

async function migrateTable(sourceClient, targetClient, tableName) {
  console.log(`\n📦 Migrating table: ${tableName}`);

  try {
    // Check if table exists in source
    const checkQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = $1
      );
    `;
    const tableExists = await sourceClient.query(checkQuery, [tableName]);

    if (!tableExists.rows[0].exists) {
      console.log(`   ⚠️  Table '${tableName}' does not exist in Supabase, skipping...`);
      return;
    }

    // Get all data from source
    console.log(`   📥 Reading data from Supabase...`);
    const sourceData = await sourceClient.query(`SELECT * FROM public.${tableName}`);
    const rowCount = sourceData.rows.length;

    if (rowCount === 0) {
      console.log(`   ℹ️  No data in table '${tableName}', skipping...`);
      return;
    }

    console.log(`   📊 Found ${rowCount} rows`);

    // Get column names
    const columns = Object.keys(sourceData.rows[0]);
    console.log(`   📋 Columns: ${columns.join(', ')}`);

    // Disable triggers to allow direct inserts
    await targetClient.query(`ALTER TABLE public.${tableName} DISABLE TRIGGER ALL;`);

    // Clear existing data in target (optional - comment out if you want to keep existing data)
    console.log(`   🗑️  Clearing existing data in local database...`);
    await targetClient.query(`DELETE FROM public.${tableName};`);

    // Insert data row by row
    let successCount = 0;
    let errorCount = 0;

    console.log(`   💾 Inserting data into local database...`);

    for (let i = 0; i < sourceData.rows.length; i++) {
      const row = sourceData.rows[i];

      try {
        // Build INSERT query
        const columnsList = columns.join(', ');
        const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
        const values = columns.map(col => row[col]);

        const insertQuery = `
          INSERT INTO public.${tableName} (${columnsList})
          VALUES (${placeholders})
          ON CONFLICT DO NOTHING;
        `;

        await targetClient.query(insertQuery, values);
        successCount++;

        // Progress indicator
        if ((i + 1) % 10 === 0 || i === sourceData.rows.length - 1) {
          process.stdout.write(`\r   Progress: ${i + 1}/${rowCount} rows (${Math.round((i + 1) / rowCount * 100)}%)`);
        }
      } catch (error) {
        errorCount++;
        console.error(`\n   ⚠️  Error inserting row ${i + 1}:`, error.message);
      }
    }

    // Re-enable triggers
    await targetClient.query(`ALTER TABLE public.${tableName} ENABLE TRIGGER ALL;`);

    // Update sequences
    console.log(`\n   🔄 Updating sequences...`);
    const sequenceQuery = `
      SELECT column_name, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_default LIKE 'nextval%';
    `;
    const sequences = await targetClient.query(sequenceQuery, [tableName]);

    for (const seq of sequences.rows) {
      const seqName = seq.column_default.match(/nextval\('(.+?)'/)?.[1];
      if (seqName) {
        await targetClient.query(`
          SELECT setval('${seqName}', COALESCE((SELECT MAX(${seq.column_name}) FROM public.${tableName}), 1));
        `);
      }
    }

    console.log(`\n   ✅ Migrated ${successCount} rows successfully`);
    if (errorCount > 0) {
      console.log(`   ⚠️  ${errorCount} rows failed`);
    }

  } catch (error) {
    console.error(`\n   ❌ Error migrating table '${tableName}':`, error.message);
    throw error;
  }
}

// Run migration
migrate().catch(console.error);
