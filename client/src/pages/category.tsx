import { useQuery } from "@tanstack/react-query";
import { type Product, type Brand } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { FixedCart } from "@/components/fixed-cart";
import { ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CategoryPage({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Debug the params
  useEffect(() => {
    console.log("Category page params:", params);
  }, [params]);

  const category = useQuery<Brand>({
    queryKey: [`/api/categories/${params.id}`]
  });

  const products = useQuery<Product[]>({
    queryKey: [`/api/products/category/${params.id}`]
  });

  // Handle errors
  useEffect(() => {
    if (category.error) {
      console.error("Error fetching category:", category.error);
      toast({
        title: "Error",
        description: "Não foi possível carregar a categoria.",
        variant: "destructive"
      });
    }
    
    if (products.error) {
      console.error("Error fetching products:", products.error);
      toast({
        title: "Error",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive"
      });
    }
  }, [category.error, products.error, toast]);

  if (category.isLoading || products.isLoading) {
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

  if (!category.data || !products.data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-sm font-normal lowercase">categoria não encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-8 px-4">
        {/* Category Header */}
        <div className="mb-12">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setLocation("/")}
              className="hover:text-white/70"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-normal lowercase tracking-wide">
              {category.data.name}
            </h1>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10">
          {products.data.map((product) => {
            // Check if all sizes have 0 stock
            const isSoldOut = Array.isArray(product.sizeStock) 
              ? !product.sizeStock.some((s) => s.stock > 0)
              : true;

            return (
              <Link key={product.id} href={`/product/${product.id}`}>
                <a className="block aspect-square relative group bg-black">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <p className="logo text-white text-sm px-4 text-center">
                      {product.name}
                    </p>
                  </div>
                  {/* Sold out overlay */}
                  {isSoldOut && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <p className="logo text-white text-sm">
                        esgotado
                      </p>
                    </div>
                  )}
                </a>
              </Link>
            );
          })}
        </div>

        {/* Fixed Cart */}
        <FixedCart />
      </div>
    </div>
  );
} 