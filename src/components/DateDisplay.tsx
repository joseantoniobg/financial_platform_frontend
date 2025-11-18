export function DateDisplay({label, date}: {label: string, date?: string}) {
    return (date && <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[hsl(var(--foreground))]/50">
        {label}
        </span>
        <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
        {new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}
        </span>
    </div>);
}