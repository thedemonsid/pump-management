import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Calculator, IndianRupee } from 'lucide-react';
import type {
  SalesmanNozzleShiftResponse,
  CreateSalesmanShiftAccountingRequest,
} from '@/types';

interface AccountingFormProps {
  shift: SalesmanNozzleShiftResponse;
  onSubmit: (data: CreateSalesmanShiftAccountingRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function AccountingForm({ shift, onSubmit, onCancel, loading }: AccountingFormProps) {
  const [formData, setFormData] = useState<CreateSalesmanShiftAccountingRequest>({
    upiReceived: 0,
    cardReceived: 0,
    expenses: 0,
    expenseReason: '',
    notes2000: 0,
    notes1000: 0,
    notes500: 0,
    notes200: 0,
    notes100: 0,
    notes50: 0,
    notes20: 0,
    notes10: 0,
    coins: 0,
  });

  // Calculate cash in hand from denominations
  const calculateCashInHand = () => {
    return (
      formData.notes2000 * 2000 +
      formData.notes1000 * 1000 +
      formData.notes500 * 500 +
      formData.notes200 * 200 +
      formData.notes100 * 100 +
      formData.notes50 * 50 +
      formData.notes20 * 20 +
      formData.notes10 * 10 +
      formData.coins
    );
  };

  // Calculate expected cash (system calculations would be done on backend)
  // For now, we'll show what the system should expect
  const expectedCash = shift.totalAmount || 0; // This would come from backend calculations
  const cashInHand = calculateCashInHand();
  const totalReceived = formData.upiReceived + formData.cardReceived + cashInHand;
  const balanceAmount = totalReceived - expectedCash - formData.expenses;

  const handleInputChange = (field: keyof CreateSalesmanShiftAccountingRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Shift Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Shift Summary
          </CardTitle>
          <CardDescription>
            Review shift details before creating accounting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Nozzle</Label>
              <p className="font-medium">{shift.nozzleName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Product</Label>
              <p className="font-medium">{shift.productName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Fuel Dispensed</Label>
              <p className="font-medium">{shift.dispensedAmount.toFixed(3)} L</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
              <p className="font-medium">{formatCurrency(shift.totalAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Enter amounts received through different payment methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upiReceived">UPI Received</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="upiReceived"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.upiReceived}
                    onChange={(e) => handleInputChange('upiReceived', e.target.value)}
                    className="pl-10"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardReceived">Card Received</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cardReceived"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cardReceived}
                    onChange={(e) => handleInputChange('cardReceived', e.target.value)}
                    className="pl-10"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>
              Enter any expenses incurred during the shift
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expenses">Expense Amount</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="expenses"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.expenses}
                    onChange={(e) => handleInputChange('expenses', e.target.value)}
                    className="pl-10"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseReason">Reason</Label>
                <Textarea
                  id="expenseReason"
                  value={formData.expenseReason}
                  onChange={(e) => handleInputChange('expenseReason', e.target.value)}
                  placeholder="Enter expense reason..."
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cash Denominations */}
        <Card>
          <CardHeader>
            <CardTitle>Cash Denominations</CardTitle>
            <CardDescription>
              Count the physical cash notes and coins in hand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notes2000">₹2000 Notes</Label>
                <Input
                  id="notes2000"
                  type="number"
                  min="0"
                  value={formData.notes2000}
                  onChange={(e) => handleInputChange('notes2000', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes1000">₹1000 Notes</Label>
                <Input
                  id="notes1000"
                  type="number"
                  min="0"
                  value={formData.notes1000}
                  onChange={(e) => handleInputChange('notes1000', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes500">₹500 Notes</Label>
                <Input
                  id="notes500"
                  type="number"
                  min="0"
                  value={formData.notes500}
                  onChange={(e) => handleInputChange('notes500', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes200">₹200 Notes</Label>
                <Input
                  id="notes200"
                  type="number"
                  min="0"
                  value={formData.notes200}
                  onChange={(e) => handleInputChange('notes200', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes100">₹100 Notes</Label>
                <Input
                  id="notes100"
                  type="number"
                  min="0"
                  value={formData.notes100}
                  onChange={(e) => handleInputChange('notes100', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes50">₹50 Notes</Label>
                <Input
                  id="notes50"
                  type="number"
                  min="0"
                  value={formData.notes50}
                  onChange={(e) => handleInputChange('notes50', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes20">₹20 Notes</Label>
                <Input
                  id="notes20"
                  type="number"
                  min="0"
                  value={formData.notes20}
                  onChange={(e) => handleInputChange('notes20', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes10">₹10 Notes</Label>
                <Input
                  id="notes10"
                  type="number"
                  min="0"
                  value={formData.notes10}
                  onChange={(e) => handleInputChange('notes10', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="coins">Coins (₹)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="coins"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.coins}
                  onChange={(e) => handleInputChange('coins', e.target.value)}
                  className="pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Accounting Summary</CardTitle>
            <CardDescription>
              Calculated totals and balance verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cash in Hand:</span>
                  <span className="font-medium">{formatCurrency(cashInHand)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">UPI Received:</span>
                  <span className="font-medium">{formatCurrency(formData.upiReceived)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Card Received:</span>
                  <span className="font-medium">{formatCurrency(formData.cardReceived)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Received:</span>
                  <span className="font-medium">{formatCurrency(totalReceived)}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Expected Amount:</span>
                  <span className="font-medium">{formatCurrency(expectedCash)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Expenses:</span>
                  <span className="font-medium text-red-600">-{formatCurrency(formData.expenses)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Balance Amount:</span>
                  <span className={`font-bold ${balanceAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(balanceAmount)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Accounting...' : 'Create Accounting'}
          </Button>
        </div>
      </form>
    </div>
  );
}