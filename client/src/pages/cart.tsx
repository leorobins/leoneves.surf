import { useQuery } from "@tanstack/react-query";
import { type CartItem, type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

export default function Cart() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const cartItems = useQuery<CartItem[]>({
    queryKey: ["/api/cart"]
  });

  const products = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      await apiRequest("PATCH", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    }
  });

  const removeItem = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart."
      });
    }
  });

  if (cartItems.isLoading || products.isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  const items = cartItems.data || [];
  const productMap = new Map(products.data?.map(p => [p.id, p]));

  const total = items.reduce((sum, item) => {
    const product = productMap.get(item.productId);
    return sum + (product ? parseFloat(product.price) * item.quantity : 0);
  }, 0);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div className="space-y-8">
          <div className="space-y-4">
            {items.map((item) => {
              const product = productMap.get(item.productId);
              if (!product) return null;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-24 w-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-lg font-bold">${product.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity.mutate({
                        id: item.id,
                        quantity: Math.max(1, item.quantity - 1)
                      })}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity.mutate({
                        id: item.id,
                        quantity: item.quantity + 1
                      })}
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeItem.mutate(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center p-4 border rounded-lg">
            <div>
              <p className="text-lg font-semibold">Total</p>
              <p className="text-2xl font-bold">${total.toFixed(2)}</p>
            </div>
            <Button size="lg">Proceed to Checkout</Button>
          </div>
        </div>
      )}
    </div>
  );
}
