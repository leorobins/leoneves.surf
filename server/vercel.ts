import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import path from "path";
import { initializeDatabase } from "./db";

// Create Express app
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Create MemoryStore instance
const MemoryStoreSession = MemoryStore(session);

// Configure session middleware
app.use(
  session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStoreSession({
      checkPeriod: 86400000,
    }),
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET || "amazonclone-secret",
  })
);

// Initialize database
let isDbInitialized = false;
const initDb = async () => {
  if (!isDbInitialized) {
    try {
      await initializeDatabase();
      console.log('Database initialized successfully');
      isDbInitialized = true;
    } catch (error) {
      console.error('Error initializing database:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
};

// Register routes
let isRoutesRegistered = false;
const setupRoutes = async () => {
  if (!isRoutesRegistered) {
    await registerRoutes(app);
    isRoutesRegistered = true;
  }
};

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Handler for Vercel
const handler = async (req: Request, res: Response) => {
  try {
    // Initialize DB if not already done
    await initDb();
    
    // Setup routes if not already done
    await setupRoutes();
    
    // Process the request
    return app(req, res);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export default handler; 