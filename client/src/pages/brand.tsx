import { useQuery } from "@tanstack/react-query";
import { type Product, type Brand } from "@shared/schema";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function BrandPage({ params }: { params: { id: string } }) {
  const brand = useQuery<Brand>({
    queryKey: ["/api/brands", params.id]
  });

  const products = useQuery<Product[]>({
    queryKey: ["/api/products/brand", params.id]
  });

  if (brand.isLoading || products.isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  if (!brand.data) {
    return <div>Brand not found</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container py-8">
        {/* Brand Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold lowercase">{brand.data.name}</h1>
          <Button variant="outline" className="text-white border-white hover:bg-white/10">
            ALL
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.data?.map((product) => (
            <div key={product.id} className="aspect-square relative group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-medium">{product.name}</p>
              </div>
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <p className="text-white text-sm font-medium">sold out</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
