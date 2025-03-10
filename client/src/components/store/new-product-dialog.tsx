import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { type InsertProduct, insertProductSchema, type Brand, type SizeStock } from "@shared/schema";
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
import { Plus, X, Video, Minus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NewProductDialog() {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [sizeStocks, setSizeStocks] = useState<SizeStock[]>([{ size: "", stock: 0 }]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const categories = useQuery<Brand[]>({
    queryKey: ["/api/categories"]
  });

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      price: 0,
      categoryId: undefined,
      sizeStock: [{ size: "", stock: 0 }],
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
      // Check file size (limit to 20MB)
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "Error",
          description: `File ${file.name} is too large. Please choose videos under 20MB.`,
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Add a loading toast
        const loadingToastId = toast({
          title: "Processing video",
          description: `Preparing ${file.name} for upload...`,
        });

        // Create a video element to get the video dimensions
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          // Create a canvas element for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set canvas dimensions to a reasonable size (720p max)
          const maxWidth = 1280;
          const maxHeight = 720;
          let width = video.videoWidth;
          let height = video.videoHeight;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;
            if (width > height) {
              width = maxWidth;
              height = width / aspectRatio;
            } else {
              height = maxHeight;
              width = height * aspectRatio;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw the first frame to the canvas (as a thumbnail)
          if (ctx) {
            ctx.drawImage(video, 0, 0, width, height);
            
            // Get the thumbnail as a data URL
            const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            
            // Store the video with its thumbnail
            setVideos(prev => [...prev, reader.result as string]);
            
            // Dismiss the loading toast
            toast({
              title: "Video added",
              description: `${file.name} has been added successfully.`,
            });
          }
        };
        
        // Set the video source to the FileReader result
        video.src = reader.result as string;
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

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
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

  const createProduct = useMutation({
    mutationFn: async (data: InsertProduct) => {
      // Log the data being sent
      console.log('Sending product data:', data);
      
      const transformedData = {
        ...data,
        // Ensure price is a number
        price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
        categoryId: parseInt(data.categoryId!.toString(), 10),
        images: images,
        videos: videos,
        sizeStock: sizeStocks,
      };
      
      // Log the transformed data
      console.log('Transformed product data:', transformedData);
      
      try {
        const response = await apiRequest("POST", "/api/products", transformedData);
        return response;
      } catch (error) {
        console.error('Error creating product:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product created",
        description: "The product has been created successfully.",
      });
      form.reset();
      setImages([]);
      setVideos([]);
      setSizeStocks([{ size: "", stock: 0 }]);
      setOpen(false);
    },
    onError: (error) => {
      console.error('Product creation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not create product. Please try again.",
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
          <Plus className="h-4 w-4 mr-2" />
          New Product
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black text-white border-white/20 max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>
            Add a new product to your store.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createProduct.mutate(data))} className="space-y-4">
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
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        form.setValue("categoryId", parseInt(value, 10));
                      }}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-transparent border-white/20">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-black border-white/20">
                        {categories.data?.map((category) => (
                          <SelectItem 
                            key={category.id} 
                            value={category.id.toString()}
                            className="text-white hover:bg-white/10"
                          >
                            {category.name}
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
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">R$</span>
                        <Input
                          {...field}
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*[.,]?[0-9]*"
                          onChange={(e) => {
                            // Convert string to number before setting the value
                            const value = e.target.value.replace(',', '.');
                            if (value === '' || isNaN(parseFloat(value))) {
                              form.setValue("price", 0);
                            } else {
                              form.setValue("price", parseFloat(value));
                            }
                          }}
                          className="bg-transparent border-white/20 pl-10"
                          placeholder="0,00"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Size and Stock */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Sizes and Stock</FormLabel>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addSize}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Size
                  </Button>
                </div>
                
                {sizeStocks.map((sizeStock, index) => (
                  <div key={index} className="flex items-end gap-4">
                    <FormItem className="flex-1">
                      <FormLabel className={index !== 0 ? "sr-only" : ""}>Size</FormLabel>
                      <FormControl>
                        <Input
                          value={sizeStock.size}
                          onChange={(e) => updateSizeStock(index, 'size', e.target.value)}
                          className="bg-transparent border-white/20"
                          placeholder="Size (e.g., S, M, L, XL, 38, 40)"
                        />
                      </FormControl>
                    </FormItem>
                    <FormItem className="flex-1">
                      <FormLabel className={index !== 0 ? "sr-only" : ""}>Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={sizeStock.stock}
                          onChange={(e) => updateSizeStock(index, 'stock', parseInt(e.target.value))}
                          className="bg-transparent border-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="Stock quantity"
                        />
                      </FormControl>
                    </FormItem>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSize(index)}
                        className="text-white border-white/20 hover:bg-white/10"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Product Images */}
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

              {/* Product Videos */}
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
                            controls
                            className="w-full aspect-video object-cover rounded-md"
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
                disabled={createProduct.isPending}
              >
                {createProduct.isPending ? "Creating..." : "Create Product"}
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}