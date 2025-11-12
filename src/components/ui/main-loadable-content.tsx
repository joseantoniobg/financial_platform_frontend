import { Loader2 } from "lucide-react";

export function MainLoadableContent({ isLoading, length, children }: { isLoading: boolean; length: number; children: React.ReactNode }) {
    return isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--card-accent))]" />
          </div>
        ) : length === 0 ? (
          <div className="text-center py-8 text-[hsl(var(--foreground))]">Nenhuma categoria cadastrada</div>
        ) : (
            <>{children}</>
        );
}