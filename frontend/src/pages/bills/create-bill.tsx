import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
const CreateBill = () => {
  return (
    <div>
      <Table className="w-full">
        <TableCaption>Create Bills Faster than your tally.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Invoice</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">INV001</TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Credit Card</TableCell>
            <TableCell>$250.00</TableCell>
            <TableCell>$250.00</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

export default CreateBill;
