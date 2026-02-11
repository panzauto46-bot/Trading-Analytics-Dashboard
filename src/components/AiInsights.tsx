"use client";

import { useMemo } from "react";
import { trades } from "@/data/mockData";
import { Lightbulb, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";

export default function AiInsights() {
    const insights = useMemo(() => {
        // Basic AI Logic Simulation
        const totalTrades = trades.length;
        const wins = trades.filter((t) => t.pnl > 0).length;
        const losses = totalTrades - wins;
        const winRate = (wins / totalTrades) * 100;

        const tips = [];

        // 1. Win Rate Analysis
        if (winRate < 40) {
            tips.push({
                type: "warning",
                title: "Low Win Rate Detected",
                msg: "Your win rate is below 40%. Consider tightening your stop losses or reviewing your entry criteria.",
                icon: AlertTriangle,
                color: "text-amber-400",
                bg: "bg-amber-500/10 border-amber-500/20",
            });
        } else if (winRate > 60) {
            tips.push({
                type: "success",
                title: "Strong Performance",
                msg: "Your win rate is solid (>60%). You might be ready to scale up your position sizing slightly.",
                icon: TrendingUp,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10 border-emerald-500/20",
            });
        }

        // 2. Overtrading Analysis (Simple check: average trades per day)
        // For mock data, let's assume if total trades > 50 in short time
        if (totalTrades > 50) {
            tips.push({
                type: "info",
                title: "High Frequency Activity",
                msg: "You are taking a lot of trades. Ensure you are not forcing setups (`overtrading`). Quality > Quantity.",
                icon: ShieldCheck,
                color: "text-blue-400",
                bg: "bg-blue-500/10 border-blue-500/20",
            });
        }

        // 3. Leverage Check (Mock logic)
        const highLevTrades = trades.filter(t => t.leverage > 20).length;
        if (highLevTrades > 5) {
            tips.push({
                type: "warning",
                title: "High Leverage Alert",
                msg: `You used >20x leverage in ${highLevTrades} trades. High leverage significantly increases ruin risk.`,
                icon: AlertTriangle,
                color: "text-red-400",
                bg: "bg-red-500/10 border-red-500/20",
            });
        }

        // Default tip if nothing else
        if (tips.length === 0) {
            tips.push({
                type: "neutral",
                title: "Consistent Trading",
                msg: "Your metrics are within normal ranges. Keep following your plan.",
                icon: Lightbulb,
                color: "text-purple-400",
                bg: "bg-purple-500/10 border-purple-500/20",
            });
        }

        return tips;
    }, []);

    return (
        <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm p-5 h-full">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" /> AI Coach Insights
            </h2>
            <div className="space-y-3">
                {insights.map((insight, idx) => (
                    <div
                        key={idx}
                        className={`p-4 rounded-xl border ${insight.bg} flex gap-3 items-start`}
                    >
                        <div className={`mt-0.5 p-1.5 rounded-lg bg-black/20 ${insight.color}`}>
                            <insight.icon size={18} />
                        </div>
                        <div>
                            <h3 className={`text-sm font-medium ${insight.color}`}>
                                {insight.title}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                {insight.msg}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Placeholder for "Processing" effect */}
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        AI analyzing live market data...
                    </div>
                </div>
            </div>
        </div>
    );
}
