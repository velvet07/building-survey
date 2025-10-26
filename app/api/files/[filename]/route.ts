/**
 * File Serving API Route
 * Serves uploaded photos and thumbnails from local storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Upload directory (Docker volume mount point)
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads';
const THUMBNAIL_DIR = path.join(UPLOAD_DIR, 'thumbnails');

/**
 * GET /api/files/[filename]
 * Serve a file from local storage
 * Query params:
 *   - thumbnail=true: Serve thumbnail instead of original
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    const searchParams = request.nextUrl.searchParams;
    const isThumbnail = searchParams.get('thumbnail') === 'true';

    // 1. Authentication check
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // 2. Sanitize filename (prevent directory traversal attacks)
    const sanitizedFilename = path.basename(filename);
    if (sanitizedFilename !== filename) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    // 3. Determine file path
    const filePath = isThumbnail
      ? path.join(THUMBNAIL_DIR, sanitizedFilename)
      : path.join(UPLOAD_DIR, sanitizedFilename);

    // 4. Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // 5. Verify user has access to this file
    // Extract project_id from filename (format: projectId_timestamp_random.ext)
    const projectId = sanitizedFilename.split('_')[0];

    if (!projectId) {
      return NextResponse.json(
        { error: 'Invalid filename format' },
        { status: 400 }
      );
    }

    // Check if user has access to the project
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    const isViewer = profile?.role === 'viewer';

    // Admin and Viewer can access all files
    if (!isAdmin && !isViewer) {
      // Regular user - check project ownership
      const { data: project } = await supabase
        .from('projects')
        .select('owner_id')
        .eq('id', projectId)
        .single();

      if (!project || project.owner_id !== user.id) {
        return NextResponse.json(
          { error: 'Forbidden - You do not have access to this file' },
          { status: 403 }
        );
      }
    }

    // 6. Read file
    const fileBuffer = await readFile(filePath);

    // 7. Determine MIME type from extension
    const ext = path.extname(sanitizedFilename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };
    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    // 8. Return file with appropriate headers
    // Convert Buffer to Uint8Array for NextResponse compatibility
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${sanitizedFilename}"`,
      },
    });

  } catch (error) {
    console.error('File serving error:', error);
    return NextResponse.json(
      {
        error: 'Failed to serve file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * HEAD /api/files/[filename]
 * Check if file exists (for quick checks without downloading)
 */
export async function HEAD(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    const searchParams = request.nextUrl.searchParams;
    const isThumbnail = searchParams.get('thumbnail') === 'true';

    // Sanitize filename
    const sanitizedFilename = path.basename(filename);
    if (sanitizedFilename !== filename) {
      return new NextResponse(null, { status: 400 });
    }

    // Determine file path
    const filePath = isThumbnail
      ? path.join(THUMBNAIL_DIR, sanitizedFilename)
      : path.join(UPLOAD_DIR, sanitizedFilename);

    // Check if file exists
    if (existsSync(filePath)) {
      return new NextResponse(null, { status: 200 });
    } else {
      return new NextResponse(null, { status: 404 });
    }
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
