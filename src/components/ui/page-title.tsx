import React from "react";

export function PageTitle({ title, subtitle, fontSize }: { title: string | React.ReactNode; subtitle?: string, fontSize?: string }) {
    return (
        <div>
            <h1 className={`font-bold text-[hsl(var(--foreground))] ${fontSize || 'text-3xl'}`}>{title}</h1>
            {subtitle && <p className="text-[hsl(var(--foreground))] mt-1">{subtitle}</p>}
        </div>
    );
}