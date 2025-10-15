import { StockListResponse } from '@/types/stock';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function getStocks(): Promise<StockListResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/integrations/stocks`, {
      next: { revalidate: 1800 }, // Revalidate every 30 minutes (1800 seconds)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stocks');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching stocks:', error);
    // Return empty stocks array on error
    return { stocks: [] };
  }
}
