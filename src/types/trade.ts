export type TradeSide = "LONG" | "SHORT";
export type TradeStatus = "CLOSED";

export interface Trade {
  id: string;
  timestamp: string;
  symbol: string;
  side: TradeSide;
  entryPrice: number;
  exitPrice: number;
  size: number;
  leverage: number;
  pnl: number;
  fee: number;
  status: TradeStatus;
}
