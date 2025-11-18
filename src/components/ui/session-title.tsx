export function SessionTitle({ title, subTitle }: { title: string, subTitle?: string }) {
    return (<div className="mt-2 mb-2 pb-2 border-b border-[hsl(var(--app-border))]">
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">{title}</h3>
                {subTitle && <p className="text-sm text-[hsl(var(--foreground-muted))]">{subTitle}</p>}
            </div>);
}