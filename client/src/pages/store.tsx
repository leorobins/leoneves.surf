import { useQuery } from "@tanstack/react-query";
import { type Brand, type Product } from "@shared/schema";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus } from "lucide-react";

export default function StorePage() {
  const brands = useQuery<Brand[]>({
    queryKey: ["/api/brands"]
  });

  const products = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-normal lowercase">Store Management</h1>
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/20 hover:bg-white/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Brand
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/20 hover:bg-white/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Product
            </Button>
          </div>
        </div>

        {/* Brands Section */}
        <div className="mb-12">
          <h2 className="text-xl font-normal mb-4 lowercase">Brands</h2>
          <div className="border border-white/20">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Name</Table.Head>
                  <Table.Head>Description</Table.Head>
                  <Table.Head>Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {brands.data?.map((brand) => (
                  <Table.Row key={brand.id}>
                    <Table.Cell>{brand.name}</Table.Cell>
                    <Table.Cell>{brand.description}</Table.Cell>
                    <Table.Cell>
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
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </div>

        {/* Products Section */}
        <div>
          <h2 className="text-xl font-normal mb-4 lowercase">Products</h2>
          <div className="border border-white/20">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Name</Table.Head>
                  <Table.Head>Brand</Table.Head>
                  <Table.Head>Price</Table.Head>
                  <Table.Head>Stock</Table.Head>
                  <Table.Head>Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {products.data?.map((product) => {
                  const brand = brands.data?.find(b => b.id === product.brandId);
                  return (
                    <Table.Row key={product.id}>
                      <Table.Cell>{product.name}</Table.Cell>
                      <Table.Cell>{brand?.name}</Table.Cell>
                      <Table.Cell>${product.price}</Table.Cell>
                      <Table.Cell>{product.stock}</Table.Cell>
                      <Table.Cell>
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
                      </Table.Cell>
                    </Table.Row>
                  )})}
              </Table.Body>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
