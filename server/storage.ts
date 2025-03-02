import { products, brands, cartItems, type Product, type Brand, type CartItem, type InsertProduct, type InsertBrand, type InsertCartItem } from "@shared/schema";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByBrand(brandId: number): Promise<Product[]>;

  // Brands
  getBrands(): Promise<Brand[]>;
  getBrand(id: number): Promise<Brand | undefined>;

  // Cart
  getCartItems(sessionId: string): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private brands: Map<number, Brand>;
  private cartItems: Map<number, CartItem>;
  private currentProductId: number;
  private currentBrandId: number;
  private currentCartItemId: number;

  constructor() {
    this.products = new Map();
    this.brands = new Map();
    this.cartItems = new Map();
    this.currentProductId = 1;
    this.currentBrandId = 1;
    this.currentCartItemId = 1;

    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    // Brands
    const mockBrands: InsertBrand[] = [
      { 
        name: "Byndis", 
        image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111",
        description: "Premium athletic wear and sports equipment"
      },
      { 
        name: "Sqhat", 
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        description: "Innovative fashion and lifestyle products"
      },
      { 
        name: "Uasty", 
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        description: "High-end electronics and accessories"
      },
      { 
        name: "Sonrobin", 
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        description: "Luxury watches and jewelry"
      }
    ];

    mockBrands.forEach(brand => {
      const id = this.currentBrandId++;
      this.brands.set(id, { ...brand, id });
    });

    // Products
    const mockProducts: InsertProduct[] = [
      {
        name: "Premium Watch",
        description: "Elegant timepiece with premium build quality",
        price: "199.99",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        brandId: 4, // Sonrobin
        stock: 50
      },
      {
        name: "Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: "149.99",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        brandId: 3, // Uasty
        stock: 100
      },
      {
        name: "Running Shoes",
        description: "Professional grade running shoes",
        price: "129.99",
        image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111",
        brandId: 1, // Byndis
        stock: 75
      },
      {
        name: "Fashion Sneakers",
        description: "Trendy and comfortable sneakers",
        price: "89.99",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        brandId: 2, // Sqhat
        stock: 150
      }
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

  async getProductsByBrand(brandId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.brandId === brandId
    );
  }

  // Brand methods
  async getBrands(): Promise<Brand[]> {
    return Array.from(this.brands.values());
  }

  async getBrand(id: number): Promise<Brand | undefined> {
    return this.brands.get(id);
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