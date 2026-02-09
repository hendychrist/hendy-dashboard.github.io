"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { createChartOptions, generateBackgroundColors } from "@/lib/chart-config";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  data: Array<{ label: string; value: number }>;
  title?: string;
  horizontal?: boolean;
  showLabels?: boolean;
}

export function BarChart({ data, title, horizontal = false, showLabels = true }: BarChartProps) {
  const labels = data.map((d) => d.label);
  const values = data.map((d) => d.value);
  const colors = generateBackgroundColors(data.length);

  const chartData = {
    labels,
    datasets: [
      {
        label: title || "Count",
        data: values,
        backgroundColor: colors,
        borderWidth: 1,
        borderColor: colors.map((c) => c),
        borderRadius: 6,
      },
    ],
  };

  const options: typeof createChartOptions extends (...args: any[]) => infer R ? R : never = createChartOptions(title || "Bar Chart", {
    indexAxis: horizontal ? "y" : "x",
    scales: {
      x: {
        display: showLabels,
        ticks: {
          color: "#ffffff", // White text for x-axis
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#ffffff", // White text for y-axis
          font: {
            size: 11,
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)", // White grid lines
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  });

  return (
    <div className="relative h-80 w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
}
