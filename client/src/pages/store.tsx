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

export default function StorePage() {
  // Filter state
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  const brands = useQuery<Brand[]>({
    queryKey: ["/api/brands"]
  });

  const products = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  // Filter products by brand
  const filteredProducts = products.data?.filter(product => {
    if (selectedBrand !== 'all' && product.brandId.toString() !== selectedBrand) return false;
    return true;
  });

  // Format price to show as currency
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `$${numPrice.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-normal lowercase">Store Management</h1>
          <div className="flex gap-4">
            <NewBrandDialog />
            <NewProductDialog />
          </div>
        </div>

        {/* Brands Section */}
        <div className="mb-12">
          <h2 className="text-xl font-normal mb-4 lowercase">Brands</h2>
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
                {brands.data?.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell>{brand.name}</TableCell>
                    <TableCell>{brand.description}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <EditBrandDialog brand={brand} />
                        <DeleteBrandDialog brand={brand} />
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
          <h2 className="text-xl font-normal mb-4 lowercase">Products</h2>

          {/* Filter Bar */}
          <div className="mb-4">
            <Select
              value={selectedBrand}
              onValueChange={setSelectedBrand}
            >
              <SelectTrigger className="bg-transparent border-white/20 w-[200px]">
                <SelectValue placeholder="Filter by brand" />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/20">
                <SelectItem value="all" className="text-white hover:bg-white/10">
                  All Brands
                </SelectItem>
                {brands.data?.map((brand) => (
                  <SelectItem
                    key={brand.id}
                    value={brand.id.toString()}
                    className="text-white hover:bg-white/10"
                  >
                    {brand.name}
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
                  <TableHead>Brand</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts?.map((product) => {
                  const brand = brands.data?.find(b => b.id === product.brandId);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{brand?.name}</TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
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
  );
}