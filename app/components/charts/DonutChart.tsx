"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { createChartOptions, generateBackgroundColors } from "@/lib/chart-config";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
  data: Array<{ label: string; value: number }>;
  title?: string;
  centerText?: string;
  size?: "sm" | "md" | "lg";
}

export function DonutChart({ data, title, centerText, size = "md" }: DonutChartProps) {
  const labels = data.map((d) => d.label);
  const values = data.map((d) => d.value);
  const colors = generateBackgroundColors(data.length);

  const sizeClasses = {
    sm: "h-48 w-48",
    md: "h-64 w-64",
    lg: "h-80 w-80",
  };

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: () => {
          // Check if dark mode is active
          if (typeof window !== "undefined" && document.documentElement.classList.contains("dark")) {
            return "#1f2937";
          }
          return "#fff";
        },
        hoverOffset: 8,
      },
    ],
  };

  const options = createChartOptions(title || "Distribution", {
    cutout: "70%",
    plugins: {
      ...createChartOptions(title || "Distribution").plugins,
      legend: {
        display: !!title,
        position: "bottom" as const,
        labels: {
          padding: 12,
          font: {
            size: 11,
          },
          color: () => {
            // Check if dark mode is active
            if (typeof window !== "undefined" && document.documentElement.classList.contains("dark")) {
              return "#e5e7eb";
            }
            return "#374151";
          },
        },
      },
    },
  });

  return (
    <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
      <Doughnut data={chartData} options={options} />
      {centerText && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-white drop-shadow-lg">
              {centerText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
