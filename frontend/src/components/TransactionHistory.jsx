import React from 'react';
import { History, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import EducationalTooltip from './EducationalTooltip';

export default function TransactionHistory({ transactions = [] }) {
  if (transactions.length === 0) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm overflow-hidden mb-6">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={18} className="text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center">
            Trade History ({transactions.length})
            <EducationalTooltip
              term="Trade Confirmation Log"
              category="Trading"
              definition="Complete record of all orders successfully filled on your account, detailing price, execution type, and trade timestamp."
              example="Shows exactly what price you bought and sold each asset at."
            />
          </h2>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-72 overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Date / Time</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Order</th>
              <th className="py-3 px-4">Asset</th>
              <th className="py-3 px-4 text-right">Shares</th>
              <th className="py-3 px-4 text-right">Filled Price</th>
              <th className="py-3 px-4 text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {transactions.map((tx) => {
              const isBuy = tx.type === 'BUY';
              return (
                <tr key={tx.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {new Date(tx.created_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded font-bold font-mono text-[11px] inline-flex items-center gap-1 ${
                      isBuy ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                    }`}>
                      {isBuy ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {tx.order_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-100">
                    {tx.symbol}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-200">
                    {tx.shares.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-100">
                    ${tx.price.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                    <span className={isBuy ? 'text-slate-200' : 'text-emerald-400'}>
                      ${tx.total_amount.toFixed(2)}
                    </span>
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

