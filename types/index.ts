// Delivery Status Types
export interface DeliveryStatus {
  status: string;
  count: number;
}

// State Performance Types
export interface StatePerformance {
  state: string;
  totalOrders: number;
  deliveredOnTime: number;
  deliveredLate: number;
  canceled: number;
  avgDelayDays: number;
}

// ML Metrics Types
export interface MLMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: {
    tp: number;
    tn: number;
    fp: number;
    fn: number;
  };
  classDistribution: {
    delivered: number;
    canceled: number;
    other: number;
  };
}

// Monthly Trends Types
export interface MonthlyTrend {
  month: string;
  year: number;
  totalOrders: number;
  delivered: number;
  canceled: number;
  revenue: number;
}

// Risk Indicator Types
export interface RiskIndicator {
  level: 'low' | 'medium' | 'high';
  message: string;
  value: number;
  threshold: number;
}

// Product Categories Types
export interface ProductCategory {
  category: string;
  orderCount: number;
  revenue: number;
}

// Payment Methods Types
export interface PaymentMethod {
  paymentType: string;
  transactionCount: number;
  totalValue: number;
  avgValue: number;
  percentage: number;
}

// Customer Demographics Types
export interface CustomerDemographics {
  byState: Array<{
    state: string;
    customerCount: number;
    cityCount: number;
  }>;
  topCities: Array<{
    city: string;
    count: number;
  }>;
}

// Reviews Analysis Types
export interface ReviewsAnalysis {
  scoreDistribution: Array<{
    score: number;
    count: number;
  }>;
  averageScore: number;
  totalReviews?: number;
  positivePercentage: number;
  negativePercentage: number;
}
