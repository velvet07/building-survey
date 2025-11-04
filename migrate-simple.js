/**
 * Simple Migration Script using Supabase REST API
 * No additional dependencies needed - uses built-in fetch and pg
 */

const { Client } = require('pg');

const SUPABASE_URL = 'https://etpchhopecknyhnjgnor.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0cGNoaG9wZWNrbnlobmpnbm9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE1NDc4MCwiZXhwIjoyMDc0NzMwNzgwfQ.vG0oCcjvGJJUgar0Rrph9Y6A5FvFNAaYqN1I-H1eiOo';
const LOCAL_DB = 'postgresql://postgres:x&P7!r!2K!y6^Z9v@postgres:5432/building_survey';

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

async function migrate() {
    console.log('==================================================');
    console.log('  Data Migration: Supabase → Local PostgreSQL');
    console.log('==================================================\n');

    const client = new Client({ connectionString: LOCAL_DB });

    try {
        console.log('📡 Connecting to local PostgreSQL...');
        await client.connect();
        console.log('✅ Connected\n');

        for (const table of TABLES) {
            console.log(`📦 Migrating table: ${table}`);

            // Fetch from Supabase
            console.log('   📥 Fetching from Supabase...');
            const data = await fetchFromSupabase(table);
            console.log(`   📊 Found ${data.length} rows`);

            if (data.length === 0) {
                console.log('   ℹ️  No data, skipping\n');
                continue;
            }

            // Clear existing data
            console.log('   🗑️  Clearing local table...');
            await client.query(`TRUNCATE TABLE public.${table} CASCADE`);

            // Insert data
            console.log('   💾 Inserting data...');
            let success = 0;
            let errors = 0;

            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                const columns = Object.keys(row);
                const values = Object.values(row);
                const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(',');

                try {
                    await client.query(
                        `INSERT INTO public.${table} (${columns.join(',')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
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

            console.log(`\n   ✅ Imported ${success} rows successfully`);
            if (errors > 0) {
                console.log(`   ⚠️  ${errors} rows failed\n`);
            } else {
                console.log('');
            }
        }

        console.log('✅ Migration completed successfully!\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
