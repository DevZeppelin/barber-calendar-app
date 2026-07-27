export function Field({ label, children, error, hint }) {
  return (
    <div className="mb-4">
      {label && <label className="block mb-1.5 text-xs font-bold uppercase tracking-wide text-white/60">{label}</label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-white/40">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

const baseInput =
  "w-full rounded-lg bg-ink-900 border border-white/10 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-brass-500 focus:ring-1 focus:ring-brass-500 transition-colors";

export function Input(props) {
  return <input className={baseInput} {...props} />;
}

export function Select(props) {
  return <select className={`${baseInput} cursor-pointer`} {...props} />;
}

export function Textarea(props) {
  return <textarea className={`${baseInput} resize-none`} rows={3} {...props} />;
}
