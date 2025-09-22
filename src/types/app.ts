
export interface AppError {
  message: string;
  code?: string;
  timestamp: string;
  stack?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: AppError;
}

export interface DataOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: AppError;
}

export interface TableSalesData {
  tableId: string;
  tableName: string;
  sales: SaleRecord[];
  totalAmount: number;
  itemCount: number;
  status: TableStatus;
}

export type TableStatus = 'available' | 'occupied' | 'reserved';

export interface SaleRecord {
  id: string;
  item: string;
  quantity: number;
  unitPrice: number;
  total: number;
  date: string;
  tableId?: string;
  sellerName?: string;
  createdAt: string;
}

export interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: string;
}

export interface OptimizedComponentProps {
  shouldUpdate?: boolean;
  dependencies?: readonly unknown[];
}
