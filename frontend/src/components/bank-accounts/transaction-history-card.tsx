import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { BankTransaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils/index';

interface TransactionHistoryCardProps {
  transactions: BankTransaction[];
}

export function TransactionHistoryCard({
  transactions,
}: TransactionHistoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          List of all transactions for this bank account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            No transactions found. Add your first transaction using the buttons
            above.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {formatDate(
                      transaction.transactionDate || transaction.createdAt!
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.transactionType === 'CREDIT'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {transaction.transactionType}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.paymentMethod}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        transaction.transactionType === 'CREDIT'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {transaction.transactionType === 'CREDIT' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
