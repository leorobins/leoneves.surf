import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { brands, products, cartItems } from '../shared/schema';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory path in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize SQLite database
const dbPath = resolve(__dirname, '../sqlite.db');
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite);

// Function to initialize the database schema
export async function initializeDatabase() {
  console.log(`Initializing SQLite database at: ${dbPath}`);
  
  // Create tables if they don't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image TEXT NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT NOT NULL,
      images TEXT DEFAULT '[]',
      videos TEXT DEFAULT '[]',
      brand_id INTEGER NOT NULL,
      size_stock TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      session_id TEXT NOT NULL,
      size TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Database initialized successfully');
} 