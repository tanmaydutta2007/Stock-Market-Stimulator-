const BASE_URL = '/api';

export async function fetchMarketStatus() {
  const res = await fetch(`${BASE_URL}/market/status`);
  if (!res.ok) throw new Error('Failed to fetch market status');
  return res.json();
}

export async function fetchStockQuote(symbol) {
  const res = await fetch(`${BASE_URL}/stocks/quote/${encodeURIComponent(symbol)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch quote');
  }
  return res.json();
}

export async function fetchStockChart(symbol, range = '1D') {
  const res = await fetch(`${BASE_URL}/stocks/chart/${encodeURIComponent(symbol)}?range=${range}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch chart data');
  }
  return res.json();
}

export async function searchStocks(query) {
  if (!query) return [];
  const res = await fetch(`${BASE_URL}/stocks/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchPortfolio() {
  const res = await fetch(`${BASE_URL}/portfolio`);
  if (!res.ok) throw new Error('Failed to fetch portfolio');
  return res.json();
}

export async function resetPortfolio() {
  const res = await fetch(`${BASE_URL}/portfolio/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset portfolio');
  return res.json();
}

export async function executeMarketOrder({ symbol, type, shares }) {
  const res = await fetch(`${BASE_URL}/orders/market`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol, type, shares: parseFloat(shares) })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Market order execution failed');
  return data;
}

export async function placeLimitOrder({ symbol, type, shares, targetPrice }) {
  const res = await fetch(`${BASE_URL}/orders/limit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symbol,
      type,
      shares: parseFloat(shares),
      targetPrice: parseFloat(targetPrice)
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Limit order placement failed');
  return data;
}

export async function cancelLimitOrder(id) {
  const res = await fetch(`${BASE_URL}/orders/limit/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to cancel limit order');
  return data;
}

export async function fetchLimitOrders() {
  const res = await fetch(`${BASE_URL}/orders/limit`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchTransactions() {
  const res = await fetch(`${BASE_URL}/orders/transactions`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchWatchlist() {
  const res = await fetch(`${BASE_URL}/watchlist`);
  if (!res.ok) return [];
  return res.json();
}

export async function addToWatchlist(symbol) {
  const res = await fetch(`${BASE_URL}/watchlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol })
  });
  return res.json();
}

export async function removeFromWatchlist(symbol) {
  const res = await fetch(`${BASE_URL}/watchlist/${encodeURIComponent(symbol)}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function fetchEducationalTerms() {
  const res = await fetch(`${BASE_URL}/education/terms`);
  if (!res.ok) return [];
  return res.json();
}

