const db = require('../database/db');
const financialData = require('./financialData');

class OrderEngine {
  constructor() {
    this.isProcessing = false;
  }

  getUser(userId) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  }

  async executeMarketOrder(userId, { symbol, type, shares }) {
    const sym = symbol.toUpperCase().trim();
    const qty = parseFloat(shares);
    const upperType = type.toUpperCase().trim();

    if (!['BUY', 'SELL'].includes(upperType)) {
      throw new Error('Order type must be BUY or SELL');
    }
    if (isNaN(qty) || qty <= 0) {
      throw new Error('Shares quantity must be a positive number');
    }

    const user = this.getUser(userId);
    if (!user) throw new Error('User account not found');

    // Fetch latest price
    const quote = await financialData.getQuote(sym);
    // Ask for buy, Bid for sell
    const executionPrice = upperType === 'BUY' ? (quote.ask || quote.price) : (quote.bid || quote.price);
    const totalAmount = Math.round((qty * executionPrice) * 100) / 100;

    // Use a transaction for atomic DB updates
    const runInTransaction = db.transaction(() => {
      if (upperType === 'BUY') {
        if (user.cash_balance < totalAmount) {
          throw new Error(`Insufficient funds. Required: $${totalAmount.toFixed(2)}, Available: $${user.cash_balance.toFixed(2)}`);
        }

        // Deduct cash
        db.prepare('UPDATE users SET cash_balance = cash_balance - ? WHERE id = ?').run(totalAmount, userId);

        // Update or insert holding
        const existingHolding = db.prepare('SELECT * FROM holdings WHERE user_id = ? AND symbol = ?').get(userId, sym);
        if (existingHolding) {
          const totalShares = existingHolding.shares + qty;
          const totalCost = (existingHolding.shares * existingHolding.avg_buy_price) + totalAmount;
          const newAvgPrice = Math.round((totalCost / totalShares) * 100) / 100;

          db.prepare(`
            UPDATE holdings 
            SET shares = ?, avg_buy_price = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(totalShares, newAvgPrice, existingHolding.id);
        } else {
          db.prepare(`
            INSERT INTO holdings (user_id, symbol, shares, avg_buy_price, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
          `).run(userId, sym, qty, executionPrice);
        }

        // Log transaction
        const result = db.prepare(`
          INSERT INTO transactions (user_id, symbol, type, order_type, shares, price, total_amount, status)
          VALUES (?, ?, 'BUY', 'MARKET', ?, ?, ?, 'EXECUTED')
        `).run(userId, sym, qty, executionPrice, totalAmount);

        return {
          transactionId: result.lastInsertRowid,
          type: 'BUY',
          orderType: 'MARKET',
          symbol: sym,
          shares: qty,
          price: executionPrice,
          totalAmount,
          status: 'EXECUTED'
        };
      } else {
        // SELL
        const holding = db.prepare('SELECT * FROM holdings WHERE user_id = ? AND symbol = ?').get(userId, sym);
        const availableShares = holding ? (holding.shares - holding.reserved_shares) : 0;

        if (!holding || availableShares < qty) {
          throw new Error(`Insufficient shares. You have ${availableShares.toFixed(2)} available shares of ${sym}.`);
        }

        // Add proceeds to cash
        db.prepare('UPDATE users SET cash_balance = cash_balance + ? WHERE id = ?').run(totalAmount, userId);

        // Deduct holding shares
        const remainingShares = holding.shares - qty;
        if (remainingShares <= 0.0001 && holding.reserved_shares <= 0) {
          db.prepare('DELETE FROM holdings WHERE id = ?').run(holding.id);
        } else {
          db.prepare(`
            UPDATE holdings
            SET shares = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(remainingShares, holding.id);
        }

        // Log transaction
        const result = db.prepare(`
          INSERT INTO transactions (user_id, symbol, type, order_type, shares, price, total_amount, status)
          VALUES (?, ?, 'SELL', 'MARKET', ?, ?, ?, 'EXECUTED')
        `).run(userId, sym, qty, executionPrice, totalAmount);

        return {
          transactionId: result.lastInsertRowid,
          type: 'SELL',
          orderType: 'MARKET',
          symbol: sym,
          shares: qty,
          price: executionPrice,
          totalAmount,
          status: 'EXECUTED'
        };
      }
    });

    const txResult = runInTransaction();
    const updatedUser = this.getUser(userId);

    return {
      success: true,
      transaction: txResult,
      cashBalance: updatedUser.cash_balance,
      reservedCash: updatedUser.reserved_cash
    };
  }

  async placeLimitOrder(userId, { symbol, type, shares, targetPrice }) {
    const sym = symbol.toUpperCase().trim();
    const qty = parseFloat(shares);
    const target = parseFloat(targetPrice);
    const upperType = type.toUpperCase().trim();

    if (!['BUY', 'SELL'].includes(upperType)) {
      throw new Error('Order type must be BUY or SELL');
    }
    if (isNaN(qty) || qty <= 0) {
      throw new Error('Shares quantity must be a positive number');
    }
    if (isNaN(target) || target <= 0) {
      throw new Error('Target price must be a positive number');
    }

    const user = this.getUser(userId);
    if (!user) throw new Error('User not found');

    const totalReserved = Math.round((qty * target) * 100) / 100;

    const runInTransaction = db.transaction(() => {
      if (upperType === 'BUY') {
        if (user.cash_balance < totalReserved) {
          throw new Error(`Insufficient cash. Required: $${totalReserved.toFixed(2)}, Available: $${user.cash_balance.toFixed(2)}`);
        }

        // Reserve cash
        db.prepare(`
          UPDATE users 
          SET cash_balance = cash_balance - ?, reserved_cash = reserved_cash + ?
          WHERE id = ?
        `).run(totalReserved, totalReserved, userId);
      } else {
        // SELL
        const holding = db.prepare('SELECT * FROM holdings WHERE user_id = ? AND symbol = ?').get(userId, sym);
        const availableShares = holding ? (holding.shares - holding.reserved_shares) : 0;

        if (!holding || availableShares < qty) {
          throw new Error(`Insufficient shares. Available to sell: ${availableShares.toFixed(2)}`);
        }

        // Reserve shares
        db.prepare('UPDATE holdings SET reserved_shares = reserved_shares + ? WHERE id = ?')
          .run(qty, holding.id);
      }

      // Insert pending limit order
      const result = db.prepare(`
        INSERT INTO limit_orders (user_id, symbol, type, target_price, shares, status)
        VALUES (?, ?, ?, ?, ?, 'PENDING')
      `).run(userId, sym, upperType, target, qty);

      return result.lastInsertRowid;
    });

    const orderId = runInTransaction();

    // Check immediately if limit order triggers at current price
    await this.processPendingLimitOrders();

    const order = db.prepare('SELECT * FROM limit_orders WHERE id = ?').get(orderId);
    return {
      success: true,
      order
    };
  }

  cancelLimitOrder(userId, orderId) {
    const order = db.prepare('SELECT * FROM limit_orders WHERE id = ? AND user_id = ?').get(orderId, userId);
    if (!order) throw new Error('Limit order not found');
    if (order.status !== 'PENDING') throw new Error(`Cannot cancel order with status: ${order.status}`);

    const runInTransaction = db.transaction(() => {
      if (order.type === 'BUY') {
        const refundAmount = Math.round((order.shares * order.target_price) * 100) / 100;
        db.prepare(`
          UPDATE users
          SET cash_balance = cash_balance + ?, reserved_cash = MAX(0, reserved_cash - ?)
          WHERE id = ?
        `).run(refundAmount, refundAmount, userId);
      } else {
        // SELL
        db.prepare(`
          UPDATE holdings
          SET reserved_shares = MAX(0, reserved_shares - ?)
          WHERE user_id = ? AND symbol = ?
        `).run(order.shares, userId, order.symbol);
      }

      db.prepare(`
        UPDATE limit_orders
        SET status = 'CANCELLED'
        WHERE id = ?
      `).run(orderId);
    });

    runInTransaction();
    return { success: true, message: 'Limit order cancelled successfully' };
  }

  async processPendingLimitOrders() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const pendingOrders = db.prepare("SELECT * FROM limit_orders WHERE status = 'PENDING'").all();
      if (!pendingOrders.length) {
        this.isProcessing = false;
        return;
      }

      for (const order of pendingOrders) {
        try {
          const quote = await financialData.getQuote(order.symbol);
          const currentPrice = quote.price;

          if (order.type === 'BUY' && currentPrice <= order.target_price) {
            // BUY triggered!
            const execPrice = currentPrice;
            const actualTotal = Math.round((order.shares * execPrice) * 100) / 100;
            const reservedTotal = Math.round((order.shares * order.target_price) * 100) / 100;
            const refund = Math.max(0, reservedTotal - actualTotal);

            const tx = db.transaction(() => {
              // Deduct reserved cash, refund any price improvement difference
              db.prepare(`
                UPDATE users
                SET reserved_cash = MAX(0, reserved_cash - ?),
                    cash_balance = cash_balance + ?
                WHERE id = ?
              `).run(reservedTotal, refund, order.user_id);

              // Update holdings
              const existing = db.prepare('SELECT * FROM holdings WHERE user_id = ? AND symbol = ?').get(order.user_id, order.symbol);
              if (existing) {
                const totalShares = existing.shares + order.shares;
                const totalCost = (existing.shares * existing.avg_buy_price) + actualTotal;
                const newAvg = Math.round((totalCost / totalShares) * 100) / 100;
                db.prepare(`
                  UPDATE holdings
                  SET shares = ?, avg_buy_price = ?, updated_at = CURRENT_TIMESTAMP
                  WHERE id = ?
                `).run(totalShares, newAvg, existing.id);
              } else {
                db.prepare(`
                  INSERT INTO holdings (user_id, symbol, shares, avg_buy_price, updated_at)
                  VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                `).run(order.user_id, order.symbol, order.shares, execPrice);
              }

              // Log transaction
              db.prepare(`
                INSERT INTO transactions (user_id, symbol, type, order_type, shares, price, total_amount, status)
                VALUES (?, ?, 'BUY', 'LIMIT', ?, ?, ?, 'EXECUTED')
              `).run(order.user_id, order.symbol, order.shares, execPrice, actualTotal);

              // Mark limit order executed
              db.prepare(`
                UPDATE limit_orders
                SET status = 'EXECUTED', executed_at = CURRENT_TIMESTAMP
                WHERE id = ?
              `).run(order.id);
            });

            tx();
            console.log(`[LimitOrder Triggered] BUY ${order.shares} ${order.symbol} @ $${execPrice} (Target was $${order.target_price})`);

          } else if (order.type === 'SELL' && currentPrice >= order.target_price) {
            // SELL triggered!
            const execPrice = currentPrice;
            const proceeds = Math.round((order.shares * execPrice) * 100) / 100;

            const tx = db.transaction(() => {
              // Credit proceeds to cash
              db.prepare('UPDATE users SET cash_balance = cash_balance + ? WHERE id = ?')
                .run(proceeds, order.user_id);

              // Deduct shares and unreserve
              const holding = db.prepare('SELECT * FROM holdings WHERE user_id = ? AND symbol = ?').get(order.user_id, order.symbol);
              if (holding) {
                const remainingShares = holding.shares - order.shares;
                const remainingReserved = Math.max(0, holding.reserved_shares - order.shares);

                if (remainingShares <= 0.0001 && remainingReserved <= 0) {
                  db.prepare('DELETE FROM holdings WHERE id = ?').run(holding.id);
                } else {
                  db.prepare(`
                    UPDATE holdings
                    SET shares = ?, reserved_shares = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                  `).run(remainingShares, remainingReserved, holding.id);
                }
              }

              // Log transaction
              db.prepare(`
                INSERT INTO transactions (user_id, symbol, type, order_type, shares, price, total_amount, status)
                VALUES (?, ?, 'SELL', 'LIMIT', ?, ?, ?, 'EXECUTED')
              `).run(order.user_id, order.symbol, order.shares, execPrice, proceeds);

              // Mark limit order executed
              db.prepare(`
                UPDATE limit_orders
                SET status = 'EXECUTED', executed_at = CURRENT_TIMESTAMP
                WHERE id = ?
              `).run(order.id);
            });

            tx();
            console.log(`[LimitOrder Triggered] SELL ${order.shares} ${order.symbol} @ $${execPrice} (Target was $${order.target_price})`);
          }
        } catch (itemErr) {
          console.warn(`[LimitOrder Error] Order ${order.id}: ${itemErr.message}`);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }
}

module.exports = new OrderEngine();

