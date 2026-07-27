import { BellRing, CalendarCheck2, CalendarClock, DollarSign, Plus, Scissors } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AppointmentModal from "../agenda/AppointmentModal";
import AppointmentRow from "../agenda/AppointmentRow";
import { useData } from "../../context/DataContext";
import { formatHora12, hoyISO } from "../../lib/time";
import Button from "../ui/Button";
import Card, { StatCard } from "../ui/Card";
import EmptyState from "../ui/EmptyState";

export default function DashboardView() {
  const { estadisticasHoy, appointmentsForDate, recallsVencidos, turnosDeManana, settings } = useData();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [turnoActivo, setTurnoActivo] = useState(null);
  const turnosHoy = appointmentsForDate(hoyISO());

  const abrirNuevo = () => {
    setTurnoActivo(null);
    setModalAbierto(true);
  };

  const abrirEditar = (turno) => {
    setTurnoActivo(turno);
    setModalAbierto(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-display tracking-wide text-white">Hola!</h1>
          <p className="text-white/50 text-sm">Este es el resumen de hoy en {settings.nombreNegocio}.</p>
        </div>
        <Button icon={Plus} onClick={abrirNuevo}>
          Nuevo turno
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Turnos hoy" value={estadisticasHoy.total} icon={CalendarCheck2} />
        <StatCard label="Completados" value={estadisticasHoy.completados} icon={Scissors} accent="text-emerald-400" />
        <StatCard
          label="Ingresos estimados"
          value={`${settings.moneda}${estadisticasHoy.ingresosEstimados}`}
          icon={DollarSign}
          accent="text-brass-400"
        />
        <StatCard
          label="Recordatorios pendientes"
          value={recallsVencidos.length + turnosDeManana.length}
          icon={BellRing}
          accent="text-amber-400"
        />
      </div>

      {estadisticasHoy.proximo && (
        <Card className="mb-6 flex items-center gap-3 border-brass-500/30">
          <div className="p-3 rounded-xl bg-brass-500/15 text-brass-400">
            <CalendarClock size={22} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-white/50 font-bold">Proximo turno</p>
            <p className="font-bold text-white">
              {estadisticasHoy.proximo.cliente?.nombre} · {formatHora12(estadisticasHoy.proximo.horaInicio)} ·{" "}
              {estadisticasHoy.proximo.servicio?.nombre}
            </p>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/50">Agenda de hoy</h2>
        <Link to="/agenda" className="text-xs font-semibold text-brass-400 hover:text-brass-300">
          Ver agenda completa →
        </Link>
      </div>

      {turnosHoy.length === 0 ? (
        <EmptyState
          icon={CalendarCheck2}
          title="Todavia no hay turnos para hoy"
          description="Agenda el primer turno del dia con un click."
          action={
            <Button size="sm" icon={Plus} onClick={abrirNuevo}>
              Agendar turno
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {turnosHoy.slice(0, 6).map((t) => (
            <AppointmentRow key={t.id} turno={t} onEdit={abrirEditar} />
          ))}
        </div>
      )}

      {(recallsVencidos.length > 0 || turnosDeManana.length > 0) && (
        <Card className="mt-8 border-amber-500/20 bg-amber-500/[0.03]">
          <div className="flex items-center gap-2 mb-1">
            <BellRing size={18} className="text-amber-400" />
            <p className="font-bold text-white">Tenes recordatorios pendientes</p>
          </div>
          <p className="text-sm text-white/60 mb-3">
            {turnosDeManana.length > 0 && `${turnosDeManana.length} turno(s) para confirmar manana. `}
            {recallsVencidos.length > 0 && `${recallsVencidos.length} cliente(s) listos para volver a agendar.`}
          </p>
          <Link to="/recordatorios">
            <Button size="sm" variant="secondary">
              Ir a Recordatorios
            </Button>
          </Link>
        </Card>
      )}

      <AppointmentModal open={modalAbierto} onClose={() => setModalAbierto(false)} turno={turnoActivo} fechaInicial={hoyISO()} />
    </div>
  );
}
