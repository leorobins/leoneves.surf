import { useQuery } from "@tanstack/react-query";
import { type Product, type Brand } from "@shared/schema";
import { ProductCard } from "@/components/product-card";
import { BrandCard } from "@/components/brand-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const products = useQuery<Product[]>({ 
    queryKey: ["/api/products"]
  });

  const brands = useQuery<Brand[]>({
    queryKey: ["/api/brands"]
  });

  return (
    <div className="container py-8 space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Our Brands</h2>
        {brands.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="aspect-[21/9]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {brands.data?.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
        {products.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.data?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}