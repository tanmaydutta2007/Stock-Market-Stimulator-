import React, { useState, useEffect, useRef } from 'react';
import { Search, Star, Loader2, TrendingUp, Sparkles } from 'lucide-react';
import { searchStocks } from '../services/api';

const POPULAR_TICKERS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'NVDA', name: 'Nvidia' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'SPY', name: 'S&P 500 ETF' }
];

export default function StockSearch({ 
  currentSymbol, 
  onSelectSymbol, 
  isWatchlisted, 
  onToggleWatchlist 
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const matches = await searchStocks(query.trim());
        setResults(matches);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (sym) => {
    onSelectSymbol(sym);
    setQuery('');
    setShowDropdown(false);
  };

  return (
    <div className="relative mb-5" ref={containerRef}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {isLoading ? <Loader2 size={16} className="animate-spin text-cyan-400" /> : <Search size={16} />}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
            placeholder="Search symbol or company (e.g. AAPL, NVDA, TSLA, Amazon)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
          />

          {/* Autocomplete Dropdown */}
          {showDropdown && results.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
              <div className="p-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-950/60 border-b border-slate-800">
                Matching Equities
              </div>
              {results.map((item) => (
                <button
                  key={item.symbol}
                  onClick={() => handleSelect(item.symbol)}
                  className="w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-slate-800 transition-colors border-b border-slate-800/40 last:border-none"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-cyan-400 text-sm">
                      {item.symbol}
                    </span>
                    <span className="text-xs text-slate-300 truncate max-w-xs">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {item.exchange || 'US'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Watchlist toggle for active stock */}
        <button
          onClick={onToggleWatchlist}
          className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
            isWatchlisted
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-slate-100'
          }`}
          title={isWatchlisted ? `Remove ${currentSymbol} from Watchlist` : `Add ${currentSymbol} to Watchlist`}
        >
          <Star size={15} className={isWatchlisted ? 'fill-amber-400 text-amber-400' : 'text-slate-400'} />
          <span>{isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}</span>
        </button>
      </div>

      {/* Popular Quick-Pick Buttons */}
      <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-medium text-slate-500 shrink-0 mr-1 flex items-center gap-1">
          <Sparkles size={12} className="text-amber-400" />
          Popular:
        </span>
        {POPULAR_TICKERS.map((t) => (
          <button
            key={t.symbol}
            onClick={() => onSelectSymbol(t.symbol)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              currentSymbol === t.symbol
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {t.symbol}
          </button>
        ))}
      </div>
    </div>
  );
}

