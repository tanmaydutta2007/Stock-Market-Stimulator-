import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import PortfolioSummary from './components/PortfolioSummary';
import StockSearch from './components/StockSearch';
import StockChart from './components/StockChart';
import OrderPanel from './components/OrderPanel';
import HoldingsTable from './components/HoldingsTable';
import LimitOrdersTable from './components/LimitOrdersTable';
import TransactionHistory from './components/TransactionHistory';
import WatchlistSidebar from './components/WatchlistSidebar';
import EducationalGlossaryModal from './components/EducationalGlossaryModal';

import {
  fetchMarketStatus,
  fetchStockQuote,
  fetchStockChart,
  fetchPortfolio,
  resetPortfolio,
  executeMarketOrder,
  placeLimitOrder,
  cancelLimitOrder,
  fetchLimitOrders,
  fetchTransactions,
  fetchWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  fetchEducationalTerms
} from './services/api';

export default function App() {
  const [activeSymbol, setActiveSymbol] = useState('AAPL');
  const [activeRange, setActiveRange] = useState('1D');
  
  const [quote, setQuote] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [isChartLoading, setIsChartLoading] = useState(false);

  const [portfolio, setPortfolio] = useState(null);
  const [limitOrders, setLimitOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [marketStatus, setMarketStatus] = useState(null);
  const [educationalTerms, setEducationalTerms] = useState([]);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  // Load static educational glossary terms once
  useEffect(() => {
    fetchEducationalTerms().then(setEducationalTerms).catch(console.error);
    fetchMarketStatus().then(setMarketStatus).catch(console.error);
  }, []);

  // Fetch full portfolio, transactions, and limit orders
  const refreshAccountData = useCallback(async () => {
    try {
      const [portData, ordersData, txData] = await Promise.all([
        fetchPortfolio(),
        fetchLimitOrders(),
        fetchTransactions()
      ]);
      setPortfolio(portData);
      setLimitOrders(ordersData);
      setTransactions(txData);
    } catch (err) {
      console.error('Error refreshing account data:', err);
    }
  }, []);

  // Fetch watchlist
  const refreshWatchlist = useCallback(async () => {
    try {
      const list = await fetchWatchlist();
      setWatchlist(list);
    } catch (err) {
      console.error('Error fetching watchlist:', err);
    }
  }, []);

  // Fetch active stock quote
  const refreshQuote = useCallback(async (symbol) => {
    try {
      const q = await fetchStockQuote(symbol);
      setQuote(q);
    } catch (err) {
      console.error('Error fetching quote for', symbol, err);
    }
  }, []);

  // Fetch historical chart
  const loadChart = useCallback(async (symbol, range) => {
    setIsChartLoading(true);
    try {
      const data = await fetchStockChart(symbol, range);
      setChartData(data);
    } catch (err) {
      console.error('Error fetching chart:', err);
    } finally {
      setIsChartLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshAccountData();
    refreshWatchlist();
  }, [refreshAccountData, refreshWatchlist]);

  // When active symbol or timeframe changes
  useEffect(() => {
    refreshQuote(activeSymbol);
    loadChart(activeSymbol, activeRange);
  }, [activeSymbol, activeRange, refreshQuote, loadChart]);

  // Continuous live price polling (every 3.5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshQuote(activeSymbol);
      refreshAccountData();
    }, 3500);

    return () => clearInterval(interval);
  }, [activeSymbol, refreshQuote, refreshAccountData]);

  // Slower watchlist polling (every 15 seconds)
  useEffect(() => {
    const wlInterval = setInterval(() => {
      refreshWatchlist();
    }, 15000);

    return () => clearInterval(wlInterval);
  }, [refreshWatchlist]);

  // Order Handlers
  const handleExecuteMarketOrder = async (orderPayload) => {
    const res = await executeMarketOrder(orderPayload);
    await refreshAccountData();
    await refreshQuote(activeSymbol);
    return res;
  };

  const handlePlaceLimitOrder = async (orderPayload) => {
    const res = await placeLimitOrder(orderPayload);
    await refreshAccountData();
    return res;
  };

  const handleCancelLimitOrder = async (orderId) => {
    await cancelLimitOrder(orderId);
    await refreshAccountData();
  };

  const handleResetPortfolio = async () => {
    await resetPortfolio();
    await refreshAccountData();
    await refreshQuote(activeSymbol);
  };

  const isWatchlisted = watchlist.some(w => w.symbol === activeSymbol);

  const handleToggleWatchlist = async () => {
    if (isWatchlisted) {
      await removeFromWatchlist(activeSymbol);
    } else {
      await addToWatchlist(activeSymbol);
    }
    await refreshWatchlist();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar
        portfolio={portfolio}
        marketStatus={marketStatus}
        onResetPortfolio={handleResetPortfolio}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Portfolio Balance Metric Cards */}
        <PortfolioSummary portfolio={portfolio} />

        {/* Stock Search Bar & Popular Chips */}
        <StockSearch
          currentSymbol={activeSymbol}
          onSelectSymbol={setActiveSymbol}
          isWatchlisted={isWatchlisted}
          onToggleWatchlist={handleToggleWatchlist}
        />

        {/* Dashboard Grid: Left (Chart & Holdings) | Right (Trading & Watchlist) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (Chart, Holdings, Orders, History) */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            
            {/* Interactive Stock Chart & Key Metrics */}
            <StockChart
              quote={quote}
              chartData={chartData}
              activeRange={activeRange}
              onChangeRange={setActiveRange}
              isLoading={isChartLoading}
            />

            {/* User Active Holdings */}
            <HoldingsTable
              holdings={portfolio?.holdings || []}
              onSelectSymbol={setActiveSymbol}
            />

            {/* Pending & Executed Limit Orders */}
            <LimitOrdersTable
              limitOrders={limitOrders}
              onCancelOrder={handleCancelLimitOrder}
            />

            {/* Transaction History Log */}
            <TransactionHistory transactions={transactions} />

          </div>

          {/* Right Column (Order Execution & Watchlist) */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            
            {/* Buy / Sell Trading Panel */}
            <OrderPanel
              quote={quote}
              portfolio={portfolio}
              onExecuteMarketOrder={handleExecuteMarketOrder}
              onPlaceLimitOrder={handlePlaceLimitOrder}
            />

            {/* Watchlist Sidebar */}
            <WatchlistSidebar
              watchlist={watchlist}
              activeSymbol={activeSymbol}
              onSelectSymbol={setActiveSymbol}
              onRemoveSymbol={async (sym) => {
                await removeFromWatchlist(sym);
                refreshWatchlist();
              }}
            />

          </div>

        </div>

      </main>

      {/* Educational Glossary & Guide Modal */}
      <EducationalGlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        terms={educationalTerms}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <p>
          StockPulse Paper Trading Simulator • Zero Financial Risk Practice Environment • Authorized Market Data Feeds
        </p>
      </footer>

    </div>
  );
}
