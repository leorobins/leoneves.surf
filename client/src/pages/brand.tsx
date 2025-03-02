import { useQuery } from "@tanstack/react-query";
import { type Product, type Brand } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FixedCart } from "@/components/fixed-cart";

export default function BrandPage({ params }: { params: { id: string } }) {
  const brand = useQuery<Brand>({
    queryKey: [`/api/brands/${params.id}`]
  });

  const products = useQuery<Product[]>({
    queryKey: [`/api/products/brand/${params.id}`]
  });

  if (brand.isLoading || products.isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-white/20 rounded mb-12"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/20">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="aspect-square bg-black"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!brand.data || !products.data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-sm font-normal lowercase">brand not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-8 px-4">
        {/* Brand Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-2xl font-normal lowercase tracking-wide">
            {brand.data.name}
          </h1>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              className="text-white border-white hover:bg-white/10 lowercase"
            >
              filter
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="text-white border-white hover:bg-white/10 lowercase"
            >
              all
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10">
          {products.data.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <a className="block aspect-square relative group bg-black">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-white text-sm font-light tracking-wide lowercase px-4 text-center">
                    {product.name}
                  </p>
                </div>
                {/* Sold out overlay */}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <p className="text-white text-sm font-light tracking-wide lowercase">
                      sold out
                    </p>
                  </div>
                )}
              </a>
            </Link>
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-center gap-8 mt-12 text-sm lowercase">
          <a href="#" className="hover:text-white/70">shop</a>
          <a href="#" className="hover:text-white/70">lookbook</a>
          <a href="#" className="hover:text-white/70">archive</a>
          <a href="#" className="hover:text-white/70">contact</a>
        </div>
      </div>

      {/* Fixed Cart */}
      <FixedCart />
    </div>
  );
}