import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Clock, Activity, BarChart2 } from 'lucide-react';
import EducationalTooltip from './EducationalTooltip';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function StockChart({ 
  quote, 
  chartData, 
  activeRange, 
  onChangeRange, 
  isLoading 
}) {
  const [flashClass, setFlashClass] = useState('');
  const prevPriceRef = useRef(quote?.price);

  useEffect(() => {
    if (quote?.price && prevPriceRef.current !== undefined) {
      if (quote.price > prevPriceRef.current) {
        setFlashClass('price-flash-up text-emerald-400');
        setTimeout(() => setFlashClass(''), 1000);
      } else if (quote.price < prevPriceRef.current) {
        setFlashClass('price-flash-down text-rose-400');
        setTimeout(() => setFlashClass(''), 1000);
      }
    }
    prevPriceRef.current = quote?.price;
  }, [quote?.price]);

  if (!quote) return null;

  const isUp = (quote.change || 0) >= 0;
  const strokeColor = isUp ? '#10b981' : '#f43f5e';
  const fillColor = isUp ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)';

  const points = chartData?.points || [];
  const labels = points.map(p => p.time);
  const dataPrices = points.map(p => p.close);

  const chartConfigData = {
    labels,
    datasets: [
      {
        label: `${quote.symbol} Price (USD)`,
        data: dataPrices,
        borderColor: strokeColor,
        borderWidth: 2,
        pointRadius: points.length > 50 ? 0 : 2,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: strokeColor,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        fill: true,
        backgroundColor: fillColor,
        tension: 0.15
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#94a3b8',
        bodyColor: '#f8fafc',
        bodyFont: { weight: 'bold', size: 13 },
        padding: 10,
        borderColor: '#334155',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context) => `Price: $${context.parsed.y.toFixed(2)} USD`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.25)' },
        ticks: {
          color: '#64748b',
          maxTicksLimit: 7,
          font: { size: 11 }
        }
      },
      y: {
        position: 'right',
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          callback: (value) => `$${value.toFixed(2)}`
        }
      }
    }
  };

  const ranges = ['1D', '1W', '1M', '1Y'];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm mb-6">
      
      {/* Header: Ticker, Name, Price & Timeframe controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight font-mono">
              {quote.symbol}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {quote.exchange || 'NASDAQ'}
            </span>
            {quote.isSimulated && (
              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 flex items-center gap-1">
                <Clock size={11} /> 24/7 Simulator
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {quote.name} • <span className="text-slate-500">{quote.sector}</span>
          </div>
        </div>

        {/* Live Price Display & Controls */}
        <div className="flex flex-col sm:items-end w-full sm:w-auto">
          <div className="flex items-baseline gap-2.5">
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono transition-colors duration-300 ${flashClass || 'text-slate-100'}`}>
              ${quote.price.toFixed(2)}
            </span>
            <span className={`text-sm font-bold font-mono px-2 py-0.5 rounded flex items-center gap-1 ${
              isUp ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
            }`}>
              {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isUp ? '+' : ''}{quote.change.toFixed(2)} ({isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Prev Close: ${quote.previousClose.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Timeframe Switcher */}
      <div className="flex items-center justify-between py-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <BarChart2 size={14} className="text-cyan-400" />
          Price History
        </span>
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => onChangeRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                activeRange === r
                  ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <div className="text-xs text-cyan-400 font-mono animate-pulse">
              Loading financial chart data...
            </div>
          </div>
        )}
        {points.length > 0 ? (
          <Line data={chartConfigData} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            No chart points available for this range.
          </div>
        )}
      </div>

      {/* Beginner Educational Key Statistics Grid */}
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>Fundamental & Market Metrics</span>
          <span className="text-[11px] text-cyan-400 font-normal">Hover (?) icons to learn what each term means</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Market Cap */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="text-[11px] text-slate-400 flex items-center">
              Market Cap
              <EducationalTooltip
                term="Market Cap"
                category="Valuation"
                definition="Total dollar valuation of the company's publicly traded stock shares."
                calculation="Current Stock Price × Total Outstanding Shares"
                example="Large Cap companies (> $10 Billion) are generally more stable than small startups."
              />
            </div>
            <div className="text-sm font-bold font-mono text-slate-200 mt-1">
              ${(quote.marketCap / 1e9).toFixed(2)}B
            </div>
          </div>

          {/* P/E Ratio */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="text-[11px] text-slate-400 flex items-center">
              P/E Ratio
              <EducationalTooltip
                term="P/E Ratio (Price-to-Earnings)"
                category="Valuation"
                definition="Measures company share price relative to its annual earnings per share. High P/E implies expectations of higher future growth."
                calculation="Current Stock Price ÷ Trailing 12-Month Earnings Per Share (EPS)"
                example="A P/E of 25 means you are paying $25 for every $1 of annual company earnings."
              />
            </div>
            <div className="text-sm font-bold font-mono text-slate-200 mt-1">
              {quote.peRatio ? `${quote.peRatio}x` : 'N/A'}
            </div>
          </div>

          {/* Bid / Ask */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="text-[11px] text-slate-400 flex items-center">
              Bid / Ask
              <EducationalTooltip
                term="Bid / Ask Spread"
                category="Trading"
                definition="The Bid is the highest price buyers will pay right now; the Ask is the lowest price sellers will accept."
                calculation="Spread = Ask Price - Bid Price"
                example="When you place a Market Buy order, you buy at the Ask. When you sell, you get the Bid."
              />
            </div>
            <div className="text-xs font-bold font-mono text-slate-200 mt-1 truncate">
              ${quote.bid.toFixed(2)} / ${quote.ask.toFixed(2)}
            </div>
          </div>

          {/* Day Range */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="text-[11px] text-slate-400 flex items-center">
              Day Range
              <EducationalTooltip
                term="Day Range (Low - High)"
                category="Technical"
                definition="The lowest and highest price at which the stock traded during today's session."
                calculation="Min(Today Price) - Max(Today Price)"
                example="Helps you spot intra-day volatility and price momentum."
              />
            </div>
            <div className="text-xs font-bold font-mono text-slate-200 mt-1 truncate">
              ${quote.dayLow.toFixed(2)} - ${quote.dayHigh.toFixed(2)}
            </div>
          </div>

          {/* 52-Week Range */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="text-[11px] text-slate-400 flex items-center">
              52-W Range
              <EducationalTooltip
                term="52-Week High & Low"
                category="Technical"
                definition="The extreme high and low prices recorded for this stock over the previous 52 weeks (1 year)."
                calculation="Lowest & Highest close over past 365 calendar days"
                example="A stock trading near its 52-week low is historically depressed; near 52-week high indicates a 1-year peak."
              />
            </div>
            <div className="text-xs font-bold font-mono text-slate-200 mt-1 truncate">
              ${quote.fiftyTwoWeekLow.toFixed(2)} - ${quote.fiftyTwoWeekHigh.toFixed(2)}
            </div>
          </div>

          {/* Volume */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="text-[11px] text-slate-400 flex items-center">
              Volume
              <EducationalTooltip
                term="Trading Volume"
                category="Technical"
                definition="The total number of individual shares traded across all market transactions today."
                calculation="Sum of all shares executed in trades today"
                example="Heavy volume indicates strong institutional interest and higher trading liquidity."
              />
            </div>
            <div className="text-sm font-bold font-mono text-slate-200 mt-1">
              {(quote.volume / 1e6).toFixed(2)}M
            </div>
          </div>

        </div>

        {/* Company Description for context */}
        {quote.description && (
          <div className="mt-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/40 text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300">About {quote.name}:</strong> {quote.description}
          </div>
        )}
      </div>

    </div>
  );
}

