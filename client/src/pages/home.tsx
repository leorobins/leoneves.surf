import { useQuery } from "@tanstack/react-query";
import { type Brand } from "@shared/schema";
import { BrandCard } from "@/components/brand-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { useState, useRef } from "react";

export default function Home() {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const brands = useQuery<Brand[]>({
    queryKey: ["/api/brands"]
  });

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div>
      {/* Video Section */}
      <section className="relative mb-12">
        <div className="aspect-video w-full bg-zinc-900 overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/videomain.mp4" type="video/mp4" />
          </video>
          {/* Sound control button */}
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-4 right-4 bg-black/50 border-white/20 hover:bg-black/70"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-white" />
            ) : (
              <Volume2 className="h-4 w-4 text-white" />
            )}
          </Button>
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