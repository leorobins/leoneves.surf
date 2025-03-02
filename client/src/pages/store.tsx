import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Brand, type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { NewBrandDialog } from "@/components/store/new-brand-dialog";
import { NewProductDialog } from "@/components/store/new-product-dialog";

function extractSpreadsheetId(input: string) {
  // If it's a URL, extract the ID
  if (input.includes('spreadsheets/d/')) {
    const matches = input.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return matches ? matches[1] : input;
  }
  // Otherwise return as is (assuming it's already an ID)
  return input;
}

export default function StorePage() {
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const { toast } = useToast();

  const brands = useQuery<Brand[]>({
    queryKey: ["/api/brands"]
  });

  const products = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  const syncSheets = useMutation({
    mutationFn: async () => {
      const cleanId = extractSpreadsheetId(spreadsheetId);
      await apiRequest("POST", "/api/sync-sheets", { spreadsheetId: cleanId });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Store data synced with Google Sheets",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sync data with Google Sheets",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-normal lowercase">Store Management</h1>
          <div className="flex gap-4">
            <NewBrandDialog />
            <NewProductDialog />
          </div>
        </div>

        {/* Brands Section */}
        <div className="mb-12">
          <h2 className="text-xl font-normal mb-4 lowercase">Brands</h2>
          <div className="border border-white/20">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.data?.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell>{brand.name}</TableCell>
                    <TableCell>{brand.description}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-white border-white/20 hover:bg-white/10"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-white border-white/20 hover:bg-white/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Products Section */}
        <div>
          <h2 className="text-xl font-normal mb-4 lowercase">Products</h2>
          <div className="border border-white/20">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.data?.map((product) => {
                  const brand = brands.data?.find(b => b.id === product.brandId);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{brand?.name}</TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-white border-white/20 hover:bg-white/10"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-white border-white/20 hover:bg-white/10"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )})}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Google Sheets Sync Section */}
        <div className="mt-8 border border-white/20 rounded-lg p-4">
          <h2 className="text-xl font-normal mb-4 lowercase">Google Sheets Sync</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">How to find your Spreadsheet ID:</label>
              <ol className="list-decimal list-inside text-sm text-white/60 space-y-1 ml-2">
                <li>Open your Google Sheet</li>
                <li>Look at the URL: docs.google.com/spreadsheets/d/<span className="text-white">spreadsheet-id</span>/edit</li>
                <li>Copy the ID part from the URL</li>
              </ol>
            </div>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm mb-2">Spreadsheet ID</label>
                <Input
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  className="bg-transparent border-white/20"
                  placeholder="Enter your Google Spreadsheet ID"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => syncSheets.mutate()}
                disabled={!spreadsheetId || syncSheets.isPending}
                className="text-white border-white/20 hover:bg-white/10"
              >
                {syncSheets.isPending ? (
                  <>
                    <span className="animate-pulse">Syncing...</span>
                  </>
                ) : (
                  "Sync with Sheets"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}