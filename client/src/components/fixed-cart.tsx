import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type CartItem, type Product } from "@shared/schema";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function FixedCart() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const cart = useQuery<CartItem[]>({
    queryKey: ["/api/cart"]
  });

  const products = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  const deleteItem = useMutation({
    mutationFn: async (cartItemId: number) => {
      await apiRequest("DELETE", `/api/cart/${cartItemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not remove item. Please try again.",
        variant: "destructive"
      });
    }
  });

  const itemCount = cart.data?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Get product details for cart items
  const cartProducts = cart.data?.map(item => {
    const product = products.data?.find(p => p.id === item.productId);
    return {
      ...item,
      product
    };
  }) || [];

  // Calculate total
  const total = cartProducts.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + (parseFloat(item.product.price) * item.quantity);
  }, 0);

  // Format WhatsApp message
  const formatWhatsAppMessage = () => {
    const items = cartProducts.map(item => 
      `${item.quantity}x ${item.product?.name} - $${item.product ? (parseFloat(item.product.price) * item.quantity).toFixed(2) : '0.00'}`
    ).join('\n');

    const message = `Hello! I would like to order:\n\n${items}\n\nTotal: $${total.toFixed(2)} USD`;
    return encodeURIComponent(message);
  };

  // WhatsApp redirect URL
  const whatsappUrl = `https://wa.me/5521995873778?text=${formatWhatsAppMessage()}`;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black border border-white/20 text-white p-4 w-[320px]">
      <div className="uppercase text-sm mb-2 font-light">CART</div>

      {/* Cart Items */}
      <div className="space-y-2 mb-4 max-h-[240px] overflow-y-auto">
        {cartProducts.map(item => (
          <div key={item.id} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span>{item.quantity}x</span>
              <span className="truncate">{item.product?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>${item.product ? (parseFloat(item.product.price) * item.quantity).toFixed(2) : '0.00'}</span>
              <button
                onClick={() => deleteItem.mutate(item.id)}
                disabled={deleteItem.isPending}
                className="text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="border-t border-white/20 pt-2 mb-4">
        <div className="flex justify-between items-center text-sm">
          <div>{itemCount} Items</div>
          <div>${total.toFixed(2)} USD</div>
        </div>
      </div>

      {/* Action */}
      <a 
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-black text-center text-sm py-3 border border-white/20 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ pointerEvents: itemCount === 0 ? 'none' : 'auto', opacity: itemCount === 0 ? 0.5 : 1 }}
      >
        checkout
      </a>
    </div>
  );
}