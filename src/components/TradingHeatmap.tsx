"use client";

import { useMemo } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { trades } from "@/data/mockData";
import { Tooltip } from "react-tooltip";

// Helper: Shift date by days
function shiftDate(date: Date, numDays: number) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numDays);
    return newDate;
}

// Generate dates for the entire calendar year
function getRange(count: number) {
    const arr = [];
    for (let i = 0; i < count; i++) {
        arr.push(i);
    }
    return arr;
}

export default function TradingHeatmap() {
    const today = new Date();
    const startDate = shiftDate(today, -365); // Last 1 year

    // Process trades into daily stats
    const dailyStats = useMemo(() => {
        const stats: Record<string, { count: number; pnl: number }> = {};

        trades.forEach((t) => {
            const dateKey = new Date(t.timestamp).toISOString().split("T")[0];
            if (!stats[dateKey]) {
                stats[dateKey] = { count: 0, pnl: 0 };
            }
            stats[dateKey].count += 1;
            stats[dateKey].pnl += t.pnl;
        });

        return Object.entries(stats).map(([date, data]) => ({
            date,
            count: data.count,
            pnl: data.pnl,
        }));
    }, []);

    return (
        <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm p-5">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <span>🔥</span> Consistency Heatmap
            </h2>
            <div className="w-full overflow-x-auto pb-2">
                <div className="min-w-[700px]">
                    <CalendarHeatmap
                        startDate={startDate}
                        endDate={today}
                        values={dailyStats}
                        classForValue={(value) => {
                            if (!value) {
                                return "color-empty";
                            }
                            if (value.pnl > 0) return `color-scale-green-${Math.min(4, Math.ceil(value.pnl / 100))}`;
                            return `color-scale-red-${Math.min(4, Math.ceil(Math.abs(value.pnl) / 100))}`;
                        }}
                        tooltipDataAttrs={(value: any) => {
                            if (!value || !value.date) {
                                return null;
                            }
                            return {
                                "data-tooltip-id": "heatmap-tooltip",
                                "data-tooltip-content": `${value.date}: ${value.count} trades, $${value.pnl.toFixed(2)} PnL`,
                            };
                        }}
                        showWeekdayLabels={true}
                    />
                    <Tooltip id="heatmap-tooltip" />
                </div>
            </div>
            <style jsx global>{`
        .react-calendar-heatmap text {
          fill: #64748b;
          font-size: 10px;
        }
        .react-calendar-heatmap .color-empty {
          fill: #1e293b; 
          rx: 2px;
        }
        /* Green Scale */
        .react-calendar-heatmap .color-scale-green-1 { fill: #065f46; rx: 2px; }
        .react-calendar-heatmap .color-scale-green-2 { fill: #047857; rx: 2px; }
        .react-calendar-heatmap .color-scale-green-3 { fill: #059669; rx: 2px; }
        .react-calendar-heatmap .color-scale-green-4 { fill: #10b981; rx: 2px; }
        
        /* Red Scale */
        .react-calendar-heatmap .color-scale-red-1 { fill: #7f1d1d; rx: 2px; }
        .react-calendar-heatmap .color-scale-red-2 { fill: #991b1b; rx: 2px; }
        .react-calendar-heatmap .color-scale-red-3 { fill: #b91c1c; rx: 2px; }
        .react-calendar-heatmap .color-scale-red-4 { fill: #ef4444; rx: 2px; }
      `}</style>
        </div>
    );
}
