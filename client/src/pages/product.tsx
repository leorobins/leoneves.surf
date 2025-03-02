import { useQuery } from "@tanstack/react-query";
import { type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ProductPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const product = useQuery<Product>({
    queryKey: ["/api/products", params.id]
  });

  const addToCart = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: parseInt(params.id),
        quantity: 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product.data?.name} has been added to your cart.`
      });
    }
  });

  if (product.isLoading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24" />
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-12" />
          </div>
        </div>
      </div>
    );
  }

  if (!product.data) {
    return <div>Product not found</div>;
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square overflow-hidden rounded-lg">
          <img
            src={product.data.image}
            alt={product.data.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.data.name}</h1>
          <p className="text-lg text-muted-foreground">
            {product.data.description}
          </p>
          <p className="text-3xl font-bold">${product.data.price}</p>
          <Button
            size="lg"
            className="w-full"
            onClick={() => addToCart.mutate()}
            disabled={addToCart.isPending}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
