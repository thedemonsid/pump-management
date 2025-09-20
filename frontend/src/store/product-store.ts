import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Product } from '@/types';
import { ProductSchema, DEFAULT_PUMP_INFO } from '@/types';
import { ProductService } from '@/services/api';
import { toast } from 'sonner';

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;

  // Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API methods
  fetchProducts: () => Promise<void>;
  createProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  editProduct: (id: string, product: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>()(
  devtools(
    (set) => ({
      products: [],
      loading: false,
      error: null,

      setProducts: (products) => set({ products }),

      addProduct: (product) => {
        const newProduct = { ...product };
        set((state) => ({
          products: [...state.products, newProduct],
        }));
      },

      updateProduct: (id, productUpdate) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id ? { ...product, ...productUpdate } : product
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        }));
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // API methods using backend
      fetchProducts: async () => {
        set({ loading: true, error: null });
        try {
          const products = await ProductService.getAll();
          console.log('Products : ', products);
          set({ products, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch products';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
        }
      },

      createProduct: async (product) => {
        set({ loading: true, error: null });
        try {
          // Validate with Zod and add default pump info
          const validatedProduct = ProductSchema.parse({
            ...product,
            pumpId: DEFAULT_PUMP_INFO.pumpId,
            pumpCode: DEFAULT_PUMP_INFO.pumpCode,
          });

          const newProduct = await ProductService.create(validatedProduct);

          set((state) => ({
            products: [...state.products, newProduct],
            loading: false,
          }));
          toast.success('Product created successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to create product';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      editProduct: async (id, productUpdate) => {
        set({ loading: true, error: null });
        try {
          // Validate the update data to ensure required fields are present
          const currentProduct = useProductStore
            .getState()
            .products.find((p) => p.id === id);
          if (!currentProduct) {
            throw new Error('Product not found');
          }

          // Merge with current product to ensure all required fields are present
          const completeUpdate = {
            ...currentProduct,
            ...productUpdate,
          };

          // Validate the complete product
          const validatedProduct = ProductSchema.parse(completeUpdate);

          const updatedProduct = await ProductService.update(
            id,
            validatedProduct
          );

          set((state) => ({
            products: state.products.map((product) =>
              product.id === id ? updatedProduct : product
            ),
            loading: false,
          }));
          toast.success('Product updated successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to update product';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      removeProduct: async (id) => {
        set({ loading: true, error: null });
        try {
          await ProductService.delete(id);

          set((state) => ({
            products: state.products.filter((product) => product.id !== id),
            loading: false,
          }));
          toast.success('Product deleted successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to delete product';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },
    }),
    {
      name: 'product-store',
    }
  )
);
