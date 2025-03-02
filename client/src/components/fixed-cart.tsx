import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type CartItem } from "@shared/schema";

export function FixedCart() {
  const cart = useQuery<CartItem[]>({
    queryKey: ["/api/cart"]
  });

  const itemCount = cart.data?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black border border-white/20 text-white p-4 w-[240px]">
      <div className="uppercase text-sm mb-2 font-light">CART</div>
      <div className="flex justify-between items-center text-sm">
        <div>{itemCount} Items</div>
        <div>€|EUR</div>
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
  );
}
