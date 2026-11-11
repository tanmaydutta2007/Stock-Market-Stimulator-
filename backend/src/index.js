const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const orderEngine = require('./services/orderEngine');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite dev server (usually localhost:5173 or any port)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API health and info
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Mount API routes
app.use('/api', apiRoutes);

// Background worker to check and execute pending limit orders every 3.5 seconds
const LIMIT_ORDER_INTERVAL_MS = 3500;
setInterval(async () => {
  try {
    await orderEngine.processPendingLimitOrders();
  } catch (err) {
    console.error('[Background Limit Order Check Error]:', err.message);
  }
}, LIMIT_ORDER_INTERVAL_MS);

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`Stock Market Simulator Backend running on http://localhost:${PORT}`);
  console.log(`Initial Cash Balance for new traders: $10,000.00 USD`);
  console.log(`Limit Order Background Engine: Active (${LIMIT_ORDER_INTERVAL_MS}ms tick)`);
  console.log(`=======================================================`);
});

