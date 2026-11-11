const express = require('express');
const router = express.Router();
const financialData = require('../services/financialData');
const orderEngine = require('../services/orderEngine');
const portfolioService = require('../services/portfolioService');

// Default user ID for single-user simulator mode
const DEFAULT_USER_ID = 1;

// --- Market Status ---
router.get('/market/status', (req, res) => {
  try {
    const status = financialData.getMarketStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Stock Quotes & Historical Charts ---
router.get('/stocks/quote/:symbol', async (req, res) => {
  try {
    const quote = await financialData.getQuote(req.params.symbol);
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stocks/chart/:symbol', async (req, res) => {
  try {
    const range = req.query.range || '1D';
    const chart = await financialData.getHistorical(req.params.symbol, range);
    res.json(chart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stocks/search', async (req, res) => {
  try {
    const results = await financialData.search(req.query.q || '');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Portfolio & User Operations ---
router.get('/portfolio', async (req, res) => {
  try {
    const summary = await portfolioService.getPortfolioSummary(DEFAULT_USER_ID);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/portfolio/reset', (req, res) => {
  try {
    const result = portfolioService.resetPortfolio(DEFAULT_USER_ID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Trading & Orders ---
router.post('/orders/market', async (req, res) => {
  try {
    const { symbol, type, shares } = req.body;
    const result = await orderEngine.executeMarketOrder(DEFAULT_USER_ID, { symbol, type, shares });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/orders/limit', async (req, res) => {
  try {
    const { symbol, type, shares, targetPrice } = req.body;
    const result = await orderEngine.placeLimitOrder(DEFAULT_USER_ID, { symbol, type, shares, targetPrice });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/orders/limit/:id', (req, res) => {
  try {
    const result = orderEngine.cancelLimitOrder(DEFAULT_USER_ID, parseInt(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/orders/limit', (req, res) => {
  try {
    const orders = portfolioService.getLimitOrders(DEFAULT_USER_ID);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders/transactions', (req, res) => {
  try {
    const txs = portfolioService.getTransactionHistory(DEFAULT_USER_ID);
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Watchlist ---
router.get('/watchlist', async (req, res) => {
  try {
    const list = await portfolioService.getWatchlist(DEFAULT_USER_ID);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/watchlist', (req, res) => {
  try {
    const { symbol } = req.body;
    const result = portfolioService.addToWatchlist(DEFAULT_USER_ID, symbol);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/watchlist/:symbol', (req, res) => {
  try {
    const result = portfolioService.removeFromWatchlist(DEFAULT_USER_ID, req.params.symbol);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Educational Terminology Glossary ---
router.get('/education/terms', (req, res) => {
  const terms = [
    {
      term: 'Market Cap',
      title: 'Market Capitalization',
      definition: 'The total dollar value of all outstanding company shares. It shows how big a company is in the eyes of the public market.',
      calculation: 'Current Stock Price × Total Outstanding Shares',
      example: 'If Apple has 15 billion shares and trades at $200, its Market Cap is $3 Trillion.',
      category: 'Valuation'
    },
    {
      term: 'P/E Ratio',
      title: 'Price-to-Earnings Ratio',
      definition: 'Measures how much investors are willing to pay for each $1 of the company’s annual profits.',
      calculation: 'Current Stock Price ÷ Trailing Earnings Per Share (EPS)',
      example: 'A P/E of 25 means you are paying $25 for every $1 of profit the company generated over the past 12 months.',
      category: 'Valuation'
    },
    {
      term: 'Bid / Ask',
      title: 'Bid Price & Ask Price (Spread)',
      definition: 'The Bid is the highest price a buyer is willing to pay right now. The Ask is the lowest price a seller is willing to accept. The difference is the "Spread".',
      calculation: 'Spread = Ask Price - Bid Price',
      example: 'If Apple Bid is $240.10 and Ask is $240.15, you buy at $240.15 and sell at $240.10.',
      category: 'Trading'
    },
    {
      term: 'Market Order',
      title: 'Market Order',
      definition: 'An instruction to execute your trade immediately at the best available current market price. Guarantees speed, but price can shift during high volatility.',
      calculation: 'Instant execution at Ask (Buy) or Bid (Sell)',
      example: 'Placing a Market Buy for 5 shares fills instantly at the current $240.15 ask.',
      category: 'Order Types'
    },
    {
      term: 'Limit Order',
      title: 'Limit Order',
      definition: 'An instruction to buy or sell a stock only at a specific target price or better. It protects you from bad fills, but may not execute if the price never reaches your target.',
      calculation: 'Buy triggers when Price ≤ Target; Sell triggers when Price ≥ Target',
      example: 'Setting a Limit Buy for TSLA at $210 when it trades at $220 will wait until TSLA drops to $210 before buying.',
      category: 'Order Types'
    },
    {
      term: 'Stop-Loss',
      title: 'Stop-Loss Order',
      definition: 'A risk-management order designed to limit an investor’s loss on a security position by automatically exiting when the stock falls below a predefined threshold.',
      calculation: 'Triggers a market sell once price hits Stop Price',
      example: 'If you buy at $100 and set a stop-loss at $90, your maximum loss is capped near 10%.',
      category: 'Risk Management'
    },
    {
      term: '52-Week High / Low',
      title: '52-Week Range',
      definition: 'The highest and lowest price at which a stock has traded over the previous 52 weeks (one full year).',
      calculation: 'Max(Price) and Min(Price) over past 365 days',
      example: 'Seeing a stock near its 52-week low might suggest it is discounted, or facing headwinds.',
      category: 'Technical'
    },
    {
      term: 'Volume',
      title: 'Trading Volume',
      definition: 'The total number of shares that changed hands between buyers and sellers during a given period or trading day.',
      calculation: 'Sum of all shares in executed transactions',
      example: 'High volume confirms price movements with high conviction; low volume can mean sluggish liquidity.',
      category: 'Technical'
    }
  ];
  res.json(terms);
});

module.exports = router;

