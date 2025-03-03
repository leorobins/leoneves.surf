import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCartItemSchema, insertBrandSchema, insertProductSchema } from "@shared/schema";
import { z } from "zod";
import { syncStoreData } from './services/sheets';

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

  app.get("/api/products/brand/:brandId", async (req, res) => {
    const brandId = parseInt(req.params.brandId);
    const products = await storage.getProductsByBrand(brandId);
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);

      // Automatically sync with Google Sheets after creating a new product
      try {
        const brands = await storage.getBrands();
        const products = await storage.getProducts();
        await syncStoreData(brands, products);
        console.log('Successfully synced after creating product');
      } catch (syncError) {
        console.error('Failed to sync after creating product:', syncError);
        // Continue even if sync fails
      }

      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data" });
        return;
      }
      throw error;
    }
  });

  // Brands
  app.get("/api/brands", async (req, res) => {
    const brands = await storage.getBrands();
    res.json(brands);
  });

  app.get("/api/brands/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const brand = await storage.getBrand(id);
    if (!brand) {
      res.status(404).json({ message: "Brand not found" });
      return;
    }
    res.json(brand);
  });

  app.post("/api/brands", async (req, res) => {
    try {
      const data = insertBrandSchema.parse(req.body);
      const brand = await storage.createBrand(data);

      // Automatically sync with Google Sheets after creating a new brand
      try {
        const brands = await storage.getBrands();
        const products = await storage.getProducts();
        await syncStoreData(brands, products);
        console.log('Successfully synced after creating brand');
      } catch (syncError) {
        console.error('Failed to sync after creating brand:', syncError);
        // Continue even if sync fails
      }

      res.json(brand);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data" });
        return;
      }
      throw error;
    }
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

  // Manual sync endpoint
  app.post("/api/sync-sheets", async (req, res) => {
    try {
      console.log('Starting manual Google Sheets sync...');
      const brands = await storage.getBrands();
      const products = await storage.getProducts();

      await syncStoreData(brands, products);

      res.json({
        success: true,
        message: "Data synced successfully",
        details: {
          brandsCount: brands.length,
          productsCount: products.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in sync-sheets endpoint:', error);

      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error occurred while syncing data";

      res.status(500).json({
        success: false,
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}