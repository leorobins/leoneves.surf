import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Brand, type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewBrandDialog } from "@/components/store/new-brand-dialog";
import { EditBrandDialog } from "@/components/store/edit-brand-dialog";
import { DeleteBrandDialog } from "@/components/store/delete-brand-dialog";
import { NewProductDialog } from "@/components/store/new-product-dialog";
import { EditProductDialog } from "@/components/store/edit-product-dialog";
import { DeleteProductDialog } from "@/components/store/delete-product-dialog";
import { AuthGuard } from "@/components/auth-guard";
import { useLocation } from "wouter";
import { ThemeForcer } from "@/components/ThemeForcer";

export default function StorePage() {
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [, setLocation] = useLocation();

  const categories = useQuery<Brand[]>({
    queryKey: ["/api/categories"]
  });

  const products = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  // Filter products by category
  const filteredProducts = products.data?.filter(product => {
    if (selectedCategory !== 'all' && product.categoryId.toString() !== selectedCategory) return false;
    return true;
  });

  // Format price to show as currency
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `R$${numPrice.toFixed(2)}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setLocation("/login");
  };

  return (
    <AuthGuard>
      <ThemeForcer />
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-normal lowercase">Store Management</h1>
            <div className="flex gap-4">
              <NewBrandDialog />
              <NewProductDialog />
              <Button 
                variant="outline" 
                className="border-white/20"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Categories Section */}
          <div className="mb-12">
            <h2 className="logo text-xl mb-4">Categories</h2>
            <div className="border border-white/20">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.data?.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <EditBrandDialog brand={category} />
                          <DeleteBrandDialog brand={category} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Products Section */}
          <div>
            <h2 className="logo text-xl mb-4">Products</h2>

            {/* Filter Bar */}
            <div className="mb-4">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="bg-transparent border-white/20 w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/20">
                  <SelectItem value="all" className="text-white hover:bg-white/10">
                    All Categories
                  </SelectItem>
                  {categories.data?.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                      className="text-white hover:bg-white/10"
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border border-white/20">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts?.map((product) => {
                    const category = categories.data?.find(c => c.id === product.categoryId);
                    // Calculate total stock from sizeStock array
                    const totalStock = Array.isArray(product.sizeStock) 
                      ? product.sizeStock.reduce((sum: number, item: { stock: number }) => sum + item.stock, 0) 
                      : 0;
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{category?.name}</TableCell>
                        <TableCell>{formatPrice(product.price)}</TableCell>
                        <TableCell>{totalStock}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <EditProductDialog product={product} />
                            <DeleteProductDialog product={product} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}