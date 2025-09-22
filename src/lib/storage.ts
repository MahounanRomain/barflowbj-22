import { generateMockData } from './utils';

export interface BarData {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  price?: number; // Made optional since some components don't provide it
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  stock: number;
  unit: string;
  threshold: number;
  lowStockThreshold?: number; // Made optional since components use threshold instead
  imageUrl?: string;
  supplier?: string;
  sku?: string;
  barcode?: string;
  notes?: string;
  containerType: string;
  minQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  firstName?: string; // Made optional since components only provide name
  lastName?: string;  // Made optional since components only provide name
  email: string;
  phone: string;
  role: string;
  permissions?: string[]; // Made optional with default empty array
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaleRecord {
  id: string;
  item: string;
  quantity: number;
  unitPrice: number;
  total: number;
  sellerId: string;
  sellerName: string;
  tableId?: string;
  tableName?: string;
  date: string;
  items?: { id: string; name: string; quantity: number; price: number }[]; // Made optional
  totalAmount?: number; // Made optional since total is provided
  paymentMethod?: string; // Made optional
  staffMember?: string; // Made optional since sellerName is provided
  customer?: string;
  createdAt: string;
}

export interface BarSettings {
  barName: string;
  address: string;
  phone: string;
  email: string;
  darkMode: boolean;
  notifications: boolean;
  lowStockAlerts: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  parentId?: string; // For hierarchical categories
  isParent?: boolean; // True for parent categories
  createdAt: string;
  updatedAt: string;
}

export interface InventoryHistoryEntry {
  id: string;
  itemId: string;
  itemName: string;
  action: 'created' | 'updated' | 'deleted' | 'stock_adjusted';
  changes: Record<string, { from: any; to: any }>;
  userId: string;
  userName: string;
  timestamp: string;
  reason?: string;
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  isActive: boolean;
  createdAt: string;
}

interface StorageInterface {
  save: <T>(key: string, value: T) => void;
  load: <T>(key: string) => T | null;
  exists: (key: string) => boolean;
  delete: (key: string) => void;
  clearAll: () => void;
}

export const storage: StorageInterface = {
  save: <T>(key: string, value: T) => {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom events for real-time updates
    const eventName = key + 'Changed';
    window.dispatchEvent(new CustomEvent(eventName, { detail: value }));
  },
  load: <T>(key: string): T | null => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  exists: (key: string): boolean => {
    return localStorage.getItem(key) !== null;
  },
  delete: (key: string): void => {
    localStorage.removeItem(key);
  },
  clearAll: (): void => {
    localStorage.clear();
  }
};

export interface CashBalance {
  id: string;
  initialAmount: number;
  currentAmount: number;
  lastUpdated: string;
  createdAt: string;
}

export interface CashTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  relatedSaleId?: string;
  timestamp: string;
}
