interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  color?: "blue" | "green" | "amber" | "red" | "purple" | "gray";
}

const colorClasses = {
  blue: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
  green: "border-green-500 bg-green-50 dark:bg-green-900/20",
  amber: "border-amber-500 bg-amber-50 dark:bg-amber-900/20",
  red: "border-red-500 bg-red-50 dark:bg-red-900/20",
  purple: "border-purple-500 bg-purple-50 dark:bg-purple-900/20",
  gray: "border-gray-500 bg-gray-50 dark:bg-gray-900/20",
};

export function KPICard({ title, value, change, changeType = "neutral", icon, color = "blue" }: KPICardProps) {
  return (
    <div className={`${colorClasses[color]} rounded-lg shadow-md p-6 border-l-4 transition-transform hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {change && (
            <p
              className={`mt-2 text-sm font-medium ${
                changeType === "positive"
                  ? "text-green-600"
                  : changeType === "negative"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {change}
            </p>
          )}
        </div>
        {icon && <div className="ml-4 text-gray-400">{icon}</div>}
      </div>
    </div>
  );
}
