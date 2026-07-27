import { Cake, CalendarClock, Clock3, MessageCircle, PhoneOff, RotateCcw } from "lucide-react";
import { useData } from "../../context/DataContext";
import { formatHora12 } from "../../lib/time";
import { construirLinkWhatsApp, mensajeConfirmacionTurno, mensajeCumpleanios, mensajeRecordatorioRecall } from "../../lib/whatsapp";
import Button from "../ui/Button";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";

export default function RecordatoriosView() {
  const { settings, turnosDeManana, recallsVencidos, cumpleaniosProximos, marcarRecordatorioEnviado, posponerRecall } = useData();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-display tracking-wide text-white">Recordatorios</h1>
        <p className="text-white/50 text-sm">
          Confirma los turnos de manana y volve a agendar a los clientes que ya deberian pasar de nuevo.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/50 mb-3 flex items-center gap-2">
          <Clock3 size={15} /> Turnos de manana ({turnosDeManana.length})
        </h2>
        {turnosDeManana.length === 0 ? (
          <EmptyState icon={CalendarClock} title="No hay turnos para manana" description="Cuando se agenden turnos para manana, van a aparecer aca para que los confirmes por WhatsApp." />
        ) : (
          <div className="flex flex-col gap-2">
            {turnosDeManana.map((t) => {
              const link = t.cliente?.telefono
                ? construirLinkWhatsApp(
                    t.cliente.telefono,
                    mensajeConfirmacionTurno({ cliente: t.cliente, turno: t, servicio: t.servicio, negocio: settings }),
                    settings.codigoPais
                  )
                : null;
              return (
                <Card key={t.id} className="flex items-center gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white">{t.cliente?.nombre ?? "Cliente"}</p>
                    <p className="text-xs text-white/50">
                      {formatHora12(t.horaInicio)} · {t.servicio?.nombre}
                      {t.recordatorioEnviadoEl && <span className="text-emerald-400"> · Recordatorio enviado</span>}
                    </p>
                  </div>
                  {link ? (
                    <a href={link} target="_blank" rel="noreferrer" onClick={() => marcarRecordatorioEnviado(t.id)}>
                      <Button size="sm" variant="success" icon={MessageCircle}>
                        {t.recordatorioEnviadoEl ? "Reenviar" : "Enviar recordatorio"}
                      </Button>
                    </a>
                  ) : (
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <PhoneOff size={13} /> Sin telefono cargado
                    </span>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/50 mb-3 flex items-center gap-2">
          <RotateCcw size={15} /> Clientes para volver a agendar ({recallsVencidos.length})
        </h2>
        {recallsVencidos.length === 0 ? (
          <EmptyState
            icon={RotateCcw}
            title="Todo al dia"
            description="Ningun cliente supero el intervalo recomendado de su servicio sin volver a agendar."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {recallsVencidos.map(({ cliente, servicio, dias }) => {
              const link = cliente.telefono
                ? construirLinkWhatsApp(
                    cliente.telefono,
                    mensajeRecordatorioRecall({ cliente, servicio, dias, negocio: settings }),
                    settings.codigoPais
                  )
                : null;
              return (
                <Card key={`${cliente.id}_${servicio.id}`} className="flex items-center gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white">{cliente.nombre}</p>
                    <p className="text-xs text-white/50">
                      Ultimo <span className="text-white/70">{servicio.nombre}</span> hace{" "}
                      <span className="text-amber-400 font-semibold">{dias} dias</span> (recomendado cada{" "}
                      {servicio.intervaloRecomendadoDias})
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => posponerRecall(cliente.id, servicio.id, 7)}>
                    Posponer 7 dias
                  </Button>
                  {link ? (
                    <a href={link} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="success" icon={MessageCircle}>
                        Enviar recordatorio
                      </Button>
                    </a>
                  ) : (
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <PhoneOff size={13} /> Sin telefono
                    </span>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/50 mb-3 flex items-center gap-2">
          <Cake size={15} /> Cumpleanos esta semana ({cumpleaniosProximos.length})
        </h2>
        {cumpleaniosProximos.length === 0 ? (
          <EmptyState icon={Cake} title="Sin cumpleanos esta semana" description="Cargá la fecha de nacimiento de tus clientes para saludarlos y ofrecerles un beneficio." />
        ) : (
          <div className="flex flex-col gap-2">
            {cumpleaniosProximos.map(({ cliente, diasFaltan }) => {
              const link = cliente.telefono
                ? construirLinkWhatsApp(cliente.telefono, mensajeCumpleanios({ cliente, negocio: settings }), settings.codigoPais)
                : null;
              return (
                <Card key={cliente.id} className="flex items-center gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white">{cliente.nombre}</p>
                    <p className="text-xs text-white/50">{diasFaltan === 0 ? "Es hoy!" : `En ${diasFaltan} dia(s)`}</p>
                  </div>
                  {link && (
                    <a href={link} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="success" icon={MessageCircle}>
                        Saludar
                      </Button>
                    </a>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
