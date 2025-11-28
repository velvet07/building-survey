import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Érvénytelen JSON formátum a kérésben',
        },
        { status: 400 }
      );
    }
    
    // Log received data for debugging (remove in production)
    console.log('Database test request:', { 
      hasHost: !!body?.host, 
      hasPort: !!body?.port, 
      hasDatabase: !!body?.database, 
      hasName: !!body?.name, 
      hasUsername: !!body?.username, 
      hasPassword: !!body?.password 
    });
    
    // Support both 'database' and 'name' field names (from different components)
    const { host, port, database, name, username, password } = body;
    const dbName = database || name;

    // Validate all required fields
    const missingFields = [];
    if (!host || host.trim() === '') missingFields.push('host');
    if (!port || port.toString().trim() === '') missingFields.push('port');
    if (!dbName || dbName.trim() === '') missingFields.push('database/name');
    if (!username || username.trim() === '') missingFields.push('username');
    if (!password || password.trim() === '') missingFields.push('password');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: `Hiányzó mezők: ${missingFields.join(', ')}. Minden adatbázis mező kitöltése kötelező.`,
          missingFields 
        },
        { status: 400 }
      );
    }

    // Test database connection
    let connection;
    try {
      const portNumber = parseInt(port.toString(), 10);
      if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
        return NextResponse.json(
          {
            success: false,
            error: `Érvénytelen port szám: ${port}. A portnak 1 és 65535 között kell lennie.`,
          },
          { status: 400 }
        );
      }

      console.log('Attempting database connection...', {
        host: host.trim(),
        port: portNumber,
        database: dbName.trim(),
        username: username.trim(),
        hasPassword: !!password,
      });

      // Create connection - this will throw if connection fails
      connection = await mysql.createConnection({
        host: host.trim(),
        port: portNumber,
        user: username.trim(),
        password: password,
        database: dbName.trim(),
        connectTimeout: 10000, // 10 seconds timeout
      });

      console.log('Connection created, testing query...');

      // Test query - this will throw if database doesn't exist or query fails
      const [rows] = await connection.query('SELECT 1 as test');
      console.log('Query successful, result:', rows);

      // Close connection
      await connection.end();
      console.log('Connection closed successfully');

      return NextResponse.json({
        success: true,
        message: 'Adatbázis kapcsolat sikeres',
      }, { status: 200 });
    } catch (error: any) {
      console.error('Database connection error details:', {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
        message: error.message,
        stack: error.stack,
        host,
        port,
        database: dbName,
        username,
      });

      // Try to close connection if it exists
      if (connection) {
        try {
          await connection.end();
        } catch (e) {
          console.error('Error closing connection:', e);
        }
      }

      // Provide more detailed error messages based on MySQL error codes
      let errorMessage = 'Adatbázis kapcsolódási hiba';
      
      // Network/connection errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        errorMessage = 'Nem sikerült csatlakozni az adatbázis szerverhez. Ellenőrizd a hoszt és port beállításokat.';
      } 
      // Authentication errors
      else if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === 'ER_DBACCESS_DENIED_ERROR' || error.errno === 1045) {
        errorMessage = 'Hozzáférés megtagadva. Ellenőrizd a felhasználónevet és jelszót.';
      } 
      // Database doesn't exist
      else if (error.code === 'ER_BAD_DB_ERROR' || error.errno === 1049) {
        errorMessage = `Az adatbázis "${dbName}" nem létezik. Hozd létre az adatbázist a webhosting panelben.`;
      }
      // Connection timeout
      else if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
        errorMessage = 'Kapcsolódási időtúllépés. Ellenőrizd, hogy az adatbázis szerver elérhető-e.';
      }
      // Other MySQL errors
      else if (error.sqlMessage) {
        errorMessage = `Adatbázis hiba: ${error.sqlMessage}`;
      }
      // Generic error message
      else if (error.message) {
        errorMessage = error.message;
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          // Include error code in development mode for debugging
          ...(process.env.NODE_ENV === 'development' && {
            debug: {
              code: error.code,
              errno: error.errno,
              sqlState: error.sqlState,
            },
          }),
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Database test error (outer catch):', error);
    console.error('Error type:', typeof error);
    console.error('Error stack:', error?.stack);
    
    // Provide more detailed error information
    const errorMessage = error?.message || 'Ismeretlen hiba';
    const errorCode = error?.code || 'UNKNOWN_ERROR';
    
    const errorDetails = {
      success: false,
      error: 'Hiba történt az adatbázis tesztelése során',
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          code: errorCode,
          type: typeof error,
          stack: error?.stack,
        },
      }),
    };
    
    return NextResponse.json(
      errorDetails,
      { status: 500 }
    );
  }
}

