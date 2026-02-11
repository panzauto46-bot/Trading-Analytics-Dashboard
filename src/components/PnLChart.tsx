import { useMemo } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import { useTradingData } from '@/context/TradingDataContext';

interface ChartDataPoint {
  date: string;
  timestamp: number;
  cumulativePnL: number;
  dailyPnL: number;
  tradeCount: number;
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: ChartDataPoint }>; label?: string }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isProfit = data.cumulativePnL >= 0;

    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 shadow-xl">
        <p className="text-slate-300 text-sm font-medium mb-2">{label}</p>
        <div className="space-y-1">
          <p className={`text-lg font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
            Cumulative PnL: {isProfit ? '+' : ''}${data.cumulativePnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-sm ${data.dailyPnL >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
            Daily PnL: {data.dailyPnL >= 0 ? '+' : ''}${data.dailyPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-slate-400 text-sm">
            Trades: {data.tradeCount}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function PnLChart() {
  const { trades } = useTradingData();

  // Process data: sort by timestamp, group by date, calculate cumulative PnL
  const chartData = useMemo(() => {
    // Sort trades by timestamp
    const sortedTrades = [...trades].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Group trades by date and calculate daily PnL
    const dailyData = new Map<string, { pnl: number; count: number; rawDate: string }>();

    sortedTrades.forEach(trade => {
      // Use YYYY-MM-DD as key to preserve correct ordering and year info
      const dateObj = new Date(trade.timestamp);
      const key = dateObj.toISOString().split('T')[0]; // e.g. "2024-01-03"
      const label = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      const existing = dailyData.get(key) || { pnl: 0, count: 0, rawDate: label };
      dailyData.set(key, {
        pnl: existing.pnl + trade.pnl,
        count: existing.count + 1,
        rawDate: label,
      });
    });

    // Calculate cumulative PnL
    let cumulativePnL = 0;
    const result: ChartDataPoint[] = [];

    dailyData.forEach((value, key) => {
      cumulativePnL += value.pnl;
      result.push({
        date: value.rawDate,
        timestamp: new Date(key).getTime(),
        cumulativePnL: parseFloat(cumulativePnL.toFixed(2)),
        dailyPnL: parseFloat(value.pnl.toFixed(2)),
        tradeCount: value.count,
      });
    });

    return result;
  }, [trades]);

  // Calculate stats for display
  const stats = useMemo(() => {
    const finalPnL = chartData[chartData.length - 1]?.cumulativePnL || 0;
    const maxPnL = Math.max(...chartData.map(d => d.cumulativePnL));
    const minPnL = Math.min(...chartData.map(d => d.cumulativePnL));

    // Correct max drawdown: largest drop from any peak to a subsequent trough
    let maxDrawdown = 0;
    let peak = -Infinity;
    for (const point of chartData) {
      if (point.cumulativePnL > peak) {
        peak = point.cumulativePnL;
      }
      const drawdown = peak - point.cumulativePnL;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    // Find best and worst days
    const bestDay = chartData.reduce((best, curr) =>
      curr.dailyPnL > best.dailyPnL ? curr : best, chartData[0]);
    const worstDay = chartData.reduce((worst, curr) =>
      curr.dailyPnL < worst.dailyPnL ? curr : worst, chartData[0]);

    return { finalPnL, maxPnL, minPnL, maxDrawdown, bestDay, worstDay };
  }, [chartData]);

  const isProfit = stats.finalPnL >= 0;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            📈 Cumulative PnL Over Time
          </h2>
          <p className="text-slate-400 text-sm">
            Track your profit and loss progression
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 mt-4 sm:mt-0">
          <div className="text-center">
            <p className="text-slate-400 text-xs uppercase tracking-wide">Peak</p>
            <p className="text-emerald-400 font-semibold">
              +${stats.maxPnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-xs uppercase tracking-wide">Trough</p>
            <p className={`font-semibold ${stats.minPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.minPnL >= 0 ? '+' : ''}${stats.minPnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-xs uppercase tracking-wide">Max DD</p>
            <p className="text-amber-400 font-semibold">
              ${stats.maxDrawdown.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isProfit ? "#10b981" : "#ef4444"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isProfit ? "#10b981" : "#ef4444"}
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
              dx={-10}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Reference line at zero */}
            <ReferenceLine
              y={0}
              stroke="#64748b"
              strokeDasharray="5 5"
              strokeWidth={1}
            />

            {/* Area fill under the line */}
            <Area
              type="monotone"
              dataKey="cumulativePnL"
              stroke="none"
              fill="url(#pnlGradient)"
            />

            {/* Main line */}
            <Line
              type="monotone"
              dataKey="cumulativePnL"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 6,
                fill: '#10b981',
                stroke: '#fff',
                strokeWidth: 2,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700/50">
        <div className="bg-emerald-500/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-emerald-400">🏆</span>
            <span className="text-slate-400 text-sm">Best Day</span>
          </div>
          <p className="text-emerald-400 font-bold text-lg">
            +${stats.bestDay?.dailyPnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-slate-500 text-xs">{stats.bestDay?.date}</p>
        </div>

        <div className="bg-red-500/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-red-400">📉</span>
            <span className="text-slate-400 text-sm">Worst Day</span>
          </div>
          <p className="text-red-400 font-bold text-lg">
            ${stats.worstDay?.dailyPnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-slate-500 text-xs">{stats.worstDay?.date}</p>
        </div>
      </div>
    </div>
  );
}
