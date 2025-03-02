import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type CartItem, type Product } from "@shared/schema";

export function FixedCart() {
  const cart = useQuery<CartItem[]>({
    queryKey: ["/api/cart"]
  });

  const products = useQuery<Product[]>({
    queryKey: ["/api/products"]
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
            <div>${item.product ? (parseFloat(item.product.price) * item.quantity).toFixed(2) : '0.00'}</div>
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
      <button 
        className="w-full bg-black text-center text-sm py-3 border border-white/20 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={itemCount === 0}
      >
        checkout
      </button>
    </div>
  );
}