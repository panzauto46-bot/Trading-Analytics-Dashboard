import { createContext, useContext, useCallback, useRef, useState, useEffect, type ReactNode } from 'react';
import type { Trade } from '@/types/trade';
import { tradingHistory } from '@/data/mockData';
import { generateRandomTrade } from '@/utils/tradeGenerator';

// Context 1: Trading data (trades array)
interface TradingDataContextValue {
  trades: Trade[];
}

// Context 2: Simulation control (toggle on/off)
interface SimulationControlContextValue {
  isSimulating: boolean;
  toggleSimulation: () => void;
}

const TradingDataContext = createContext<TradingDataContextValue | null>(null);
const SimulationControlContext = createContext<SimulationControlContextValue | null>(null);

export function TradingDataProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>(tradingHistory);
  const [isSimulating, setIsSimulating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tradeCounterRef = useRef(tradingHistory.length);

  const toggleSimulation = useCallback(() => {
    setIsSimulating(prev => !prev);
  }, []);

  useEffect(() => {
    if (isSimulating) {
      const scheduleNext = () => {
        const delay = 3000 + Math.random() * 2000; // 3-5 seconds
        timeoutRef.current = setTimeout(() => {
          tradeCounterRef.current += 1;
          const newTrade = generateRandomTrade(tradeCounterRef.current);
          setTrades(prev => {
            // Cap at 200 trades to prevent memory issues
            const updated = [...prev, newTrade];
            return updated.length > 200 ? updated.slice(-200) : updated;
          });
          scheduleNext();
        }, delay);
      };
      scheduleNext();
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isSimulating]);

  return (
    <SimulationControlContext.Provider value={{ isSimulating, toggleSimulation }}>
      <TradingDataContext.Provider value={{ trades }}>
        {children}
      </TradingDataContext.Provider>
    </SimulationControlContext.Provider>
  );
}

export function useTradingData() {
  const ctx = useContext(TradingDataContext);
  if (!ctx) throw new Error('useTradingData must be used within TradingDataProvider');
  return ctx;
}

export function useSimulationControl() {
  const ctx = useContext(SimulationControlContext);
  if (!ctx) throw new Error('useSimulationControl must be used within TradingDataProvider');
  return ctx;
}
