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

  const cartItems = cart.data?.map(item => {
    const product = products.data?.find(p => p.id === item.productId);
    return {
      ...item,
      product
    };
  }) || [];

  const total = cartItems.reduce((sum, item) => {
    return sum + (parseFloat(item.product?.price || "0") * item.quantity);
  }, 0);

  const itemCount = cart.data?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="fixed top-16 right-0 bottom-0 w-[300px] bg-black border-l border-white/20 text-white">
      <div className="p-4">
        <div className="uppercase text-sm mb-4 font-light">CART</div>
        <div className="flex justify-between items-center text-sm mb-4">
          <div>{itemCount} Items</div>
          <div>${total.toFixed(2)} USD</div>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-auto">
          {cartItems.map(item => (
            <div key={item.id} className="flex gap-4 items-start">
              <img 
                src={item.product?.image} 
                alt={item.product?.name}
                className="w-20 h-20 object-cover"
              />
              <div className="flex-1">
                <p className="text-sm">{item.product?.name}</p>
                <p className="text-sm text-white/60">Qty: {item.quantity}</p>
                <p className="text-sm">${parseFloat(item.product?.price || "0").toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-px mt-4 bg-white/20">
          <Link href="/cart">
            <a className="bg-black py-2 text-center text-sm hover:bg-white/10 transition-colors">
              cart
            </a>
          </Link>
          <Link href="/">
            <a className="bg-black py-2 text-center text-sm hover:bg-white/10 transition-colors">
              shop
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}