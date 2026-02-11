import { TradingDataProvider } from './context/TradingDataContext';
import { Header } from './components/Header';
import { DashboardSummary } from './components/DashboardSummary';
import { AITradingInsights } from './components/AITradingInsights';
import PnLChart from './components/PnLChart';
import { TradingHeatmap } from './components/TradingHeatmap';
import TradeHistoryTable from './components/TradeHistoryTable';

export function App() {
  return (
    <TradingDataProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8 text-white">
        <div className="mx-auto max-w-[1600px]">
          {/* Header with Demo Toggle and Wallet */}
          <Header />

          {/* Dashboard Summary Component */}
          <div className="mb-6">
            <DashboardSummary />
          </div>

          {/* AI Trading Insights */}
          <div className="mb-8">
            <AITradingInsights />
          </div>

          {/* PnL Chart */}
          <div className="mb-8">
            <PnLChart />
          </div>

          {/* Trading Heatmap Calendar */}
          <div className="mb-8">
            <TradingHeatmap />
          </div>

          {/* Trade History Table with Filters */}
          <div className="mb-8">
            <TradeHistoryTable />
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-slate-500 text-sm">
              Trading Analytics Dashboard • Crypto Perpetual Trading Performance
            </p>
            <p className="text-slate-600 text-xs mt-1">
              Data shown is for demonstration purposes only
            </p>
          </footer>
        </div>
      </div>
    </TradingDataProvider>
  );
}
