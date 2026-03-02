export interface Medicine {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  stock: number;
  unit: string;
  price: number;
  expiryDate: string;
  reorderLevel: number;
}

export interface StockAlert {
  id: string;
  medicineId: string;
  medicineName: string;
  currentStock: number;
  reorderLevel: number;
  severity: 'low' | 'critical' | 'out-of-stock';
}

export interface DemandForecast {
  medicineId: string;
  medicineName: string;
  currentStock: number;
  predictedDemand: number;
  confidence: number;
  recommendedOrder: number;
  timeframe: string;
}
