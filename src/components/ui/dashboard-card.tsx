import { formatCurrency } from "@/lib/utils";

export function DashBoardCard({ title, items, balance, textColor, children, total, chart }: { title: string; items: { label: string; value: number }[]; balance?: number; textColor?: string; children?: React.ReactNode; total?: number; chart?: React.ReactNode }) {
    return (<div className="bg-white dark:bg-[#0D2744] rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-top justify-between">
                <p className="text-lg font-medium text-slate-600 dark:text-white">{title}</p>
                {children}
              </div>
              {balance && balance !== 0 && <p className={`text-3xl font-bold mt-1 ${textColor} text-center`}>{formatCurrency(Math.abs(balance ?? 0))}</p>}
              {chart && <div className="mt-[-20px]">{chart}</div>}
              <div className="mt-4 space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm text-slate-500 dark:text-gray-400">{item.label}:</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-white">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
              {total && <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-lg text-slate-500 dark:text-gray-400">Total:</span>
                  <span className="text-lg font-medium text-slate-800 dark:text-white">{formatCurrency(total)}</span>
                </div>
              </div>}
            </div>);
}