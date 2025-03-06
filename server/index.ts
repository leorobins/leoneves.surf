import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { initializeDatabase } from "./db";
import fs from "fs";

// Set up global error handlers
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  // Keep the process running despite the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
  // Keep the process running despite the error
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory at ${uploadsDir}`);
  } catch (error) {
    console.error(`Failed to create uploads directory: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const app = express();
app.use(express.json({ limit: '50mb' }));  // Increase JSON payload limit to 50MB
app.use(express.urlencoded({ extended: false, limit: '50mb' }));  // Also increase URL-encoded limit to 50MB

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Create MemoryStore instance
const MemoryStoreSession = MemoryStore(session);

// Configure session middleware
app.use(
  session({
    cookie: { maxAge: 86400000 }, // 24 hours
    store: new MemoryStoreSession({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET || "amazonclone-secret",
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Add a simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Print environment information
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL ? '[REDACTED]' : 'not set',
  SESSION_SECRET: process.env.SESSION_SECRET ? '[REDACTED]' : 'using default',
  cwd: process.cwd(),
  platform: process.platform,
  nodeVersion: process.version
});

(async () => {
  try {
    // Initialize the database before registering routes
    try {
      await initializeDatabase();
      log('Database initialized successfully');
    } catch (error) {
      log('Error initializing database:', error instanceof Error ? error.message : String(error));
      // Continue despite database error - might be able to recover
    }

    let server;
    try {
      server = await registerRoutes(app);
      log('Routes registered successfully');
    } catch (error) {
      log('Error registering routes:', error instanceof Error ? error.message : String(error));
      throw error; // Can't continue without routes
    }

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error('Express error handler:', err);
      res.status(status).json({ message });
    });

    if (process.env.NODE_ENV === "development") {
      try {
        await setupVite(app, server);
        log('Vite setup successfully');
      } catch (error) {
        log('Error setting up Vite:', error instanceof Error ? error.message : String(error));
        // Continue despite Vite error - might be in production mode
      }
    } else {
      try {
        serveStatic(app);
        log('Static files configured successfully');
      } catch (error) {
        log('Error serving static files:', error instanceof Error ? error.message : String(error));
        // Continue despite static file error - API might still work
      }
    }

    const port = process.env.PORT || 3000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Fatal server error:', error);
    process.exit(1);
  }
})();