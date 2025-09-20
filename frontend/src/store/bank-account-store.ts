import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  BankAccount,
  CreateBankAccount,
  UpdateBankAccount,
} from '@/types';
import { BankAccountSchema } from '@/types';
import { BankAccountService } from '@/services/api';
import { toast } from 'sonner';

interface BankAccountState {
  bankAccounts: BankAccount[];
  loading: boolean;
  error: string | null;

  // Actions
  setBankAccounts: (bankAccounts: BankAccount[]) => void;
  addBankAccount: (bankAccount: BankAccount) => void;
  updateBankAccount: (id: string, bankAccount: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API methods
  fetchBankAccounts: () => Promise<void>;
  createBankAccount: (bankAccount: CreateBankAccount) => Promise<void>;
  editBankAccount: (
    id: string,
    bankAccount: UpdateBankAccount
  ) => Promise<void>;
  removeBankAccount: (id: string) => Promise<void>;
}

export const useBankAccountStore = create<BankAccountState>()(
  devtools(
    (set) => ({
      bankAccounts: [],
      loading: false,
      error: null,

      setBankAccounts: (bankAccounts) => set({ bankAccounts }),

      addBankAccount: (bankAccount) => {
        set((state) => ({
          bankAccounts: [...state.bankAccounts, bankAccount],
        }));
      },

      updateBankAccount: (id, bankAccountUpdate) => {
        set((state) => ({
          bankAccounts: state.bankAccounts.map((bankAccount) =>
            bankAccount.id === id
              ? { ...bankAccount, ...bankAccountUpdate }
              : bankAccount
          ),
        }));
      },

      deleteBankAccount: (id) => {
        set((state) => ({
          bankAccounts: state.bankAccounts.filter(
            (bankAccount) => bankAccount.id !== id
          ),
        }));
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // API methods using backend
      fetchBankAccounts: async () => {
        set({ loading: true, error: null });
        try {
          const bankAccounts = await BankAccountService.getAll();
          console.log('Bank Accounts : ', bankAccounts);
          set({ bankAccounts, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch bank accounts';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
        }
      },

      createBankAccount: async (bankAccount) => {
        set({ loading: true, error: null });
        try {
          // Validate with Zod
          const validatedBankAccount = BankAccountSchema.parse(bankAccount);

          const newBankAccount = await BankAccountService.create(
            validatedBankAccount
          );

          set((state) => ({
            bankAccounts: [...state.bankAccounts, newBankAccount],
            loading: false,
          }));
          toast.success('Bank account created successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to create bank account';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      editBankAccount: async (id, bankAccountUpdate) => {
        set({ loading: true, error: null });
        try {
          // Validate the update data to ensure required fields are present
          const currentBankAccount = useBankAccountStore
            .getState()
            .bankAccounts.find((b) => b.id === id);
          if (!currentBankAccount) {
            throw new Error('Bank account not found');
          }

          // Merge with current bank account to ensure all required fields are present
          const completeUpdate = {
            ...currentBankAccount,
            ...bankAccountUpdate,
          };

          // Validate the complete bank account
          const validatedBankAccount = BankAccountSchema.parse(completeUpdate);

          const updatedBankAccount = await BankAccountService.update(
            id,
            validatedBankAccount
          );

          set((state) => ({
            bankAccounts: state.bankAccounts.map((bankAccount) =>
              bankAccount.id === id ? updatedBankAccount : bankAccount
            ),
            loading: false,
          }));
          toast.success('Bank account updated successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to update bank account';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      removeBankAccount: async (id) => {
        set({ loading: true, error: null });
        try {
          await BankAccountService.delete(id);

          set((state) => ({
            bankAccounts: state.bankAccounts.filter(
              (bankAccount) => bankAccount.id !== id
            ),
            loading: false,
          }));
          toast.success('Bank account deleted successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to delete bank account';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },
    }),
    {
      name: 'bank-account-store',
    }
  )
);
