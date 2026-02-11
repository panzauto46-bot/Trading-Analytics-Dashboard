import type { Trade, TradeSide } from '@/types/trade';

const SYMBOLS = [
  'BTC-PERP', 'ETH-PERP', 'SOL-PERP', 'AVAX-PERP', 'ARB-PERP',
  'MATIC-PERP', 'DOGE-PERP', 'LINK-PERP', 'OP-PERP', 'NEAR-PERP',
  'SUI-PERP', 'APT-PERP', 'INJ-PERP', 'TIA-PERP', 'WIF-PERP',
];

const BASE_PRICES: Record<string, number> = {
  'BTC-PERP': 43000,
  'ETH-PERP': 2400,
  'SOL-PERP': 100,
  'AVAX-PERP': 37,
  'ARB-PERP': 1.95,
  'MATIC-PERP': 0.88,
  'DOGE-PERP': 0.08,
  'LINK-PERP': 15,
  'OP-PERP': 3.05,
  'NEAR-PERP': 3.60,
  'SUI-PERP': 1.22,
  'APT-PERP': 9.50,
  'INJ-PERP': 37,
  'TIA-PERP': 16,
  'WIF-PERP': 0.27,
};

const SIZE_RANGES: Record<string, [number, number]> = {
  'BTC-PERP': [0.1, 0.5],
  'ETH-PERP': [1, 3],
  'SOL-PERP': [20, 80],
  'AVAX-PERP': [50, 200],
  'ARB-PERP': [1000, 5000],
  'MATIC-PERP': [2000, 8000],
  'DOGE-PERP': [20000, 80000],
  'LINK-PERP': [100, 500],
  'OP-PERP': [500, 3000],
  'NEAR-PERP': [300, 1500],
  'SUI-PERP': [1000, 5000],
  'APT-PERP': [200, 800],
  'INJ-PERP': [50, 200],
  'TIA-PERP': [100, 400],
  'WIF-PERP': [3000, 15000],
};

const LEVERAGES = [5, 10, 15, 20, 25];

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function generateRandomTrade(sequenceNumber: number): Trade {
  const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  const side: TradeSide = Math.random() > 0.5 ? 'LONG' : 'SHORT';
  const leverage = LEVERAGES[Math.floor(Math.random() * LEVERAGES.length)];

  const basePrice = BASE_PRICES[symbol] ?? 10;
  const pricePrecision = basePrice < 1 ? 4 : 2;

  const entryPrice = roundTo(basePrice * randomBetween(0.97, 1.03), pricePrecision);
  const priceChange = entryPrice * randomBetween(-0.05, 0.05);
  const exitPrice = roundTo(entryPrice + priceChange, pricePrecision);

  const sizeRange = SIZE_RANGES[symbol] ?? [10, 100];
  const size = roundTo(randomBetween(sizeRange[0], sizeRange[1]), basePrice < 1 ? 0 : 2);

  const rawPnl = side === 'LONG'
    ? (exitPrice - entryPrice) * size
    : (entryPrice - exitPrice) * size;
  const pnl = roundTo(rawPnl, 2);

  const notional = entryPrice * size;
  const fee = roundTo(-notional * randomBetween(0.0005, 0.001), 2);

  return {
    id: `tx_${String(sequenceNumber).padStart(3, '0')}`,
    timestamp: new Date().toISOString(),
    symbol,
    side,
    entryPrice,
    exitPrice,
    size,
    leverage,
    pnl,
    fee,
    status: 'CLOSED',
  };
}
