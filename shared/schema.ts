import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  image: text("image").notNull(),
  description: text("description").notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  image: text("image").notNull(),
  brandId: integer("brand_id").notNull(),
  stock: integer("stock").notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertBrandSchema = createInsertSchema(brands).omit({ id: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true });

export type Product = typeof products.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;