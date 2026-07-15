export interface TraderData {
  rank: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
  volume24h: number;
  trades24h: number;
  winRate: number;
  pnl: number; // positive = profit, negative = loss
  badge?: 'whale' | 'shark' | 'dolphin';
}

export const MOCK_TRADERS: TraderData[] = [
  { rank: 1, username: 'whale_alert', displayName: 'Whale Alert', volume24h: 4250000, trades24h: 142, winRate: 73, pnl: 89200, badge: 'whale' },
  { rank: 2, username: 'alpha_trader', displayName: 'Alpha Trader', volume24h: 3100000, trades24h: 98, winRate: 68, pnl: 52100, badge: 'shark' },
  { rank: 3, username: 'crypto_sage', displayName: 'Crypto Sage', volume24h: 2800000, trades24h: 87, winRate: 71, pnl: 44800, badge: 'shark' },
  { rank: 4, username: 'market_maven', displayName: 'Market Maven', volume24h: 1950000, trades24h: 65, winRate: 64, pnl: 28700, badge: 'dolphin' },
  { rank: 5, username: 'prediction_pro', displayName: 'Prediction Pro', volume24h: 1600000, trades24h: 53, winRate: 61, pnl: 19300, badge: 'dolphin' },
];