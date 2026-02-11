import { useState, useMemo, useRef } from 'react';
import type { Trade } from '@/types/trade';
import { useTradingData } from '@/context/TradingDataContext';

// Icons
const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const ClearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export default function TradeHistoryTable() {
  const { trades } = useTradingData();
  const [selectedSymbol, setSelectedSymbol] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'wins' | 'losses' | 'long' | 'short'>('all');

  const symbols = useMemo(() => [...new Set(trades.map(t => t.symbol))], [trades]);

  // Filter trades based on selected filters
  const filteredTrades = useMemo(() => {
    let filtered = [...trades];

    // Filter by symbol
    if (selectedSymbol !== 'all') {
      filtered = filtered.filter(trade => trade.symbol === selectedSymbol);
    }

    // Filter by start date
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(trade => new Date(trade.timestamp) >= start);
    }

    // Filter by end date
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(trade => new Date(trade.timestamp) <= end);
    }

    // Apply quick filter
    switch (quickFilter) {
      case 'wins':
        filtered = filtered.filter(trade => trade.pnl > 0);
        break;
      case 'losses':
        filtered = filtered.filter(trade => trade.pnl < 0);
        break;
      case 'long':
        filtered = filtered.filter(trade => trade.side === 'LONG');
        break;
      case 'short':
        filtered = filtered.filter(trade => trade.side === 'SHORT');
        break;
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [trades, selectedSymbol, startDate, endDate, quickFilter]);

  // Calculate filtered stats
  const filteredStats = useMemo(() => {
    const totalPnL = filteredTrades.reduce((sum, t) => sum + t.pnl, 0);
    const winCount = filteredTrades.filter(t => t.pnl > 0).length;
    const lossCount = filteredTrades.filter(t => t.pnl < 0).length;
    return { totalPnL, winCount, lossCount };
  }, [filteredTrades]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedSymbol('all');
    setStartDate('');
    setEndDate('');
    setQuickFilter('all');
  };

  const hasActiveFilters = selectedSymbol !== 'all' || startDate || endDate || quickFilter !== 'all';

  // Quick filter chips config
  const filterChips = [
    { id: 'all' as const, label: 'All Trades', icon: '📊' },
    { id: 'wins' as const, label: 'Wins Only', icon: '✅' },
    { id: 'losses' as const, label: 'Losses Only', icon: '❌' },
    { id: 'long' as const, label: 'Longs', icon: '📈' },
    { id: 'short' as const, label: 'Shorts', icon: '📉' },
  ];

  // Stable timestamp that only sets once on mount
  const mountTime = useRef(new Date().toLocaleTimeString());

  // Format date for display
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              📋 Trade History
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Complete transaction log with filtering options
            </p>
          </div>

          {/* Filter Stats Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg">
              <span className="text-slate-400 text-sm">Showing:</span>
              <span className="text-white font-semibold">{filteredTrades.length}</span>
              <span className="text-slate-400 text-sm">of {trades.length}</span>
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filteredStats.totalPnL >= 0
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-red-500/20 text-red-400'
              }`}>
              {filteredStats.totalPnL >= 0 ? '+' : ''}${formatCurrency(filteredStats.totalPnL)}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div className="px-6 py-4 border-b border-slate-700/50">
        <div className="flex flex-wrap items-center gap-2">
          {filterChips.map(chip => (
            <button
              key={chip.id}
              onClick={() => setQuickFilter(chip.id)}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-200 border
                ${quickFilter === chip.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 border-transparent text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500'
                }
              `}
            >
              <span>{chip.icon}</span>
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters Section */}
      <div className="px-6 py-4 bg-slate-900/30 border-b border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          {/* Filter Icon & Title */}
          <div className="flex items-center gap-2 text-slate-400">
            <FilterIcon />
            <span className="text-sm font-medium">Filters</span>
          </div>

          {/* Symbol Filter */}
          <div className="flex-1 max-w-xs">
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wide">
              Symbol
            </label>
            <div className="relative">
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="w-full appearance-none bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer hover:bg-slate-700/70 transition-colors"
              >
                <option value="all">All Symbols</option>
                {symbols.map(symbol => (
                  <option key={symbol} value={symbol}>{symbol}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDownIcon />
              </div>
            </div>
          </div>

          {/* Start Date */}
          <div className="flex-1 max-w-xs">
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wide">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent hover:bg-slate-700/70 transition-colors [color-scheme:dark]"
            />
          </div>

          {/* End Date */}
          <div className="flex-1 max-w-xs">
            <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wide">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent hover:bg-slate-700/70 transition-colors [color-scheme:dark]"
            />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
            >
              <ClearIcon />
              Clear
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-700/30">
            {selectedSymbol !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-medium">
                Symbol: {selectedSymbol}
                <button
                  onClick={() => setSelectedSymbol('all')}
                  className="hover:text-cyan-200 transition-colors"
                >
                  <ClearIcon />
                </button>
              </span>
            )}
            {startDate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full text-xs font-medium">
                From: {new Date(startDate).toLocaleDateString()}
                <button
                  onClick={() => setStartDate('')}
                  className="hover:text-violet-200 transition-colors"
                >
                  <ClearIcon />
                </button>
              </span>
            )}
            {endDate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
                To: {new Date(endDate).toLocaleDateString()}
                <button
                  onClick={() => setEndDate('')}
                  className="hover:text-amber-200 transition-colors"
                >
                  <ClearIcon />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Trade history">
          <thead>
            <tr className="bg-slate-700/30">
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Side
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Entry Price
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Exit Price
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Leverage
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                PnL
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Fee
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filteredTrades.length > 0 ? (
              filteredTrades.map((trade: Trade) => (
                <tr
                  key={trade.id}
                  className="hover:bg-slate-700/20 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-slate-300 text-xs">
                      {formatDate(trade.timestamp)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {trade.symbol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${trade.side === 'LONG'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                      {trade.side === 'LONG' ? '↑' : '↓'} {trade.side}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-slate-300 font-mono">
                      ${formatCurrency(trade.entryPrice)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-slate-300 font-mono">
                      ${formatCurrency(trade.exitPrice)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-slate-300 font-mono">
                      {trade.size.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center justify-center px-2 py-1 bg-slate-700/50 rounded text-xs font-medium text-slate-300">
                      {trade.leverage}x
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`font-bold font-mono ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                      {trade.pnl >= 0 ? '+' : ''}${formatCurrency(trade.pnl)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-slate-500 font-mono text-xs">
                      ${formatCurrency(trade.fee)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">🔍</span>
                    <p className="text-slate-400 font-medium">No trades found</p>
                    <p className="text-slate-500 text-sm">
                      Try adjusting your filters to see more results
                    </p>
                    <button
                      onClick={clearFilters}
                      className="mt-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-colors"
                    >
                      Clear all filters
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Stats */}
      {filteredTrades.length > 0 && (
        <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700/50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-400 text-sm">Wins:</span>
                <span className="text-emerald-400 font-semibold">{filteredStats.winCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-slate-400 text-sm">Losses:</span>
                <span className="text-red-400 font-semibold">{filteredStats.lossCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">Win Rate:</span>
                <span className="text-cyan-400 font-semibold">
                  {((filteredStats.winCount / filteredTrades.length) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="text-slate-500 text-sm">
              Last updated: {mountTime.current}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
