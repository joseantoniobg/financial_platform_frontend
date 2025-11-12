export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div>
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">{title}</h1>
            {subtitle && <p className="text-[hsl(var(--foreground))] mt-1">{subtitle}</p>}
        </div>
    );
}