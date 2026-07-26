"use client";

interface RiskBadgeProps {
  score: number;
}

export function RiskBadge({ score }: RiskBadgeProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 70) return { label: "High Risk", bg: "bg-red-100 text-red-700 border-red-200" };
    if (score >= 30) return { label: "Medium Risk", bg: "bg-amber-100 text-amber-700 border-amber-200" };
    return { label: "Low Risk", bg: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  };

  const level = getRiskLevel(score);

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${level.bg}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span>{level.label} ({score}%)</span>
    </div>
  );
}