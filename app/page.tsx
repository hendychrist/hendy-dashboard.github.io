"use client";

import { useState } from "react";
import Link from "next/link";
import { PieChart } from "./components/charts/PieChart";
import { BarChart } from "./components/charts/BarChart";
import { StackedBarChart } from "./components/charts/StackedBarChart";
import { DonutChart } from "./components/charts/DonutChart";
import { KPICard } from "./components/kpi/KPICard";
import { RiskIndicator } from "./components/insights/RiskIndicator";
import { Filters } from "./components/Filters";
import { useDashboardData, DashboardFilters } from "./hooks/useDashboardData";
import { calculatePercentage, formatNumber } from "../lib/utils";

export default function DashboardPage() {
  // Get available filter options from data (will be populated on first load)
  const [availableStates] = useState([
    "SP", "RJ", "MG", "RS", "PR", "SC", "BA", "PE", "GO", "ES", "CE", "PA", "MT", "DF", "AM"
  ]);
  const [availablePayments] = useState([
    "credit_card", "boleto", "voucher", "debit_card"
  ]);
  const [availableMonths] = useState(() => {
    const months: string[] = [];
    const startYear = 2016;
    const startMonth = 9; // September
    const endYear = 2018;
    const endMonth = 9; // September

    let currentYear = startYear;
    let currentMonth = startMonth;

    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      months.push(`${currentYear}-${String(currentMonth).padStart(2, "0")}`);
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    return months;
  });

  // Initialize filters with full date range
  const [filters, setFilters] = useState<DashboardFilters>({
    status: "all",
    payment: "all",
    state: "all",
    monthStart: availableMonths[0],
    monthEnd: availableMonths[availableMonths.length - 1],
  });

  // Fetch dashboard data with filters
  const { data, loading, error } = useDashboardData(filters);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <p className="text-white">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const { kpi, deliveryStatus, statePerformance, monthlyTrends, productCategories, paymentMethods, reviewsAnalysis, customerDemographics } = data;

  const totalOrders = kpi.totalOrders;
  const deliveryRate = kpi.deliveredRate;
  const pendingOrders = deliveryStatus
    .filter((d) => !["delivered", "canceled"].includes(d.status))
    .reduce((sum, d) => sum + d.count, 0);
  const canceledCount = deliveryStatus.find((d) => d.status === "canceled")?.count || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Olist Analytics Dashboard
              </h1>
              <p className="mt-1 text-sm text-white">
                Hendy Christian - 2602623415
              </p>
            </div>
            <div className="flex gap-3">
              <a
                // save Direct Debit 
                //href="https://example.com/?status=success&referenceNo=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI2alBVdDdKOTc5Ny1qZVg3MUQ0aHFtcFpEb3pWcW9XRkRlclNvZWJWdHc0In0.eyJleHAiOjE3NzA5MDk0MDgsImlhdCI6MTc3MDg5MTQwOCwianRpIjoiNjgxOGZiNDUtYTExNy00MzM4LTg5NTctMDE0NGVkZTg3YzdmIiwiaXNzIjoiaHR0cHM6Ly9zdGcta2V5Y2xvYWsuYmFua2luYS5pZC9hdXRoL3JlYWxtcy9CSU5BIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjdmYWQ5MmQzLWNmYTEtNDFlMS05ZmRjLTMxZTNjMDBjODliYSIsInR5cCI6IkJlYXJlciIsImF6cCI6Im1vYmlsZSIsInNlc3Npb25fc3RhdGUiOiJhNGVkMTFjMi1lY2ViLTRkNWEtOWY5MC04NWJhYjhmM2EwZGYiLCJhbGxvd2VkLW9yaWdpbnMiOlsiLyoiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtYmluYSIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImVtYWlsIG9mZmxpbmVfYWNjZXNzIHByb2ZpbGUiLCJzaWQiOiJhNGVkMTFjMi1lY2ViLTRkNWEtOWY5MC04NWJhYjhmM2EwZGYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInByZWZlcnJlZF91c2VybmFtZSI6ImFiYzJqc2hzIiwidXNlciI6eyJpZCI6MTE4MTV9fQ.ut-g-B_ihnBVd5kw83Yq9r7w5tMgbdKuiLfOPesFwxwBtCFyMHaUPWBLRHO8cKPBD90-m_92JwGSVq5KJLa19ChHSqP-Yb15EdS_6_7LYF0sGbwLyVjLDidPJ03cOcFuL5N1_aA-Fjkr1fKVpSN0Jcb6GW8YSBw37jwwPa2TXW2GOS-TWY11CsLNghRZyIYR_xhpBqFcXKYHt5Hsj5x97KEOD2cYO1pSe0Ce7BNs2aLDuS8S7DAaoUBrSU7YBXDo9p7wMw5ObXiisUvnYJ2V3pwi9W6RpGr0IyA2PW50NF9FDuV3gDtkCx3eSjIU-fKXnF5HLi5gdv1hoxZfOZo_6g&referenceNo=2026021216130882215850688479&accountNo=816688285400&secondaryAccountNo=85009109051035&refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkMDNiYjFmZC00M2QyLTQ1NjQtOTMyMy02ZTE5M2E1NWFjZmQifQ.eyJpYXQiOjE3NzA4OTE0MDgsImp0aSI6ImEzYTEyYjJkLTI2NzMtNDIzNy05MWJkLWMzYjQ2ZWYzOTNjZSIsImlzcyI6Imh0dHBzOi8vc3RnLWtleWNsb2FrLmJhbmtpbmEuaWQvYXV0aC9yZWFsbXMvQklOQSIsImF1ZCI6Imh0dHBzOi8vc3RnLWtleWNsb2FrLmJhbmtpbmEuaWQvYXV0aC9yZWFsbXMvQklOQSIsInN1YiI6IjdmYWQ5MmQzLWNmYTEtNDFlMS05ZmRjLTMxZTNjMDBjODliYSIsInR5cCI6Ik9mZmxpbmUiLCJhenAiOiJtb2JpbGUiLCJzZXNzaW9uX3N0YXRlIjoiYTRlZDExYzItZWNlYi00ZDVhLTlmOTAtODViYWI4ZjNhMGRmIiwic2NvcGUiOiJlbWFpbCBvZmZsaW5lX2FjY2VzcyBwcm9maWxlIiwic2lkIjoiYTRlZDExYzItZWNlYi00ZDVhLTlmOTAtODViYWI4ZjNhMGRmIn0.5W5MR2wu-dg0w7fzppXL8M6USQ6NfSG2XYyRHCRqAO4&username=Abc2jshs&errorCode=ESP-200&errorMessage=User%20binding%20already%20exist"
                
                // save binding 
                 href="https://example.com/?status=success&userToken=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI2alBVdDdKOTc5Ny1qZVg3MUQ0aHFtcFpEb3pWcW9XRkRlclNvZWJWdHc0In0.eyJleHAiOjE3NzA5MDk0MDgsImlhdCI6MTc3MDg5MTQwOCwianRpIjoiNjgxOGZiNDUtYTExNy00MzM4LTg5NTctMDE0NGVkZTg3YzdmIiwiaXNzIjoiaHR0cHM6Ly9zdGcta2V5Y2xvYWsuYmFua2luYS5pZC9hdXRoL3JlYWxtcy9CSU5BIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjdmYWQ5MmQzLWNmYTEtNDFlMS05ZmRjLTMxZTNjMDBjODliYSIsInR5cCI6IkJlYXJlciIsImF6cCI6Im1vYmlsZSIsInNlc3Npb25fc3RhdGUiOiJhNGVkMTFjMi1lY2ViLTRkNWEtOWY5MC04NWJhYjhmM2EwZGYiLCJhbGxvd2VkLW9yaWdpbnMiOlsiLyoiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtYmluYSIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImVtYWlsIG9mZmxpbmVfYWNjZXNzIHByb2ZpbGUiLCJzaWQiOiJhNGVkMTFjMi1lY2ViLTRkNWEtOWY5MC04NWJhYjhmM2EwZGYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInByZWZlcnJlZF91c2VybmFtZSI6ImFiYzJqc2hzIiwidXNlciI6eyJpZCI6MTE4MTV9fQ.ut-g-B_ihnBVd5kw83Yq9r7w5tMgbdKuiLfOPesFwxwBtCFyMHaUPWBLRHO8cKPBD90-m_92JwGSVq5KJLa19ChHSqP-Yb15EdS_6_7LYF0sGbwLyVjLDidPJ03cOcFuL5N1_aA-Fjkr1fKVpSN0Jcb6GW8YSBw37jwwPa2TXW2GOS-TWY11CsLNghRZyIYR_xhpBqFcXKYHt5Hsj5x97KEOD2cYO1pSe0Ce7BNs2aLDuS8S7DAaoUBrSU7YBXDo9p7wMw5ObXiisUvnYJ2V3pwi9W6RpGr0IyA2PW50NF9FDuV3gDtkCx3eSjIU-fKXnF5HLi5gdv1hoxZfOZo_6g&referenceNo=2026021216130882215850688479&accountNo=816688285400&secondaryAccountNo=85009109051035&refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkMDNiYjFmZC00M2QyLTQ1NjQtOTMyMy02ZTE5M2E1NWFjZmQifQ.eyJpYXQiOjE3NzA4OTE0MDgsImp0aSI6ImEzYTEyYjJkLTI2NzMtNDIzNy05MWJkLWMzYjQ2ZWYzOTNjZSIsImlzcyI6Imh0dHBzOi8vc3RnLWtleWNsb2FrLmJhbmtpbmEuaWQvYXV0aC9yZWFsbXMvQklOQSIsImF1ZCI6Imh0dHBzOi8vc3RnLWtleWNsb2FrLmJhbmtpbmEuaWQvYXV0aC9yZWFsbXMvQklOQSIsInN1YiI6IjdmYWQ5MmQzLWNmYTEtNDFlMS05ZmRjLTMxZTNjMDBjODliYSIsInR5cCI6Ik9mZmxpbmUiLCJhenAiOiJtb2JpbGUiLCJzZXNzaW9uX3N0YXRlIjoiYTRlZDExYzItZWNlYi00ZDVhLTlmOTAtODViYWI4ZjNhMGRmIiwic2NvcGUiOiJlbWFpbCBvZmZsaW5lX2FjY2VzcyBwcm9maWxlIiwic2lkIjoiYTRlZDExYzItZWNlYi00ZDVhLTlmOTAtODViYWI4ZjNhMGRmIn0.5W5MR2wu-dg0w7fzppXL8M6USQ6NfSG2XYyRHCRqAO4&username=Abc2jshs&errorCode=ESP-200&errorMessage=User%20binding%20already%20exist"
              
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                ✓ Complete Bank Case
              </a>
              <Link
                href="/model"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                ML Model Insights →
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Filters */}
        <Filters
          filters={filters}
          setFilters={setFilters}
          availableStates={availableStates}
          availablePayments={availablePayments}
          availableMonths={availableMonths}
          loading={loading}
        />

        {/* KPI Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Key Performance Indicators
            {loading && <span className="ml-2 text-sm font-normal text-white">Updating...</span>}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard
              title="Total Orders"
              value={formatNumber(totalOrders)}
              color="blue"
            />
            <KPICard
              title="Delivery Rate"
              value={`${deliveryRate}%`}
              change="Success rate"
              changeType="positive"
              color="green"
            />
            <KPICard
              title="Total Revenue"
              value={`R$${formatNumber(kpi.totalRevenue)}`}
              change="From filtered data"
              changeType="positive"
              color="purple"
            />
            <KPICard
              title="Avg Review Score"
              value={kpi.avgReviewScore.toFixed(1)}
              change="/ 5.0"
              changeType={kpi.avgReviewScore >= 4 ? "positive" : "neutral"}
              color="amber"
            />
          </div>
        </section>

        {/* Order Status Distribution */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Order Status Distribution
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <PieChart
                data={deliveryStatus.map((d) => ({ label: d.status, value: d.count }))}
                title="Status Distribution"
              />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <BarChart
                data={deliveryStatus.map((d) => ({ label: d.status, value: d.count }))}
                title="Orders by Status"
                horizontal
              />
            </div>
          </div>
        </section>

        {/* Product Categories Performance */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Product Categories Performance
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <BarChart
                data={productCategories.slice(0, 10).map((cat) => ({
                  label: cat.category.length > 20 ? cat.category.substring(0, 20) + "..." : cat.category,
                  value: cat.orderCount,
                }))}
                title="Top 10 Categories by Orders"
                horizontal
              />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <BarChart
                data={productCategories.slice(0, 10).map((cat) => ({
                  label: cat.category.length > 20 ? cat.category.substring(0, 20) + "..." : cat.category,
                  value: cat.revenue,
                }))}
                title="Top 10 Categories by Revenue"
                horizontal
              />
            </div>
          </div>
        </section>

        {/* Payment Methods & Reviews */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Payment Methods & Customer Reviews
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Payment Methods Distribution
              </h3>
              <div className="flex items-center gap-6">
                {/* Donut Chart - smaller, no center text */}
                <div className="flex-shrink-0">
                  <DonutChart
                    data={paymentMethods.map((pm) => ({ label: pm.paymentType, value: pm.transactionCount }))}
                    title=""
                    centerText=""
                  />
                </div>
                {/* Legend - right side */}
                <div className="flex-1 space-y-2">
                  {paymentMethods.map((pm, idx) => {
                    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
                    return (
                      <div key={pm.paymentType} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colors[idx % colors.length] }}
                          />
                          <span className="text-sm text-white font-medium capitalize">
                            {pm.paymentType.replace(/_/g, " ")}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-white bg-gray-700 dark:bg-gray-600 px-2 py-1 rounded">
                          {pm.percentage.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Total count */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                <span className="text-sm text-white">
                  Total Payment Methods:{" "}
                  <span className="font-bold text-white">{paymentMethods.length}</span>
                </span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <BarChart
                data={reviewsAnalysis.scoreDistribution.map((sd) => ({
                  label: `${sd.score} Star${sd.score > 1 ? "s" : ""}`,
                  value: sd.count,
                }))}
                title="Review Score Distribution"
              />
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <p className="text-xs text-white">Positive</p>
                  <p className="text-lg font-bold text-green-600">{reviewsAnalysis.positivePercentage}%</p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <p className="text-xs text-white">Negative</p>
                  <p className="text-lg font-bold text-red-600">{reviewsAnalysis.negativePercentage}%</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Demographics */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Customer Demographics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <BarChart
                data={customerDemographics.byState.slice(0, 10).map((state) => ({
                  label: state.state,
                  value: state.customerCount,
                }))}
                title="Top 10 States by Customers"
                horizontal
              />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top Cities</h3>
              <div className="space-y-3">
                {customerDemographics.topCities.map((city, idx) => (
                  <div key={city.city} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-white w-6">#{idx + 1}</span>
                      <span className="text-sm text-white">{city.city}</span>
                    </div>
                    <span className="text-sm font-semibold">{formatNumber(city.count)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* State Performance */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Delivery Performance by State
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <StackedBarChart
              data={statePerformance.map((s) => ({
                label: s.state,
                datasets: {
                  onTime: s.deliveredOnTime,
                  late: s.deliveredLate,
                  canceled: s.canceled,
                },
              }))}
              title="Orders by State (Top 15)"
            />
          </div>
        </section>

        {/* Monthly Trends */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Monthly Order Trends
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <BarChart
              data={monthlyTrends.map((t) => ({
                label: t.month,
                value: t.totalOrders,
              }))}
              title="Monthly Orders (Filtered Range)"
            />
          </div>
        </section>

        {/* Risk Indicators */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Operational Risk Indicators
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <RiskIndicator
              nonDeliveredRate={calculatePercentage(canceledCount + pendingOrders, totalOrders)}
              pendingOrdersRate={calculatePercentage(pendingOrders, totalOrders)}
            />
          </div>
        </section>

        {/* Insights Summary */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Executive Summary
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-lg shadow-lg p-6 border border-blue-100 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {deliveryRate}%
                </div>
                <p className="text-sm text-white">
                  Delivery Success Rate
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {statePerformance.length}
                </div>
                <p className="text-sm text-white">
                  States Covered
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {kpi.totalRevenue > 0 ? `R$${(kpi.totalRevenue / 1000000).toFixed(1)}M` : "R$0"}
                </div>
                <p className="text-sm text-white">
                  Total Revenue
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-600 mb-2">
                  {kpi.avgReviewScore.toFixed(1)}
                </div>
                <p className="text-sm text-white">
                  Avg Customer Rating
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Summary */}
        <section className="mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Active Filters:</strong> Status: {filters.status === "all" ? "All" : filters.status} |
              Payment: {filters.payment === "all" ? "All" : filters.payment} |
              State: {filters.state === "all" ? "All" : filters.state} |
              Date Range: {filters.monthStart} to {filters.monthEnd}
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-white">
          <p>Olist Big Data Analytics Dashboard • Powered by Apache Spark & Machine Learning</p>
          <p className="mt-1">Interactive Analysis with Real-time Filtering</p>
        </div>
      </footer>
    </div>
  );
}
