import { useMemo, useState } from 'react';
import { useTradingData } from '@/context/TradingDataContext';

interface DayData {
    date: Date;
    dateStr: string;
    dayOfMonth: number;
    pnl: number;
    tradeCount: number;
    isCurrentMonth: boolean;
    weekIndex: number;
}

interface TooltipData {
    x: number;
    y: number;
    date: string;
    pnl: number;
    tradeCount: number;
}

export function TradingHeatmap() {
    const { trades } = useTradingData();
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);

    // Generate calendar data
    const { weeks, monthStats, monthLabel } = useMemo(() => {
        // Group trades by date
        const pnlByDate = new Map<string, { pnl: number; count: number }>();

        trades.forEach(trade => {
            const dateKey = new Date(trade.timestamp).toISOString().split('T')[0];
            const existing = pnlByDate.get(dateKey) || { pnl: 0, count: 0 };
            pnlByDate.set(dateKey, {
                pnl: existing.pnl + trade.pnl,
                count: existing.count + 1,
            });
        });

        // Generate calendar for January 2024 (matching mock data)
        const year = 2024;
        const month = 0; // January
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        // Create weeks array (GitHub style - columns are weeks)
        const weeksArray: DayData[][] = [];
        let currentWeek: DayData[] = [];

        // Add empty cells for days before the 1st
        for (let i = 0; i < startDayOfWeek; i++) {
            currentWeek.push({
                date: new Date(year, month, -startDayOfWeek + i + 1),
                dateStr: '',
                dayOfMonth: 0,
                pnl: 0,
                tradeCount: 0,
                isCurrentMonth: false,
                weekIndex: 0,
            });
        }

        let totalPnl = 0;
        let profitDays = 0;
        let lossDays = 0;
        let tradingDays = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const dayData = pnlByDate.get(dateStr) || { pnl: 0, count: 0 };

            if (dayData.count > 0) {
                totalPnl += dayData.pnl;
                tradingDays++;
                if (dayData.pnl > 0) profitDays++;
                else if (dayData.pnl < 0) lossDays++;
            }

            currentWeek.push({
                date,
                dateStr,
                dayOfMonth: day,
                pnl: dayData.pnl,
                tradeCount: dayData.count,
                isCurrentMonth: true,
                weekIndex: weeksArray.length,
            });

            // Start new week on Sunday
            if (date.getDay() === 6) {
                weeksArray.push(currentWeek);
                currentWeek = [];
            }
        }

        // Push remaining days
        if (currentWeek.length > 0) {
            // Fill remaining days of the week
            while (currentWeek.length < 7) {
                currentWeek.push({
                    date: new Date(year, month + 1, currentWeek.length - 6),
                    dateStr: '',
                    dayOfMonth: 0,
                    pnl: 0,
                    tradeCount: 0,
                    isCurrentMonth: false,
                    weekIndex: weeksArray.length,
                });
            }
            weeksArray.push(currentWeek);
        }

        return {
            weeks: weeksArray,
            monthStats: { totalPnl, profitDays, lossDays, tradingDays },
            monthLabel: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        };
    }, [trades]);

    // Get color based on PnL - GitHub neon style
    const getColor = (day: DayData): string => {
        if (!day.isCurrentMonth) return 'bg-slate-800/20';
        if (day.tradeCount === 0) return 'bg-slate-700/40 hover:bg-slate-600/50';

        if (day.pnl > 0) {
            // Neon green gradient
            if (day.pnl > 400) return 'bg-[#39d353] shadow-[0_0_8px_#39d353]'; // Brightest
            if (day.pnl > 250) return 'bg-[#26a641]';
            if (day.pnl > 100) return 'bg-[#006d32]';
            return 'bg-[#0e4429]';
        } else {
            // Red gradient
            if (day.pnl < -200) return 'bg-red-400 shadow-[0_0_8px_#f87171]';
            if (day.pnl < -100) return 'bg-red-500';
            return 'bg-red-600/80';
        }
    };

    const handleMouseEnter = (e: React.MouseEvent, day: DayData) => {
        if (!day.isCurrentMonth) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top,
            date: day.date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            pnl: day.pnl,
            tradeCount: day.tradeCount,
        });
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        📅 Trading Activity
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">
                        {monthLabel} • {monthStats.tradingDays} active trading days
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                        <p className="text-emerald-400 font-bold text-lg">{monthStats.profitDays}</p>
                        <p className="text-slate-500 text-xs">Profit Days</p>
                    </div>
                    <div className="text-center">
                        <p className="text-red-400 font-bold text-lg">{monthStats.lossDays}</p>
                        <p className="text-slate-500 text-xs">Loss Days</p>
                    </div>
                    <div className="text-center">
                        <p className={`font-bold text-lg ${monthStats.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {monthStats.totalPnl >= 0 ? '+' : ''}${monthStats.totalPnl.toFixed(0)}
                        </p>
                        <p className="text-slate-500 text-xs">Total PnL</p>
                    </div>
                </div>
            </div>

            {/* Heatmap Grid - GitHub Style */}
            <div className="overflow-x-auto pb-2">
                <div className="inline-flex gap-4">
                    {/* Day labels */}
                    <div className="flex flex-col gap-[3px] text-xs text-slate-500 pr-2">
                        {weekDays.map((day, i) => (
                            <div key={day} className="h-[14px] flex items-center">
                                {i % 2 === 1 ? day : ''}
                            </div>
                        ))}
                    </div>

                    {/* Week columns */}
                    <div className="flex gap-[3px]">
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-[3px]">
                                {week.map((day, dayIndex) => (
                                    <div
                                        key={dayIndex}
                                        className={`
                      w-[14px] h-[14px] rounded-[3px] transition-all duration-150
                      ${getColor(day)}
                      ${day.isCurrentMonth && day.tradeCount > 0 ? 'cursor-pointer' : ''}
                    `}
                                        onMouseEnter={(e) => handleMouseEnter(e, day)}
                                        onMouseLeave={handleMouseLeave}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/30">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Less</span>
                    <div className="flex gap-[2px]">
                        <span className="w-[12px] h-[12px] rounded-[2px] bg-slate-700/40"></span>
                        <span className="w-[12px] h-[12px] rounded-[2px] bg-[#0e4429]"></span>
                        <span className="w-[12px] h-[12px] rounded-[2px] bg-[#006d32]"></span>
                        <span className="w-[12px] h-[12px] rounded-[2px] bg-[#26a641]"></span>
                        <span className="w-[12px] h-[12px] rounded-[2px] bg-[#39d353]"></span>
                    </div>
                    <span>More</span>
                </div>
                <p className="text-slate-500 text-xs">
                    Hover for details
                </p>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="fixed z-[100] pointer-events-none animate-in fade-in duration-150"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y - 8,
                        transform: 'translate(-50%, -100%)',
                    }}
                >
                    <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-600/50 rounded-lg px-3 py-2 shadow-2xl">
                        <p className="text-white font-medium text-sm whitespace-nowrap">
                            {tooltip.date}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                            <span className={`font-bold ${tooltip.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                PnL: {tooltip.pnl >= 0 ? '+' : ''}${tooltip.pnl.toFixed(2)}
                            </span>
                            {tooltip.tradeCount > 0 && (
                                <span className="text-slate-400 text-xs">
                                    {tooltip.tradeCount} trade{tooltip.tradeCount > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Arrow */}
                    <div className="w-0 h-0 mx-auto border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900/95"></div>
                </div>
            )}
        </div>
    );
}
