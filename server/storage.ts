import { products, categories, cartItems, type Product, type Category, type CartItem, type InsertProduct, type InsertCategory, type InsertCartItem } from "@shared/schema";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  
  // Cart
  getCartItems(sessionId: string): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private cartItems: Map<number, CartItem>;
  private currentProductId: number;
  private currentCategoryId: number;
  private currentCartItemId: number;

  constructor() {
    this.products = new Map();
    this.categories = new Map();
    this.cartItems = new Map();
    this.currentProductId = 1;
    this.currentCategoryId = 1;
    this.currentCartItemId = 1;

    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    // Categories
    const mockCategories: InsertCategory[] = [
      { name: "Electronics", image: "https://images.unsplash.com/photo-1558770147-a0e2842c5ea1" },
      { name: "Fashion", image: "https://images.unsplash.com/photo-1558770147-68c0607adb26" },
      { name: "Home", image: "https://images.unsplash.com/photo-1558770147-d2a384e1ad85" },
      { name: "Sports", image: "https://images.unsplash.com/photo-1524871729950-c4e886edc1f9" },
      { name: "Books", image: "https://images.unsplash.com/photo-1621777106818-aa0303a2adc7" },
      { name: "Beauty", image: "https://images.unsplash.com/photo-1598845210582-699090239180" }
    ];

    mockCategories.forEach(category => {
      const id = this.currentCategoryId++;
      this.categories.set(id, { ...category, id });
    });

    // Products
    const mockProducts: InsertProduct[] = [
      {
        name: "Premium Watch",
        description: "Elegant timepiece with premium build quality",
        price: "199.99",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        categoryId: 1,
        stock: 50
      },
      {
        name: "Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: "149.99",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        categoryId: 1,
        stock: 100
      },
      // Add more mock products...
    ];

    mockProducts.forEach(product => {
      const id = this.currentProductId++;
      this.products.set(id, { ...product, id });
    });
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.categoryId === categoryId
    );
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  // Cart methods
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      item => item.sessionId === sessionId
    );
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const id = this.currentCartItemId++;
    const cartItem: CartItem = {
      ...item,
      id,
      createdAt: new Date()
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;
    
    const updated = { ...item, quantity };
    this.cartItems.set(id, updated);
    return updated;
  }

  async removeFromCart(id: number): Promise<void> {
    this.cartItems.delete(id);
  }
}

export const storage = new MemStorage();
