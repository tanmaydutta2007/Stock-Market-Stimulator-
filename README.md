# StockSim - Beginner Stock Market Simulator & Paper Trading

> A high-performance, beginner-friendly Stock Market Simulator web application designed to help users practice trading without real financial risk.  
> **Author:** Tanmay Dutta, Heritage Institute of Technology.

---

## 🌟 Key Features

1. **Authorized Market Data with Zero API-Key Friction**:
   - Integrates live US market quotes and historical candlestick data (1D, 1W, 1M, 1Y) via free authorized Yahoo Finance API endpoints.
   - Built-in caching layer (TTL) protects against rate limits and network drops.
   - **Continuous 24/7 Price Simulation Engine**: When US stock markets are closed (nights, weekends, holidays), the backend runs a realistic micro-fluctuation simulation based on the latest closing price so you can practice paper trading at any time!

2. **$10,000 USD Virtual Paper-Trading Balance**:
   - New accounts start with **$10,000.00 USD** in paper cash.
   - One-click account reset button to restart from $10,000 whenever you want to test new trading strategies.

3. **Interactive Financial Dashboard**:
   - **Performance Summary Cards**: Total Net Worth, Available Buying Power, Invested Equity, and Total Return / P&L (dollar and percentage).
   - **Holdings Table**: Real-time unrealized P&L, shares owned, average cost basis, and quick trade shortcuts.
   - **Transaction History**: Audit trail of every buy/sell trade executed.

4. **Realistic Order Execution Engine**:
   - **Market Orders**: Instant buy or sell executions at the current ask/bid price.
   - **Limit Orders**: Specify a target price. Cash/shares are safely held in escrow, and an active background matching engine triggers and fills orders automatically when the price touches your target. Pending limit orders can be cancelled anytime with instant cash/shares refund.

5. **Beginner Financial Literacy & Interactive Tooltips**:
   - Clickable and hoverable educational tooltips next to every stock term: **Market Cap**, **P/E Ratio**, **Bid/Ask Spread**, **Limit Orders**, **Stop-Loss**, **52-Week Range**, and **Volume**.
   - Includes formulas, plain-English definitions, and concrete beginner examples.
   - Built-in **Beginner Handbook / Glossary Modal** for quick reference on essential market concepts.

6. **Search & Watchlist**:
   - Live autocomplete search for any US ticker or company name.
   - Quick-pick chips for popular stocks: AAPL, NVDA, TSLA, MSFT, AMZN, GOOGL, META, SPY.
   - Personal star watchlist with real-time price changes.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Chart.js, React-Chartjs-2, Lucide Icons.
- **Backend**: Node.js, Express, Better-SQLite3, In-Memory TTL Cache.
- **Database**: SQLite (`backend/simulator.db`) with WAL mode.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Run the Backend Server
```bash
cd backend
npm install
npm start
```
The backend API server will run at `http://localhost:5000`.

### 2. Run the Frontend App
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
The Vite development server will run at `http://localhost:5173`. Open this URL in your web browser to start paper trading!

---

## 📡 Backend API Endpoints

- `GET /health` - Health check.
- `GET /api/market/status` - Live market open/closed status.
- `GET /api/stocks/quote/:symbol` - Real-time stock quote and fundamental metrics.
- `GET /api/stocks/chart/:symbol?range=1D|1W|1M|1Y` - Historical chart data.
- `GET /api/stocks/search?q=:query` - Autocomplete ticker search.
- `GET /api/portfolio` - User balance, net worth, holdings, and P&L.
- `POST /api/portfolio/reset` - Reset portfolio back to $10,000 USD.
- `POST /api/orders/market` - Execute market buy/sell order.
- `POST /api/orders/limit` - Place limit buy/sell order.
- `DELETE /api/orders/limit/:id` - Cancel pending limit order.
- `GET /api/orders/limit` - List user limit orders.
- `GET /api/orders/transactions` - List past trade transactions.
- `GET /api/watchlist` - User's watchlist.
- `POST /api/watchlist` - Add ticker to watchlist.
- `DELETE /api/watchlist/:symbol` - Remove ticker from watchlist.
- `GET /api/education/terms` - Educational definitions and formulas.
