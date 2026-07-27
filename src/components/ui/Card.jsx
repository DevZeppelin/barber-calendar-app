export default function Card({ children, className = "", ...props }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-ink-800/60 p-4 sm:p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, accent = "text-brass-400" }) {
  return (
    <Card className="flex items-center gap-4">
      {Icon && (
        <div className={`p-3 rounded-xl bg-white/5 ${accent}`}>
          <Icon size={22} />
        </div>
      )}
      <div>
        <p className="text-2xl font-black text-white leading-tight">{value}</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">{label}</p>
      </div>
    </Card>
  );
}
