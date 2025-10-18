import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ReactSelect from "react-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  ArrowLeft,
  Trash2,
  Save,
  Image as ImageIcon,
} from "lucide-react";
import { SalesmanBillService } from "@/services/salesman-bill-service";
import { CustomerService } from "@/services/customer-service";
import { ProductService } from "@/services/product-service";
import api from "@/services/api";
import type { SalesmanBillResponse } from "@/types";
import type { Customer } from "@/types/customer";
import type { Product } from "@/types/product";
import { toast } from "sonner";

const selectStyles = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: (base: any) => ({
    ...base,
    minHeight: "40px",
    borderColor: "hsl(var(--input))",
    "&:hover": {
      borderColor: "hsl(var(--input))",
    },
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  menu: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
};

export function SalesmanBillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bill, setBill] = useState<SalesmanBillResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Image URLs state
  const [meterImageUrl, setMeterImageUrl] = useState<string | null>(null);
  const [vehicleImageUrl, setVehicleImageUrl] = useState<string | null>(null);
  const [extraImageUrl, setExtraImageUrl] = useState<string | null>(null);

  // Form state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [driverName, setDriverName] = useState("");

  // Load customers and products
  useEffect(() => {
    const loadData = async () => {
      try {
        const [customerData, productData] = await Promise.all([
          CustomerService.getAll(),
          ProductService.getAll(),
        ]);
        setCustomers(customerData);
        setProducts(productData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load form data");
      }
    };
    loadData();
  }, []);

  // Load bill details
  useEffect(() => {
    const fetchBill = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const billData = await SalesmanBillService.getById(id);
        setBill(billData);

        // Set form values
        setQuantity(billData.quantity.toString());
        setRate(billData.rate.toString());
        setVehicleNo(billData.vehicleNo || "");
        setDriverName(billData.driverName || "");
      } catch (error) {
        console.error("Failed to fetch bill:", error);
        toast.error("Failed to load bill details", {
          description:
            error instanceof Error
              ? error.message
              : "An error occurred while loading the bill",
        });
        navigate("/salesman-bills");
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [id, navigate]);

  // Set selected customer and product after data is loaded
  useEffect(() => {
    if (bill && customers.length > 0 && products.length > 0) {
      const customer = customers.find((c) => c.id === bill.customerId);
      const product = products.find((p) => p.id === bill.productId);

      if (customer) setSelectedCustomer(customer);
      if (product) setSelectedProduct(product);
    }
  }, [bill, customers, products]);

  // Fetch images when bill is loaded
  useEffect(() => {
    const fetchImages = async () => {
      if (!bill) return;

      try {
        // Fetch meter image
        if (bill.meterImageId) {
          const response = await api.get(`/api/v1/files/${bill.meterImageId}`, {
            responseType: "blob",
          });
          const url = URL.createObjectURL(response.data);
          setMeterImageUrl(url);
        } else {
          setMeterImageUrl(null);
        }

        // Fetch vehicle image
        if (bill.vehicleImageId) {
          const response = await api.get(
            `/api/v1/files/${bill.vehicleImageId}`,
            {
              responseType: "blob",
            }
          );
          const url = URL.createObjectURL(response.data);
          setVehicleImageUrl(url);
        } else {
          setVehicleImageUrl(null);
        }

        // Fetch extra image
        if (bill.extraImageId) {
          const response = await api.get(`/api/v1/files/${bill.extraImageId}`, {
            responseType: "blob",
          });
          const url = URL.createObjectURL(response.data);
          setExtraImageUrl(url);
        } else {
          setExtraImageUrl(null);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();

    // Cleanup function to revoke blob URLs when component unmounts or bill changes
    return () => {
      setMeterImageUrl((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return null;
      });
      setVehicleImageUrl((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return null;
      });
      setExtraImageUrl((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return null;
      });
    };
  }, [bill]);

  const handleSave = async () => {
    if (
      !bill?.id ||
      !user?.pumpMasterId ||
      !selectedCustomer ||
      !selectedProduct
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        pumpMasterId: user.pumpMasterId,
        customerId: selectedCustomer.id!,
        productId: selectedProduct.id!,
        quantity: parseFloat(quantity) || 0,
        rate: parseFloat(rate) || 0,
        vehicleNo: vehicleNo || undefined,
        driverName: driverName || undefined,
        salesmanNozzleShiftId: bill.salesmanNozzleShiftId || undefined,
      };

      await SalesmanBillService.update(bill.id, updateData);

      toast.success("Bill updated successfully", {
        description: `Bill #${bill.billNo} has been updated`,
      });

      // Reload bill data
      const updatedBill = await SalesmanBillService.getById(bill.id);
      setBill(updatedBill);
    } catch (error) {
      console.error("Failed to update bill:", error);
      toast.error("Failed to update bill", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while updating the bill",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!bill?.id) return;

    if (!confirm("Are you sure you want to delete this bill?")) return;

    try {
      setSaving(true);
      await SalesmanBillService.delete(bill.id);

      toast.success("Bill deleted successfully", {
        description: "The bill has been removed",
      });

      navigate("/salesman-bills");
    } catch (error) {
      console.error("Failed to delete bill:", error);
      toast.error("Failed to delete bill", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while deleting the bill",
      });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading bill details...</span>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Bill Not Found
          </h2>
          <p className="text-muted-foreground mt-2">
            The requested bill could not be found.
          </p>
          <Button onClick={() => navigate("/salesman-bills")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bills
          </Button>
        </div>
      </div>
    );
  }

  if (user?.role !== "ADMIN" && user?.role !== "MANAGER") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Access Denied
          </h2>
          <p className="text-muted-foreground mt-2">
            This page is only accessible to administrators and managers.
          </p>
        </div>
      </div>
    );
  }

  const totalAmount = (parseFloat(quantity) || 0) * (parseFloat(rate) || 0);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/salesman-bills")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Salesman Bill #{bill.billNo}
            </h1>
            <p className="text-sm text-muted-foreground">
              Edit bill details below
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
            disabled={saving}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Bill Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Bill Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer */}
            <div className="space-y-2">
              <Label htmlFor="customer">
                Customer <span className="text-red-500">*</span>
              </Label>
              <ReactSelect
                id="customer"
                value={
                  selectedCustomer
                    ? {
                        value: selectedCustomer,
                        label: selectedCustomer.customerName,
                      }
                    : null
                }
                onChange={(option) =>
                  setSelectedCustomer(option?.value || null)
                }
                options={customers.map((customer) => ({
                  value: customer,
                  label: customer.customerName,
                }))}
                placeholder="Select customer"
                styles={selectStyles}
                menuPortalTarget={document.body}
                isClearable
              />
            </div>

            {/* Product */}
            <div className="space-y-2">
              <Label htmlFor="product">
                Product <span className="text-red-500">*</span>
              </Label>
              <ReactSelect
                id="product"
                value={
                  selectedProduct
                    ? {
                        value: selectedProduct,
                        label: selectedProduct.productName,
                      }
                    : null
                }
                onChange={(option) => setSelectedProduct(option?.value || null)}
                options={products.map((product) => ({
                  value: product,
                  label: product.productName,
                }))}
                placeholder="Select product"
                styles={selectStyles}
                menuPortalTarget={document.body}
                isClearable
              />
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity (L) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.001"
                placeholder="0.000"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            {/* Rate */}
            <div className="space-y-2">
              <Label htmlFor="rate">
                Rate (₹/L) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>

            {/* Vehicle Number */}
            <div className="space-y-2">
              <Label htmlFor="vehicleNo">Vehicle Number</Label>
              <Input
                id="vehicleNo"
                placeholder="Enter vehicle number"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
              />
            </div>

            {/* Driver Name */}
            <div className="space-y-2">
              <Label htmlFor="driverName">Driver Name</Label>
              <Input
                id="driverName"
                placeholder="Enter driver name"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
              />
            </div>
          </div>

          {/* Total Amount Display */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-primary">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Bill Date
              </p>
              <p className="text-lg">
                {new Date(bill.billDate).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Bill Number
              </p>
              <p className="text-lg font-semibold">#{bill.billNo}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images Card */}
      {(bill.meterImageId || bill.vehicleImageId || bill.extraImageId) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Bill Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Meter Image */}
              {bill.meterImageId && meterImageUrl && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Meter Reading</Label>
                  <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                    <img
                      src={meterImageUrl}
                      alt="Meter Reading"
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => {
                        if (meterImageUrl) window.open(meterImageUrl, "_blank");
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='12' fill='%23999'%3EImage Unavailable%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Vehicle Image */}
              {bill.vehicleImageId && vehicleImageUrl && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Vehicle</Label>
                  <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                    <img
                      src={vehicleImageUrl}
                      alt="Vehicle"
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => {
                        if (vehicleImageUrl)
                          window.open(vehicleImageUrl, "_blank");
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='12' fill='%23999'%3EImage Unavailable%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Extra Image */}
              {bill.extraImageId && extraImageUrl && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Additional</Label>
                  <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                    <img
                      src={extraImageUrl}
                      alt="Additional"
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => {
                        if (extraImageUrl) window.open(extraImageUrl, "_blank");
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='12' fill='%23999'%3EImage Unavailable%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Click on any image to view in full size
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
