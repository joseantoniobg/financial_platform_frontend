export function ErrorText({ children }: { children: React.ReactNode }) {
  return children && <p className="text-red-600 font-bold text-xs mt-1">{children}</p>;
}