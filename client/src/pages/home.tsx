import { useQuery } from "@tanstack/react-query";
import { type Brand } from "@shared/schema";
import { BrandCard } from "@/components/brand-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const brands = useQuery<Brand[]>({
    queryKey: ["/api/brands"]
  });

  return (
    <div>
      {/* Video Section */}
      <section className="mb-12">
        <div className="aspect-video w-full bg-zinc-900">
          {/* Video placeholder - will be replaced with actual video */}
          <div className="w-full h-full flex items-center justify-center text-white/50">
            Video content
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6 px-8">Our Brands</h2>
        {brands.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="aspect-[21/9] rounded-none" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {brands.data?.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}