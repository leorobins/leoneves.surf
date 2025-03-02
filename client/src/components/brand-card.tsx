import { type Brand } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

interface BrandCardProps {
  brand: Brand;
}

export function BrandCard({ brand }: BrandCardProps) {
  return (
    <Link href={`/brand/${brand.id}`}>
      <a>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow rounded-none">
          <div className="aspect-[21/9] overflow-hidden">
            <img
              src={brand.image}
              alt={brand.name}
              className="h-full w-full object-cover"
            />
          </div>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-center">{brand.name}</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">{brand.description}</p>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}