import { CheckCircle2, MessageCircle, Pencil, XCircle } from "lucide-react";
import { useData } from "../../context/DataContext";
import { formatHora12 } from "../../lib/time";
import { construirLinkWhatsApp, mensajeConfirmacionTurno } from "../../lib/whatsapp";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

export default function AppointmentRow({ turno, onEdit }) {
  const { settings, setAppointmentStatus, marcarRecordatorioEnviado } = useData();
  const link = turno.cliente?.telefono
    ? construirLinkWhatsApp(
        turno.cliente.telefono,
        mensajeConfirmacionTurno({ cliente: turno.cliente, turno, servicio: turno.servicio, negocio: settings }),
        settings.codigoPais
      )
    : null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <div className="w-16 shrink-0 text-center">
        <p className="text-sm font-black text-white">{formatHora12(turno.horaInicio)}</p>
        <p className="text-[10px] text-white/40">{turno.duracionMin}min</p>
      </div>
      <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: turno.barbero?.color || "#f6820e" }} />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-white truncate">{turno.cliente?.nombre ?? "Cliente"}</p>
        <p className="text-xs text-white/50 truncate">
          {turno.servicio?.nombre ?? "Servicio"} {turno.barbero ? `· ${turno.barbero.nombre}` : ""}
        </p>
      </div>
      <Badge estado={turno.estado} />
      <div className="flex items-center gap-1 shrink-0">
        {turno.estado === "confirmado" && (
          <button
            className="p-2 rounded-lg hover:bg-emerald-500/15 text-emerald-400"
            title="Marcar como completado"
            onClick={() => setAppointmentStatus(turno.id, "completado")}
          >
            <CheckCircle2 size={17} />
          </button>
        )}
        {turno.estado === "confirmado" && (
          <button
            className="p-2 rounded-lg hover:bg-red-500/15 text-red-400"
            title="Cancelar turno"
            onClick={() => setAppointmentStatus(turno.id, "cancelado")}
          >
            <XCircle size={17} />
          </button>
        )}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg hover:bg-emerald-500/15 text-emerald-400"
            title="Enviar confirmacion por WhatsApp"
            onClick={() => marcarRecordatorioEnviado(turno.id)}
          >
            <MessageCircle size={17} />
          </a>
        )}
        <button className="p-2 rounded-lg hover:bg-white/10 text-white/60" title="Editar" onClick={() => onEdit(turno)}>
          <Pencil size={17} />
        </button>
      </div>
    </div>
  );
}
