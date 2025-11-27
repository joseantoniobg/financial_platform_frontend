export function SessionTitle({ title, subTitle, leftContents }: { title: string, subTitle?: string, leftContents?: React.ReactNode }) {
    return (<div className="flex items-center justify-between mb-4 border-b border-[hsl(var(--app-border))]">
                <div className="mt-2 pb-2">
                    <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">{title}</h3>
                    {subTitle && <p className="text-sm text-[hsl(var(--foreground-muted))]">{subTitle}</p>}
                </div>
                {leftContents}
            </div>);
}