const POPULAR_PROFILES = {
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    description: 'Designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories, and sells a variety of related services.',
    sharesOutstanding: 15120000000,
    trailingEPS: 6.75,
    beta: 1.08,
    dividendYield: 0.52
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Technology',
    industry: 'Semiconductors',
    description: 'Pioneer of GPU-accelerated computing and undisputed leader in AI hardware, data center GPUs, gaming graphics, and autonomous vehicle platforms.',
    sharesOutstanding: 24500000000,
    trailingEPS: 2.92,
    beta: 1.68,
    dividendYield: 0.03
  },
  TSLA: {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    sector: 'Consumer Cyclical',
    industry: 'Auto Manufacturers',
    description: 'Designs, develops, manufactures, and sells electric vehicles, energy generation and storage systems, and full self-driving AI technology.',
    sharesOutstanding: 3210000000,
    trailingEPS: 2.15,
    beta: 2.34,
    dividendYield: 0.00
  },
  MSFT: {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Technology',
    industry: 'Software - Infrastructure',
    description: 'Global tech giant developing software, cloud services (Azure), enterprise hardware, gaming (Xbox), and AI integrations via OpenAI partnership.',
    sharesOutstanding: 7430000000,
    trailingEPS: 12.05,
    beta: 0.89,
    dividendYield: 0.75
  },
  AMZN: {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    sector: 'Consumer Cyclical',
    industry: 'Internet Retail',
    description: 'Global e-commerce marketplace, cloud computing leader (Amazon Web Services AWS), digital streaming, and logistics infrastructure.',
    sharesOutstanding: 10550000000,
    trailingEPS: 4.88,
    beta: 1.15,
    dividendYield: 0.00
  },
  GOOGL: {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    sector: 'Communication Services',
    industry: 'Internet Content & Information',
    description: 'Parent company of Google, YouTube, Android, Chrome, Waymo, and Google Cloud, dominating search advertising and foundational AI models.',
    sharesOutstanding: 12380000000,
    trailingEPS: 7.54,
    beta: 1.05,
    dividendYield: 0.44
  },
  META: {
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    sector: 'Communication Services',
    industry: 'Internet Content & Information',
    description: 'Operates social networks Facebook, Instagram, WhatsApp, Messenger, and develops open-source Llama AI and Quest virtual reality systems.',
    sharesOutstanding: 2540000000,
    trailingEPS: 21.20,
    beta: 1.22,
    dividendYield: 0.35
  },
  SPY: {
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    sector: 'Exchange Traded Fund (ETF)',
    industry: 'Broad Market Index',
    description: 'Tracks the performance of the S&P 500 index, holding 500 of the largest publicly traded US corporations. The most traded ETF in the world.',
    sharesOutstanding: 950000000,
    trailingEPS: 24.50,
    beta: 1.00,
    dividendYield: 1.22
  },
  QQQ: {
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust',
    sector: 'Exchange Traded Fund (ETF)',
    industry: 'Tech-Heavy Nasdaq 100',
    description: 'Tracks the Nasdaq-100 Index, giving exposure to the largest non-financial innovative tech giants like Apple, Microsoft, Nvidia, and Amazon.',
    sharesOutstanding: 620000000,
    trailingEPS: 18.20,
    beta: 1.18,
    dividendYield: 0.60
  },
  NFLX: {
    symbol: 'NFLX',
    name: 'Netflix, Inc.',
    sector: 'Communication Services',
    industry: 'Entertainment',
    description: 'Leading global subscription video-on-demand streaming service offering TV series, documentaries, and feature films across diverse genres.',
    sharesOutstanding: 428000000,
    trailingEPS: 19.80,
    beta: 1.25,
    dividendYield: 0.00
  },
  AMD: {
    symbol: 'AMD',
    name: 'Advanced Micro Devices, Inc.',
    sector: 'Technology',
    industry: 'Semiconductors',
    description: 'Designs microprocessors, graphics processing units (Radeon), data center EPYC chips, and Instinct AI accelerators.',
    sharesOutstanding: 1620000000,
    trailingEPS: 2.10,
    beta: 1.70,
    dividendYield: 0.00
  }
};

function getProfile(symbol) {
  const sym = (symbol || '').toUpperCase().trim();
  if (POPULAR_PROFILES[sym]) {
    return POPULAR_PROFILES[sym];
  }
  return {
    symbol: sym,
    name: sym + ' Corporation',
    sector: 'General Equity',
    industry: 'Diversified',
    description: `Publicly traded security listed under ticker ${sym}.`,
    sharesOutstanding: 1000000000,
    trailingEPS: 3.50,
    beta: 1.0,
    dividendYield: 1.0
  };
}

module.exports = {
  POPULAR_PROFILES,
  getProfile
};

