'use client';

import { Stock } from '@/types/stock';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface StockCarouselProps {
  stocks: Stock[];
}

export function StockCarousel({ stocks }: StockCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (stocks.length === 0) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % stocks.length);
        setIsAnimating(false);
      }, 300);
    }, 5000); // Change stock every 5 seconds

    return () => clearInterval(interval);
  }, [stocks.length]);

  if (stocks.length === 0) {
    return null;
  }

  const currentStock = stocks[currentIndex];
  const isPositive = currentStock.change >= 0;

  return (
    <div className="w-full bg-[hsl(var(--card))] border border-[hsl(var(--app-border))] rounded-xl p-4 backdrop-blur-sm shadow-2xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white text-sm font-semibold flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4 text-[#B4F481]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
          </svg>
          Mercado em Tempo Real
        </h3>
        <div className="flex gap-1">
          {stocks.slice(0, 5).map((_, idx) => (
            <div
              key={idx}
              className={`h-1 w-8 rounded-full transition-colors ${
                idx === currentIndex % 5 ? 'bg-[#B4F481]' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      <div
        className={`transition-opacity duration-300 ${
          isAnimating ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentStock.logo && (
              <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center relative">
                <Image
                  src={currentStock.logo}
                  alt={currentStock.stock}
                  width={40}
                  height={40}
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
            <div>
              <h4 className="text-white font-bold text-lg">
                {currentStock.stock}
              </h4>
              <p className="text-[hsl(var(--foreground))] text-xs truncate max-w-[200px]">
                {currentStock.name}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-white font-bold text-xl">
              R$ {currentStock.close.toFixed(2)}
            </div>
            <div
              className={`flex items-center justify-end gap-1 text-sm font-semibold ${
                isPositive ? 'text-[#B4F481]' : 'text-red-400'
              }`}
            >
              {isPositive ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 15.75l7.5-7.5 7.5 7.5"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              )}
              {isPositive ? '+' : ''}
              {currentStock.change.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#1E4976] grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[hsl(var(--foreground))]">Setor:</span>
            <span className="text-white ml-1 font-medium">
              {currentStock.sector}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[hsl(var(--foreground))]">Volume:</span>
            <span className="text-white ml-1 font-medium">
              {(currentStock.volume / 1000000).toFixed(1)}M
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
