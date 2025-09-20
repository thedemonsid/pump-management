import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBillStore } from '@/store/bill-store';
import { useProductStore } from '@/store/product-store';
import { useCustomerStore } from '@/store/customer-store';
import { useBankAccountStore } from '@/store/bank-account-store';
import {
  CreateBillRequestSchema,
  type CreateBillRequest,
  DEFAULT_PUMP_INFO,
  type PaymentMethod,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type CreateBillFormData = CreateBillRequest;

interface CreateBillFormProps {
  onSuccess: () => void;
}

export function CreateBillForm({ onSuccess }: CreateBillFormProps) {
  const { createBill, loading, getNextBillNo, nextBillNo } = useBillStore();
  const { products, fetchProducts } = useProductStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { bankAccounts, fetchBankAccounts } = useBankAccountStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billNoLoading, setBillNoLoading] = useState(true);

  const form = useForm<CreateBillFormData>({
    resolver: zodResolver(CreateBillRequestSchema),
    defaultValues: {
      pumpMasterId: DEFAULT_PUMP_INFO.id || '',
      billNo: nextBillNo || 0,
      billDate: new Date().toISOString().split('T')[0],
      customerId: '',
      billType: 'GENERAL',
      rateType: 'EXCLUDING_GST',
      billItems: [],
      payments: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'billItems',
  });

  const {
    fields: paymentFields,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({
    control: form.control,
    name: 'payments',
  });

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    fetchBankAccounts();
  }, [fetchProducts, fetchCustomers, fetchBankAccounts]);

  // Fetch next bill number on component mount
  useEffect(() => {
    const fetchNextBillNo = async () => {
      try {
        console.log('Fetching next bill number');
        await getNextBillNo();
        console.log('Next bill number fetched and stored in store');
      } catch (error) {
        console.error('Failed to fetch next bill number:', error);
      } finally {
        setBillNoLoading(false);
      }
    };

    fetchNextBillNo();
  }, [getNextBillNo]);

  // Update billNo in form when nextBillNo changes
  useEffect(() => {
    if (nextBillNo !== null) {
      form.setValue('billNo', nextBillNo);
    }
  }, [nextBillNo, form]);

  const addBillItem = () => {
    append({
      productId: '',
      quantity: 1,
      rate: 0,
      discount: 0,
      taxPercentage: 18,
    });
  };

  const addPayment = () => {
    appendPayment({
      pumpMasterId: DEFAULT_PUMP_INFO.id!,
      customerId: form.watch('customerId') || '',
      bankAccountId: '',
      amount: 0,
      paymentDate: new Date().toISOString(),
      paymentMethod: 'CASH' as PaymentMethod,
      referenceNumber: '',
      notes: '',
    });
  };

  const onSubmit = async (data: CreateBillFormData) => {
    setIsSubmitting(true);
    try {
      await createBill(data);
      onSuccess();

      // Reset form and fetch new bill number
      setBillNoLoading(true);
      await getNextBillNo();
      setBillNoLoading(false);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
      form.reset();
    }
  };

  const totalAmount = form.watch('billItems').reduce((total, item) => {
    const quantity = item.quantity || 0;
    const rate = item.rate || 0;
    const discount = item.discount || 0;
    const taxPercentage = item.taxPercentage || 0;
    const baseAmount = quantity * rate;
    const afterDiscount = baseAmount - discount;
    const afterTax = afterDiscount * (1 + taxPercentage / 100);
    return total + afterTax;
  }, 0);

  return (
    <div className="md:w-full w-fit shadow-xs border rounded-md p-4 bg-muted/25">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Bill Information - Compact Header */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <FormField
              control={form.control}
              name="billNo"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-medium">No.</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="h-7 text-sm"
                      value={nextBillNo || ''}
                      readOnly
                      disabled={billNoLoading}
                      placeholder={billNoLoading ? 'Loading...' : ''}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billDate"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-medium">Date</FormLabel>
                  <FormControl>
                    <Input type="date" className="h-7 text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-medium">
                    Customer
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-7 text-sm">
                        <SelectValue
                          placeholder="Select a Customer"
                          className="w-full"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id!}>
                          {c.customerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rateType"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-medium">Rate</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-7 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INCLUDING_GST">Incl GST</SelectItem>
                      <SelectItem value="EXCLUDING_GST">Excl GST</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billType"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-medium">Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-7 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="SALESMAN">Salesman</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex justify-end items-center">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addBillItem}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Item
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-6 bg-muted/30 rounded-md">
                No items added yet. Click "Add Item" to get started.
              </div>
            ) : (
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left text-sm">Product</TableHead>
                    <TableHead className="text-left text-sm">Qty</TableHead>
                    <TableHead className="text-left text-sm">Rate</TableHead>
                    <TableHead className="text-left text-sm">Disc</TableHead>
                    <TableHead className="text-left text-sm">Tax%</TableHead>
                    <TableHead className="text-left text-sm"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className="py-1 px-3">
                        <FormField
                          control={form.control}
                          name={`billItems.${index}.productId`}
                          render={({ field }) => (
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                const selectedProduct = products.find(
                                  (p) => p.id === value
                                );
                                if (selectedProduct) {
                                  form.setValue(
                                    `billItems.${index}.rate`,
                                    selectedProduct.salesRate
                                  );
                                }
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {products.map((p) => (
                                  <SelectItem key={p.id} value={p.id!}>
                                    {p.productName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <Input
                          type="number"
                          className="h-8 text-sm text-center"
                          {...form.register(`billItems.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                        />
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <Input
                          type="number"
                          className="h-8 text-sm text-center"
                          {...form.register(`billItems.${index}.rate`, {
                            valueAsNumber: true,
                          })}
                        />
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <Input
                          type="number"
                          className="h-8 text-sm text-center"
                          {...form.register(`billItems.${index}.discount`, {
                            valueAsNumber: true,
                          })}
                        />
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <Input
                          type="number"
                          className="h-8 text-sm text-center"
                          {...form.register(
                            `billItems.${index}.taxPercentage`,
                            {
                              valueAsNumber: true,
                            }
                          )}
                        />
                      </TableCell>
                      <TableCell className="py-1 px-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:bg-destructive/10"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <Separator />

          {/* Payments Section */}
          <div className="space-y-3">
            <div className="flex justify-end items-center">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addPayment}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Payment
              </Button>
            </div>

            {paymentFields.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-6 bg-muted/30 rounded-md">
                No payments added yet. Click "Add Payment" to get started.
              </div>
            ) : (
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left text-sm">
                      Bank Account
                    </TableHead>
                    <TableHead className="text-left text-sm">Amount</TableHead>
                    <TableHead className="text-left text-sm">Method</TableHead>
                    <TableHead className="text-left text-sm">
                      Reference
                    </TableHead>
                    <TableHead className="text-left text-sm"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentFields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className="py-1 px-3">
                        <FormField
                          control={form.control}
                          name={`payments.${index}.bankAccountId`}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder="Select bank account" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {bankAccounts.map((account) => (
                                  <SelectItem
                                    key={account.id}
                                    value={account.id!}
                                  >
                                    {account.accountHolderName} -{' '}
                                    {account.accountNumber}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <Input
                          type="number"
                          className="h-8 text-sm"
                          {...form.register(`payments.${index}.amount`, {
                            valueAsNumber: true,
                          })}
                        />
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <FormField
                          control={form.control}
                          name={`payments.${index}.paymentMethod`}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="CASH">Cash</SelectItem>
                                <SelectItem value="UPI">UPI</SelectItem>
                                <SelectItem value="RTGS">RTGS</SelectItem>
                                <SelectItem value="NEFT">NEFT</SelectItem>
                                <SelectItem value="IMPS">IMPS</SelectItem>
                                <SelectItem value="CHEQUE">Cheque</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <Input
                          type="text"
                          className="h-8 text-sm"
                          {...form.register(
                            `payments.${index}.referenceNumber`
                          )}
                        />
                      </TableCell>
                      <TableCell className="py-1 px-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:bg-destructive/10"
                          onClick={() => removePayment(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <Separator />

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-sm font-semibold">
              Total: ₹{totalAmount.toFixed(2)}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onSuccess}
                disabled={isSubmitting}
                className="h-8 text-sm px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="h-8 text-sm px-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Bill'
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
