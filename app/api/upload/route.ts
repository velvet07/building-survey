/**
 * File Upload API Route
 * Handles local file uploads to Docker volume with thumbnail generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

    // 4. Verify project access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, owner_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user has permission (owner or admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

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

    // 11. Create database record
    const { data: photo, error: dbError } = await supabase
      .from('photos')
      .insert({
        project_id: projectId,
        file_name: file.name,
        file_path: '', // Legacy field (empty for local storage)
        local_file_path: fileName,
        thumbnail_path: thumbnailName,
        file_size: file.size,
        mime_type: file.type,
        width,
        height,
        caption: caption || null,
        description: description || null,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      return NextResponse.json(
        { error: `Failed to save photo metadata: ${dbError.message}` },
        { status: 500 }
      );
    }

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
