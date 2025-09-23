import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ReactSelect, { type CSSObjectWithLabel } from 'react-select';
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

const selectStyles = {
  control: (provided: CSSObjectWithLabel) => ({
    ...provided,
    minHeight: '36px',
    borderColor: '#e5e7eb', // gray-200
    backgroundColor: '#ffffff', // white
    '&:hover': {
      borderColor: '#9ca3af', // gray-400
    },
    boxShadow: 'none',
    '&:focus-within': {
      borderColor: '#3b82f6', // blue-500
      boxShadow: '0 0 0 1px #3b82f6',
    },
  }),
  option: (
    provided: CSSObjectWithLabel,
    state: { isSelected: boolean; isFocused: boolean }
  ) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#3b82f6' // blue-500
      : state.isFocused
      ? '#dbeafe' // blue-100
      : '#ffffff', // white
    color: state.isSelected
      ? '#ffffff' // white
      : '#111827', // gray-900
    '&:hover': {
      backgroundColor: state.isSelected ? '#2563eb' : '#dbeafe', // blue-600 : blue-100
    },
  }),
  menu: (provided: CSSObjectWithLabel) => ({
    ...provided,
    zIndex: 9999,
    backgroundColor: '#ffffff', // white
    border: '1px solid #e5e7eb', // gray-200
  }),
  menuPortal: (base: CSSObjectWithLabel) => ({ ...base, zIndex: 9999 }),
};

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="space-y-2">
        <Label htmlFor="bill-date" className="text-sm font-medium">
          Date
        </Label>
        <Input
          id="bill-date"
          type="date"
          value={billDate}
          onChange={(e) => setBillDate(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer-select" className="text-sm font-medium">
          Customer
        </Label>
        <ReactSelect
          inputId="customer-select"
          value={
            selectedCustomer
              ? {
                  value: selectedCustomer.id,
                  label: selectedCustomer.customerName,
                }
              : null
          }
          onChange={(option) => {
            const customer = customers.find((c) => c.id === option?.value);
            setSelectedCustomer(customer || null);
          }}
          options={customers.map((customer) => ({
            value: customer.id,
            label: customer.customerName,
          }))}
          placeholder="Select Customer"
          className="text-sm"
          styles={selectStyles}
          menuPortalTarget={document.body}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment-type" className="text-sm font-medium">
          Type
        </Label>
        <ReactSelect
          inputId="payment-type"
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
          className="text-sm"
          styles={selectStyles}
          menuPortalTarget={document.body}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gst-select" className="text-sm font-medium">
          GST
        </Label>
        <ReactSelect
          inputId="gst-select"
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
          className="text-sm"
          styles={selectStyles}
          menuPortalTarget={document.body}
        />
      </div>
    </div>
  );
};
