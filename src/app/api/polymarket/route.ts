import { NextResponse } from 'next/server';

interface GammaMarket {
  id: string;
  question: string;
  outcomes: string;
  outcomePrices: string;
  volume: string;
  volume24hr: string;
  endDate: string;
  category?: string;
  tags?: string;
  image: string;
  description: string;
  closed: boolean;
  active: boolean;
  groupItemTitle?: string;
}

interface TransformedMarket {
  id: string;
  question: string;
  outcomes: string[];
  outcomePrices: string[];
  volume: string;
  volume24hr: string;
  endDate: string;
  category: string;
  image: string;
  description: string;
}

function extractCategory(market: GammaMarket): string {
  if (market.category && market.category !== 'undefined') return market.category;
  if (market.tags) {
    try {
      const tags = JSON.parse(market.tags);
      if (Array.isArray(tags) && tags.length > 0) {
        return tags[0];
      }
    } catch {
      // tags might not be JSON
    }
    if (typeof market.tags === 'string' && market.tags.length > 0) {
      return market.tags.split(',')[0].trim();
    }
  }
  const q = market.question.toLowerCase();
  if (q.includes('bitcoin') || q.includes('eth') || q.includes('crypto') || q.includes('solana')) return 'Crypto';
  if (q.includes('trump') || q.includes('biden') || q.includes('election') || q.includes('president') || q.includes('congress')) return 'Politics';
  if (q.includes('fed ') || q.includes('interest rate') || q.includes('inflation') || q.includes('gdp')) return 'Economics';
  if (q.includes('nfl') || q.includes('nba') || q.includes('fifa') || q.includes('world cup') || q.includes('premier league')) return 'Sports';
  if (q.includes('ai ') || q.includes('gpt') || q.includes('openai') || q.includes('tech')) return 'Tech';
  return 'Trending';
}

async function fetchPolymarketEvents(): Promise<TransformedMarket[]> {
  try {
    const params = new URLSearchParams({
      limit: '50',
      order: 'volume24hr',
      ascending: 'false',
      closed: 'false',
      active: 'true',
    });

    const response = await fetch(
      `https://gamma-api.polymarket.com/markets?${params.toString()}`,
      {
        next: { revalidate: 300 },
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data: GammaMarket[] = await response.json();

    return data
      .filter((market) => {
        const prices = JSON.parse(market.outcomePrices || '[]');
        if (prices.length < 2) return false;
        if (parseFloat(market.volume24hr || '0') < 50000) return false;
        // Filter out resolved markets (one outcome > 98%)
        const maxPrice = Math.max(...prices.map(Number));
        if (maxPrice > 0.98) return false;
        // Filter out very short/duplicate questions
        if (market.question.length < 15) return false;
        return true;
      })
      .slice(0, 12)
      .map((market) => ({
        id: market.id,
        question: market.question,
        outcomes: JSON.parse(market.outcomes || '[]'),
        outcomePrices: JSON.parse(market.outcomePrices || '[]'),
        volume: market.volume,
        volume24hr: market.volume24hr,
        endDate: market.endDate,
        category: extractCategory(market),
        image: market.image,
        description: market.description,
      }));
  } catch (error) {
    console.error('Failed to fetch Polymarket events:', error);
    return getFallbackData();
  }
}

function getFallbackData(): TransformedMarket[] {
  return [
    {
      id: 'fallback-1',
      question: 'Will Bitcoin reach $150,000 by end of 2025?',
      outcomes: ['Yes', 'No'],
      outcomePrices: ['0.42', '0.58'],
      volume: '45000000',
      volume24hr: '1200000',
      endDate: '2025-12-31T23:59:59Z',
      category: 'Crypto',
      image: '',
      description: '',
    },
    {
      id: 'fallback-2',
      question: 'Will the Fed cut interest rates in Q3 2025?',
      outcomes: ['Yes', 'No'],
      outcomePrices: ['0.65', '0.35'],
      volume: '32000000',
      volume24hr: '890000',
      endDate: '2025-09-30T23:59:59Z',
      category: 'Economics',
      image: '',
      description: '',
    },
    {
      id: 'fallback-3',
      question: 'Will AI achieve AGI before 2030?',
      outcomes: ['Yes', 'No'],
      outcomePrices: ['0.28', '0.72'],
      volume: '28000000',
      volume24hr: '750000',
      endDate: '2029-12-31T23:59:59Z',
      category: 'Tech',
      image: '',
      description: '',
    },
    {
      id: 'fallback-4',
      question: 'Will Tesla stock exceed $400 by July 2025?',
      outcomes: ['Yes', 'No'],
      outcomePrices: ['0.55', '0.45'],
      volume: '18000000',
      volume24hr: '620000',
      endDate: '2025-07-31T23:59:59Z',
      category: 'Crypto',
      image: '',
      description: '',
    },
    {
      id: 'fallback-5',
      question: 'Will there be a new COVID variant alert in 2025?',
      outcomes: ['Yes', 'No'],
      outcomePrices: ['0.38', '0.62'],
      volume: '15000000',
      volume24hr: '480000',
      endDate: '2025-12-31T23:59:59Z',
      category: 'Science',
      image: '',
      description: '',
    },
    {
      id: 'fallback-6',
      question: 'Will Ethereum ETF approval happen in 2025?',
      outcomes: ['Yes', 'No'],
      outcomePrices: ['0.72', '0.28'],
      volume: '22000000',
      volume24hr: '530000',
      endDate: '2025-12-31T23:59:59Z',
      category: 'Crypto',
      image: '',
      description: '',
    },
  ];
}

export async function GET() {
  const events = await fetchPolymarketEvents();
  return NextResponse.json({ events });
}