import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Customer, PaymentMethod, Product, Sale } from '../types';
import { storage } from '../services/storage';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

interface POSContextType {
  cart: CartItem[];
  customers: Customer[];
  selectedCustomer: Customer | undefined;
  setSelectedCustomerId: (id: string) => void;
  addToCart: (product: Product, quantity?: number) => boolean;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  setDiscountType: (type: 'percentage' | 'fixed') => void;
  setDiscountValue: (value: number) => void;
  notes: string;
  setNotes: (notes: string) => void;
  // Computed values
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  itemCount: number;
  // Sale execution
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  lastCompletedSale: Sale | null;
  setLastCompletedSale: (sale: Sale | null) => void;
  isReceiptModalOpen: boolean;
  setIsReceiptModalOpen: (open: boolean) => void;
  processSale: (
    paymentMethod: PaymentMethod,
    amountPaid: number
  ) => { success: boolean; sale?: Sale; error?: string };
  // Search & scanner
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (categoryId: string) => void;
  refreshProducts: () => void;
  allProducts: Product[];
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [allProducts, setAllProducts] = useState<Product[]>(() => storage.getProducts());
  const [customers, setCustomers] = useState<Customer[]>(() => storage.getCustomers());
  const [selectedCustomerId, setSelectedCustomerIdState] = useState<string>('cust_walkin');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  const refreshProducts = () => {
    setAllProducts(storage.getProducts());
    setCustomers(storage.getCustomers());
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const setSelectedCustomerId = (id: string) => {
    setSelectedCustomerIdState(id);
  };

  // Add item to cart
  const addToCart = (product: Product, quantity = 1): boolean => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    const currentQtyInCart = existingIndex >= 0 ? cart[existingIndex].quantity : 0;
    const requestedTotal = currentQtyInCart + quantity;

    if (requestedTotal > product.currentStock) {
      return false; // Exceeds available stock
    }

    if (existingIndex >= 0) {
      const updatedCart = [...cart];
      const newQty = updatedCart[existingIndex].quantity + quantity;
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity: newQty,
        total: newQty * updatedCart[existingIndex].unitPrice,
      };
      setCart(updatedCart);
    } else {
      const unitPrice =
        selectedCustomer?.type === 'wholesale' && product.wholesalePrice
          ? product.wholesalePrice
          : product.sellingPrice;

      setCart([
        ...cart,
        {
          product,
          quantity,
          unitPrice,
          discount: 0,
          total: quantity * unitPrice,
        },
      ]);
    }
    return true;
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const prod = allProducts.find((p) => p.id === productId);
    if (!prod) return;

    if (quantity > prod.currentStock) {
      // capped at stock
      quantity = prod.currentStock;
    }

    setCart(
      cart.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              total: quantity * item.unitPrice - item.discount,
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountValue(0);
    setNotes('');
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);

  const discountAmount =
    discountType === 'percentage'
      ? Math.round((subtotal * Math.min(100, Math.max(0, discountValue))) / 100)
      : Math.min(subtotal, Math.max(0, discountValue));

  const settings = storage.getSettings();
  const taxAmount = settings.enableTax
    ? Math.round((subtotal - discountAmount) * (settings.taxRate / 100))
    : 0;

  const grandTotal = Math.max(0, subtotal - discountAmount + taxAmount);
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Barcode scanner auto-listener (captures rapid hardware barcode scanner input)
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting when user is typing into input fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      const currentTime = Date.now();
      // Barcode scanners type very rapidly (< 50ms per key)
      if (currentTime - lastKeyTime > 100) {
        buffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          const matched = allProducts.find(
            (p) => p.barcode === buffer || p.sku.toLowerCase() === buffer.toLowerCase()
          );
          if (matched) {
            addToCart(matched, 1);
            buffer = '';
            e.preventDefault();
          }
        }
        buffer = '';
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allProducts, cart, selectedCustomer]);

  // Execute sale
  const processSale = (
    paymentMethod: PaymentMethod,
    amountPaid: number
  ): { success: boolean; sale?: Sale; error?: string } => {
    if (cart.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    const result = storage.createSale({
      customerId: selectedCustomerId,
      items: cart.map((c) => ({
        productId: c.product.id,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        discount: c.discount,
      })),
      discount: discountAmount,
      amountPaid,
      paymentMethod,
      notes,
      actor: currentUser,
    });

    if (result.success && result.sale) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch {
        // ignore
      }

      setLastCompletedSale(result.sale);
      setIsCheckoutOpen(false);
      setIsReceiptModalOpen(true);
      clearCart();
      refreshProducts();
    }

    return result;
  };

  return (
    <POSContext.Provider
      value={{
        cart,
        customers,
        selectedCustomer,
        setSelectedCustomerId,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        discountType,
        discountValue,
        setDiscountType,
        setDiscountValue,
        notes,
        setNotes,
        subtotal,
        discountAmount,
        taxAmount,
        grandTotal,
        itemCount,
        isCheckoutOpen,
        setIsCheckoutOpen,
        lastCompletedSale,
        setLastCompletedSale,
        isReceiptModalOpen,
        setIsReceiptModalOpen,
        processSale,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        refreshProducts,
        allProducts,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
