import { formatHora12, minutesToTime, timeToMinutes } from "../../lib/time";

export default function OccupancyBar({ barbero, turnos, settings, onSlotClick, onTurnoClick }) {
  const inicioMin = timeToMinutes(settings.horaApertura);
  const finMin = timeToMinutes(settings.horaCierre);
  const totalMin = Math.max(finMin - inicioMin, 1);

  const handleBarClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const minutosClick = inicioMin + pct * totalMin;
    const redondeado = Math.round(minutosClick / settings.intervaloSlotMin) * settings.intervaloSlotMin;
    onSlotClick(minutesToTime(redondeado));
  };

  const ocupacionPct = Math.round(
    (turnos.filter((t) => t.estado !== "cancelado").reduce((acc, t) => acc + t.duracionMin, 0) / totalMin) * 100
  );

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: barbero.color }} />
          <p className="text-sm font-bold text-white">{barbero.nombre}</p>
        </div>
        <p className="text-xs text-white/40">{ocupacionPct}% ocupado</p>
      </div>
      <div
        className="relative h-10 rounded-lg bg-white/5 border border-white/10 cursor-pointer overflow-hidden"
        onClick={handleBarClick}
        title="Click en un espacio libre para crear un turno"
      >
        {turnos
          .filter((t) => t.estado !== "cancelado")
          .map((t) => {
            const left = ((timeToMinutes(t.horaInicio) - inicioMin) / totalMin) * 100;
            const width = (t.duracionMin / totalMin) * 100;
            const completado = t.estado === "completado";
            const noAsistio = t.estado === "no_asistio";
            return (
              <button
                type="button"
                key={t.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onTurnoClick(t);
                }}
                className={`absolute top-0.5 bottom-0.5 rounded-md text-[10px] font-bold px-1.5 text-left overflow-hidden whitespace-nowrap border transition-transform hover:scale-[1.02] hover:z-10 ${
                  noAsistio ? "opacity-50 line-through" : ""
                }`}
                style={{
                  left: `${left}%`,
                  width: `${Math.max(width, 3)}%`,
                  background: completado ? "rgba(255,255,255,0.12)" : `${barbero.color}33`,
                  borderColor: `${barbero.color}88`,
                  color: "white",
                }}
              >
                {formatHora12(t.horaInicio)} · {t.cliente?.nombre}
              </button>
            );
          })}
      </div>
    </div>
  );
}
