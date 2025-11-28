import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { host, port, database, username, password } = await request.json();

    if (!host || !port || !database || !username || !password) {
      return NextResponse.json(
        { error: 'Minden adatbázis mező kitöltése kötelező' },
        { status: 400 }
      );
    }

    // Test database connection
    let connection;
    try {
      connection = await mysql.createConnection({
        host,
        port: parseInt(port, 10),
        user: username,
        password,
        database,
      });

      // Test query
      await connection.query('SELECT 1');

      await connection.end();

      return NextResponse.json({
        success: true,
        message: 'Adatbázis kapcsolat sikeres',
      });
    } catch (error: any) {
      if (connection) {
        await connection.end();
      }

      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Adatbázis kapcsolódási hiba',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { error: 'Hiba történt az adatbázis tesztelése során' },
      { status: 500 }
    );
  }
}

