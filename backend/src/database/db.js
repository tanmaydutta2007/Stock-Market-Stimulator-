const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../simulator.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance concurrency
db.pragma('journal_mode = WAL');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      cash_balance REAL NOT NULL DEFAULT 10000.00,
      reserved_cash REAL NOT NULL DEFAULT 0.00,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS holdings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      shares REAL NOT NULL DEFAULT 0,
      reserved_shares REAL NOT NULL DEFAULT 0,
      avg_buy_price REAL NOT NULL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, symbol),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('BUY', 'SELL')),
      order_type TEXT NOT NULL CHECK(order_type IN ('MARKET', 'LIMIT')),
      shares REAL NOT NULL,
      price REAL NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'EXECUTED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS limit_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('BUY', 'SELL')),
      target_price REAL NOT NULL,
      shares REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'EXECUTED', 'CANCELLED')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      executed_at DATETIME,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, symbol),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Ensure default demo user exists
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get('demo_trader');
  if (!user) {
    db.prepare(`
      INSERT INTO users (username, cash_balance, reserved_cash)
      VALUES (?, 10000.00, 0.00)
    `).run('demo_trader');
    console.log('Seeded default user "demo_trader" with $10,000.00 cash balance.');

    // Seed default watchlist items
    const newUser = db.prepare('SELECT id FROM users WHERE username = ?').get('demo_trader');
    const defaultWatchlist = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'GOOGL'];
    const insertWatch = db.prepare('INSERT OR IGNORE INTO watchlist (user_id, symbol) VALUES (?, ?)');
    for (const sym of defaultWatchlist) {
      insertWatch.run(newUser.id, sym);
    }
  }
}

initDb();

module.exports = db;

