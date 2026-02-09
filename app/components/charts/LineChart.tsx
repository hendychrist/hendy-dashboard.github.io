"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { createChartOptions } from "@/lib/chart-config";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  data: Array<{
    label: string;
    datasets: Array<{
      label: string;
      data: number[];
      color: string;
      fill?: boolean;
    }>;
  }>;
  labels: string[];
  title?: string;
}

export function LineChart({ labels, data, title }: LineChartProps) {
  const chartData = {
    labels,
    datasets: data[0].datasets.map((dataset) => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: dataset.color,
      backgroundColor: dataset.fill ? dataset.color + "20" : "transparent",
      borderWidth: 3,
      tension: 0.4,
      fill: dataset.fill || false,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  };

  const options = createChartOptions(title || "Trend", {
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
  });

  return (
    <div className="relative h-80 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
