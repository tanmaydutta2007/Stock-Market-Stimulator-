const cache = require('./cache');
const priceSimulator = require('./priceSimulator');
const { getProfile, POPULAR_PROFILES } = require('./companyProfiles');

class FinancialDataService {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  getMarketStatus() {
    const isOpen = priceSimulator.isMarketOpen();
    return {
      isOpen,
      status: isOpen ? 'OPEN' : 'AFTER_HOURS_SIMULATION',
      message: isOpen 
        ? 'US Markets are currently Open (Live NYSE/NASDAQ Feeds)' 
        : 'US Markets are Closed. Live 24/7 After-Hours Simulation Engine is Active for continuous paper trading.',
      timestamp: new Date().toISOString()
    };
  }

  async getQuote(symbol) {
    const sym = (symbol || 'AAPL').toUpperCase().trim();
    const cacheKey = `quote_${sym}`;
    const cached = cache.get(cacheKey);

    // If cached quote is fresh and market is closed, we still tick simulated price
    const profile = getProfile(sym);
    const isOpen = priceSimulator.isMarketOpen();

    let rawPrice = null;
    let prevClose = null;
    let high = null;
    let low = null;
    let volume = null;
    let fiftyTwoWeekHigh = null;
    let fiftyTwoWeekLow = null;
    let companyName = profile.name;
    let exchange = 'NASDAQ';

    if (cached) {
      rawPrice = cached.rawPrice;
      prevClose = cached.previousClose;
      high = cached.high;
      low = cached.low;
      volume = cached.volume;
      fiftyTwoWeekHigh = cached.fiftyTwoWeekHigh;
      fiftyTwoWeekLow = cached.fiftyTwoWeekLow;
      companyName = cached.name || profile.name;
      exchange = cached.exchange || 'NASDAQ';
    } else {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1d&interval=5m`;
        const res = await fetch(url, {
          headers: { 'User-Agent': this.userAgent },
          signal: AbortSignal.timeout(4000)
        });

        if (res.ok) {
          const data = await res.json();
          const meta = data.chart?.result?.[0]?.meta;
          if (meta) {
            rawPrice = meta.regularMarketPrice;
            prevClose = meta.chartPreviousClose || meta.previousClose || rawPrice;
            high = meta.regularMarketDayHigh || rawPrice;
            low = meta.regularMarketDayLow || rawPrice;
            volume = meta.regularMarketVolume || 12500000;
            fiftyTwoWeekHigh = meta.fiftyTwoWeekHigh || Math.round(rawPrice * 1.25 * 100) / 100;
            fiftyTwoWeekLow = meta.fiftyTwoWeekLow || Math.round(rawPrice * 0.75 * 100) / 100;
            companyName = meta.shortName || meta.longName || profile.name;
            exchange = meta.exchangeName || 'NASDAQ';

            // Cache raw data for 20 seconds
            cache.set(cacheKey, {
              rawPrice,
              previousClose: prevClose,
              high,
              low,
              volume,
              fiftyTwoWeekHigh,
              fiftyTwoWeekLow,
              name: companyName,
              exchange
            }, 20);

            priceSimulator.updateAnchor(sym, rawPrice, prevClose);
          }
        }
      } catch (err) {
        console.warn(`[FinancialData] API fetch warning for ${sym}: ${err.message}. Using fallback simulator.`);
      }
    }

    // Determine final price: if market is closed or API failed, simulate realistic micro ticks
    let currentPrice = rawPrice;
    let change = 0;
    let changePercent = 0;
    let isSimulated = false;

    if (!isOpen || !currentPrice) {
      const sim = priceSimulator.getSimulatedPrice(sym, rawPrice, prevClose);
      currentPrice = sim.price;
      change = sim.change;
      changePercent = sim.changePercent;
      high = Math.max(high || currentPrice, sim.high);
      low = Math.min(low || currentPrice, sim.low);
      prevClose = sim.previousClose;
      isSimulated = true;
    } else {
      change = Math.round((currentPrice - prevClose) * 100) / 100;
      changePercent = prevClose ? Math.round(((change / prevClose) * 100) * 100) / 100 : 0;
    }

    // Bid / Ask calculation with tight realistic spread (approx 0.05% - 0.1%)
    const spreadHalf = Math.max(0.01, Math.round((currentPrice * 0.0005) * 100) / 100);
    const bid = Math.round((currentPrice - spreadHalf) * 100) / 100;
    const ask = Math.round((currentPrice + spreadHalf) * 100) / 100;

    // Derived Financial Fundamentals
    const marketCap = Math.round(currentPrice * (profile.sharesOutstanding || 1000000000));
    const peRatio = profile.trailingEPS && profile.trailingEPS > 0
      ? Math.round((currentPrice / profile.trailingEPS) * 10) / 10
      : null;

    return {
      symbol: sym,
      name: companyName,
      exchange,
      price: currentPrice,
      change,
      changePercent,
      previousClose: prevClose || currentPrice,
      dayHigh: high || currentPrice,
      dayLow: low || currentPrice,
      volume: volume || 5000000,
      bid,
      ask,
      marketCap,
      peRatio,
      fiftyTwoWeekHigh: fiftyTwoWeekHigh || Math.round(currentPrice * 1.25 * 100) / 100,
      fiftyTwoWeekLow: fiftyTwoWeekLow || Math.round(currentPrice * 0.8 * 100) / 100,
      sector: profile.sector,
      industry: profile.industry,
      description: profile.description,
      dividendYield: profile.dividendYield,
      isSimulated,
      marketOpen: isOpen,
      timestamp: new Date().toISOString()
    };
  }

  async getHistorical(symbol, range = '1D') {
    const sym = (symbol || 'AAPL').toUpperCase().trim();
    const upperRange = (range || '1D').toUpperCase();
    const cacheKey = `chart_${sym}_${upperRange}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    // Map range to Yahoo params
    let yRange = '1d';
    let yInterval = '5m';

    switch (upperRange) {
      case '1W':
        yRange = '5d';
        yInterval = '15m';
        break;
      case '1M':
        yRange = '1mo';
        yInterval = '1d';
        break;
      case '1Y':
        yRange = '1y';
        yInterval = '1d';
        break;
      case '1D':
      default:
        yRange = '1d';
        yInterval = '5m';
        break;
    }

    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=${yRange}&interval=${yInterval}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': this.userAgent },
        signal: AbortSignal.timeout(5000)
      });

