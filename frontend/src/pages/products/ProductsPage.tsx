import { useEffect, useState, useCallback } from "react";
import { useProductStore } from "@/store/product-store";
import { useTankStore } from "@/store/tank-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Pencil, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductForm } from "./ProductForm";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils/index";
import { Link } from "react-router-dom";
import { TankTransactionService } from "@/services/tank-transaction-service";

export function ProductsPage() {
  const { products, loading, error, fetchProducts } = useProductStore();
  const { tanks, fetchTanks } = useTankStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  // const [currentBalances, setCurrentBalances] = useState<
  //   Record<string, number>
  // >({});

  useEffect(() => {
    fetchProducts();
    fetchTanks();
  }, [fetchProducts, fetchTanks]);

  const calculateCurrentBalances = useCallback(async () => {
    const today = new Date();
    const twoDaysBefore = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
    const twoDaysAfter = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
    const fromDate = twoDaysBefore.toISOString().split("T")[0];
    const toDate = twoDaysAfter.toISOString().split("T")[0];

    const balances: Record<string, number> = {};
    const loadingStates: Record<string, boolean> = {};

    // Start loading for all tanks
    tanks.forEach((tank) => {
      loadingStates[tank.id!] = true;
    });

    // Calculate balance for each tank
    await Promise.all(
      tanks.map(async (tank) => {
        if (!tank.id) return;

        try {
          // Get opening level for 2 days before today
          const levelBefore = await TankTransactionService.getOpeningLevel(
            tank.id,
            fromDate
          );

          // Get transactions for the date range
          const transactions =
            await TankTransactionService.getTransactionsWithDateRange(
              tank.id,
              fromDate,
              toDate
            );

          // Calculate running level
          let runningLevel = levelBefore;
          transactions.forEach((transaction) => {
            if (transaction.transactionType === "ADDITION") {
              runningLevel += transaction.volume;
            } else if (transaction.transactionType === "REMOVAL") {
              runningLevel -= transaction.volume;
            }
          });

          balances[tank.id] = Math.max(0, runningLevel); // Ensure non-negative
        } catch (error) {
          console.error(
            `Failed to calculate balance for tank ${tank.id}:`,
            error
          );
          // Fallback to tank's current level or 0
          balances[tank.id] = tank.currentLevel || 0;
        } finally {
          loadingStates[tank.id] = false;
        }
      })
    );

    // setCurrentBalances(balances);
  }, [tanks]);

  // Calculate current balances for all tanks
  useEffect(() => {
    if (tanks.length > 0) {
      calculateCurrentBalances();
    }
  }, [tanks, calculateCurrentBalances]);

  // Compute tank quantities per product
  // const getTankQuantityForProduct = (productId: string) => {
  //   const quantity = tanks
  //     .filter((tank) => tank.productId === productId)
  //     .reduce((sum, tank) => sum + (currentBalances[tank.id!] || 0), 0);

  //   console.log("Computed quantity for product", productId, "is", quantity);
  //   return quantity;
  // };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage fuel products and their pricing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div>
            <Link to="/products/report">
              <Button variant="outline" className="mr-2">
                View Report
              </Button>
            </Link>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
                <DialogDescription>
                  Add a new fuel product to the system
                </DialogDescription>
              </DialogHeader>
              <ProductForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>
            A list of all fuel products in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No products found. Create your first product to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Alias</TableHead>
                  <TableHead>Product Type</TableHead>
                  <TableHead>HSN Code</TableHead>
                  <TableHead>GST %</TableHead>
                  <TableHead>Purchase Rate</TableHead>
                  <TableHead>Sales Rate</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Low Stock</TableHead>
                  {/* <TableHead>Stock Quantity</TableHead> */}
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.productName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.alias}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.productType}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {product.hsnCode}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.gstPercentage}%</Badge>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(product.purchaseRate)}
                    </TableCell>
                    <TableCell>{formatCurrency(product.salesRate)}</TableCell>
                    <TableCell>
                      {product.salesUnit}
                      {product.salesUnit !== product.purchaseUnit &&
                        ` / ${product.purchaseUnit}`}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.lowStockCount < 50 ? "destructive" : "outline"
                        }
                      >
                        {product.lowStockCount}
                      </Badge>
                    </TableCell>
                    {/* <TableCell>
                      <Badge variant="secondary">
                        {getTankQuantityForProduct(product.id!)}{" "}
                        {product.salesUnit}
                      </Badge>
                    </TableCell> */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={editingProduct !== null}
        onOpenChange={() => setEditingProduct(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              product={editingProduct}
              onSuccess={() => setEditingProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
