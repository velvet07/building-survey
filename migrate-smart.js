/**
 * Smart Migration Script
 * Automatically detects columns and handles foreign keys properly
 */

const { Client } = require('pg');

const SUPABASE_URL = 'https://etpchhopecknyhnjgnor.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0cGNoaG9wZWNrbnlobmpnbm9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE1NDc4MCwiZXhwIjoyMDc0NzMwNzgwfQ.vG0oCcjvGJJUgar0Rrph9Y6A5FvFNAaYqN1I-H1eiOo';
const LOCAL_DB = 'postgresql://postgres:x&P7!r!2K!y6^Z9v@postgres:5432/building_survey';

// Order matters for foreign keys!
const TABLES = ['profiles', 'projects', 'drawings', 'photos'];

async function fetchFromSupabase(table) {
    const https = require('https');
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;

    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'apikey': SERVICE_KEY,
                'Authorization': `Bearer ${SERVICE_KEY}`
            }
        };

        https.get(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function getTableColumns(client, table) {
    const result = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = $1
        ORDER BY ordinal_position
    `, [table]);

    return result.rows.map(r => r.column_name);
}

async function migrate() {
    console.log('==================================================');
    console.log('  Smart Data Migration: Supabase → Local PostgreSQL');
    console.log('==================================================\n');

    const client = new Client({ connectionString: LOCAL_DB });

    try {
        console.log('📡 Connecting to local PostgreSQL...');
        await client.connect();
        console.log('✅ Connected\n');

        for (const table of TABLES) {
            console.log(`📦 Migrating table: ${table}`);

            // Get local table columns
            console.log('   🔍 Detecting local table structure...');
            const localColumns = await getTableColumns(client, table);
            console.log(`   📋 Local columns: ${localColumns.join(', ')}`);

            // Fetch from Supabase
            console.log('   📥 Fetching from Supabase...');
            const data = await fetchFromSupabase(table);
            console.log(`   📊 Found ${data.length} rows`);

            if (data.length === 0) {
                console.log('   ℹ️  No data, skipping\n');
                continue;
            }

            // Get Supabase columns from first row
            const supabaseColumns = Object.keys(data[0]);

            // Find matching columns
            const matchingColumns = supabaseColumns.filter(col => localColumns.includes(col));
            console.log(`   ✅ Matching columns: ${matchingColumns.join(', ')}`);

            const skippedColumns = supabaseColumns.filter(col => !localColumns.includes(col));
            if (skippedColumns.length > 0) {
                console.log(`   ⚠️  Skipping columns: ${skippedColumns.join(', ')}`);
            }

            // Disable triggers temporarily to allow direct inserts
            await client.query(`ALTER TABLE public.${table} DISABLE TRIGGER ALL`);

            // Clear existing data
            console.log('   🗑️  Clearing local table...');
            await client.query(`TRUNCATE TABLE public.${table} CASCADE`);

            // Insert data
            console.log('   💾 Inserting data...');
            let success = 0;
            let errors = 0;

            for (let i = 0; i < data.length; i++) {
                const row = data[i];

                // Only use matching columns
                const values = matchingColumns.map(col => row[col]);
                const placeholders = matchingColumns.map((_, idx) => `$${idx + 1}`).join(',');

                try {
                    await client.query(
                        `INSERT INTO public.${table} (${matchingColumns.join(',')}) VALUES (${placeholders})`,
                        values
                    );
                    success++;
                } catch (err) {
                    errors++;
                    if (errors <= 3) {
                        console.log(`   ⚠️  Error on row ${i + 1}: ${err.message}`);
                    }
                }

                if ((i + 1) % 10 === 0 || i === data.length - 1) {
                    process.stdout.write(`\r   Progress: ${i + 1}/${data.length} (${Math.round((i + 1) / data.length * 100)}%)`);
                }
            }

            // Re-enable triggers
            await client.query(`ALTER TABLE public.${table} ENABLE TRIGGER ALL`);

            console.log(`\n   ✅ Imported ${success} rows successfully`);
            if (errors > 0) {
                console.log(`   ⚠️  ${errors} rows failed\n`);
            } else {
                console.log('');
            }
        }

        console.log('✅ Migration completed successfully!\n');
        console.log('🔄 Please restart your application:');
        console.log('   docker-compose restart app\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
