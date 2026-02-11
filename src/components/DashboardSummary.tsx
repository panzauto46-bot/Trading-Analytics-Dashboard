import { useMemo } from 'react';
import { useTradingData } from '@/context/TradingDataContext';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  valueColor?: string;
  bgGradient: string;
  iconBg: string;
}

function StatCard({ title, value, subtitle, icon, valueColor = 'text-white', bgGradient, iconBg }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${bgGradient} p-6 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}>
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5" />
      <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/5" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-white/70 uppercase tracking-wider">
              {title}
            </p>
            <p className={`mt-2 text-3xl font-bold ${valueColor}`}>
              {value}
            </p>
            {subtitle && (
              <p className="mt-1 text-sm text-white/60">
                {subtitle}
              </p>
            )}
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons as SVG components
const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendingDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const VolumeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
  </svg>
);

const FeeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export function DashboardSummary() {
  const { trades } = useTradingData();

  // Calculate all metrics from trading history
  const stats = useMemo(() => {
    const totalTrades = trades.length;

    // Total PnL - sum all pnl values
    const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);

    // Win Rate - trades with positive PnL / total trades * 100
    const winningTrades = trades.filter(trade => trade.pnl > 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    // Total Trading Volume - sum all size values
    const totalVolume = trades.reduce((sum, trade) => sum + trade.size, 0);

    // Total Fees Paid - sum all fee values (already negative in data)
    const totalFees = trades.reduce((sum, trade) => sum + trade.fee, 0);

    return {
      totalPnL,
      winRate,
      totalVolume,
      totalFees,
      totalTrades,
      winningTrades,
      losingTrades: totalTrades - winningTrades,
    };
  }, [trades]);

  // Format currency with proper formatting
  const formatCurrency = (value: number, showSign = false) => {
    const formatted = Math.abs(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (showSign) {
      return value >= 0 ? `+$${formatted}` : `-$${formatted}`;
    }
    return value >= 0 ? `$${formatted}` : `-$${formatted}`;
  };

  // Format large numbers
  const formatNumber = (value: number) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="w-full">
      {/* Section Title */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Dashboard Overview</h2>
        <p className="text-sm text-slate-400 mt-1">
          Summary of your trading performance • {stats.totalTrades} total trades
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total PnL Card */}
        <StatCard
          title="Total PnL"
          value={formatCurrency(stats.totalPnL, true)}
          subtitle={`${stats.winningTrades} wins • ${stats.losingTrades} losses`}
          icon={stats.totalPnL >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
          valueColor={stats.totalPnL >= 0 ? 'text-emerald-300' : 'text-red-300'}
          bgGradient={stats.totalPnL >= 0
            ? 'bg-gradient-to-br from-emerald-600 to-emerald-800'
            : 'bg-gradient-to-br from-red-600 to-red-800'
          }
          iconBg={stats.totalPnL >= 0 ? 'bg-emerald-500/30' : 'bg-red-500/30'}
        />

        {/* Win Rate Card */}
        <StatCard
          title="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          subtitle={`${stats.winningTrades} of ${stats.totalTrades} trades`}
          icon={<ChartIcon />}
          valueColor="text-cyan-300"
          bgGradient="bg-gradient-to-br from-cyan-600 to-blue-800"
          iconBg="bg-cyan-500/30"
        />

        {/* Total Volume Card */}
        <StatCard
          title="Trading Volume"
          value={`$${formatNumber(stats.totalVolume)}`}
          subtitle="Total assets traded"
          icon={<VolumeIcon />}
          valueColor="text-violet-300"
          bgGradient="bg-gradient-to-br from-violet-600 to-purple-800"
          iconBg="bg-violet-500/30"
        />

        {/* Total Fees Card */}
        <StatCard
          title="Total Fees Paid"
          value={formatCurrency(stats.totalFees)}
          subtitle="Transaction costs"
          icon={<FeeIcon />}
          valueColor="text-amber-300"
          bgGradient="bg-gradient-to-br from-amber-600 to-orange-800"
          iconBg="bg-amber-500/30"
        />
      </div>
    </div>
  );
}
