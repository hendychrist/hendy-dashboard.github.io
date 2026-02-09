interface RiskIndicatorProps {
  nonDeliveredRate: number;
  pendingOrdersRate: number;
}

const riskThresholds = {
  nonDelivered: { low: 5, medium: 10 },
  pending: { low: 10, medium: 20 },
};

function getRiskLevel(value: number, thresholds: { low: number; medium: number }) {
  if (value < thresholds.low) return { level: "low" as const, label: "Low Risk" };
  if (value < thresholds.medium) return { level: "medium" as const, label: "Medium Risk" };
  return { level: "high" as const, label: "High Risk" };
}

const riskStyles = {
  low: "bg-green-50 border-green-200 text-green-800",
  medium: "bg-amber-50 border-amber-200 text-amber-800",
  high: "bg-red-50 border-red-200 text-red-800",
};

export function RiskIndicator({ nonDeliveredRate, pendingOrdersRate }: RiskIndicatorProps) {
  const nonDeliveredRisk = getRiskLevel(nonDeliveredRate, riskThresholds.nonDelivered);
  const pendingRisk = getRiskLevel(pendingOrdersRate, riskThresholds.pending);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <RiskCard
        title="Non-Delivered Orders"
        value={`${nonDeliveredRate.toFixed(1)}%`}
        risk={nonDeliveredRisk}
        description="Percentage of orders not delivered"
      />
      <RiskCard
        title="Pending Orders"
        value={`${pendingOrdersRate.toFixed(1)}%`}
        risk={pendingRisk}
        description="Orders in transit or processing"
      />
    </div>
  );
}

interface RiskCardProps {
  title: string;
  value: string;
  risk: { level: "low" | "medium" | "high"; label: string };
  description: string;
}

function RiskCard({ title, value, risk, description }: RiskCardProps) {
  return (
    <div className={`rounded-lg p-4 border-2 ${riskStyles[risk.level]}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm uppercase tracking-wide">{title}</h4>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            risk.level === "low"
              ? "bg-green-200 text-green-800"
              : risk.level === "medium"
              ? "bg-amber-200 text-amber-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {risk.label}
        </span>
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-xs opacity-75">{description}</p>
    </div>
  );
}
