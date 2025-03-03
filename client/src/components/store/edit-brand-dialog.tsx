import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type InsertBrand, type Brand, insertBrandSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditBrandDialogProps {
  brand: Brand;
}

export function EditBrandDialog({ brand }: EditBrandDialogProps) {
  const [open, setOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(brand.image);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertBrand>({
    resolver: zodResolver(insertBrandSchema),
    defaultValues: {
      name: brand.name,
      description: brand.description,
      image: brand.image,
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image file is too large. Please choose an image under 5MB.",
          variant: "destructive"
        });
        e.target.value = '';
        return;
      }

      // Create a preview URL for the image
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);

      // Convert image to base64 for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateBrand = useMutation({
    mutationFn: async (data: InsertBrand) => {
      await apiRequest("PATCH", `/api/brands/${brand.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      toast({
        title: "Brand updated",
        description: "The brand has been updated successfully.",
      });
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not update brand. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-white border-white/20 hover:bg-white/10"
        >
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black text-white border-white/20 max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Brand</DialogTitle>
          <DialogDescription>
            Update brand information.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => updateBrand.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-transparent border-white/20"
                        placeholder="Brand name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="bg-transparent border-white/20"
                        placeholder="Brand description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel>Brand Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="bg-transparent border-white/20 file:bg-white/10 file:text-white file:border-0 file:mr-4 file:px-4 file:py-2 hover:file:bg-white/20"
                        />
                        {previewImage && (
                          <div className="aspect-[21/9] overflow-hidden border border-white/20">
                            <img
                              src={previewImage}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-white/90"
                disabled={updateBrand.isPending}
              >
                {updateBrand.isPending ? "Updating..." : "Update Brand"}
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
