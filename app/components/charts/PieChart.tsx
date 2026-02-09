"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { createChartOptions, generateBackgroundColors } from "../../../lib/chart-config";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: Array<{ label: string; value: number }>;
  title?: string;
}

export function PieChart({ data, title }: PieChartProps) {
  const labels = data.map((d) => d.label);
  const values = data.map((d) => d.value);
  const colors = generateBackgroundColors(data.length);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: "#fff",
        hoverOffset: 8,
      },
    ],
  };

  const options = createChartOptions(title || "Distribution");

  return (
    <div className="relative h-80 w-full">
      <Pie data={chartData} options={options} />
    </div>
  );
}
