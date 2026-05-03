export function Spinner({ className = "", size = "md", variant = "default" }) {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-10 w-10 border-[3px]",
  };
  const tone =
    variant === "light"
      ? "border-white/35 border-t-white"
      : "border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400";
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full ${tone} ${sizes[size] || sizes.md} ${className}`}
    />
  );
}

export function PageLoader({ label = "Loading…" }) {
  return (
    <div className="flex min-h-[45vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <Spinner size="lg" />
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
    </div>
  );
}
