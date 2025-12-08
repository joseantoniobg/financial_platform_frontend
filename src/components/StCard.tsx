export function StCard({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-[hsl(var(--card))]/50 border border-[hsl(var(--app-border))]/20 shadow-md rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
}