const variantes = {
  primary: "bg-brass-500 hover:bg-brass-400 text-ink-950 shadow-glow",
  secondary: "bg-ink-700 hover:bg-ink-600 text-white border border-white/10",
  danger: "bg-red-600/90 hover:bg-red-500 text-white",
  ghost: "bg-transparent hover:bg-white/5 text-white/80 border border-white/10",
  success: "bg-emerald-600 hover:bg-emerald-500 text-white",
};

const tamanios = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon: Icon,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] ${variantes[variant]} ${tamanios[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} strokeWidth={2.25} />}
      {children}
    </button>
  );
}
