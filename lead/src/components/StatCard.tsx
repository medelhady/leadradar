"use client";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: "blue" | "green" | "amber";
  description?: string;
}

export function StatCard({ label, value, icon, color = "blue", description }: StatCardProps) {
  const colorMap = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    green: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <div
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      className="rounded-xl border p-6 flex gap-4 items-start"
    >
      <div className={`p-3 rounded-lg border ${colorMap[color]}`}>{icon}</div>
      <div>
        <p style={{ color: "var(--color-text-muted)" }} className="text-sm font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="text-3xl font-bold mt-1" style={{ color: "var(--color-text)" }}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {description && (
          <p className="text-xs mt-1" style={{ color: "var(--color-text-dim)" }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
