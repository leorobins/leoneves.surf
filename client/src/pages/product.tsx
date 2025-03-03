import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { FixedCart } from "@/components/fixed-cart";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';

const SIZES = ["28", "30", "32", "34", "36"];

export default function ProductPage({ params }: { params: { id: string } }) {
  const [selectedSize, setSelectedSize] = useState(SIZES[0]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Embla carousel setup
  const [mainViewRef, mainEmbla] = useEmblaCarousel();
  const [thumbViewRef, thumbEmbla] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainEmbla || !thumbEmbla) return;
      mainEmbla.scrollTo(index);
    },
    [mainEmbla, thumbEmbla]
  );

  const onSelect = useCallback(() => {
    if (!mainEmbla || !thumbEmbla) return;
    setSelectedIndex(mainEmbla.selectedScrollSnap());
    thumbEmbla.scrollTo(mainEmbla.selectedScrollSnap());
  }, [mainEmbla, thumbEmbla]);

  const scrollPrev = useCallback(() => {
    if (mainEmbla) mainEmbla.scrollPrev();
  }, [mainEmbla]);

  const scrollNext = useCallback(() => {
    if (mainEmbla) mainEmbla.scrollNext();
  }, [mainEmbla]);

  const product = useQuery<Product>({
    queryKey: [`/api/products/${params.id}`]
  });

  const relatedProducts = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  const addToCart = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: parseInt(params.id),
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product.data?.name} has been added to your cart.`
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not add item to cart. Please try again.",
        variant: "destructive"
      });
    }
  });

  if (product.isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-[1fr,400px] gap-8">
              <div className="aspect-[4/5] bg-white/20"></div>
              <div className="space-y-4">
                <div className="h-8 w-3/4 bg-white/20"></div>
                <div className="h-6 w-1/4 bg-white/20"></div>
                <div className="h-24 bg-white/20"></div>
                <div className="h-12 bg-white/20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product.data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-sm font-normal lowercase">product not found</p>
      </div>
    );
  }

  const productImages = product.data.images?.length > 0 
    ? product.data.images 
    : [product.data.image];

  const otherProducts = relatedProducts.data?.filter(p => p.id !== product.data.id).slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,400px] gap-8">
          {/* Main Product Image with Back Button */}
          <div className="relative">
            <button 
              onClick={() => setLocation(`/brand/${product.data.brandId}`)}
              className="absolute left-4 top-4 z-10 hover:text-white/70"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Main Carousel */}
            <div className="relative" ref={mainViewRef}>
              <div className="aspect-[4/5] overflow-hidden flex" onScroll={onSelect}>
                {productImages.map((image, index) => (
                  <div key={index} className="flex-[0_0_100%] min-w-0">
                    <img
                      src={image}
                      alt={`${product.data.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={scrollPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={scrollNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            <div className="mt-4" ref={thumbViewRef}>
              <div className="flex gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => onThumbClick(index)}
                    className={`relative flex-[0_0_16.666%] min-w-0 aspect-square overflow-hidden ${
                      index === selectedIndex ? 'ring-2 ring-white' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div>
                <h1 className="text-xl font-normal lowercase mb-2">{product.data.name}</h1>
                <p className="text-lg">${product.data.price}</p>
              </div>
              <p className="text-sm text-white/70 mt-4">Shipping calculated at checkout.</p>
            </div>

            {/* Size Selection */}
            <div className="space-y-4">
              <label className="text-sm lowercase">Size</label>
              <div className="grid grid-cols-1">
                <select 
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="bg-zinc-700 text-white p-2 w-full lowercase"
                >
                  {SIZES.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button 
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white lowercase"
              disabled={product.data.stock === 0 || addToCart.isPending}
              onClick={() => addToCart.mutate()}
            >
              {product.data.stock === 0 ? "sold out" : 
               addToCart.isPending ? "adding..." : "add to cart"}
            </Button>

            {/* Product Description */}
            <div className="text-sm space-y-4 text-white/70">
              <p>{product.data.description}</p>
              <p>
                14,5 oz washed denim / 100% cotton / embroidery on back pocket / embroidered leather patch / baggy fit / fits true to size
              </p>
            </div>

            {/* Others Section */}
            <div className="mt-8">
              <h2 className="text-sm lowercase mb-4">Others</h2>
              <div className="grid grid-cols-5 gap-2">
                {otherProducts.map(product => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <a className="aspect-square bg-white/10">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Cart */}
      <FixedCart />
    </div>
  );
}