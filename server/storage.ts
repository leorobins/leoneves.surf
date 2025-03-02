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

    // Products for each brand
    const mockProducts: InsertProduct[] = [
      // Byndis Products
      {
        name: "Running Shoes Pro",
        description: "Professional grade running shoes",
        price: "129.99",
        image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111",
        brandId: 1,
        stock: 75
      },
      {
        name: "Training Jacket",
        description: "Lightweight training jacket",
        price: "89.99",
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea",
        brandId: 1,
        stock: 0 // Sold out
      },
      {
        name: "Sports Bag",
        description: "Durable sports bag",
        price: "59.99",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
        brandId: 1,
        stock: 100
      },
      {
        name: "Performance Shorts",
        description: "High-performance shorts",
        price: "45.99",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",
        brandId: 1,
        stock: 0 // Sold out
      },

      // Sqhat Products
      {
        name: "Fashion Sneakers",
        description: "Trendy and comfortable sneakers",
        price: "89.99",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        brandId: 2,
        stock: 150
      },
      {
        name: "Designer Hoodie",
        description: "Limited edition hoodie",
        price: "120.00",
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7",
        brandId: 2,
        stock: 0 // Sold out
      },
      {
        name: "Urban Backpack",
        description: "Stylish urban backpack",
        price: "79.99",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
        brandId: 2,
        stock: 85
      },
      {
        name: "Graphic T-Shirt",
        description: "Artist collaboration t-shirt",
        price: "39.99",
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a",
        brandId: 2,
        stock: 200
      },

      // Uasty Products
      {
        name: "Wireless Headphones",
        description: "High-quality wireless headphones",
        price: "149.99",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        brandId: 3,
        stock: 100
      },
      {
        name: "Smart Speaker",
        description: "Voice-controlled speaker",
        price: "199.99",
        image: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc",
        brandId: 3,
        stock: 0 // Sold out
      },
      {
        name: "Fitness Tracker",
        description: "Advanced fitness tracking",
        price: "79.99",
        image: "https://images.unsplash.com/photo-1557438159-51eec7a6c9e8",
        brandId: 3,
        stock: 150
      },
      {
        name: "Wireless Earbuds",
        description: "Premium wireless earbuds",
        price: "129.99",
        image: "https://images.unsplash.com/photo-1574920162043-b872873f19c8",
        brandId: 3,
        stock: 0 // Sold out
      },

      // Sonrobin Products
      {
        name: "Premium Watch",
        description: "Elegant timepiece",
        price: "199.99",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        brandId: 4,
        stock: 50
      },
      {
        name: "Gold Bracelet",
        description: "18k gold bracelet",
        price: "299.99",
        image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0",
        brandId: 4,
        stock: 0 // Sold out
      },
      {
        name: "Silver Necklace",
        description: "Sterling silver necklace",
        price: "159.99",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
        brandId: 4,
        stock: 75
      },
      {
        name: "Diamond Ring",
        description: "Classic diamond ring",
        price: "499.99",
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e",
        brandId: 4,
        stock: 0 // Sold out
      }
    ];

    mockBrands.forEach(brand => {
      const id = this.currentBrandId++;
      this.brands.set(id, { ...brand, id });
    });

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