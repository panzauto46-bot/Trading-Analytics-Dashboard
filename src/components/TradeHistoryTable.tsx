"use client";

import { useMemo, useState } from "react";
import { trades, type Trade } from "@/data/mockData";

export default function TradeHistoryTable() {
  const symbols = useMemo(
    () => ["All", ...Array.from(new Set(trades.map((t) => t.symbol))).sort()],
    []
  );

  const [selectedSymbol, setSelectedSymbol] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filtered = useMemo(() => {
    let result: Trade[] = [...trades].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (selectedSymbol !== "All") {
      result = result.filter((t) => t.symbol === selectedSymbol);
    }

    if (startDate) {
      const start = new Date(startDate).getTime();
      result = result.filter((t) => new Date(t.timestamp).getTime() >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((t) => new Date(t.timestamp).getTime() <= end.getTime());
    }

    return result;
  }, [selectedSymbol, startDate, endDate]);

  const fmt = (n: number, decimals = 2) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm p-5">
      <h2 className="text-lg font-semibold text-slate-200 mb-4">
        Trade History
      </h2>

      {/* ── Filters ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-4 mb-5">
        {/* Symbol filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Symbol</label>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-500 transition-colors"
          >
            {symbols.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-500 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Reset */}
        {(selectedSymbol !== "All" || startDate || endDate) && (
          <button
            onClick={() => {
              setSelectedSymbol("All");
              setStartDate("");
              setEndDate("");
            }}
            className="rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Reset
          </button>
        )}

        <span className="ml-auto text-xs text-slate-500">
          {filtered.length} trade{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Symbol</th>
              <th className="py-3 px-3">Side</th>
              <th className="py-3 px-3 text-right">Entry Price</th>
              <th className="py-3 px-3 text-right">Exit Price</th>
              <th className="py-3 px-3 text-right">Size</th>
              <th className="py-3 px-3 text-right">Leverage</th>
              <th className="py-3 px-3 text-right">PnL</th>
              <th className="py-3 px-3 text-right">Fee</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr
                key={t.id}
                className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                  {new Date(t.timestamp).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="py-3 px-3 font-medium text-slate-200">
                  {t.symbol}
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${
                      t.side === "LONG"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {t.side}
                  </span>
                </td>
                <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                  ${fmt(t.entryPrice)}
                </td>
                <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                  ${fmt(t.exitPrice)}
                </td>
                <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                  {fmt(t.size, 4)}
                </td>
                <td className="py-3 px-3 text-right text-slate-300">
                  {t.leverage}x
                </td>
                <td
                  className={`py-3 px-3 text-right font-medium tabular-nums ${
                    t.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {t.pnl >= 0 ? "+" : ""}${fmt(t.pnl)}
                </td>
                <td className="py-3 px-3 text-right text-amber-400/80 tabular-nums">
                  ${fmt(t.fee)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-500">
                  No trades match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
