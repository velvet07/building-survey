import { NextResponse } from 'next/server';
import { readFileSync, accessSync, constants } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks = {
    nodejs: false,
    packageJson: false,
    databaseConfig: false,
    filePermissions: false,
    errors: [] as string[],
  };

  try {
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);
    if (majorVersion >= 18) {
      checks.nodejs = true;
    } else {
      checks.errors.push(`Node.js 18+ szükséges. Jelenlegi verzió: ${nodeVersion}`);
    }

    // Check package.json exists
    try {
      const packageJsonPath = join(process.cwd(), 'package.json');
      readFileSync(packageJsonPath, 'utf-8');
      checks.packageJson = true;
    } catch {
      checks.errors.push('package.json fájl nem található');
    }

    // Check file permissions (write access to current directory)
    try {
      const testFile = join(process.cwd(), '.install-test');
      require('fs').writeFileSync(testFile, 'test');
      require('fs').unlinkSync(testFile);
      checks.filePermissions = true;
    } catch {
      checks.errors.push('Nincs írási jogosultság a könyvtárban');
    }

    // Database config check (optional - will be set during installation)
    checks.databaseConfig = true; // Will be checked in test-db endpoint

    return NextResponse.json(checks);
  } catch (error) {
    console.error('Install check error:', error);
    return NextResponse.json(
      { error: 'Hiba történt az ellenőrzés során' },
      { status: 500 }
    );
  }
}

