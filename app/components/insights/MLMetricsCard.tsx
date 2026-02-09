interface MLMetricsCardProps {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

const metricColors = {
  accuracy: "text-blue-600",
  precision: "text-green-600",
  recall: "text-amber-600",
  f1Score: "text-purple-600",
};

export function MLMetricsCard({ accuracy, precision, recall, f1Score }: MLMetricsCardProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard label="Accuracy" value={`${accuracy}%`} colorClass={metricColors.accuracy} />
      <MetricCard label="Precision" value={`${precision}%`} colorClass={metricColors.precision} />
      <MetricCard label="Recall" value={`${recall}%`} colorClass={metricColors.recall} />
      <MetricCard label="F1 Score" value={f1Score.toFixed(2)} colorClass={metricColors.f1Score} />
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  colorClass: string;
}

function MetricCard({ label, value, colorClass }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}
