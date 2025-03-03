import { pgTable, text, serial, integer, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  image: text("image").notNull(),
  description: text("description").notNull(),
});

// Define size stock type
export type SizeStock = {
  size: string;
  stock: number;
};

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  image: text("image").notNull(),
  images: text("images").array().default([]),
  brandId: integer("brand_id").notNull(),
  sizeStock: jsonb("size_stock").$type<SizeStock[]>().default([]),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  sessionId: text("session_id").notNull(),
  size: text("size").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Update the schemas with the new sizeStock field
const sizeStockSchema = z.object({
  size: z.string(),
  stock: z.number().int().min(0),
});

export const insertProductSchema = createInsertSchema(products).extend({
  sizeStock: z.array(sizeStockSchema).default([]),
}).omit({ id: true });

export const insertBrandSchema = createInsertSchema(brands).omit({ id: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true });

export type Product = typeof products.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;