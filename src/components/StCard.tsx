export function StCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[hsl(var(--card))]/50 border border-[hsl(var(--app-border))]/20 shadow-md rounded-lg p-4">
      {children}
    </div>
  );
}