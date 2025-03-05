import { useQuery } from "@tanstack/react-query";
import { type Brand } from "@shared/schema";
import { BrandCard } from "@/components/brand-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { useState, useRef } from "react";

export default function Home() {
  const [isMuted, setIsMuted] = useState(true);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  const brands = useQuery<Brand[]>({
    queryKey: ["/api/categories"]
  });

  const toggleMute = () => {
    // Toggle mute for both videos
    if (desktopVideoRef.current) {
      desktopVideoRef.current.muted = !desktopVideoRef.current.muted;
    }
    if (mobileVideoRef.current) {
      mobileVideoRef.current.muted = !mobileVideoRef.current.muted;
    }
    setIsMuted(!isMuted);
  };

  return (
    <div>
      {/* Video Section */}
      <section className="relative mb-12">
        <div className="w-full bg-background/95 overflow-hidden md:aspect-video">
          {/* Desktop Video (hidden on mobile) */}
          <video
            ref={desktopVideoRef}
            className="w-full h-full object-cover hidden md:block"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/videomain.mp4" type="video/mp4" />
          </video>
          
          {/* Mobile Video (hidden on desktop) - using a taller aspect ratio for mobile */}
          <div className="aspect-[9/16] md:hidden">
            <video
              ref={mobileVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            >
              {/* Replace videomobile.mp4 with your actual mobile-optimized video */}
              <source src="/videomobile.mp4" type="video/mp4" />
            </video>
          </div>
          
          {/* Sound control button - positioned for both mobile and desktop */}
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-4 right-4 bg-background/80 hover:bg-background/90 border-border/50 z-10"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-foreground" />
            ) : (
              <Volume2 className="h-4 w-4 text-foreground" />
            )}
          </Button>
        </div>
      </section>

      {/* Brands Section */}
      <section>
        <h2 className="logo text-2xl mb-6 px-8">Products</h2>
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