import { CalendarX2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useData } from "../../context/DataContext";
import { etiquetaRelativaFecha, formatFecha, hoyISO, sumarDias } from "../../lib/time";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import { Input } from "../ui/Field";
import AppointmentModal from "./AppointmentModal";
import AppointmentRow from "./AppointmentRow";
import OccupancyBar from "./OccupancyBar";

export default function AgendaView() {
  const { staff, settings, appointmentsForDate } = useData();
  const [fecha, setFecha] = useState(hoyISO());
  const [modalAbierto, setModalAbierto] = useState(false);
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [slotPrefill, setSlotPrefill] = useState({ hora: "", barberoId: "" });

  const turnosDelDia = appointmentsForDate(fecha);
  const staffActivo = staff.filter((s) => s.activo);

  const abrirNuevo = (hora = "", barberoId = "") => {
    setTurnoActivo(null);
    setSlotPrefill({ hora, barberoId });
    setModalAbierto(true);
  };

  const abrirEditar = (turno) => {
    setTurnoActivo(turno);
    setModalAbierto(true);
  };

  const diasLaboralesTexto = useMemo(() => {
    const diaSemana = new Date(`${fecha}T12:00:00`).getDay();
    return settings.diasLaborales.includes(diaSemana);
  }, [fecha, settings.diasLaborales]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-display tracking-wide text-white">Agenda</h1>
          <p className="text-white/50 text-sm capitalize">{formatFecha(fecha)}</p>
        </div>
        <Button icon={Plus} onClick={() => abrirNuevo()}>
          Nuevo turno
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={() => setFecha((f) => sumarDias(f, -1))} />
        <Button variant="secondary" size="sm" onClick={() => setFecha(hoyISO())}>
          Hoy
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setFecha(sumarDias(hoyISO(), 1))}>
          Manana
        </Button>
        <Button variant="ghost" size="sm" icon={ChevronRight} onClick={() => setFecha((f) => sumarDias(f, 1))} />
        <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="ml-auto !w-auto" />
      </div>

      {!diasLaboralesTexto && (
        <div className="mb-4 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          Este dia esta marcado como no laboral en Ajustes, pero igual podes cargar turnos manualmente.
        </div>
      )}

      <div className="mb-6">
        {staffActivo.map((b) => (
          <OccupancyBar
            key={b.id}
            barbero={b}
            settings={settings}
            turnos={turnosDelDia.filter((t) => t.barberoId === b.id)}
            onSlotClick={(hora) => abrirNuevo(hora, b.id)}
            onTurnoClick={abrirEditar}
          />
        ))}
      </div>

      <h2 className="text-sm font-bold uppercase tracking-wide text-white/50 mb-3">
        {etiquetaRelativaFecha(fecha)} · {turnosDelDia.length} {turnosDelDia.length === 1 ? "turno" : "turnos"}
      </h2>

      {turnosDelDia.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title="No hay turnos este dia"
          description="Toca un espacio libre en la barra de arriba o el boton 'Nuevo turno' para agendar."
          action={
            <Button size="sm" icon={Plus} onClick={() => abrirNuevo()}>
              Agendar turno
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {turnosDelDia.map((t) => (
            <AppointmentRow key={t.id} turno={t} onEdit={abrirEditar} />
          ))}
        </div>
      )}

      <AppointmentModal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        turno={turnoActivo}
        fechaInicial={fecha}
        horaInicial={slotPrefill.hora}
        barberoInicial={slotPrefill.barberoId}
      />
    </div>
  );
}
