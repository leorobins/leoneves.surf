import { products, categories, cartItems, type Product, type Category, type CartItem, type InsertProduct, type InsertCategory, type InsertCartItem } from "@shared/schema";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: InsertProduct): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: InsertCategory): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<void>;

  // For backward compatibility
  getBrands(): Promise<Category[]>;
  getBrand(id: number): Promise<Category | undefined>;
  createBrand(brand: InsertCategory): Promise<Category>;
  updateBrand(id: number, brand: InsertCategory): Promise<Category | undefined>;
  deleteBrand(id: number): Promise<void>;
  getProductsByBrand(brandId: number): Promise<Product[]>;

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

    // Products for each category
    const mockProducts: InsertProduct[] = [
      // Byndis Products
      {
        name: "Running Shoes Pro",
        description: "Professional grade running shoes",
        price: 129.99,
        image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111",
        images: [
          "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111",
          "https://images.unsplash.com/photo-1460353581641-37baddab0fa2",
          "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
        ],
        categoryId: 1,
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
        categoryId: 1,
        sizeStock: [{size: "S", stock: 0}, {size: "M", stock: 0}, {size: "L", stock: 0}, {size: "XL", stock: 0}]
      },
      {
        name: "Sports Bag",
        description: "Durable sports bag",
        price: "59.99",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
        categoryId: 1,
        sizeStock: [{size: "One Size", stock: 100}]
      },
      {
        name: "Performance Shorts",
        description: "High-performance shorts",
        price: "45.99",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",
        categoryId: 1,
        sizeStock: [{size: "S", stock: 0}, {size: "M", stock: 0}, {size: "L", stock: 0}, {size: "XL", stock: 0}]
      },

      // Sqhat Products
      {
        name: "Fashion Sneakers",
        description: "Trendy and comfortable sneakers",
        price: "89.99",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        categoryId: 2,
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
        categoryId: 2,
        sizeStock: [{size: "S", stock: 0}, {size: "M", stock: 0}, {size: "L", stock: 0}, {size: "XL", stock: 0}]
      },
      {
        name: "Urban Backpack",
        description: "Stylish urban backpack",
        price: "79.99",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
        categoryId: 2,
        sizeStock: [{size: "One Size", stock: 85}]
      },
      {
        name: "Graphic T-Shirt",
        description: "Artist collaboration t-shirt",
        price: "39.99",
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a",
        categoryId: 2,
        sizeStock: [{size: "S", stock: 50}, {size: "M", stock: 50}, {size: "L", stock: 50}, {size: "XL", stock: 50}]
      },

      // Uasty Products
      {
        name: "Wireless Headphones",
        description: "High-quality wireless headphones",
        price: "149.99",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        categoryId: 3,
        sizeStock: [{size: "One Size", stock: 100}]
      },
      {
        name: "Smart Speaker",
        description: "Voice-controlled speaker",
        price: "199.99",
        image: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc",
        categoryId: 3,
        sizeStock: [{size: "One Size", stock: 0}]
      },
      {
        name: "Fitness Tracker",
        description: "Advanced fitness tracking",
        price: "79.99",
        image: "https://images.unsplash.com/photo-1557438159-51eec7a6c9e8",
        categoryId: 3,
        sizeStock: [{size: "One Size", stock: 150}]
      },
      {
        name: "Wireless Earbuds",
        description: "Premium wireless earbuds",
        price: "129.99",
        image: "https://images.unsplash.com/photo-1574920162043-b872873f19c8",
        categoryId: 3,
        sizeStock: [{size: "One Size", stock: 0}]
      },

      // Sonrobin Products
      {
        name: "Premium Watch",
        description: "Elegant timepiece",
        price: "199.99",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        categoryId: 4,
        sizeStock: [{size: "One Size", stock: 50}]
      },
      {
        name: "Gold Bracelet",
        description: "18k gold bracelet",
        price: "299.99",
        image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0",
        categoryId: 4,
        sizeStock: [{size: "One Size", stock: 0}]
      },
      {
        name: "Silver Necklace",
        description: "Sterling silver necklace",
        price: "159.99",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
        categoryId: 4,
        sizeStock: [{size: "One Size", stock: 75}]
      },
      {
        name: "Diamond Ring",
        description: "Classic diamond ring",
        price: "499.99",
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e",
        categoryId: 4,
        sizeStock: [{size: "One Size", stock: 0}]
      }
    ];

    mockCategories.forEach(category => {
      const id = this.currentCategoryId++;
      this.categories.set(id, { ...category, id });
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

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.categoryId === categoryId
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

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, category: InsertCategory): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) return undefined;

    const updatedCategory: Category = { ...category, id };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    this.categories.delete(id);
    // Also delete associated products
    const productsToDelete = Array.from(this.products.values())
      .filter(product => product.categoryId === id)
      .map(product => product.id);

    productsToDelete.forEach(productId => {
      this.products.delete(productId);
    });
  }

  // For backward compatibility
  async getBrands(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getBrand(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createBrand(brand: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const newBrand: Category = { ...brand, id };
    this.categories.set(id, newBrand);
    return newBrand;
  }

  async updateBrand(id: number, brand: InsertCategory): Promise<Category | undefined> {
    const existingBrand = this.categories.get(id);
    if (!existingBrand) return undefined;

    const updatedBrand: Category = { ...brand, id };
    this.categories.set(id, updatedBrand);
    return updatedBrand;
  }

  async deleteBrand(id: number): Promise<void> {
    this.categories.delete(id);
    // Also delete associated products
    const productsToDelete = Array.from(this.products.values())
      .filter(product => product.categoryId === id)
      .map(product => product.id);

    productsToDelete.forEach(productId => {
      this.products.delete(productId);
    });
  }

  // For backward compatibility
  async getProductsByBrand(brandId: number): Promise<Product[]> {
    return this.getProductsByCategory(brandId);
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

// Export an instance of MemStorage for backward compatibility
export const memStorage = new MemStorage();