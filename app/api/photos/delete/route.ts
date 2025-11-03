/**
 * Photo Delete API Route
 * Handles deletion of local photo files and thumbnails
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Upload directory (Docker volume mount point)
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads';
const THUMBNAIL_DIR = path.join(UPLOAD_DIR, 'thumbnails');

/**
 * POST /api/photos/delete
 * Delete a photo file and its thumbnail from local storage
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { filename, thumbnail } = body;

    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      );
    }

    // 3. Sanitize filename (prevent directory traversal attacks)
    const sanitizedFilename = path.basename(filename);
    const sanitizedThumbnail = thumbnail ? path.basename(thumbnail) : null;

    if (sanitizedFilename !== filename || (thumbnail && sanitizedThumbnail !== thumbnail)) {
      return NextResponse.json(
        { error: 'Invalid filename format' },
        { status: 400 }
      );
    }

    // 4. Verify user has permission to delete this file
    // Extract project_id from filename (format: projectId_timestamp_random.ext)
    const projectId = sanitizedFilename.split('_')[0];

    if (!projectId) {
      return NextResponse.json(
        { error: 'Invalid filename format - cannot extract project ID' },
        { status: 400 }
      );
    }

    // Check if user has delete permission for this project
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';

    if (!isAdmin) {
      // Regular user - check project ownership
      const { data: project } = await supabase
        .from('projects')
        .select('owner_id')
        .eq('id', projectId)
        .single();

      if (!project || project.owner_id !== user.id) {
        return NextResponse.json(
          { error: 'Forbidden - You do not have permission to delete this file' },
          { status: 403 }
        );
      }
    }

    // 5. Delete main file
    const mainFilePath = path.join(UPLOAD_DIR, sanitizedFilename);
    if (existsSync(mainFilePath)) {
      await unlink(mainFilePath);
      console.log(`Deleted file: ${mainFilePath}`);
    } else {
      console.warn(`File not found: ${mainFilePath}`);
    }

    // 6. Delete thumbnail if provided
    if (sanitizedThumbnail) {
      const thumbnailPath = path.join(THUMBNAIL_DIR, sanitizedThumbnail);
      if (existsSync(thumbnailPath)) {
        await unlink(thumbnailPath);
        console.log(`Deleted thumbnail: ${thumbnailPath}`);
      } else {
        console.warn(`Thumbnail not found: ${thumbnailPath}`);
      }
    }

    // 7. Return success response
    return NextResponse.json({
      success: true,
      message: 'Photo files deleted successfully',
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      {
        error: 'Delete failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
