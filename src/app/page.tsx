import DashboardSummary from "@/components/DashboardSummary";
import PnLChart from "@/components/PnLChart";
import TradeHistoryTable from "@/components/TradeHistoryTable";
import TradingHeatmap from "@/components/TradingHeatmap";
import AiInsights from "@/components/AiInsights";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Trading Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Crypto Perpetual Performance Dashboard
          </p>
        </div>
        <span className="hidden sm:inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
          Live Demo
        </span>
      </header>

      {/* Summary Cards */}
      <DashboardSummary />

      {/* Middle Section: Heatmap & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TradingHeatmap />
        </div>
        <div className="lg:col-span-1">
          <AiInsights />
        </div>
      </div>

      {/* Chart */}
      <PnLChart />

      {/* Trade Table */}
      <TradeHistoryTable />
    </main>
  );
}
