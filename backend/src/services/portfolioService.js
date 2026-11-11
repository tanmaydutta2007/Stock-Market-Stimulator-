const db = require('../database/db');
const financialData = require('./financialData');

class PortfolioService {
  async getPortfolioSummary(userId) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) throw new Error('User not found');

    const rawHoldings = db.prepare('SELECT * FROM holdings WHERE user_id = ? AND shares > 0').all(userId);

    let totalInvested = 0;
    let totalCostBasis = 0;
    let totalDayChangeDollar = 0;

    const holdingsWithQuotes = await Promise.all(rawHoldings.map(async (holding) => {
      try {
        const quote = await financialData.getQuote(holding.symbol);
        const currentPrice = quote.price;
        const totalValue = Math.round((holding.shares * currentPrice) * 100) / 100;
        const costBasis = Math.round((holding.shares * holding.avg_buy_price) * 100) / 100;
        const pnl = Math.round((totalValue - costBasis) * 100) / 100;
        const pnlPercent = costBasis > 0 ? Math.round(((pnl / costBasis) * 100) * 100) / 100 : 0;
        const dayChange = Math.round((holding.shares * quote.change) * 100) / 100;

        totalInvested += totalValue;
        totalCostBasis += costBasis;
        totalDayChangeDollar += dayChange;

        return {
          id: holding.id,
          symbol: holding.symbol,
          companyName: quote.name,
          shares: holding.shares,
          availableShares: Math.max(0, holding.shares - holding.reserved_shares),
          reservedShares: holding.reserved_shares,
          avgBuyPrice: holding.avg_buy_price,
          currentPrice,
          totalValue,
          costBasis,
          pnl,
          pnlPercent,
          dayChange,
          dayChangePercent: quote.changePercent,
          updatedAt: holding.updated_at
        };
      } catch (err) {
        console.warn(`Error getting quote for holding ${holding.symbol}:`, err.message);
        const fallbackPrice = holding.avg_buy_price;
        const fallbackVal = Math.round((holding.shares * fallbackPrice) * 100) / 100;
        totalInvested += fallbackVal;
        totalCostBasis += fallbackVal;

        return {
          id: holding.id,
          symbol: holding.symbol,
          companyName: holding.symbol,
          shares: holding.shares,
          availableShares: holding.shares,
          reservedShares: 0,
          avgBuyPrice: holding.avg_buy_price,
          currentPrice: fallbackPrice,
          totalValue: fallbackVal,
          costBasis: fallbackVal,
          pnl: 0,
          pnlPercent: 0,
          dayChange: 0,
          dayChangePercent: 0,
          updatedAt: holding.updated_at
        };
      }
    }));

    totalInvested = Math.round(totalInvested * 100) / 100;
    totalCostBasis = Math.round(totalCostBasis * 100) / 100;
    const netWorth = Math.round((user.cash_balance + user.reserved_cash + totalInvested) * 100) / 100;
    const totalPnl = Math.round((netWorth - 10000.00) * 100) / 100;
    const totalPnlPercent = Math.round(((totalPnl / 10000.00) * 100) * 100) / 100;
    const dayPnlPercent = netWorth > 0 ? Math.round(((totalDayChangeDollar / netWorth) * 100) * 100) / 100 : 0;

    return {
      userId: user.id,
      username: user.username,
      cashBalance: user.cash_balance,
      reservedCash: user.reserved_cash,
      totalInvested,
      netWorth,
      startingBalance: 10000.00,
      totalPnl,
      totalPnlPercent,
      dayPnlDollar: Math.round(totalDayChangeDollar * 100) / 100,
      dayPnlPercent,
      holdingsCount: holdingsWithQuotes.length,
      holdings: holdingsWithQuotes
    };
  }

  resetPortfolio(userId) {
    const tx = db.transaction(() => {
      db.prepare('DELETE FROM holdings WHERE user_id = ?').run(userId);
      db.prepare("UPDATE limit_orders SET status = 'CANCELLED' WHERE user_id = ? AND status = 'PENDING'").run(userId);
      db.prepare('DELETE FROM transactions WHERE user_id = ?').run(userId);
      db.prepare(`
        UPDATE users 
        SET cash_balance = 10000.00, reserved_cash = 0.00 
        WHERE id = ?
      `).run(userId);
    });

    tx();
    return { success: true, message: 'Portfolio reset to initial $10,000.00 balance.' };
  }

  async getWatchlist(userId) {
    const rows = db.prepare('SELECT symbol FROM watchlist WHERE user_id = ? ORDER BY id ASC').all(userId);
    const symbols = rows.map(r => r.symbol);

    const watchlist = await Promise.all(symbols.map(async (symbol) => {
      try {
        const quote = await financialData.getQuote(symbol);
        return {
          symbol: quote.symbol,
          name: quote.name,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          volume: quote.volume,
          sector: quote.sector
        };
      } catch (e) {
        return {
          symbol,
          name: symbol,
          price: 100,
          change: 0,
          changePercent: 0,
          volume: 0,
          sector: 'General'
        };
      }
    }));

    return watchlist;
  }

  addToWatchlist(userId, symbol) {
    const sym = symbol.toUpperCase().trim();
    db.prepare('INSERT OR IGNORE INTO watchlist (user_id, symbol) VALUES (?, ?)').run(userId, sym);
    return { success: true, symbol: sym };
  }

  removeFromWatchlist(userId, symbol) {
    const sym = symbol.toUpperCase().trim();
    db.prepare('DELETE FROM watchlist WHERE user_id = ? AND symbol = ?').run(userId, sym);
    return { success: true, symbol: sym };
  }

  getTransactionHistory(userId) {
    return db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY id DESC 
      LIMIT 100
    `).all(userId);
  }

  getLimitOrders(userId) {
    return db.prepare(`
      SELECT * FROM limit_orders 
      WHERE user_id = ? 
      ORDER BY id DESC 
      LIMIT 100
    `).all(userId);
  }
}

module.exports = new PortfolioService();

