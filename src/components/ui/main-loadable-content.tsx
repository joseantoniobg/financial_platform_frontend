import { Loader2 } from "lucide-react";

export function MainLoadableContent({ isLoading, noItems, children }: { isLoading: boolean; noItems: string; children: React.ReactNode }) {
    return isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-[hsl(var(--nav-background))]" />
          </div>
        ) : noItems ? (
          <div className="text-center py-8 text-[hsl(var(--foreground))]">{noItems}</div>
        ) : (
            <>{children}</>
        );
}