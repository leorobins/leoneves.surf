import { products, brands, cartItems, type Product, type Brand, type CartItem, type InsertProduct, type InsertBrand, type InsertCartItem } from "@shared/schema";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByBrand(brandId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: InsertProduct): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  // Brands
  getBrands(): Promise<Brand[]>;
  getBrand(id: number): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  updateBrand(id: number, brand: InsertBrand): Promise<Brand | undefined>;
  deleteBrand(id: number): Promise<void>;

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
        images: [
          "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111",
          "https://images.unsplash.com/photo-1460353581641-37baddab0fa2",
          "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
        ],
        brandId: 1,
        sizeStock: [
          { size: "38", stock: 10 },
          { size: "39", stock: 15 },
          { size: "40", stock: 20 },
          { size: "41", stock: 25 },
          { size: "42", stock: 5 }
        ]
      },
      {
        name: "Training Jacket",
        description: "Lightweight training jacket",
        price: "89.99",
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea",
        brandId: 1,
        sizeStock: [{size: "S", stock: 0}, {size: "M", stock: 0}, {size: "L", stock: 0}, {size: "XL", stock: 0}]
      },
      {
        name: "Sports Bag",
        description: "Durable sports bag",
        price: "59.99",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
        brandId: 1,
        sizeStock: [{size: "One Size", stock: 100}]
      },
      {
        name: "Performance Shorts",
        description: "High-performance shorts",
        price: "45.99",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",
        brandId: 1,
        sizeStock: [{size: "S", stock: 0}, {size: "M", stock: 0}, {size: "L", stock: 0}, {size: "XL", stock: 0}]
      },

      // Sqhat Products
      {
        name: "Fashion Sneakers",
        description: "Trendy and comfortable sneakers",
        price: "89.99",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        brandId: 2,
        sizeStock: [
          { size: "38", stock: 20 },
          { size: "39", stock: 25 },
          { size: "40", stock: 30 },
          { size: "41", stock: 35 },
          { size: "42", stock: 10 }
        ]
      },
      {
        name: "Designer Hoodie",
        description: "Limited edition hoodie",
        price: "120.00",
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7",
        brandId: 2,
        sizeStock: [{size: "S", stock: 0}, {size: "M", stock: 0}, {size: "L", stock: 0}, {size: "XL", stock: 0}]
      },
      {
        name: "Urban Backpack",
        description: "Stylish urban backpack",
        price: "79.99",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
        brandId: 2,
        sizeStock: [{size: "One Size", stock: 85}]
      },
      {
        name: "Graphic T-Shirt",
        description: "Artist collaboration t-shirt",
        price: "39.99",
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a",
        brandId: 2,
        sizeStock: [{size: "S", stock: 50}, {size: "M", stock: 50}, {size: "L", stock: 50}, {size: "XL", stock: 50}]
      },

      // Uasty Products
      {
        name: "Wireless Headphones",
        description: "High-quality wireless headphones",
        price: "149.99",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        brandId: 3,
        sizeStock: [{size: "One Size", stock: 100}]
      },
      {
        name: "Smart Speaker",
        description: "Voice-controlled speaker",
        price: "199.99",
        image: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc",
        brandId: 3,
        sizeStock: [{size: "One Size", stock: 0}]
      },
      {
        name: "Fitness Tracker",
        description: "Advanced fitness tracking",
        price: "79.99",
        image: "https://images.unsplash.com/photo-1557438159-51eec7a6c9e8",
        brandId: 3,
        sizeStock: [{size: "One Size", stock: 150}]
      },
      {
        name: "Wireless Earbuds",
        description: "Premium wireless earbuds",
        price: "129.99",
        image: "https://images.unsplash.com/photo-1574920162043-b872873f19c8",
        brandId: 3,
        sizeStock: [{size: "One Size", stock: 0}]
      },

      // Sonrobin Products
      {
        name: "Premium Watch",
        description: "Elegant timepiece",
        price: "199.99",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        brandId: 4,
        sizeStock: [{size: "One Size", stock: 50}]
      },
      {
        name: "Gold Bracelet",
        description: "18k gold bracelet",
        price: "299.99",
        image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0",
        brandId: 4,
        sizeStock: [{size: "One Size", stock: 0}]
      },
      {
        name: "Silver Necklace",
        description: "Sterling silver necklace",
        price: "159.99",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
        brandId: 4,
        sizeStock: [{size: "One Size", stock: 75}]
      },
      {
        name: "Diamond Ring",
        description: "Classic diamond ring",
        price: "499.99",
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e",
        brandId: 4,
        sizeStock: [{size: "One Size", stock: 0}]
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

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: InsertProduct): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;

    const updatedProduct: Product = { ...product, id };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    this.products.delete(id);

    // Also remove this product from any cart items
    const cartItemsToDelete = Array.from(this.cartItems.values())
      .filter(item => item.productId === id)
      .map(item => item.id);

    cartItemsToDelete.forEach(cartItemId => {
      this.cartItems.delete(cartItemId);
    });
  }

  // Brand methods
  async getBrands(): Promise<Brand[]> {
    return Array.from(this.brands.values());
  }

  async getBrand(id: number): Promise<Brand | undefined> {
    return this.brands.get(id);
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const id = this.currentBrandId++;
    const newBrand: Brand = { ...brand, id };
    this.brands.set(id, newBrand);
    return newBrand;
  }

  async updateBrand(id: number, brand: InsertBrand): Promise<Brand | undefined> {
    const existingBrand = this.brands.get(id);
    if (!existingBrand) return undefined;

    const updatedBrand: Brand = { ...brand, id };
    this.brands.set(id, updatedBrand);
    return updatedBrand;
  }

  async deleteBrand(id: number): Promise<void> {
    this.brands.delete(id);
    // Also delete associated products
    const productsToDelete = Array.from(this.products.values())
      .filter(product => product.brandId === id)
      .map(product => product.id);

    productsToDelete.forEach(productId => {
      this.products.delete(productId);
    });
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