import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DataTable } from '@/components/ui/data-table';
import { tankLedgerColumns } from './tank-ledger-columns';
import {
  Loader2,
  Fuel,
  Calendar,
  Search,
  FileText,
  Plus,
  Minus,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useTankStore, formatOpeningLevelDate } from '@/store/tank-store';
import { useTankLedgerStore } from '@/store/tank-ledger-store';
import { TankTransactionService } from '@/services/tank-transaction-service';
import { TankTransactionForm } from '@/components/tanks/tank-transaction-form';
import {
  CreateTankTransactionSchema,
  type CreateTankTransaction,
} from '@/types';

export function TankLedgerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { tanks, fetchTanks } = useTankStore();
  const { ledgerData, summary, loading, hasSearched, computeLedgerData } =
    useTankLedgerStore();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAdditionDialogOpen, setIsAdditionDialogOpen] = useState(false);
  const [isRemovalDialogOpen, setIsRemovalDialogOpen] = useState(false);

  const additionForm = useForm<CreateTankTransaction>({
    resolver: zodResolver(CreateTankTransactionSchema),
    defaultValues: {
      volume: 0,
      transactionType: 'ADDITION',
      description: '',
      transactionDate: new Date().toISOString().slice(0, 16),
      supplierName: '',
      invoiceNumber: '',
    },
  });

  const removalForm = useForm<CreateTankTransaction>({
    resolver: zodResolver(CreateTankTransactionSchema),
    defaultValues: {
      volume: 0,
      transactionType: 'REMOVAL',
      description: '',
      transactionDate: new Date().toISOString().slice(0, 16),
    },
  });

  const handleAdditionTransaction = async (data: CreateTankTransaction) => {
    if (!id) return;
    try {
      await TankTransactionService.createAddition(id, data);
      setIsAdditionDialogOpen(false);
      additionForm.reset();
      toast.success('Fuel addition recorded successfully');
      // Refresh ledger data if it's already been searched
      if (hasSearched) {
        handleFetchLedger();
      }
    } catch (error) {
      console.error('Failed to create addition transaction:', error);
      toast.error('Failed to record fuel addition');
    }
  };

  const handleRemovalTransaction = async (data: CreateTankTransaction) => {
    if (!id) return;
    try {
      await TankTransactionService.createRemoval(id, data);
      setIsRemovalDialogOpen(false);
      removalForm.reset();
      toast.success('Fuel removal recorded successfully');
      // Refresh ledger data if it's already been searched
      if (hasSearched) {
        handleFetchLedger();
      }
    } catch (error) {
      console.error('Failed to create removal transaction:', error);
      toast.error('Failed to record fuel removal');
    }
  };

  const tank = tanks.find((t) => t.id === id);

  useEffect(() => {
    if (tanks.length === 0) {
      fetchTanks();
    }
  }, [tanks.length, fetchTanks]);

  useEffect(() => {
    if (tank?.openingLevelDate) {
      const openingDate = formatOpeningLevelDate(tank.openingLevelDate);
      if (openingDate) {
        setFromDate(openingDate);
      }
    }
  }, [tank?.openingLevelDate]);

  const handleFetchLedger = () => {
    if (!id || !fromDate) return;
    computeLedgerData({
      tankId: id,
      fromDate,
      toDate,
      openingLevel: tank?.openingLevel || 0,
    });
  };

  if (!tank) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Loading tank details...</span>
        </div>
      </div>
    );
  }

  const formatVolume = (volume: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      maximumFractionDigits: 2,
    }).format(volume);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Fuel className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tank Ledger</h1>
              <p className="text-lg text-muted-foreground">
                {tank.tankName} - {tank.product?.productName || 'No Product'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog
              open={isAdditionDialogOpen}
              onOpenChange={setIsAdditionDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Fuel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Fuel to Tank</DialogTitle>
                  <DialogDescription>
                    Record fuel addition to this tank.
                  </DialogDescription>
                </DialogHeader>
                <TankTransactionForm
                  form={additionForm}
                  onSubmit={handleAdditionTransaction}
                  onCancel={() => setIsAdditionDialogOpen(false)}
                  type="addition"
                />
              </DialogContent>
            </Dialog>

            <Dialog
              open={isRemovalDialogOpen}
              onOpenChange={setIsRemovalDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Minus className="h-4 w-4 mr-2" />
                  Remove Fuel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove Fuel from Tank</DialogTitle>
                  <DialogDescription>
                    Record fuel removal from this tank.
                  </DialogDescription>
                </DialogHeader>
                <TankTransactionForm
                  form={removalForm}
                  onSubmit={handleRemovalTransaction}
                  onCancel={() => setIsRemovalDialogOpen(false)}
                  type="removal"
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Separator />
      </div>

      {/* Date Range Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date Range Filter
          </CardTitle>
          <CardDescription>
            Select the date range and click fetch to view ledger entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="from-date" className="text-sm font-medium">
                From Date
              </Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-date" className="text-sm font-medium">
                To Date
              </Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <Button
              onClick={handleFetchLedger}
              disabled={loading || !fromDate}
              size="lg"
              className="min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching Data...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Fetch Ledger Details
                </>
              )}
            </Button>
            {hasSearched && (
              <Button
                onClick={() =>
                  navigate(
                    `/tanks/${id}/ledger/report?fromDate=${fromDate}&toDate=${toDate}`
                  )
                }
                variant="outline"
                size="lg"
                className="min-w-[150px]"
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Show content only after search */}
      {hasSearched && (
        <>
          {/* Tank Information */}
          <Card>
            <CardHeader>
              <CardTitle>Tank Information</CardTitle>
              <CardDescription>
                Current tank details and capacity information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Capacity
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {formatVolume(tank.capacity)} L
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Opening Level
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {tank.openingLevel ? formatVolume(tank.openingLevel) : '0'}{' '}
                    L
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Opening Level Date
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {tank.openingLevelDate
                      ? formatDate(tank.openingLevelDate)
                      : 'Not specified'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Before Date Range */}
          <Card>
            <CardHeader>
              <CardTitle>Summary Before Selected Date Range</CardTitle>
              <CardDescription>
                Fuel volume summary before {formatDate(fromDate)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg bg-muted/20">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Total Additions
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatVolume(summary.totalAdditionsBefore)} L
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-muted/20">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Total Removals
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatVolume(summary.totalRemovalsBefore)} L
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-muted/20">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Net Level Change
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      summary.levelBefore - summary.openingLevel >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatVolume(
                      Math.abs(summary.levelBefore - summary.openingLevel)
                    )}{' '}
                    L
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ledger Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                Fuel Transaction History
              </CardTitle>
              <CardDescription>
                Fuel additions and removals for the selected date range
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={tankLedgerColumns}
                data={ledgerData}
                searchKey="description"
                searchPlaceholder="Search transactions..."
              />
            </CardContent>
          </Card>

          {/* Summary Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Fuel Volume Summary</CardTitle>
              <CardDescription>
                Complete fuel volume overview including all transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Total Additions (Till Date)
                  </p>
                  <p className="text-xl font-bold text-green-700">
                    {formatVolume(summary.totalAdditionsTillDate)} L
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Total Removals (Till Date)
                  </p>
                  <p className="text-xl font-bold text-red-700">
                    {formatVolume(summary.totalRemovalsTillDate)} L
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Current Level
                  </p>
                  <p className="text-xl font-bold text-blue-700">
                    {formatVolume(summary.closingLevel)} L
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Show message if no search performed yet */}
      {!hasSearched && !loading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Ready to View Fuel Ledger
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Select your desired date range above and click "Fetch Ledger
                  Details" to view the tank's fuel transaction history and
                  volume summary.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
