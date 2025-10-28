/**
 * File Upload API Route
 * Handles local file uploads to Docker volume with thumbnail generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { query } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

// Upload directory (Docker volume mount point)
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads';
const THUMBNAIL_DIR = path.join(UPLOAD_DIR, 'thumbnails');

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * POST /api/upload
 * Upload a photo to local storage
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

    // 2. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const projectId = formData.get('project_id') as string | null;
    const caption = formData.get('caption') as string | null;
    const description = formData.get('description') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: 'No project_id provided' },
        { status: 400 }
      );
    }

    // 3. Validate file
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // 4. Verify project access (LOCAL POSTGRESQL)
    const projectResult = await query(
      'SELECT id, owner_id FROM public.projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const project = projectResult.rows[0];

    // Check if user has permission (owner or admin) (LOCAL POSTGRESQL)
    const profileResult = await query(
      'SELECT role FROM public.profiles WHERE id = $1',
      [user.id]
    );

    const profile = profileResult.rows[0];
    const isAdmin = profile?.role === 'admin';
    const isOwner = project.owner_id === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have permission to upload to this project' },
        { status: 403 }
      );
    }

    // 5. Ensure upload directories exist
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }
    if (!existsSync(THUMBNAIL_DIR)) {
      await mkdir(THUMBNAIL_DIR, { recursive: true });
    }

    // 6. Generate unique filename
    const fileExt = path.extname(file.name);
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileName = `${projectId}_${timestamp}_${randomStr}${fileExt}`;
    const thumbnailName = `${projectId}_${timestamp}_${randomStr}_thumb${fileExt}`;

    const filePath = path.join(UPLOAD_DIR, fileName);
    const thumbnailPath = path.join(THUMBNAIL_DIR, thumbnailName);

    // 7. Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 8. Get image dimensions
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // 9. Save original file
    await writeFile(filePath, buffer);

    // 10. Generate thumbnail (max 400x400, preserve aspect ratio)
    await sharp(buffer)
      .resize(400, 400, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFile(thumbnailPath);

    // 11. Create database record (LOCAL POSTGRESQL)
    const photoResult = await query(
      `INSERT INTO public.photos (
        project_id, file_name, file_path, local_file_path, thumbnail_path,
        file_size, mime_type, width, height, caption, description, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        projectId,
        file.name,
        '', // Legacy field (empty for local storage)
        fileName,
        thumbnailName,
        file.size,
        file.type,
        width,
        height,
        caption || null,
        description || null,
        user.id,
      ]
    );

    if (photoResult.rows.length === 0) {
      console.error('Database insert error: No rows returned');
      return NextResponse.json(
        { error: 'Failed to save photo metadata' },
        { status: 500 }
      );
    }

    const photo = photoResult.rows[0];

    // 12. Return success response
    return NextResponse.json({
      success: true,
      photo,
      message: 'Photo uploaded successfully',
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload
 * Get upload configuration
 */
export async function GET() {
  return NextResponse.json({
    maxFileSize: MAX_FILE_SIZE,
    allowedTypes: ALLOWED_MIME_TYPES,
    uploadDir: UPLOAD_DIR,
  });
}
