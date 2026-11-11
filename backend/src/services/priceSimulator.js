const cache = require('./cache');

class PriceSimulator {
  constructor() {
    this.simulatedState = new Map();
    // Default reference prices if network is unavailable
    this.defaultBasePrices = {
      AAPL: 242.50,
      NVDA: 138.25,
      TSLA: 260.40,
      MSFT: 428.80,
      AMZN: 196.15,
      GOOGL: 178.60,
      META: 585.30,
      SPY: 574.90,
      QQQ: 486.20,
      NFLX: 745.00,
      AMD: 154.60
    };
  }

  isMarketOpen() {
    // Regular US market hours: Mon-Fri 9:30 AM - 4:00 PM US Eastern Time (ET)
    const now = new Date();
    // Convert current time to US Eastern
    const estString = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
    const estDate = new Date(estString);
    const day = estDate.getDay(); // 0 is Sunday, 6 is Saturday
    if (day === 0 || day === 6) {
      return false;
    }
    const hours = estDate.getHours();
    const minutes = estDate.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    // 9:30 AM = 570 mins, 4:00 PM = 960 mins
    return totalMinutes >= 570 && totalMinutes <= 960;
  }

  getSimulatedPrice(symbol, basePrice = null, previousClose = null) {
    const sym = symbol.toUpperCase();
    let state = this.simulatedState.get(sym);

    if (!state) {
      const startingPrice = basePrice || this.defaultBasePrices[sym] || 150.00;
      const prevClose = previousClose || (startingPrice * 0.995);
      state = {
        symbol: sym,
        price: startingPrice,
        basePrice: startingPrice,
        previousClose: prevClose,
        high: startingPrice,
        low: startingPrice,
        lastUpdated: Date.now()
      };
      this.simulatedState.set(sym, state);
    } else if (basePrice && Math.abs(state.basePrice - basePrice) > basePrice * 0.05) {
      // Re-anchor if real base price shifted substantially
      state.basePrice = basePrice;
      state.previousClose = previousClose || (basePrice * 0.995);
    }

    // Micro fluctuation: small random walk step (-0.08% to +0.08%)
    const elapsedSeconds = Math.max(1, (Date.now() - state.lastUpdated) / 1000);
    if (elapsedSeconds >= 1.5) {
      const volatility = 0.0006;
      const drift = (Math.random() - 0.495) * volatility;
      const newPrice = Math.round((state.price * (1 + drift)) * 100) / 100;

      state.price = Math.max(0.01, newPrice);
      state.high = Math.max(state.high, state.price);
      state.low = Math.min(state.low, state.price);
      state.lastUpdated = Date.now();
    }

    const change = Math.round((state.price - state.previousClose) * 100) / 100;
    const changePercent = Math.round(((change / state.previousClose) * 100) * 100) / 100;

    return {
      symbol: sym,
      price: state.price,
      change,
      changePercent,
      high: state.high,
      low: state.low,
      previousClose: state.previousClose,
      isSimulated: true
    };
  }

  // Force update a symbol's base anchor from live data
  updateAnchor(symbol, realPrice, prevClose) {
    const sym = symbol.toUpperCase();
    let state = this.simulatedState.get(sym);
    if (!state) {
      this.simulatedState.set(sym, {
        symbol: sym,
        price: realPrice,
        basePrice: realPrice,
        previousClose: prevClose || realPrice,
        high: realPrice,
        low: realPrice,
        lastUpdated: Date.now()
      });
    } else {
      state.basePrice = realPrice;
      if (prevClose) state.previousClose = prevClose;
      // If live market is open, keep price synced
      if (this.isMarketOpen()) {
        state.price = realPrice;
        state.high = Math.max(state.high, realPrice);
        state.low = Math.min(state.low, realPrice);
        state.lastUpdated = Date.now();
      }
    }
  }
}

module.exports = new PriceSimulator();

