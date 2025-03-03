import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Brand } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteBrandDialogProps {
  brand: Brand;
}

export function DeleteBrandDialog({ brand }: DeleteBrandDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteBrand = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/brands/${brand.id}`);
    },
    onSuccess: () => {
      // Invalidate brands list
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });

      // Invalidate specific brand query
      queryClient.invalidateQueries({ queryKey: [`/api/brands/${brand.id}`] });

      // Invalidate products list as they might be affected
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });

      // Invalidate brand-specific products
      queryClient.invalidateQueries({ queryKey: [`/api/products/brand/${brand.id}`] });

      toast({
        title: "Brand deleted",
        description: "The brand and its products have been deleted.",
      });
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not delete brand. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-white border-white/20 hover:bg-white/10"
        >
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-black text-white border-white/20">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-white/60">
            This will permanently delete the brand "{brand.name}" and all its products.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent text-white border-white/20 hover:bg-white/10">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteBrand.mutate()}
            disabled={deleteBrand.isPending}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            {deleteBrand.isPending ? "Deleting..." : "Delete Brand"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}