import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { BankAccount } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils/index';

interface BankAccountInfoCardProps {
  bankAccount: BankAccount;
}

export function BankAccountInfoCard({ bankAccount }: BankAccountInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Details of the bank account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Account Holder
            </p>
            <p className="text-lg font-semibold">
              {bankAccount.accountHolderName}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Account Number
            </p>
            <p className="font-mono text-lg">{bankAccount.accountNumber}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Bank</p>
            <p className="text-lg">{bankAccount.bank}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Branch</p>
            <p className="text-lg">{bankAccount.branch}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              IFSC Code
            </p>
            <p className="font-mono text-lg">{bankAccount.ifscCode}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Opening Balance
            </p>
            <p className="text-lg font-semibold">
              {formatCurrency(bankAccount.openingBalance)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Current Balance
            </p>
            <p className="text-lg font-semibold">
              {bankAccount.currentBalance != null
                ? formatCurrency(bankAccount.currentBalance)
                : formatCurrency(bankAccount.openingBalance)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Opening Date
            </p>
            <p className="text-lg">
              {formatDate(bankAccount.openingBalanceDate)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
