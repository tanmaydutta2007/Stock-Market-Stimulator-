import React from 'react';
import { Clock, CheckCircle2, XCircle, Ban, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import EducationalTooltip from './EducationalTooltip';

export default function LimitOrdersTable({ limitOrders = [], onCancelOrder }) {
  if (limitOrders.length === 0) return null;

  const pendingCount = limitOrders.filter(o => o.status === 'PENDING').length;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm overflow-hidden mb-6">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-amber-400" />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center">
            Limit Orders ({limitOrders.length})
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {pendingCount} Active Pending
              </span>
            )}
            <EducationalTooltip
              term="Limit Orders Queue"
              category="Order Types"
              definition="Pending orders waiting for market prices to hit the exact target price you specified. Funds or shares are reserved in escrow until filled or cancelled."
              calculation="Executes automatically as soon as Live Price crosses Target Price."
              example="A pending Buy Limit at $130 will stay active until the stock dips to $130 or you cancel it."
            />
          </h2>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Asset & Type</th>
              <th className="py-3 px-4 text-right">Shares</th>
              <th className="py-3 px-4 text-right">Target Price</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Created</th>
              <th className="py-3 px-4 text-center">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {limitOrders.map((order) => {
              const isBuy = order.type === 'BUY';
              const isPending = order.status === 'PENDING';
              const isExecuted = order.status === 'EXECUTED';

              return (
                <tr key={order.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400">
                    #{order.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-bold font-mono text-[11px] flex items-center gap-1 ${
                        isBuy ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                      }`}>
                        {isBuy ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {order.type}
                      </span>
                      <span className="font-bold font-mono text-slate-200">
                        {order.symbol}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-200">
                    {order.shares}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-cyan-300">
                    ${order.target_price.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                      isPending
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : isExecuted
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isPending && <Clock size={11} className="animate-spin text-amber-400" />}
                      {isExecuted && <CheckCircle2 size={11} className="text-emerald-400" />}
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isPending ? (
                      <button
                        onClick={() => onCancelOrder(order.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-medium transition-colors inline-flex items-center gap-1"
                        title="Cancel order and refund reserved funds"
                      >
                        <Ban size={12} />
                        Cancel
                      </button>
                    ) : (
                      <span className="text-slate-600 font-mono text-[11px]">—</span>
                    )}
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

