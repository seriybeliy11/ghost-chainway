import { NextRequest, NextResponse } from 'next/server';

interface Trade {
  id: string;
  marketSlug: string;
  marketQuestion: string;
  outcome: string;
  action: 'buy' | 'sell';
  price: number;
  quantity: number;
  profit: number;
  timestamp: string;
  category: string;
}

interface PLPoint {
  time: string;
  value: number;
}

interface Trader {
  rank: number;
  id: string;
  username: string;
  displayName: string;
  avatarEmoji: string;
  profit24h: number;
  profitPercent: number;
  winRate: number;
  trades24h: number;
  totalVolume: string;
  streak: number;
  badge: string;
  recentTrades: Trade[];
  plChart: PLPoint[];
}

function generateTrades(traderId: string, count: number): Trade[] {
  const markets = [
    { slug: 'fifa-2026-winner', question: 'Will France win the 2026 FIFA World Cup?', category: 'Sports' },
    { slug: 'btc-150k-2025', question: 'Will Bitcoin reach $150K by end of 2025?', category: 'Crypto' },
    { slug: 'fed-rate-cut-q3', question: 'Will the Fed cut interest rates in Q3 2025?', category: 'Economics' },
    { slug: 'ai-agi-2030', question: 'Will AI achieve AGI before 2030?', category: 'Tech' },
    { slug: 'trump-approval-50', question: 'Trump approval rating above 50% by August?', category: 'Politics' },
    { slug: 'eth-5k-2025', question: 'Will Ethereum reach $5,000 in 2025?', category: 'Crypto' },
    { slug: 'sp-500-6000', question: 'S&P 500 above 6,000 by September?', category: 'Economics' },
    { slug: 'openai-ipo', question: 'Will OpenAI IPO before 2027?', category: 'Tech' },
    { slug: 'ukraine-ceasefire', question: 'Ukraine ceasefire by end of 2025?', category: 'World' },
    { slug: 'nba-champs-2026', question: 'Who wins the 2026 NBA Championship?', category: 'Sports' },
  ];

  const trades: Trade[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const market = markets[Math.floor(Math.random() * markets.length)];
    const isBuy = Math.random() > 0.35;
    const price = 0.15 + Math.random() * 0.7;
    const quantity = 50 + Math.floor(Math.random() * 950);
    const isWinner = Math.random() > 0.3;
    const profit = isBuy
      ? (isWinner ? (1 - price) * quantity : -(price) * quantity)
      : (isWinner ? -(1 - price) * quantity : (price) * quantity);

    trades.push({
      id: `${traderId}-trade-${i}`,
      marketSlug: market.slug,
      marketQuestion: market.question,
      outcome: 'Yes',
      action: isBuy ? 'buy' : 'sell',
      price: Math.round(price * 100) / 100,
      quantity,
      profit: Math.round(profit * 100) / 100,
      timestamp: new Date(now - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      category: market.category,
    });
  }

  return trades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function generatePLChart(baseValue: number, volatility: number): PLPoint[] {
  const points: PLPoint[] = [];
  let value = baseValue - volatility * 10;
  const now = Date.now();
  for (let i = 24; i >= 0; i--) {
    value += (Math.random() - 0.3) * volatility;
    if (value < 0) value = Math.abs(value) * 0.5;
    points.push({
      time: new Date(now - i * 60 * 60 * 1000).toISOString(),
      value: Math.round(value * 100) / 100,
    });
  }
  // Ensure last point is the highest (they're "top traders")
  points[points.length - 1].value = baseValue;
  return points;
}

function getTraders(): Trader[] {
  const traders = [
    { rank: 1, id: 'whale-alpha', username: 'whale_alpha', displayName: 'Whale Alpha', avatarEmoji: '🐋', profit24h: 187420, profitPercent: 34.2, winRate: 89, trades24h: 47, totalVolume: '$2.4M', streak: 12, badge: '👑' },
    { rank: 2, id: 'crypto-oracle', username: 'crypto_oracle', displayName: 'Crypto Oracle', avatarEmoji: '🔮', profit24h: 142890, profitPercent: 28.7, winRate: 85, trades24h: 38, totalVolume: '$1.8M', streak: 9, badge: '🔥' },
    { rank: 3, id: 'prediction-king', username: 'prediction_king', displayName: 'Prediction King', avatarEmoji: '👑', profit24h: 98340, profitPercent: 22.1, winRate: 82, trades24h: 31, totalVolume: '$1.2M', streak: 7, badge: '✅' },
    { rank: 4, id: 'smart-money', username: 'smart_money_99', displayName: 'Smart Money', avatarEmoji: '💰', profit24h: 76500, profitPercent: 19.5, winRate: 78, trades24h: 25, totalVolume: '$980K', streak: 6, badge: '⏳' },
    { rank: 5, id: 'data-driven', username: 'data_driven', displayName: 'Data Driven', avatarEmoji: '📊', profit24h: 54200, profitPercent: 15.8, winRate: 75, trades24h: 22, totalVolume: '$720K', streak: 5, badge: '✅' },
  ];

  return traders.map(t => ({
    ...t,
    recentTrades: generateTrades(t.id, 15 + Math.floor(Math.random() * 20)),
    plChart: generatePLChart(t.profit24h, t.profit24h * 0.08),
  }));
}

// GET /api/leaderboard - all traders with summary
export async function GET(request: NextRequest) {
  const traders = getTraders();
  const traderId = request.nextUrl.searchParams.get('traderId');

  if (traderId) {
    const trader = traders.find(t => t.id === traderId);
    if (!trader) {
      return NextResponse.json({ error: 'Trader not found' }, { status: 404 });
    }
    return NextResponse.json({ trader });
  }

  return NextResponse.json({ traders, updatedAt: new Date().toISOString() });
}