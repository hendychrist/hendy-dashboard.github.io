import { ChartOptions, ChartType } from "chart.js";

// Create options for chart with title
export function createChartOptions<TType extends ChartType = ChartType>(
  title: string,
  additionalOptions?: Partial<ChartOptions<TType>>
): ChartOptions<TType> {
  return {
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
          color: "#ffffff",
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
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: "bold" as const,
          family: "'Inter', sans-serif",
        },
        padding: { bottom: 16 },
        color: "#ffffff",
      },
      ...additionalOptions?.plugins,
    },
    ...additionalOptions,
  } as ChartOptions<TType>;
}

// Helper to create scale options for charts that need them (bar, line, etc.)
export function createScaleOptions(color = "#ffffff", gridColor = "rgba(255, 255, 255, 0.1)") {
  return {
    ticks: {
      color,
      font: {
        size: 11,
      },
    },
    grid: {
      color: gridColor,
    },
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
