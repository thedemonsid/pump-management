import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import ReactSelect from 'react-select';
import type { Customer } from '@/types/customer';

interface BillHeaderProps {
  billDate: string;
  setBillDate: (date: string) => void;
  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  paymentType: string;
  setPaymentType: (type: string) => void;
  gstIncluded: string;
  setGstIncluded: (gst: string) => void;
}

export const BillHeader = ({
  billDate,
  setBillDate,
  customers,
  selectedCustomer,
  setSelectedCustomer,
  paymentType,
  setPaymentType,
  gstIncluded,
  setGstIncluded,
}: BillHeaderProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Bill No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-64">Customer</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>GST</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <Input value="AUTO" className="text-xs" readOnly />
            </TableCell>
            <TableCell>
              <Input
                type="date"
                className="text-xs"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
              />
            </TableCell>
            <TableCell>
              <ReactSelect
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
                placeholder="Select Customer"
                className="text-xs"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    fontSize: '12px',
                    minHeight: '32px',
                    width: '200px',
                  }),
                  option: (provided) => ({
                    ...provided,
                    fontSize: '12px',
                  }),
                  menu: (provided) => ({
                    ...provided,
                    zIndex: 9999,
                  }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                menuPortalTarget={document.body}
              />
            </TableCell>
            <TableCell>
              <ReactSelect
                value={
                  paymentType
                    ? {
                        value: paymentType,
                        label: paymentType.toUpperCase(),
                      }
                    : null
                }
                onChange={(option) => setPaymentType(option?.value || '')}
                options={[
                  { value: 'cash', label: 'CASH' },
                  { value: 'credit', label: 'CREDIT' },
                ]}
                placeholder="Type of Payment"
                className="text-xs"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    fontSize: '12px',
                    minHeight: '32px',
                    width: '150px',
                  }),
                  option: (provided) => ({
                    ...provided,
                    fontSize: '12px',
                  }),
                  menu: (provided) => ({
                    ...provided,
                    zIndex: 9999,
                  }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                menuPortalTarget={document.body}
              />
            </TableCell>
            <TableCell>
              <ReactSelect
                value={
                  gstIncluded
                    ? {
                        value: gstIncluded,
                        label: gstIncluded === 'including' ? 'Inc' : 'Exc',
                      }
                    : null
                }
                onChange={(option) => setGstIncluded(option?.value || '')}
                options={[
                  { value: 'including', label: 'Inc' },
                  { value: 'excluding', label: 'Exc' },
                ]}
                placeholder="GST"
                className="text-xs"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    fontSize: '12px',
                    minHeight: '32px',
                    width: '100px',
                  }),
                  option: (provided) => ({
                    ...provided,
                    fontSize: '12px',
                  }),
                  menu: (provided) => ({
                    ...provided,
                    zIndex: 9999,
                  }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                menuPortalTarget={document.body}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
