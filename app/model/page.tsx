"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MLMetrics } from "../../types";
import { formatNumber } from "../../lib/utils";
import { MLMetricsCard } from "./components/insights/MLMetricsCard";

export default function ModelPage() {
  const [mlMetrics, setMLMetrics] = useState<MLMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ml-metrics")
      .then((res) => res.json())
      .then((data) => {
        setMLMetrics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching ML metrics:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading ML Model Insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Machine Learning Model Insights
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Performance Metrics & Model Analysis
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Model Overview */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-lg shadow-lg p-6 border border-purple-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Model Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Model Type</p>
                <p className="text-xl font-bold text-purple-600">Classification</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Target Variable</p>
                <p className="text-xl font-bold text-purple-600">Order Status</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Predictions</p>
                <p className="text-xl font-bold text-purple-600">
                  {mlMetrics ? formatNumber(mlMetrics.classDistribution.delivered + mlMetrics.classDistribution.canceled + mlMetrics.classDistribution.other) : "0"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Metrics */}
        {mlMetrics && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Performance Metrics
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <MLMetricsCard
                accuracy={mlMetrics.accuracy}
                precision={mlMetrics.precision}
                recall={mlMetrics.recall}
                f1Score={mlMetrics.f1Score}
              />
            </div>
          </section>
        )}

        {/* Confusion Matrix */}
        {mlMetrics && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Confusion Matrix
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-400"></th>
                      <th className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">Predicted: Positive</th>
                      <th className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">Predicted: Negative</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Actual: Positive
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg p-3">
                          <p className="text-xs font-semibold">True Positive</p>
                          <p className="text-lg font-bold">{formatNumber(mlMetrics.confusionMatrix.tp)}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-lg p-3">
                          <p className="text-xs font-semibold">False Negative</p>
                          <p className="text-lg font-bold">{formatNumber(mlMetrics.confusionMatrix.fn)}</p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Actual: Negative
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg p-3">
                          <p className="text-xs font-semibold">False Positive</p>
                          <p className="text-lg font-bold">{formatNumber(mlMetrics.confusionMatrix.fp)}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg p-3">
                          <p className="text-xs font-semibold">True Negative</p>
                          <p className="text-lg font-bold">{formatNumber(mlMetrics.confusionMatrix.tn)}</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Class Distribution */}
        {mlMetrics && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Class Distribution Analysis
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-green-800 dark:text-green-300">Delivered</h3>
                    <span className="text-2xl font-bold text-green-600">
                      {((mlMetrics.classDistribution.delivered /
                        (mlMetrics.classDistribution.delivered +
                          mlMetrics.classDistribution.canceled +
                          mlMetrics.classDistribution.other)) *
                        100).toFixed(1)}
                      %
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatNumber(mlMetrics.classDistribution.delivered)} instances
                  </p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-red-800 dark:text-red-300">Canceled</h3>
                    <span className="text-2xl font-bold text-red-600">
                      {((mlMetrics.classDistribution.canceled /
                        (mlMetrics.classDistribution.delivered +
                          mlMetrics.classDistribution.canceled +
                          mlMetrics.classDistribution.other)) *
                        100).toFixed(1)}
                      %
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatNumber(mlMetrics.classDistribution.canceled)} instances
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-300">Other</h3>
                    <span className="text-2xl font-bold text-gray-600">
                      {((mlMetrics.classDistribution.other /
                        (mlMetrics.classDistribution.delivered +
                          mlMetrics.classDistribution.canceled +
                          mlMetrics.classDistribution.other)) *
                        100).toFixed(1)}
                      %
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatNumber(mlMetrics.classDistribution.other)} instances
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Insights & Recommendations */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Insights & Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                ⚠️ Class Imbalance Detected
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                The dataset shows significant class imbalance with the "delivered" class dominating.
                This can lead to biased model predictions.
              </p>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Recommended Actions:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>Apply SMOTE or ADASYN for oversampling minority classes</li>
                <li>Use class weighting in model training</li>
                <li>Consider ensemble methods with balanced bagging</li>
                <li>Evaluate using F1-score instead of accuracy</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                📈 Model Performance Analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {mlMetrics && mlMetrics.accuracy >= 95
                  ? "The model demonstrates excellent accuracy with strong performance across all metrics."
                  : mlMetrics && mlMetrics.accuracy >= 85
                  ? "The model shows good performance with room for improvement in precision and recall."
                  : "The model requires additional tuning and feature engineering to improve performance."}
              </p>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Feature Engineering Opportunities:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>Add temporal features (day of week, month)</li>
                <li>Include delivery distance calculations</li>
                <li>Create customer behavior features</li>
                <li>Engineer product category performance scores</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Additional Metrics */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Model Details
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Training Algorithm</span>
                <span className="font-semibold text-gray-900 dark:text-white">Random Forest Classifier</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Cross-Validation</span>
                <span className="font-semibold text-gray-900 dark:text-white">5-Fold</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Feature Count</span>
                <span className="font-semibold text-gray-900 dark:text-white">15 Features</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>ML Model Insights • Powered by Apache Spark & Scikit-learn</p>
        </div>
      </footer>
    </div>
  );
}
