import React from 'react';
import { DollarSign, Wallet, PieChart, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import EducationalTooltip from './EducationalTooltip';

export default function PortfolioSummary({ portfolio }) {
  if (!portfolio) return null;

  const {
    netWorth = 10000,
    cashBalance = 10000,
    reservedCash = 0,
    totalInvested = 0,
    totalPnl = 0,
    totalPnlPercent = 0,
    dayPnlDollar = 0,
    dayPnlPercent = 0
  } = portfolio;

  const isOverallProfit = totalPnl >= 0;
  const isDayProfit = dayPnlDollar >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. Net Worth */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center">
            Total Net Worth
            <EducationalTooltip
              term="Net Worth (Portfolio Value)"
              category="Portfolio"
              definition="The total consolidated value of your entire trading account, calculated by adding all cash plus the current live market value of all stocks you own."
              calculation="Cash Balance + Reserved Cash + Market Value of all Stocks"
              example="If you have $6,000 cash and $4,500 worth of Nvidia stock, your Net Worth is $10,500."
            />
          </span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <DollarSign size={18} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-100 tracking-tight">
          ${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Starting: $10,000.00</span>
          <span className={`font-semibold font-mono ${isOverallProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isOverallProfit ? '+' : ''}${totalPnl.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 2. Buying Power (Cash) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center">
            Buying Power
            <EducationalTooltip
              term="Buying Power (Cash Available)"
              category="Trading"
              definition="The exact liquid cash available in your account to place new buy orders right now."
              calculation="Total Cash - Cash Reserved for Pending Limit Orders"
              example="If you have $10,000 cash and place a $2,000 pending limit order, your remaining Buying Power is $8,000."
            />
          </span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Wallet size={18} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-100 tracking-tight">
          ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>In Escrow (Limit):</span>
          <span className="font-mono text-amber-400 font-medium">
            ${reservedCash.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 3. Invested Equity */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center">
            Invested Equity
            <EducationalTooltip
              term="Invested Equity (Holdings)"
              category="Portfolio"
              definition="The current total market value of all stock shares actively in your portfolio."
              calculation="Sum of (Shares × Current Price) for every stock held"
              example="If you own 5 shares of Apple at $240, your invested equity in Apple is $1,200."
            />
          </span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <PieChart size={18} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-100 tracking-tight">
          ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Active Holdings:</span>
          <span className="font-mono font-medium text-purple-300">
            {portfolio.holdingsCount || 0} Stocks
          </span>
        </div>
      </div>

      {/* 4. Total Return & P&L */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center">
            Total Profit / Loss
            <EducationalTooltip
              term="P&L (Profit and Loss)"
              category="Performance"
              definition="The net financial gain or loss achieved compared to your original $10,000 paper trading deposit."
              calculation="Net Worth - Initial Capital ($10,000.00)"
              example="If Net Worth is $10,850, your Total P&L is +$850 (+8.50%)."
            />
          </span>
          <div className={`p-2 rounded-xl ${
            isOverallProfit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {isOverallProfit ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          </div>
        </div>
        <div className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight flex items-center gap-1.5 ${
          isOverallProfit ? 'text-emerald-400' : 'text-rose-400'
        }`}>
          <span>{isOverallProfit ? '+' : ''}${totalPnl.toFixed(2)}</span>
        </div>
        <div className="mt-2 text-xs flex items-center justify-between">
          <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
            isOverallProfit ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/60' : 'bg-rose-950/70 text-rose-400 border border-rose-800/60'
          }`}>
            {isOverallProfit ? '+' : ''}{totalPnlPercent.toFixed(2)}% Return
          </span>
          <span className="text-slate-400 text-[11px] font-mono">
            Today: {isDayProfit ? '+' : ''}${dayPnlDollar.toFixed(2)}
          </span>
        </div>
      </div>

    </div>
  );
}

