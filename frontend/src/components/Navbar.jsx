import React, { useState } from 'react';
import { 
  TrendingUp, 
  RotateCcw, 
  BookOpen, 
  Activity, 
  Moon, 
  Sun, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

export default function Navbar({ 
  portfolio, 
  marketStatus, 
  onResetPortfolio, 
  onOpenGlossary 
}) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const netWorth = portfolio?.netWorth ?? 10000;
  const totalPnl = portfolio?.totalPnl ?? 0;
  const totalPnlPercent = portfolio?.totalPnlPercent ?? 0;
  const isProfit = totalPnl >= 0;
  const isOpen = marketStatus?.isOpen;

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      await onResetPortfolio();
      setShowConfirmReset(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-lg">
            <TrendingUp size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                Stock<span className="text-cyan-400">Sim</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Simulator
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Risk-Free Virtual Paper Trading
            </p>
          </div>
        </div>

        {/* Center: Market State Badge */}
        <div className="hidden md:flex items-center">
          <div className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-2 ${
            isOpen 
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
              : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isOpen ? 'bg-emerald-400' : 'bg-indigo-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isOpen ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}></span>
            </span>
            <span>
              {isOpen ? 'US Markets Live (Open)' : '24/7 Live Price Simulation (Trade Anytime)'}
            </span>
          </div>
        </div>

        {/* Right Controls & Balance */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Quick Net Worth Display */}
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              Virtual Balance
            </div>
            <div className="flex items-center justify-end gap-1.5">
              <span className="font-bold text-slate-100 text-sm sm:text-base font-mono">
                ${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded font-mono ${
                isProfit 
                  ? 'bg-emerald-500/15 text-emerald-400' 
                  : 'bg-rose-500/15 text-rose-400'
              }`}>
                {isProfit ? '+' : ''}{totalPnlPercent.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Beginner Handbook Button */}
            <button
              onClick={onOpenGlossary}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              title="Beginner Financial Handbook & Terms"
            >
              <BookOpen size={16} className="text-cyan-400" />
              <span className="hidden sm:inline">Guide</span>
            </button>

            {/* Reset Balance Button */}
            <button
              onClick={() => setShowConfirmReset(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-700/60 text-xs text-slate-300 hover:text-rose-300 font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              title="Reset Portfolio to $10,000"
            >
              <RotateCcw size={15} />
              <span className="hidden sm:inline">Reset $10k</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">
              Reset Virtual Portfolio to $10,000?
            </h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              This will clear all current active holdings, cancel pending limit orders, and wipe your trade history. Your paper trading cash balance will be restored to <strong>$10,000.00 USD</strong>.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors flex items-center gap-2"
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset to $10,000'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

