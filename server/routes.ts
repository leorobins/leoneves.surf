import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCartItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Products
  app.get("/api/products", async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await storage.getProduct(id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.json(product);
  });

  app.get("/api/products/category/:categoryId", async (req, res) => {
    const categoryId = parseInt(req.params.categoryId);
    const products = await storage.getProductsByCategory(categoryId);
    res.json(products);
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // Cart
  app.get("/api/cart", async (req, res) => {
    const sessionId = req.session.id;
    const items = await storage.getCartItems(sessionId);
    res.json(items);
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const data = insertCartItemSchema.parse({ ...req.body, sessionId });
      const item = await storage.addToCart(data);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data" });
        return;
      }
      throw error;
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const quantity = parseInt(req.body.quantity);
    
    if (isNaN(quantity) || quantity < 1) {
      res.status(400).json({ message: "Invalid quantity" });
      return;
    }

    const updated = await storage.updateCartItem(id, quantity);
    if (!updated) {
      res.status(404).json({ message: "Cart item not found" });
      return;
    }
    res.json(updated);
  });

  app.delete("/api/cart/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.removeFromCart(id);
    res.status(204).send();
  });

  const httpServer = createServer(app);
  return httpServer;
}
