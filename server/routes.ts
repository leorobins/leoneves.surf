import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-provider";
import { insertCartItemSchema, insertCategorySchema, insertProductSchema } from "@shared/schema";
import { z } from "zod";
import { saveVideo } from "./file-storage";

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

  // Get products by category
  app.get("/api/products/category/:categoryId", async (req, res) => {
    const categoryId = parseInt(req.params.categoryId);
    const products = await storage.getProductsByCategory(categoryId);
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      
      // Process videos if they exist
      let videoUrls: string[] = [];
      if (req.body.videos && Array.isArray(req.body.videos)) {
        // Save each video and collect the file paths
        for (const videoData of req.body.videos) {
          if (typeof videoData === 'string' && videoData.startsWith('data:')) {
            // Extract file extension from the data URL
            const fileExtension = videoData.split(';')[0].split('/')[1] || 'mp4';
            const videoUrl = await saveVideo(videoData, fileExtension);
            videoUrls.push(videoUrl);
          }
        }
      }
      
      // Create the product with file paths instead of base64 data
      const productData = {
        ...data,
        videos: videoUrls
      };
      
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data" });
        return;
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Updated product endpoints
  app.patch("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertProductSchema.parse(req.body);
      
      // Get existing product to check for existing videos
      const existingProduct = await storage.getProduct(id);
      if (!existingProduct) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      
      // Process videos if they exist
      let videoUrls: string[] = [];
      if (req.body.videos && Array.isArray(req.body.videos)) {
        for (const videoData of req.body.videos) {
          if (typeof videoData === 'string') {
            // If it's already a URL (from a previous upload), keep it
            if (videoData.startsWith('/uploads/') || videoData.startsWith('http')) {
              videoUrls.push(videoData);
            } 
            // If it's a new video (data URL), save it
            else if (videoData.startsWith('data:')) {
              const fileExtension = videoData.split(';')[0].split('/')[1] || 'mp4';
              const videoUrl = await saveVideo(videoData, fileExtension);
              videoUrls.push(videoUrl);
            }
          }
        }
      }
      
      // Update the product with file paths instead of base64 data
      const productData = {
        ...data,
        videos: videoUrls
      };
      
      const product = await storage.updateProduct(id, productData);
      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      res.json(product);
    } catch (error) {
      console.error('Error updating product:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data" });
        return;
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: "Could not delete product" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get("/api/categories/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    console.log("Fetching category with ID:", id, typeof id);
    const category = await storage.getCategory(id);
    if (!category) {
      console.log("Category not found for ID:", id);
      res.status(404).json({ message: "Category not found" });
      return;
    }
    console.log("Category found:", category.name);
    res.json(category);
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data" });
        return;
      }
      throw error;
    }
  });

  // Added PATCH endpoint for updating categories
  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertCategorySchema.parse(req.body);
      const updatedCategory = await storage.updateCategory(id, data);
      if (!updatedCategory) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data" });
        return;
      }
      throw error;
    }
  });

  // Added DELETE endpoint for categories
  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: "Could not delete category" });
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

  const httpServer = createServer(app);
  return httpServer;
}