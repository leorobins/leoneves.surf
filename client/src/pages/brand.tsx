import { useQuery } from "@tanstack/react-query";
import { type Product, type Brand } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function BrandPage({ params }: { params: { id: string } }) {
  const brand = useQuery<Brand>({
    queryKey: [`/api/brands/${params.id}`]
  });

  const products = useQuery<Product[]>({
    queryKey: [`/api/products/brand/${params.id}`]
  });

  if (brand.isLoading || products.isLoading) {
    return (
      <div className="min-h-screen bg-black text-white px-4">
        <div className="container mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-white/20 rounded mb-12"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="aspect-square bg-white/20"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!brand.data || !products.data) {
    return (
      <div className="min-h-screen bg-black text-white px-4 flex items-center justify-center">
        <p>Brand not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4">
      {/* Header */}
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-normal lowercase">{brand.data.name}</h1>
          <Button 
            variant="outline" 
            size="sm"
            className="text-white border-white hover:bg-white/10"
          >
            ALL
          </Button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          {products.data.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <a className="aspect-square relative group cursor-pointer">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-normal lowercase">
                    {product.name}
                  </p>
                </div>
                {/* Sold out overlay */}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <p className="text-white text-sm font-normal lowercase">
                      sold out
                    </p>
                  </div>
                )}
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}