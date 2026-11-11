import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Zap, 
  ShieldAlert 
} from 'lucide-react';
import EducationalTooltip from './EducationalTooltip';

export default function OrderPanel({ 
  quote, 
  portfolio, 
  onExecuteMarketOrder, 
  onPlaceLimitOrder 
}) {
  const [tab, setTab] = useState('BUY'); // 'BUY' or 'SELL'
  const [orderType, setOrderType] = useState('MARKET'); // 'MARKET' or 'LIMIT'
  const [shares, setShares] = useState('1');
  const [targetPrice, setTargetPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // Set default target price to current price when switching or ticker changes
  useEffect(() => {
    if (quote?.price && (!targetPrice || orderType === 'MARKET')) {
      setTargetPrice(quote.price.toFixed(2));
    }
  }, [quote?.price, orderType]);

  if (!quote) return null;

  const currentPrice = quote.price || 0;
  const executionPrice = tab === 'BUY' ? (quote.ask || currentPrice) : (quote.bid || currentPrice);
  const numShares = parseFloat(shares) || 0;
  const effectivePrice = orderType === 'LIMIT' ? (parseFloat(targetPrice) || currentPrice) : executionPrice;
  const estimatedTotal = Math.round((numShares * effectivePrice) * 100) / 100;

  const availableCash = portfolio?.cashBalance ?? 0;
  const holding = portfolio?.holdings?.find(h => h.symbol === quote.symbol);
  const availableShares = holding ? (holding.shares - (holding.reservedShares || 0)) : 0;

  // Validation
  const hasEnoughCash = tab === 'BUY' ? (availableCash >= estimatedTotal && estimatedTotal > 0) : true;
  const hasEnoughShares = tab === 'SELL' ? (availableShares >= numShares && numShares > 0) : true;
  const isValidShares = numShares > 0;
  const isValidLimitPrice = orderType === 'LIMIT' ? (parseFloat(targetPrice) > 0) : true;
  const canSubmit = isValidShares && isValidLimitPrice && (tab === 'BUY' ? hasEnoughCash : hasEnoughShares) && !isSubmitting;

  // Quick allocation buttons
  const handleQuickPercent = (percent) => {
    if (tab === 'BUY') {
      const budget = availableCash * (percent / 100);
      const calculatedShares = Math.floor((budget / effectivePrice) * 100) / 100;
      setShares(calculatedShares > 0 ? calculatedShares.toString() : '0');
    } else {
      const calculatedShares = Math.floor((availableShares * (percent / 100)) * 100) / 100;
      setShares(calculatedShares > 0 ? calculatedShares.toString() : '0');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      if (orderType === 'MARKET') {
        const res = await onExecuteMarketOrder({
          symbol: quote.symbol,
          type: tab,
          shares: numShares
        });
        setMessage({
          type: 'success',
          text: `Market ${tab} filled! Bought ${numShares} ${quote.symbol} @ $${res.transaction.price.toFixed(2)}`
        });
        setShares('1');
      } else {
        const res = await onPlaceLimitOrder({
          symbol: quote.symbol,
          type: tab,
          shares: numShares,
          targetPrice: parseFloat(targetPrice)
        });
        setMessage({
          type: 'success',
          text: `Limit ${tab} placed! Waiting for ${quote.symbol} to reach $${parseFloat(targetPrice).toFixed(2)}`
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Trade execution failed'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
          <span>Order Execution</span>
          <span className="text-xs font-mono font-normal text-slate-400">
            ({quote.symbol})
          </span>
        </h2>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
          $0 Commission
        </span>
      </div>

      {/* Buy / Sell Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          type="button"
          onClick={() => { setTab('BUY'); setMessage(null); }}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            tab === 'BUY'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
              : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <ArrowUpRight size={15} />
          BUY {quote.symbol}
        </button>
        <button
          type="button"
          onClick={() => { setTab('SELL'); setMessage(null); }}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            tab === 'SELL'
              ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/25'
              : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <ArrowDownRight size={15} />
          SELL {quote.symbol}
        </button>
      </div>

      {/* Order Type Selector */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
            Order Type
            <EducationalTooltip
              term={orderType === 'MARKET' ? 'Market Order' : 'Limit Order'}
              category="Order Types"
              definition={
                orderType === 'MARKET'
                  ? 'Fills immediately at current live market price. Guarantees execution speed.'
                  : 'Fills only when market reaches your target price or better. Guarantees price control, but order remains pending until price hits.'
              }
              calculation={orderType === 'MARKET' ? 'Fills at Ask (Buy) or Bid (Sell)' : 'Target Price ≤ Current Price (Buy), Target Price ≥ Current Price (Sell)'}
              example={orderType === 'MARKET' ? 'Buy 5 shares right now at current ask.' : `Place Buy order at $${(currentPrice * 0.98).toFixed(2)} to buy if it dips 2%.`}
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setOrderType('MARKET')}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              orderType === 'MARKET'
                ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap size={13} />
            Market Order
          </button>
          <button
            type="button"
            onClick={() => setOrderType('LIMIT')}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              orderType === 'LIMIT'
                ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock size={13} />
            Limit Order
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Quantity (Shares) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Shares Quantity
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {tab === 'BUY' 
                ? `Available Cash: $${availableCash.toFixed(2)}`
                : `Available Shares: ${availableShares.toFixed(2)}`
              }
            </span>
          </div>
          <input
            type="number"
            step="any"
            min="0.01"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            placeholder="0"
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
          />

          {/* Quick percentage buttons */}
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {[25, 50, 75, 100].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => handleQuickPercent(pct)}
                className="py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 text-[11px] font-semibold text-slate-400 hover:text-cyan-400 transition-colors font-mono"
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Target Price for Limit Orders */}
        {orderType === 'LIMIT' && (
          <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-900/50">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center">
                Target Limit Price ($)
                <EducationalTooltip
                  term="Limit Price"
                  category="Order Types"
                  definition="The threshold price at which you want your trade to execute. For BUY, order fills when price drops to or below target. For SELL, fills when price rises to or above target."
                  example={`Target $${(currentPrice * 0.95).toFixed(2)} waits for a 5% price drop.`}
                />
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                Current: ${currentPrice.toFixed(2)}
              </span>
            </div>
            <input
              type="number"
              step="any"
              min="0.01"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder={currentPrice.toFixed(2)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-cyan-800/60 rounded-xl text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
            />
            {parseFloat(targetPrice) > 0 && (
              <div className="mt-2 text-[11px] text-slate-400 leading-normal">
                {tab === 'BUY' ? (
                  <span>
                    Will trigger if {quote.symbol} drops to or below <strong>${parseFloat(targetPrice).toFixed(2)}</strong> ({((parseFloat(targetPrice) - currentPrice) / currentPrice * 100).toFixed(1)}%).
                  </span>
                ) : (
                  <span>
                    Will trigger if {quote.symbol} rises to or above <strong>${parseFloat(targetPrice).toFixed(2)}</strong> (+{((parseFloat(targetPrice) - currentPrice) / currentPrice * 100).toFixed(1)}%).
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Order Summary Calculations */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Execution Price:</span>
            <span className="font-mono text-slate-200">
              ${effectivePrice.toFixed(2)} {orderType === 'MARKET' ? (tab === 'BUY' ? '(Ask)' : '(Bid)') : '(Limit Target)'}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Trading Fee:</span>
            <span className="font-mono text-emerald-400">$0.00 Commission</span>
          </div>
          <div className="flex justify-between font-bold pt-1.5 border-t border-slate-800/80 text-slate-200">
            <span>Estimated Total:</span>
            <span className="font-mono text-cyan-300 text-sm">
              ${estimatedTotal.toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* Validation Warning */}
        {tab === 'BUY' && !hasEnoughCash && numShares > 0 && (
          <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-400" />
            <span>Insufficient funds. You need ${estimatedTotal.toFixed(2)} but have ${availableCash.toFixed(2)}.</span>
          </div>
        )}

        {tab === 'SELL' && !hasEnoughShares && numShares > 0 && (
          <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-400" />
            <span>Insufficient shares. You have {availableShares.toFixed(2)} available to sell.</span>
          </div>
        )}

        {/* Feedback Message */}
        {message && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/40 border border-rose-800/60 text-rose-300'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Submit Order Button */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg ${
            canSubmit
              ? tab === 'BUY'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 active:scale-[0.99]'
                : 'bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-rose-500/25 active:scale-[0.99]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
          }`}
        >
          {isSubmitting
            ? 'Processing Order...'
            : orderType === 'MARKET'
              ? `${tab} ${numShares || 0} ${quote.symbol} (Market)`
              : `Place ${tab} Limit Order ($${parseFloat(targetPrice || 0).toFixed(2)})`
          }
        </button>

      </form>
    </div>
  );
}

