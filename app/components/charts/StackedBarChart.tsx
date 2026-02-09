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
import { createChartOptions } from "../../../lib/chart-config";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface StackedBarChartProps {
  data: Array<{
    label: string;
    datasets: {
      onTime: number;
      late: number;
      canceled: number;
    };
  }>;
  title?: string;
}

export function StackedBarChart({ data, title }: StackedBarChartProps) {
  const labels = data.map((d) => d.label);

  const chartData = {
    labels,
    datasets: [
      {
        label: "On Time",
        data: data.map((d) => d.datasets.onTime),
        backgroundColor: "#10b981",
        borderRadius: 4,
      },
      {
        label: "Late",
        data: data.map((d) => d.datasets.late),
        backgroundColor: "#f59e0b",
        borderRadius: 4,
      },
      {
        label: "Canceled",
        data: data.map((d) => d.datasets.canceled),
        backgroundColor: "#ef4444",
        borderRadius: 4,
      },
    ],
  };

  const options = createChartOptions(title || "Stacked Bar Chart", {
    scales: {
      x: {
        stacked: true,
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
        stacked: true,
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
  });

  return (
    <div className="relative h-96 w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
}
