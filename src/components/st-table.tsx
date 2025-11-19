import React from "react";

export function StTable({ colunmNames, items, subTotals }: { colunmNames: string[], items: any[], subTotals?: React.ReactNode }) {
    return ( 
                <table className="w-full bg-[hsl(var(--card-accent))]/30 border border-[hsl(var(--border))] rounded-lg shadow-sm overflow-hidden">
                  <thead className="bg-[hsl(var(--background))]/40 border-b border-[hsl(var(--border))]">
                    <tr>
                        {colunmNames.map((name) => (
                            <th key={name} className={`px-6 py-3 text-left text-xs font-medium text-[hsl(var(--foreground))] uppercase tracking-wider ${name === 'Ações' ? 'text-right' : ''}`}>{name}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {items.map((item) => 
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        {Object.keys(item).map((key) => (<td key={key} className={`px-6 py-4 text-sm font-medium text-[hsl(var(--foreground))] ${key === 'actions' ? 'text-right' : ''}`}>{item[key]}</td>))}
                      </tr>
                    )}
                    {subTotals}
                  </tbody>
                </table>);
}