import { useState, useEffect, useRef } from "react";

export interface DashboardFilters {
  status: string;
  payment: string;
  state: string;
  monthStart: string;
  monthEnd: string;
}

export interface DashboardData {
  kpi: {
    totalOrders: number;
    deliveredRate: number;
    totalRevenue: number;
    avgReviewScore: number;
  };
  deliveryStatus: Array<{ status: string; count: number }>;
  statePerformance: Array<{
    state: string;
    totalOrders: number;
    deliveredOnTime: number;
    deliveredLate: number;
    canceled: number;
  }>;
  monthlyTrends: Array<{ month: string; year: number; totalOrders: number }>;
  productCategories: Array<{ category: string; orderCount: number; revenue: number }>;
  paymentMethods: Array<{
    paymentType: string;
    transactionCount: number;
    percentage: number;
  }>;
  reviewsAnalysis: {
    scoreDistribution: Array<{ score: number; count: number }>;
    averageScore: number;
    positivePercentage: number;
    negativePercentage: number;
  };
  customerDemographics: {
    byState: Array<{ state: string; customerCount: number }>;
    topCities: Array<{ city: string; count: number }>;
  };
}

export function useDashboardData(filters: DashboardFilters) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      // Build query string
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "all") params.append("status", filters.status);
      if (filters.payment && filters.payment !== "all") params.append("payment", filters.payment);
      if (filters.state && filters.state !== "all") params.append("state", filters.state);
      if (filters.monthStart) params.append("month_start", filters.monthStart);
      if (filters.monthEnd) params.append("month_end", filters.monthEnd);

      const queryString = params.toString();
      const url = `/api/dashboard-summary${queryString ? `?${queryString}` : ""}`;

      try {
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        setData(json);
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") {
          console.error("Error fetching dashboard data:", e);
          setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    }

    // Debounce: wait 200ms after last filter change before fetching
    timeoutRef.current = setTimeout(() => {
      load();
    }, 200);

    return () => {
      clearTimeout(timeoutRef.current);
      controller.abort();
    };
  }, [filters]);

  return { data, loading, error };
}
