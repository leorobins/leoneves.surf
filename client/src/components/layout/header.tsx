import { Link } from "wouter";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full h-16 flex items-center justify-center">
        <Link href="/">
          <a>
            <span className="logo text-xl">THIS IS LEO NEVES</span>
          </a>
        </Link>
      </div>
    </header>
  );
}