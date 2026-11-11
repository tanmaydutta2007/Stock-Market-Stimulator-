import React from 'react';
import { Star, TrendingUp, TrendingDown, Trash2, Plus } from 'lucide-react';

export default function WatchlistSidebar({ 
  watchlist = [], 
  activeSymbol, 
  onSelectSymbol, 
  onRemoveSymbol 
}) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Star size={16} className="text-amber-400 fill-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100">
            My Watchlist ({watchlist.length})
          </h2>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          Click to load chart
        </span>
      </div>

      {watchlist.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500">
          Your watchlist is empty. Click "Add to Watchlist" on any stock to track it here.
        </div>
      ) : (
        <div className="space-y-1.5 max-h-80 overflow-y-auto">
          {watchlist.map((item) => {
            const isUp = (item.change || 0) >= 0;
            const isSelected = activeSymbol === item.symbol;

            return (
              <div
                key={item.symbol}
                onClick={() => onSelectSymbol(item.symbol)}
                className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-slate-100 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-100">
                    {item.symbol}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate max-w-[100px] hidden sm:inline">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-slate-100">
                      ${item.price?.toFixed(2)}
                    </div>
                    <div className={`font-mono text-[10px] font-semibold flex items-center justify-end gap-0.5 ${
                      isUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isUp ? '+' : ''}{item.changePercent?.toFixed(2)}%
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSymbol(item.symbol);
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors rounded"
                    title="Remove from Watchlist"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

