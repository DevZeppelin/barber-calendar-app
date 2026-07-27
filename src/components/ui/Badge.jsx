const estilos = {
  confirmado: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  completado: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  cancelado: "bg-red-500/15 text-red-300 border-red-500/30",
  no_asistio: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  neutral: "bg-white/10 text-white/70 border-white/15",
};

const etiquetas = {
  confirmado: "Confirmado",
  completado: "Completado",
  cancelado: "Cancelado",
  no_asistio: "No asistio",
};

export default function Badge({ estado, children, className = "" }) {
  const estilo = estado ? estilos[estado] ?? estilos.neutral : estilos.neutral;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${estilo} ${className}`}>
      {children ?? etiquetas[estado] ?? estado}
    </span>
  );
}
