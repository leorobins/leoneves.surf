import { type Category } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/category/${category.id}`}>
      <a>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-[21/9] overflow-hidden">
            <img
              src={category.image}
              alt={category.name}
              className="h-full w-full object-cover"
            />
          </div>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-center">{category.name}</h3>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
