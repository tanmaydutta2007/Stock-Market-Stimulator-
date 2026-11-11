import React from 'react';
import { Briefcase, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import EducationalTooltip from './EducationalTooltip';

export default function HoldingsTable({ holdings = [], onSelectSymbol }) {
  if (holdings.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Briefcase size={22} />
        </div>
        <h3 className="text-sm font-bold text-slate-200 mb-1">
          No Active Stock Holdings
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
          You currently hold 100% in virtual cash. Pick a stock like AAPL, NVDA, or TSLA from the search bar above to place your first trade!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm overflow-hidden mb-6">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase size={18} className="text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center">
            Active Holdings ({holdings.length})
            <EducationalTooltip
              term="Portfolio Holdings"
              category="Portfolio"
              definition="The list of companies in which you currently own shares. Shows your average cost, current price, and unrealized profit or loss."
              calculation="Unrealized P&L = (Current Price - Avg Cost) × Shares"
              example="If you bought 10 shares at $100 and it rises to $120, your unrealized gain is +$200."
            />
          </h2>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Asset</th>
              <th className="py-3 px-4 text-right">Shares</th>
              <th className="py-3 px-4 text-right">Avg Cost</th>
              <th className="py-3 px-4 text-right">Current Price</th>
              <th className="py-3 px-4 text-right">Market Value</th>
              <th className="py-3 px-4 text-right">Total P&L</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {holdings.map((h) => {
              const isGain = h.pnl >= 0;
              return (
                <tr 
                  key={h.id} 
                  className="hover:bg-slate-850/60 transition-colors group cursor-pointer"
                  onClick={() => onSelectSymbol(h.symbol)}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-cyan-400 font-mono text-xs border border-slate-700">
                        {h.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 font-mono group-hover:text-cyan-300 transition-colors">
                          {h.symbol}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[120px]">
                          {h.companyName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-200">
                    <div>{h.shares.toFixed(2)}</div>
                    {h.reservedShares > 0 && (
                      <div className="text-[10px] text-amber-400">
                        ({h.reservedShares.toFixed(2)} limit reserved)
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                    ${h.avgBuyPrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-100">
                    ${h.currentPrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100">
                    ${h.totalValue.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span className={`inline-flex items-center gap-0.5 font-bold ${
                      isGain ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isGain ? '+' : ''}${h.pnl.toFixed(2)} ({isGain ? '+' : ''}{h.pnlPercent.toFixed(2)}%)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSymbol(h.symbol);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1 mx-auto"
                    >
                      Trade
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}

