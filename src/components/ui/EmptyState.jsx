export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
      {Icon && (
        <div className="mb-3 p-3 rounded-full bg-white/5 text-brass-400">
          <Icon size={28} strokeWidth={1.75} />
        </div>
      )}
      <p className="font-bold text-white">{title}</p>
      {description && <p className="text-sm text-white/50 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
