import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { UseFormReturn } from 'react-hook-form';
import type { TransactionFormValues } from '@/types';
import { Plus, Minus } from 'lucide-react';
import { TransactionForm } from './transaction-form';

interface TransactionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'credit' | 'debit';
  form: UseFormReturn<TransactionFormValues>;
  onSubmit: (data: TransactionFormValues) => void;
}

export function TransactionDialog({
  isOpen,
  onOpenChange,
  type,
  form,
  onSubmit,
}: TransactionDialogProps) {
  const isCredit = type === 'credit';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant={isCredit ? 'default' : 'outline'}>
          {isCredit ? (
            <Plus className="mr-2 h-4 w-4" />
          ) : (
            <Minus className="mr-2 h-4 w-4" />
          )}
          {isCredit ? 'Credit' : 'Debit'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Add {isCredit ? 'Credit' : 'Debit'} Transaction
          </DialogTitle>
          <DialogDescription>
            {isCredit
              ? 'Add money to this bank account'
              : 'Deduct money from this bank account'}
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          form={form}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          type={type}
        />
      </DialogContent>
    </Dialog>
  );
}
