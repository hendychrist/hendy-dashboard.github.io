import { ChartOptions } from "chart.js";

// Base chart options
export const baseChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        padding: 16,
        font: {
          size: 12,
          family: "'Inter', sans-serif",
        },
        color: "#ffffff", // White text for legend
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 12,
      titleFont: {
        size: 14,
        weight: "bold",
      },
      bodyFont: {
        size: 13,
      },
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#ffffff", // White text for x-axis labels
        font: {
          size: 11,
        },
      },
      grid: {
        color: "rgba(255, 255, 255, 0.1)", // Subtle white grid lines
      },
    },
    y: {
      ticks: {
        color: "#ffffff", // White text for y-axis labels
        font: {
          size: 11,
        },
      },
      grid: {
        color: "rgba(255, 255, 255, 0.1)", // Subtle white grid lines
      },
    },
  },
};

// Create options for chart with title
export function createChartOptions(title: string, additionalOptions?: Partial<ChartOptions>): ChartOptions {
  return {
    ...baseChartOptions,
    plugins: {
      ...baseChartOptions.plugins,
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: "bold" as const,
          family: "'Inter', sans-serif",
        },
        padding: { bottom: 16 },
        color: "#ffffff", // White text for title
      },
      ...additionalOptions?.plugins,
    },
    ...additionalOptions,
  };
}

// Color palette
export const colorPalette = [
  "#10b981", // green
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

// Generate background colors
export function generateBackgroundColors(count: number, alpha = 1): string[] {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const color = colorPalette[i % colorPalette.length];
    colors.push(color);
  }
  return colors;
}
