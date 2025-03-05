import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Renamed to categories but keeping the table name as "brands" for database compatibility
export const categories = sqliteTable("brands", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  image: text("image").notNull(),
  description: text("description").notNull(),
});

// Define size stock type
export type SizeStock = {
  size: string;
  stock: number;
};

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  image: text("image").notNull(),
  images: text("images", { mode: "json" }).default("[]"),
  videos: text("videos", { mode: "json" }).default("[]"),
  categoryId: integer("category_id").notNull(),
  sizeStock: text("size_stock", { mode: "json" }).default("[]"),
});

export const cartItems = sqliteTable("cart_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  sessionId: text("session_id").notNull(),
  size: text("size").notNull(),
  createdAt: text("created_at").default(String(new Date().toISOString())),
});

// Update the schemas with the new sizeStock field
const sizeStockSchema = z.object({
  size: z.string(),
  stock: z.number().int().min(0),
});

export const insertProductSchema = createInsertSchema(products).extend({
  sizeStock: z.array(sizeStockSchema).default([]),
  images: z.array(z.string()).nullable().default([]),
  videos: z.array(z.string()).nullable().default([]),
  price: z.coerce.number(),
}).omit({ id: true });

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true });

export type Product = typeof products.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

// For backward compatibility
export const brands = categories;
export type Brand = Category;
export type InsertBrand = InsertCategory;
export const insertBrandSchema = insertCategorySchema;