      if (res.ok) {
        const data = await res.json();
        const result = data.chart?.result?.[0];
        if (result && result.timestamp && result.indicators?.quote?.[0]) {
          const timestamps = result.timestamp;
          const quote = result.indicators.quote[0];
          const opens = quote.open || [];
          const highs = quote.high || [];
          const lows = quote.low || [];
          const closes = quote.close || [];
          const volumes = quote.volume || [];

          const points = [];
          for (let i = 0; i < timestamps.length; i++) {
            const c = closes[i];
            if (c !== null && c !== undefined && !isNaN(c)) {
              const o = opens[i] || c;
              const h = highs[i] || Math.max(o, c);
              const l = lows[i] || Math.min(o, c);
              const v = volumes[i] || 0;
              const d = new Date(timestamps[i] * 1000);

              let formattedTime = '';
              if (upperRange === '1D') {
                formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } else if (upperRange === '1W') {
                formattedTime = `${d.getMonth() + 1}/${d.getDate()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
              } else {
                formattedTime = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              }

              points.push({
                timestamp: timestamps[i] * 1000,
                time: formattedTime,
                open: Math.round(o * 100) / 100,
                high: Math.round(h * 100) / 100,
                low: Math.round(l * 100) / 100,
                close: Math.round(c * 100) / 100,
                volume: v
              });
            }
          }

          if (points.length > 0) {
            const chartData = {
              symbol: sym,
              range: upperRange,
              points,
              previousClose: result.meta?.chartPreviousClose || result.meta?.previousClose || points[0].close
            };
            cache.set(cacheKey, chartData, 180); // cache for 3 mins
            return chartData;
          }
        }
      }
    } catch (err) {
      console.warn(`[FinancialData] Error fetching historical chart for ${sym}: ${err.message}. Generating fallback.`);
    }

    // Fallback chart generator if network failed
    const fallback = this.generateFallbackChart(sym, upperRange);
    cache.set(cacheKey, fallback, 60);
    return fallback;
  }

  generateFallbackChart(symbol, range) {
    const profile = getProfile(symbol);
    const quote = priceSimulator.getSimulatedPrice(symbol);
    const basePrice = quote.price;
    const points = [];
    const count = range === '1D' ? 78 : range === '1W' ? 120 : range === '1M' ? 30 : 250;
    let curr = basePrice * (range === '1D' ? 0.99 : range === '1Y' ? 0.8 : 0.95);

    const now = Date.now();
    const stepMs = range === '1D' ? 5 * 60 * 1000 : range === '1W' ? 15 * 60 * 1000 : 24 * 3600 * 1000;

    for (let i = count; i >= 0; i--) {
      const ts = now - i * stepMs;
      const d = new Date(ts);
      const delta = (Math.random() - 0.49) * (curr * 0.008);
      curr = Math.max(1, curr + delta);
      const o = curr - (Math.random() - 0.5) * (curr * 0.004);
      const h = Math.max(o, curr) + Math.random() * (curr * 0.003);
      const l = Math.min(o, curr) - Math.random() * (curr * 0.003);

      let formattedTime = '';
      if (range === '1D') {
        formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (range === '1W') {
        formattedTime = `${d.getMonth() + 1}/${d.getDate()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        formattedTime = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }

      points.push({
        timestamp: ts,
        time: formattedTime,
        open: Math.round(o * 100) / 100,
        high: Math.round(h * 100) / 100,
        low: Math.round(l * 100) / 100,
        close: Math.round(curr * 100) / 100,
        volume: Math.floor(Math.random() * 500000 + 100000)
      });
    }

    return {
      symbol,
      range,
      points,
      previousClose: points[0].close
    };
  }

  async search(query) {
    const q = (query || '').trim();
    if (!q) return [];

    const cacheKey = `search_${q.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const results = [];

    // Check popular symbols first
    for (const [sym, data] of Object.entries(POPULAR_PROFILES)) {
      if (sym.includes(q.toUpperCase()) || data.name.toLowerCase().includes(q.toLowerCase())) {
        results.push({
          symbol: sym,
          name: data.name,
          exchange: 'NASDAQ',
          sector: data.sector,
          industry: data.industry
        });
      }
    }

    try {
      const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0`;
      const res = await fetch(url, {
        headers: { 'User-Agent': this.userAgent },
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.quotes) {
          for (const item of data.quotes) {
            if (item.symbol && !results.some(r => r.symbol === item.symbol)) {
              results.push({
                symbol: item.symbol,
                name: item.shortname || item.longname || item.symbol,
                exchange: item.exchDisp || item.exchange || 'US',
                sector: item.sector || 'General',
                industry: item.industry || 'Equities'
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn(`[Search] query failed: ${e.message}`);
    }

    const trimmed = results.slice(0, 10);
    cache.set(cacheKey, trimmed, 300);
    return trimmed;
  }
}

module.exports = new FinancialDataService();

