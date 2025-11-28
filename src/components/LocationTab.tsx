import { Plus } from "lucide-react";
import { Button } from "./ui/button";

export function LocationTab({ handleCreate, labelCreate, loading, columns, items, noItemsLabel }: { handleCreate: () => void; labelCreate: string; loading: boolean; columns: string[]; items: any[]; noItemsLabel: string }) {
    return (<div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">Países</h2>
                <Button
                  onClick={handleCreate}
                >
                  <Plus className="h-4 w-4" />
                  {labelCreate}
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">Carregando...</div>
              ) : items.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">{noItemsLabel}</div>
              ) : (
                <div className="bg-[hsl(var(--card))] rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[hsl(var(--card-accent))]">
                       <tr>
                        {columns.map((column) => (<th key={column} className={`px-6 py-3 text-left text-xs font-medium text-[hsl(var(--foreground))] ${column === 'Ações' ? 'text-right' : ''}`}>{column}</th>))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {items.map((item, index) => (
                        <tr key={`${item[0]}${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          {Object.keys(item).map((key) => (
                            <td key={key} className="px-6 py-4 text-sm text-[hsl(var(--foreground))]">{item[key]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>);
}