import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { type InsertProduct, type Product, type Brand, insertProductSchema, type SizeStock } from "@shared/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, Minus, Video } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditProductDialogProps {
  product: Product;
}

export function EditProductDialog({ product }: EditProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<string[]>(
    product.images?.length > 0 ? product.images : [product.image]
  );
  const [sizeStocks, setSizeStocks] = useState<SizeStock[]>(
    product.sizeStock || []
  );
  const [videos, setVideos] = useState<string[]>(
    product.videos || []
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const brands = useQuery<Brand[]>({
    queryKey: ["/api/brands"]
  });

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: product.name,
      description: product.description,
      image: product.image,
      price: product.price.toString(),
      brandId: product.brandId,
      sizeStock: product.sizeStock || [],
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Check if adding new files would exceed the limit
    if (images.length + files.length > 10) {
      toast({
        title: "Error",
        description: "You can only upload up to 10 images.",
        variant: "destructive"
      });
      e.target.value = '';
      return;
    }

    files.forEach(file => {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: `File ${file.name} is too large. Please choose images under 5MB.`,
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
        // Store the first image as the main product image
        if (images.length === 0) {
          form.setValue("image", reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    // If removing the first image, update the form value
    if (index === 0 && images.length > 1) {
      form.setValue("image", images[1]);
    }
  };

  const addSize = () => {
    setSizeStocks([...sizeStocks, { size: "", stock: 0 }]);
  };

  const removeSize = (index: number) => {
    setSizeStocks(sizeStocks.filter((_, i) => i !== index));
  };

  const updateSizeStock = (index: number, field: keyof SizeStock, value: string | number) => {
    const newSizeStocks = [...sizeStocks];
    newSizeStocks[index] = {
      ...newSizeStocks[index],
      [field]: field === 'stock' ? parseInt(value.toString()) : value
    };
    setSizeStocks(newSizeStocks);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Check if adding new files would exceed the limit
    if (videos.length + files.length > 5) {
      toast({
        title: "Error",
        description: "You can only upload up to 5 videos.",
        variant: "destructive"
      });
      e.target.value = '';
      return;
    }

    files.forEach(file => {
      // Check file size (limit to 25MB)
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: "Error",
          description: `File ${file.name} is too large. Please choose videos under 25MB.`,
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setVideos(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const updateProduct = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const transformedData = {
        ...data,
        price: parseFloat(data.price.toString()).toFixed(2),
        brandId: parseInt(data.brandId!.toString(), 10),
        images: images,
        videos: videos,
        sizeStock: sizeStocks,
      };
      await apiRequest("PATCH", `/api/products/${product.id}`, transformedData);
    },
    onSuccess: () => {
      // Invalidate all products
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });

      // Invalidate specific product
      queryClient.invalidateQueries({ queryKey: [`/api/products/${product.id}`] });

      // Invalidate brand-specific products
      queryClient.invalidateQueries({ queryKey: [`/api/products/brand/${product.brandId}`] });

      toast({
        title: "Product updated",
        description: "The product has been updated successfully.",
      });
      form.reset();
      setImages([]);
      setVideos([]);
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not update product. Please try again.",
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
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product information.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => updateProduct.mutate(data))} className="space-y-4">
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
                        placeholder="Product name"
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
                        placeholder="Product description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        form.setValue("brandId", parseInt(value, 10));
                      }}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-transparent border-white/20">
                          <SelectValue placeholder="Select a brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-black border-white/20">
                        {brands.data?.map((brand) => (
                          <SelectItem
                            key={brand.id}
                            value={brand.id.toString()}
                            className="text-white hover:bg-white/10"
                          >
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">$</span>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          className="bg-transparent border-white/20 pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="29.99"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Size Stock</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {sizeStocks.map((sizeStock, index) => (
                      <div key={index} className="flex gap-4 items-center">
                        <Input
                          value={sizeStock.size}
                          onChange={(e) => updateSizeStock(index, 'size', e.target.value)}
                          placeholder="Size"
                          className="bg-transparent border-white/20 w-24"
                        />
                        <Input
                          type="number"
                          value={sizeStock.stock}
                          onChange={(e) => updateSizeStock(index, 'stock', e.target.value)}
                          placeholder="Stock"
                          className="bg-transparent border-white/20 w-24"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeSize(index)}
                          className="text-white border-white/20 hover:bg-white/10"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSize}
                      className="text-white border-white/20 hover:bg-white/10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Size
                    </Button>
                  </div>
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel>Product Images (Max 10)</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="bg-transparent border-white/20 file:bg-white/10 file:text-white file:border-0 file:mr-4 file:px-4 file:py-2 hover:file:bg-white/20"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full aspect-video object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
              <FormItem>
                <FormLabel>Product Videos (Max 5)</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={handleVideoUpload}
                      className="bg-transparent border-white/20 file:bg-white/10 file:text-white file:border-0 file:mr-4 file:px-4 file:py-2 hover:file:bg-white/20"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      {videos.map((video, index) => (
                        <div key={index} className="relative">
                          <video
                            src={video}
                            className="w-full aspect-video object-cover rounded-md"
                            controls
                          />
                          <button
                            type="button"
                            onClick={() => removeVideo(index)}
                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-white/90"
                disabled={updateProduct.isPending}
              >
                {updateProduct.isPending ? "Updating..." : "Update Product"}
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}