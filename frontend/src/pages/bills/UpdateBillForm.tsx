import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBillStore } from '@/store/bill-store';
import { useProductStore } from '@/store/product-store';
import { useBankAccountStore } from '@/store/bank-account-store';
import {
  UpdateBillRequestSchema,
  type UpdateBillRequest,
  type BillResponse,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Plus, Trash2, Calculator } from 'lucide-react';

type UpdateBillFormData = UpdateBillRequest;

interface UpdateBillFormProps {
  bill: BillResponse;
  onSuccess: () => void;
}

export function UpdateBillForm({ bill, onSuccess }: UpdateBillFormProps) {
  const { editBill, loading } = useBillStore();
  const { products, fetchProducts } = useProductStore();
  const { bankAccounts, fetchBankAccounts } = useBankAccountStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateBillFormData>({
    resolver: zodResolver(UpdateBillRequestSchema),
    defaultValues: {
      billNo: bill.billNo,
      billDate: bill.billDate,
      billType: bill.billType,
      billItems: bill.billItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        rate: item.rate,
        discount: item.discount || 0,
        taxPercentage: item.taxPercentage,
      })),
      payments:
        bill.payments?.map((payment) => ({
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          bankAccountId:
            payment.bankAccountId ||
            (bankAccounts.length > 0 ? bankAccounts[0].id! : ''),
        })) || [],
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
    fetchBankAccounts();
  }, [fetchProducts, fetchBankAccounts]);

  const calculateTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

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
      amount: 0,
      paymentMethod: 'CASH',
      bankAccountId: bankAccounts.length > 0 ? bankAccounts[0].id! : '',
    });
  };

  const onSubmit = async (data: UpdateBillFormData) => {
    setIsSubmitting(true);
    try {
      await editBill(bill.id, data);
      onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount =
    form.watch('billItems')?.reduce((total, item) => {
      return total + item.quantity * item.rate;
    }, 0) || 0;

  const totalPaid =
    form.watch('payments')?.reduce((total, payment) => {
      return total + (payment?.amount || 0);
    }, 0) || 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Bill Header */}
        <Card>
          <CardHeader>
            <CardTitle>Bill Information</CardTitle>
            <CardDescription>Basic bill details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Number *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="billType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bill Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bill type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BILL_OF_SUPPLY">
                        Bill of Supply
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Bill Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bill Items</CardTitle>
                <CardDescription>
                  Add products and quantities to the bill
                </CardDescription>
              </div>
              <Button type="button" onClick={addBillItem} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No items added. Click "Add Item" to start.
              </div>
            ) : (
              fields.map((field, index) => (
                <Card key={field.id} className="border-dashed">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-4">
                        <FormField
                          control={form.control}
                          name={`billItems.${index}.productId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select product" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {products.map((product) => (
                                    <SelectItem
                                      key={product.id}
                                      value={product.id!}
                                    >
                                      {product.productName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`billItems.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`billItems.${index}.rate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rate *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2">
                        <div className="space-y-2">
                          <FormLabel>Total</FormLabel>
                          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                            <Calculator className="h-4 w-4" />
                            <span className="font-mono">
                              ₹
                              {calculateTotal(
                                form.watch(`billItems.${index}.quantity`) || 0,
                                form.watch(`billItems.${index}.rate`) || 0
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name={`billItems.${index}.discount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`billItems.${index}.taxPercentage`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax % *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="18.00"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Payments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payments</CardTitle>
                <CardDescription>Record payments for the bill</CardDescription>
              </div>
              <Button type="button" onClick={addPayment} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentFields.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No payments added. Click "Add Payment" to start.
              </div>
            ) : (
              paymentFields.map((field, index) => (
                <Card key={field.id} className="border-dashed">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-13 gap-4 items-end">
                      <div className="col-span-4">
                        <FormField
                          control={form.control}
                          name={`payments.${index}.paymentMethod`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Method *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-3">
                        <FormField
                          control={form.control}
                          name={`payments.${index}.bankAccountId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Account *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={
                                  field.value ||
                                  (bankAccounts.length > 0
                                    ? bankAccounts[0].id!
                                    : '')
                                }
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select account" />
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`payments.${index}.amount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removePayment(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Total and Submit */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex gap-4">
                  <div>
                    <p className="text-sm font-medium">Total Amount</p>
                    <p className="text-2xl font-bold text-primary">
                      ₹{totalAmount.toFixed(2)}
                    </p>
                  </div>
                  {totalPaid > 0 && (
                    <div>
                      <p className="text-sm font-medium">Total Paid</p>
                      <p className="text-lg font-semibold text-green-600">
                        ₹{totalPaid.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSuccess}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || loading}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Bill'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
