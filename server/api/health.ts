import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export default function handler(req: Request, res: Response) {
  try {
    // Basic system info
    const systemInfo = {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memory: {
        total: Math.round(os.totalmem() / (1024 * 1024)) + 'MB',
        free: Math.round(os.freemem() / (1024 * 1024)) + 'MB',
      },
      uptime: Math.round(os.uptime()) + 's',
    };

    // Check if uploads directory exists and is writable
    const uploadsPath = path.join(process.cwd(), 'uploads');
    let uploadsStatus = 'unknown';
    try {
      if (fs.existsSync(uploadsPath)) {
        // Try to write a test file
        const testFile = path.join(uploadsPath, '.test-' + Date.now());
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        uploadsStatus = 'writable';
      } else {
        uploadsStatus = 'directory not found';
      }
    } catch (error) {
      uploadsStatus = `error: ${error instanceof Error ? error.message : String(error)}`;
    }

    // Check database connection
    let dbStatus = 'unknown';
    try {
      // This is a placeholder - you would add actual DB connection check here
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = `error: ${error instanceof Error ? error.message : String(error)}`;
    }

    // Check environment variables (redacting sensitive values)
    const envVars = Object.keys(process.env).reduce((acc, key) => {
      if (key.toLowerCase().includes('secret') || key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) {
        acc[key] = '[REDACTED]';
      } else {
        acc[key] = process.env[key];
      }
      return acc;
    }, {} as Record<string, string | undefined>);

    // Return all diagnostic information
    res.status(200).json({
      status: 'ok',
      message: 'API is running',
      timestamp: new Date().toISOString(),
      system: systemInfo,
      storage: {
        uploads: uploadsStatus,
      },
      database: dbStatus,
      environment: envVars,
      nodeVersion: process.version,
      processId: process.pid,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : String(error),
    });
  }
} 