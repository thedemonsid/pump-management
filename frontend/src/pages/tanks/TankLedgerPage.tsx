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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Loader2,
  Fuel,
  Calendar,
  TrendingUp,
  TrendingDown,
  Search,
  FileText,
  Plus,
  Minus,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useTankStore } from '@/store/tank-store';
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
      // Format the opening level date to YYYY-MM-DD for the date input
      const openingDate = new Date(tank.openingLevelDate)
        .toISOString()
        .split('T')[0];
      setFromDate(openingDate);
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                    Current Level
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {tank.currentLevel ? formatVolume(tank.currentLevel) : '0'}{' '}
                    L
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
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Fill Percentage
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {tank.capacity > 0 && tank.currentLevel
                      ? `${((tank.currentLevel / tank.capacity) * 100).toFixed(
                          1
                        )}%`
                      : 'N/A'}
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
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Action</TableHead>
                      <TableHead className="font-semibold text-right">
                        Volume (L)
                      </TableHead>
                      <TableHead className="font-semibold text-right">
                        Level After (L)
                      </TableHead>
                      <TableHead className="font-semibold">
                        Description
                      </TableHead>
                      <TableHead className="font-semibold">Supplier</TableHead>
                      <TableHead className="font-semibold">Invoice</TableHead>
                      <TableHead className="font-semibold">Entry By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No fuel transactions found for the selected date
                          range.
                        </TableCell>
                      </TableRow>
                    ) : (
                      ledgerData.map((entry, index) => (
                        <TableRow key={index} className="hover:bg-muted/30">
                          <TableCell className="font-medium">
                            {formatDate(entry.date)}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {entry.type === 'addition' ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                              {entry.action}
                            </div>
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium ${
                              entry.type === 'addition'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {entry.type === 'addition' ? '+' : '-'}
                            {formatVolume(entry.volume)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatVolume(entry.level)}
                          </TableCell>
                          <TableCell className="text-sm max-w-xs truncate">
                            {entry.description}
                          </TableCell>
                          <TableCell className="text-sm">
                            {entry.supplierName || '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {entry.invoiceNumber || '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {entry.entryBy}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
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
