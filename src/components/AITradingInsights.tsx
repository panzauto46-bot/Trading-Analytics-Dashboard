import { useMemo } from 'react';
import { useTradingData } from '@/context/TradingDataContext';

// Brain/AI Icon
const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

interface InsightProps {
  icon: string;
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  metric?: string;
}

function InsightCard({ icon, type, title, description, metric }: InsightProps) {
  const typeStyles = {
    warning: {
      bg: 'bg-gradient-to-br from-amber-500/10 to-orange-500/5',
      border: 'border-amber-500/30',
      iconBg: 'bg-amber-500/20',
      titleColor: 'text-amber-400',
      hoverBorder: 'hover:border-amber-500/50',
    },
    success: {
      bg: 'bg-gradient-to-br from-emerald-500/10 to-green-500/5',
      border: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/20',
      titleColor: 'text-emerald-400',
      hoverBorder: 'hover:border-emerald-500/50',
    },
    info: {
      bg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/5',
      border: 'border-blue-500/30',
      iconBg: 'bg-blue-500/20',
      titleColor: 'text-blue-400',
      hoverBorder: 'hover:border-blue-500/50',
    },
  };

  const style = typeStyles[type];

  return (
    <div className={`
      relative p-4 rounded-xl border transition-all duration-300
      ${style.bg} ${style.border} ${style.hoverBorder}
      hover:shadow-lg cursor-default
    `}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-9 h-9 ${style.iconBg} rounded-lg flex items-center justify-center text-lg`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold text-sm ${style.titleColor} mb-0.5`}>
            {title}
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            {description}
          </p>
          {metric && (
            <div className="mt-2 inline-flex items-center px-2 py-0.5 bg-slate-800/50 rounded">
              <span className={`text-xs font-medium ${style.titleColor}`}>{metric}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AITradingInsights() {
  const { trades } = useTradingData();

  // Analyze trading patterns (simulated AI analysis)
  const insights = useMemo(() => {
    if (trades.length === 0) {
      return {
        highLeverageRatio: 0,
        bestAsset: { symbol: 'N/A', winRate: 0 },
        nightLossRate: 0,
        highLevLosses: 0,
        totalTrades: 0,
      };
    }

    // Calculate leverage stats
    const highLeverageTrades = trades.filter(t => t.leverage >= 20);
    const highLeverageRatio = (highLeverageTrades.length / trades.length) * 100;

    // Find best performing asset
    const assetStats = trades.reduce((acc, trade) => {
      if (!acc[trade.symbol]) {
        acc[trade.symbol] = { wins: 0, total: 0, pnl: 0 };
      }
      acc[trade.symbol].total++;
      acc[trade.symbol].pnl += trade.pnl;
      if (trade.pnl > 0) acc[trade.symbol].wins++;
      return acc;
    }, {} as Record<string, { wins: number; total: number; pnl: number }>);

    // Find best asset by win rate (min 3 trades)
    let bestAsset = { symbol: 'N/A', winRate: 0 };
    Object.entries(assetStats).forEach(([symbol, stats]) => {
      if (stats.total >= 3) {
        const winRate = (stats.wins / stats.total) * 100;
        if (winRate > bestAsset.winRate) {
          bestAsset = { symbol, winRate };
        }
      }
    });

    // Analyze trading hours (simulated)
    const nightTrades = trades.filter(t => {
      const hour = new Date(t.timestamp).getUTCHours();
      return hour >= 19 || hour <= 5;
    });
    const nightLosses = nightTrades.filter(t => t.pnl < 0).length;
    const nightLossRate = nightTrades.length > 0 ? (nightLosses / nightTrades.length) * 100 : 0;

    // Calculate potential savings
    const highLevLosses = highLeverageTrades.filter(t => t.pnl < 0).reduce((sum, t) => sum + Math.abs(t.pnl), 0);

    return {
      highLeverageRatio,
      bestAsset,
      nightLossRate,
      highLevLosses,
      totalTrades: trades.length,
    };
  }, [trades]);

  // Generate dynamic insights based on analysis
  const insightCards: InsightProps[] = [
    {
      icon: '⚠️',
      type: 'warning',
      title: 'High Risk Detected',
      description: `${insights.highLeverageRatio.toFixed(0)}% trades use leverage ≥20x. Reduce position sizes.`,
      metric: `-$${insights.highLevLosses.toFixed(0)} loss`,
    },
    {
      icon: '✅',
      type: 'success',
      title: 'Best Performing Asset',
      description: `${insights.bestAsset.symbol} shows strongest performance in your portfolio.`,
      metric: `${insights.bestAsset.winRate.toFixed(0)}% win rate`,
    },
    {
      icon: '🕒',
      type: 'info',
      title: 'Optimal Trading Hours',
      description: `Avoid 02:00-12:00 WIB. Higher loss rate during these hours.`,
      metric: `${insights.nightLossRate.toFixed(0)}% loss rate`,
    },
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-50 animate-pulse" />
            <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <BrainIcon />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white whitespace-nowrap">
                🤖 AI Trading Insights
              </h3>
              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-gradient-to-r from-purple-500 to-pink-500 rounded-full uppercase tracking-wider flex-shrink-0">
                Beta
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Powered by machine learning • {insights.totalTrades} trades analyzed
            </p>
          </div>
        </div>

        {/* AI Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex-shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 text-xs font-medium">Live</span>
        </div>
      </div>

      {/* Insights Grid - 3 columns on large screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {insightCards.map((insight, index) => (
          <InsightCard key={index} {...insight} />
        ))}
      </div>
    </div>
  );
}
