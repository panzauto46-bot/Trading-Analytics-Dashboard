"use client";

import { useMemo } from "react";
import { trades } from "@/data/mockData";

export default function DashboardSummary() {
  const stats = useMemo(() => {
    const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
    const wins = trades.filter((t) => t.pnl > 0).length;
    const winRate = (wins / trades.length) * 100;
    const totalVolume = trades.reduce((sum, t) => sum + t.size * t.entryPrice, 0);
    const totalFees = trades.reduce((sum, t) => sum + t.fee, 0);

    return { totalPnl, winRate, totalVolume, totalFees };
  }, []);

  const cards = [
    {
      label: "Total PnL",
      value: `$${stats.totalPnl >= 0 ? "+" : ""}${stats.totalPnl.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: stats.totalPnl >= 0 ? "text-emerald-400" : "text-red-400",
      bg: stats.totalPnl >= 0 ? "from-emerald-500/10 to-emerald-500/5" : "from-red-500/10 to-red-500/5",
      border: stats.totalPnl >= 0 ? "border-emerald-500/20" : "border-red-500/20",
      icon: stats.totalPnl >= 0 ? "↗" : "↘",
    },
    {
      label: "Win Rate",
      value: `${stats.winRate.toFixed(1)}%`,
      color: stats.winRate >= 50 ? "text-emerald-400" : "text-red-400",
      bg: "from-blue-500/10 to-blue-500/5",
      border: "border-blue-500/20",
      icon: "◎",
    },
    {
      label: "Trading Volume",
      value: `$${stats.totalVolume.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      color: "text-sky-400",
      bg: "from-sky-500/10 to-sky-500/5",
      border: "border-sky-500/20",
      icon: "⇄",
    },
    {
      label: "Total Fees Paid",
      value: `$${stats.totalFees.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: "text-amber-400",
      bg: "from-amber-500/10 to-amber-500/5",
      border: "border-amber-500/20",
      icon: "✦",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`relative overflow-hidden rounded-2xl border ${card.border} bg-gradient-to-br ${card.bg} backdrop-blur-sm p-5`}
        >
          <span className="absolute top-3 right-4 text-2xl opacity-40">
            {card.icon}
          </span>
          <p className="text-sm text-slate-400 mb-1">{card.label}</p>
          <p className={`text-2xl font-bold tracking-tight ${card.color}`}>
            {card.value}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {card.label === "Win Rate"
              ? `${trades.filter((t) => t.pnl > 0).length}W / ${trades.filter((t) => t.pnl <= 0).length}L`
              : `${trades.length} trades`}
          </p>
        </div>
      ))}
    </div>
  );
}
