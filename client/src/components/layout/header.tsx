import { Link } from "wouter";
import { ShoppingCart, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <span className="text-xl font-bold">AmazonClone</span>
          </a>
        </Link>

        <div className="flex-1 flex items-center gap-4">
          <form className="flex-1 flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <Input
              type="search"
              placeholder="Search products..."
              className="flex-1"
            />
            <Button type="submit" variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <Link href="/cart">
          <a className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            <span className="font-medium">Cart</span>
          </a>
        </Link>
      </div>
    </header>
  );
}
