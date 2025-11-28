import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import mysql from 'mysql2/promise';
import { hashPassword } from '@/lib/auth/local';
import modulesConfig from '@/config/modules.json';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Helper function to execute SQL schema with DELIMITER support
async function executeSchema(connection: any, schema: string) {
  // Check if schema contains DELIMITER
  if (schema.includes('DELIMITER')) {
    // Handle DELIMITER for MySQL stored procedures/triggers
    const parts = schema.split('DELIMITER');
    for (let i = 1; i < parts.length; i += 2) {
      const delimiter = parts[i].trim().split('\n')[0];
      const content = parts[i].substring(parts[i].indexOf('\n')).trim();
      const statements = content.split(delimiter);
      for (const statement of statements) {
        const trimmed = statement.trim();
        if (trimmed && !trimmed.startsWith('--')) {
          await connection.query(trimmed);
        }
      }
    }
  } else {
    // Normal SQL without DELIMITER
    // Remove comment lines before splitting
    const cleanedSchema = schema
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 0 && !trimmed.startsWith('--');
      })
      .join('\n');

    const statements = cleanedSchema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      database,
      modules,
      adminEmail,
      adminPassword,
      adminFullName,
    } = await request.json();

    // Validate inputs
    if (!database || !modules || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Minden kötelező mező kitöltése szükséges' },
        { status: 400 }
      );
    }

    const { host, port, database: dbName, username, password } = database;

    // Connect to database
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port, 10),
      user: username,
      password,
      database: dbName,
    });

    try {
      // Install schemas for selected modules
      const selectedModules = Object.keys(modules).filter(
        (key) => modules[key] === true
      );

      // Always install core schemas first
      const coreSchemas = [
        '01-users.sql',
        '02-profiles.sql',
        '03-projects.sql',
        '04-modules.sql',
      ];

      for (const schemaFile of coreSchemas) {
        const schemaPath = join(
          process.cwd(),
          'database',
          'mysql',
          'schema',
          schemaFile
        );
        const schema = readFileSync(schemaPath, 'utf-8');
        await executeSchema(connection, schema);
      }

      // Create core functions and triggers
      try {
        // Function: Generate project identifier
        await connection.query(`DROP PROCEDURE IF EXISTS generate_project_identifier`);
        await connection.query(`
          CREATE PROCEDURE generate_project_identifier(OUT new_identifier VARCHAR(50))
          BEGIN
            DECLARE today_date VARCHAR(8);
            DECLARE today_count INT;

            SET today_date = DATE_FORMAT(CURRENT_DATE, '%Y%m%d');

            SELECT COUNT(*) INTO today_count
            FROM projects
            WHERE auto_identifier LIKE CONCAT('PROJ-', today_date, '-%');

            SET today_count = today_count + 1;
            SET new_identifier = CONCAT('PROJ-', today_date, '-', LPAD(today_count, 3, '0'));
          END
        `);

        // Trigger: Auto-generate project identifier
        await connection.query(`DROP TRIGGER IF EXISTS trigger_set_project_auto_identifier`);
        await connection.query(`
          CREATE TRIGGER trigger_set_project_auto_identifier
          BEFORE INSERT ON projects
          FOR EACH ROW
          BEGIN
            IF NEW.auto_identifier IS NULL OR NEW.auto_identifier = '' THEN
              CALL generate_project_identifier(NEW.auto_identifier);
            END IF;

            IF NEW.id IS NULL OR NEW.id = '' THEN
              SET NEW.id = UUID();
            END IF;
          END
        `);

        // Trigger: Auto-generate UUIDs for core tables
        await connection.query(`DROP TRIGGER IF EXISTS trigger_generate_user_id`);
        await connection.query(`
          CREATE TRIGGER trigger_generate_user_id
          BEFORE INSERT ON users
          FOR EACH ROW
          BEGIN
            IF NEW.id IS NULL OR NEW.id = '' THEN
              SET NEW.id = UUID();
            END IF;
          END
        `);

        await connection.query(`DROP TRIGGER IF EXISTS trigger_generate_session_id`);
        await connection.query(`
          CREATE TRIGGER trigger_generate_session_id
          BEFORE INSERT ON sessions
          FOR EACH ROW
          BEGIN
            IF NEW.id IS NULL OR NEW.id = '' THEN
              SET NEW.id = UUID();
            END IF;
          END
        `);

        await connection.query(`DROP TRIGGER IF EXISTS trigger_generate_module_id`);
        await connection.query(`
          CREATE TRIGGER trigger_generate_module_id
          BEFORE INSERT ON modules
          FOR EACH ROW
          BEGIN
            IF NEW.id IS NULL OR NEW.id = '' THEN
              SET NEW.id = UUID();
            END IF;
          END
        `);

        await connection.query(`DROP TRIGGER IF EXISTS trigger_generate_activation_id`);
        await connection.query(`
          CREATE TRIGGER trigger_generate_activation_id
          BEFORE INSERT ON user_module_activations
          FOR EACH ROW
          BEGIN
            IF NEW.id IS NULL OR NEW.id = '' THEN
              SET NEW.id = UUID();
            END IF;
          END
        `);

        await connection.query(`DROP TRIGGER IF EXISTS trigger_generate_installed_module_id`);
        await connection.query(`
          CREATE TRIGGER trigger_generate_installed_module_id
          BEFORE INSERT ON installed_modules
          FOR EACH ROW
          BEGIN
            IF NEW.id IS NULL OR NEW.id = '' THEN
              SET NEW.id = UUID();
            END IF;
          END
        `);

        await connection.query(`DROP TRIGGER IF EXISTS trigger_generate_form_response_id`);
        await connection.query(`
          CREATE TRIGGER trigger_generate_form_response_id
          BEFORE INSERT ON project_form_responses
          FOR EACH ROW
          BEGIN
            IF NEW.id IS NULL OR NEW.id = '' THEN
              SET NEW.id = UUID();
            END IF;
          END
        `);

        // Trigger: Auto-create profile on user creation
        await connection.query(`DROP TRIGGER IF EXISTS trigger_create_profile_on_user`);
        await connection.query(`
          CREATE TRIGGER trigger_create_profile_on_user
          AFTER INSERT ON users
          FOR EACH ROW
          BEGIN
            INSERT INTO profiles (id, email, role)
            VALUES (NEW.id, NEW.email, 'user')
            ON DUPLICATE KEY UPDATE email = NEW.email;
          END
        `);
      } catch (coreTriggersError: any) {
        console.log(`Core triggers warning: ${coreTriggersError.message}`);
      }

      // Install selected module schemas
      for (const moduleKey of selectedModules) {
        const module = (modulesConfig as any)[moduleKey];
        if (module?.schema) {
          const schemaPath = join(process.cwd(), module.schema);
          if (existsSync(schemaPath)) {
            const schema = readFileSync(schemaPath, 'utf-8');
            await executeSchema(connection, schema);

            // Mark module as installed
            await connection.query(
              'INSERT INTO installed_modules (id, module_slug) VALUES (UUID(), ?)',
              [moduleKey]
            );

            // Create triggers for modules (ignore errors if trigger already exists)
            if (moduleKey === 'photos') {
              try {
                await connection.query(`DROP TRIGGER IF EXISTS trigger_generate_photo_id`);
                await connection.query(`
                  CREATE TRIGGER trigger_generate_photo_id
                  BEFORE INSERT ON photos
                  FOR EACH ROW
                  BEGIN
                    IF NEW.id IS NULL OR NEW.id = '' THEN
                      SET NEW.id = UUID();
                    END IF;
                  END
                `);
              } catch (triggerError: any) {
                // Ignore trigger creation errors (trigger may already exist)
                console.log(`Photos trigger warning: ${triggerError.message}`);
              }
            }

            if (moduleKey === 'drawings') {
              try {
                await connection.query(`DROP TRIGGER IF EXISTS trigger_generate_drawing_id`);
                await connection.query(`
                  CREATE TRIGGER trigger_generate_drawing_id
                  BEFORE INSERT ON drawings
                  FOR EACH ROW
                  BEGIN
                    IF NEW.id IS NULL OR NEW.id = '' THEN
                      SET NEW.id = UUID();
                    END IF;
                  END
                `);
              } catch (triggerError: any) {
                console.log(`Drawing ID trigger warning: ${triggerError.message}`);
              }

              try {
                await connection.query(`DROP TRIGGER IF EXISTS auto_name_drawing`);
                await connection.query(`
                  CREATE TRIGGER auto_name_drawing
                  BEFORE INSERT ON drawings
                  FOR EACH ROW
                  BEGIN
                    DECLARE drawing_count INT;

                    IF NEW.name = 'Alaprajz' THEN
                      SELECT COUNT(*) INTO drawing_count
                      FROM drawings
                      WHERE project_id = NEW.project_id AND deleted_at IS NULL;

                      IF drawing_count = 0 THEN
                        SET NEW.name = 'Alaprajz';
                      ELSE
                        SET NEW.name = CONCAT('Alaprajz ', drawing_count + 1);
                      END IF;
                    END IF;
                  END
                `);
              } catch (triggerError: any) {
                console.log(`Auto name trigger warning: ${triggerError.message}`);
              }
            }
          }
        }
      }

      // Note: Functions and triggers are now created programmatically above
      // 08-functions.sql is kept for documentation purposes only

      // Install seed data (09-seed.sql)
      const seedPath = join(
        process.cwd(),
        'database',
        'mysql',
        'schema',
        '09-seed.sql'
      );
      if (existsSync(seedPath)) {
        const seed = readFileSync(seedPath, 'utf-8');
        await executeSchema(connection, seed);
      }

      // Create admin user (using installer's own connection, not lib/db which doesn't have .env yet)
      const adminUserId = crypto.randomUUID();
      const passwordHash = await hashPassword(adminPassword);

      await connection.query(
        'INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
        [adminUserId, adminEmail, passwordHash, adminFullName || null]
      );

      // Profile is created automatically by trigger_create_profile_on_user
      // Now set admin role
      await connection.query(
        'UPDATE profiles SET role = ? WHERE id = ?',
        ['admin', adminUserId]
      );

      // Generate .env file
      const envContent = `# Database
DB_HOST=${host}
DB_PORT=${port}
DB_NAME=${dbName}
DB_USER=${username}
DB_PASSWORD=${password}

# Database URL
DATABASE_URL=mysql://${username}:${password}@${host}:${port}/${dbName}

# App
NEXT_PUBLIC_APP_URL=${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
NODE_ENV=production

# Session
SESSION_SECRET=${crypto.randomBytes(32).toString('hex')}

# File Upload
UPLOAD_DIR=./uploads
`;

      writeFileSync(join(process.cwd(), '.env'), envContent);

      // Create install lock file
      writeFileSync(
        join(process.cwd(), 'app', 'install', 'INSTALL_LOCK'),
        new Date().toISOString()
      );

      await connection.end();

      return NextResponse.json({
        success: true,
        message: 'Telepítés sikeresen befejezve',
      });
    } catch (error: any) {
      await connection.end();
      throw error;
    }
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Hiba történt a telepítés során',
      },
      { status: 500 }
    );
  }
}

