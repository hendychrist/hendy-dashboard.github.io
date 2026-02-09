"use client";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { DashboardFilters } from "@/hooks/useDashboardData";

interface FiltersProps {
  filters: DashboardFilters;
  setFilters: (filters: DashboardFilters) => void;
  availableStates: string[];
  availablePayments: string[];
  availableMonths: string[];
  loading?: boolean;
}

export function Filters({
  filters,
  setFilters,
  availableStates,
  availablePayments,
  availableMonths,
  loading = false,
}: FiltersProps) {
  // Get current range indices
  const getCurrentRange = (): [number, number] => {
    const startIdx = availableMonths.indexOf(filters.monthStart);
    const endIdx = availableMonths.indexOf(filters.monthEnd);
    return [
      startIdx >= 0 ? startIdx : 0,
      endIdx >= 0 ? endIdx : availableMonths.length - 1,
    ];
  };

  const [rangeStart, rangeEnd] = getCurrentRange();

  const handleSliderChange = (values: number[] | number) => {
    // Handle both single number (rc-slider v10) and array (v11)
    const [startIdx, endIdx] = Array.isArray(values) ? values : [values, values];
    setFilters({
      ...filters,
      monthStart: availableMonths[startIdx],
      monthEnd: availableMonths[endIdx],
    });
  };

  // Create marks object for the slider
  const createMarks = () => {
    const marks: Record<number, string> = {};
    const totalMonths = availableMonths.length;
    const step = Math.max(1, Math.floor(totalMonths / 6)); // Show ~6-7 marks

    for (let i = 0; i < totalMonths; i += step) {
      const month = availableMonths[i];
      const [year, mon] = month.split("-");
      marks[i] = `${mon}/${year.slice(2)}`;
    }

    // Always mark the last position
    if (totalMonths - 1 > 0 && !marks[totalMonths - 1]) {
      const lastMonth = availableMonths[totalMonths - 1];
      const [year, mon] = lastMonth.split("-");
      marks[totalMonths - 1] = `${mon}/${year.slice(2)}`;
    }

    return marks;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Dashboard Filters
        </h3>
        {loading && (
          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500"></span>
            Updating...
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Order Status
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="delivered">Delivered</option>
            <option value="shipped">Shipped</option>
            <option value="processing">Processing</option>
            <option value="canceled">Canceled</option>
            <option value="invoiced">Invoiced</option>
            <option value="unavailable">Unavailable</option>
            <option value="created">Created</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        {/* Payment Type Filter */}
        <div>
          <label htmlFor="payment-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Payment Type
          </label>
          <select
            id="payment-filter"
            value={filters.payment}
            onChange={(e) => setFilters({ ...filters, payment: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="all">All Payment Types</option>
            {availablePayments.map((payment) => (
              <option key={payment} value={payment}>
                {payment}
              </option>
            ))}
          </select>
        </div>

        {/* State Filter */}
        <div>
          <label htmlFor="state-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Customer State
          </label>
          <select
            id="state-filter"
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="all">All States</option>
            {availableStates.slice(0, 20).map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={() =>
              setFilters({
                status: "all",
                payment: "all",
                state: "all",
                monthStart: availableMonths[0],
                monthEnd: availableMonths[availableMonths.length - 1],
              })
            }
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Month Range Slider - Dual Handle */}
      {availableMonths.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date Range Filter
            </label>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {filters.monthStart} → {filters.monthEnd}
            </span>
          </div>

          <div className="px-2 pb-2">
            <Slider
              range
              min={0}
              max={availableMonths.length - 1}
              step={1}
              value={[rangeStart, rangeEnd]}
              onChange={(values) => handleSliderChange(values as number[])}
              marks={createMarks()}
              allowCross={false}
              className="mb-4"
              styles={{
                track: {
                  backgroundColor: '#3b82f6',
                  height: 6,
                },
                rail: {
                  backgroundColor: '#e5e7eb',
                  height: 6,
                },
                handle: {
                  borderColor: '#2563eb',
                  height: 20,
                  width: 20,
                  marginTop: -7,
                },
              }}
            />

            {/* Date labels below slider */}
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span className="font-medium">Start: {filters.monthStart}</span>
              <span className="font-medium">End: {filters.monthEnd}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
