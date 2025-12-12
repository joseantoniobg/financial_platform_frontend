import React from "react";

export function StTable({ colunmNames, items, subTotals }: { colunmNames: string[], items: any[], subTotals?: React.ReactNode }) {
    return ( 
              <div className="bg-[hsl(var(--card))] rounded-lg shadow-md border border-[hsl(var(--app-border))] overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[hsl(var(--card-accent))]">
                    <tr>
                        {colunmNames.map((name) => (
                            <th key={name} className={`px-6 py-3 text-left text-xs font-medium text-[hsl(var(--foreground))] uppercase tracking-wider ${name === 'Ações' ? 'text-right' : ''}`}>{name}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--card))]">
                    {items.map((item) => 
                      <tr key={item.id}>
                        {Object.keys(item).slice(0, colunmNames.length).map((key) => (<td key={key} className={`px-6 py-4 text-sm font-medium text-[hsl(var(--foreground))] ${key === 'actions' ? 'text-right' : ''}`}>{item[key]}</td>))}
                      </tr>
                    )}
                    {subTotals}
                  </tbody>
                </table>
              </div>);
}