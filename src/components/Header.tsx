import { useSimulationControl } from '@/context/TradingDataContext';
import { WalletInfo } from './WalletInfo';

export function Header() {
    const { isSimulating, toggleSimulation } = useSimulationControl();

    return (
        <header className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Logo & Title */}
                <div className="text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-normal pb-1">
                        Trading Analytics Dashboard
                    </h1>
                    <p className="mt-2 text-slate-400">
                        Crypto Perpetual Trading Performance Analytics
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center sm:justify-end gap-4">
                    {/* Wallet Connection */}
                    <WalletInfo />
                    {/* Demo Toggle */}
                    <button
                        onClick={toggleSimulation}
                        className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
              transition-all duration-300 shadow-lg
              ${isSimulating
                                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40'
                                : 'bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-slate-700 hover:border-slate-500'
                            }
            `}
                    >
                        {/* Animated Dot */}
                        <span className="relative flex h-3 w-3">
                            {isSimulating && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${isSimulating ? 'bg-emerald-300' : 'bg-slate-500'}`}></span>
                        </span>
                        {isSimulating ? 'Live Demo Active' : 'Start Demo'}
                    </button>
                </div>
            </div>

            {/* Live Status Banner */}
            {isSimulating && (
                <div className="mt-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center gap-2">
                    <span className="text-emerald-400 text-sm">
                        📊 Generating simulated trades every 3-5 seconds...
                    </span>
                </div>
            )}
        </header>
    );
}
