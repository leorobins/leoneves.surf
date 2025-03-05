import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import crypto from 'crypto';

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const existsAsync = promisify(fs.exists);

// Define the upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const VIDEO_DIR = path.join(UPLOAD_DIR, 'videos');

// Ensure upload directories exist
async function ensureDirectoriesExist() {
  if (!await existsAsync(UPLOAD_DIR)) {
    await mkdirAsync(UPLOAD_DIR, { recursive: true });
  }
  if (!await existsAsync(VIDEO_DIR)) {
    await mkdirAsync(VIDEO_DIR, { recursive: true });
  }
}

// Initialize directories on startup
ensureDirectoriesExist().catch(err => {
  console.error('Failed to create upload directories:', err);
});

/**
 * Save a base64 encoded video to the filesystem
 * @param base64Data Base64 encoded video data (can include data URL prefix)
 * @param fileExtension File extension (e.g., 'mp4', 'webm')
 * @returns The relative path to the saved file
 */
export async function saveVideo(base64Data: string, fileExtension: string = 'mp4'): Promise<string> {
  // Remove data URL prefix if present
  const base64Content = base64Data.includes('base64,') 
    ? base64Data.split('base64,')[1] 
    : base64Data;
  
  // Generate a unique filename
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExtension}`;
  const filePath = path.join(VIDEO_DIR, filename);
  
  // Convert base64 to buffer and save to file
  const buffer = Buffer.from(base64Content, 'base64');
  await writeFileAsync(filePath, buffer);
  
  // Return the relative path for storage in the database
  return `/uploads/videos/${filename}`;
}

/**
 * Get the absolute file path from a relative path
 * @param relativePath Relative path stored in the database
 * @returns Absolute file path
 */
export function getAbsoluteFilePath(relativePath: string): string {
  return path.join(process.cwd(), relativePath.replace(/^\//, ''));
} 