import { AlertTriangle, MessageCircle, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useData } from "../../context/DataContext";
import { formatHora12, hoyISO } from "../../lib/time";
import { construirLinkWhatsApp, mensajeConfirmacionTurno } from "../../lib/whatsapp";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { Field, Input, Select, Textarea } from "../ui/Field";
import Modal from "../ui/Modal";

const ESTADOS = [
  { valor: "confirmado", label: "Confirmado" },
  { valor: "completado", label: "Completado" },
  { valor: "no_asistio", label: "No asistio" },
  { valor: "cancelado", label: "Cancelado" },
];

export default function AppointmentModal({ open, onClose, turno = null, fechaInicial, horaInicial, barberoInicial }) {
  const {
    clients,
    services,
    staff,
    settings,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getClientById,
    findOrCreateClientByName,
    slotsDisponibles,
  } = useData();

  const [nombreCliente, setNombreCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [barberoId, setBarberoId] = useState("");
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [notas, setNotas] = useState("");
  const [estado, setEstado] = useState("confirmado");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (turno) {
      const cliente = getClientById(turno.clienteId);
      setNombreCliente(cliente?.nombre ?? "");
      setTelefonoCliente(cliente?.telefono ?? "");
      setServicioId(turno.servicioId);
      setBarberoId(turno.barberoId);
      setFecha(turno.fecha);
      setHoraInicio(turno.horaInicio);
      setNotas(turno.notas ?? "");
      setEstado(turno.estado ?? "confirmado");
    } else {
      setNombreCliente("");
      setTelefonoCliente("");
      setServicioId(services[0]?.id ?? "");
      setBarberoId(barberoInicial ?? staff[0]?.id ?? "");
      setFecha(fechaInicial ?? hoyISO());
      setHoraInicio(horaInicial ?? "");
      setNotas("");
      setEstado("confirmado");
    }
    setError("");
  }, [open, turno]); // eslint-disable-line react-hooks/exhaustive-deps

  const servicio = services.find((s) => s.id === servicioId);

  const slots = useMemo(() => {
    if (!fecha || !barberoId || !servicio) return [];
    const disponibles = slotsDisponibles({
      fecha,
      barberoId,
      duracionMin: servicio.duracionMin,
      excluirTurnoId: turno?.id ?? null,
    });
    if (turno && turno.fecha === fecha && turno.barberoId === barberoId && !disponibles.includes(turno.horaInicio)) {
      return [turno.horaInicio, ...disponibles].sort();
    }
    return disponibles;
  }, [fecha, barberoId, servicio, slotsDisponibles, turno]);

  const clientesSugeridos = clients.map((c) => c.nombre);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!nombreCliente.trim()) return setError("Ingresa el nombre del cliente.");
    if (!servicioId) return setError("Elegi un servicio.");
    if (!horaInicio) return setError("Elegi un horario disponible.");

    try {
      const cliente = findOrCreateClientByName(nombreCliente, telefonoCliente);

      const datosBase = {
        clienteId: cliente.id,
        servicioId,
        barberoId,
        fecha,
        horaInicio,
        duracionMin: servicio.duracionMin,
        notas,
      };

      if (turno) {
        updateAppointment(turno.id, { ...datosBase, estado });
      } else {
        addAppointment(datosBase);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const linkConfirmacion =
    turno && telefonoCliente
      ? construirLinkWhatsApp(
          telefonoCliente,
          mensajeConfirmacionTurno({ cliente: { nombre: nombreCliente }, turno, servicio, negocio: settings }),
          settings.codigoPais
        )
      : null;

  return (
    <Modal open={open} onClose={onClose} title={turno ? "Editar turno" : "Nuevo turno"}>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-3 rounded-lg">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <Field label="Cliente">
          <Input
            list="clientes-sugeridos"
            value={nombreCliente}
            onChange={(e) => {
              setNombreCliente(e.target.value);
              const match = clients.find((c) => c.nombre.toLowerCase() === e.target.value.trim().toLowerCase());
              if (match) setTelefonoCliente(match.telefono || "");
            }}
            placeholder="Nombre y apellido"
            required
          />
          <datalist id="clientes-sugeridos">
            {clientesSugeridos.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </Field>

        <Field label="Telefono (para recordatorios por WhatsApp)">
          <Input value={telefonoCliente} onChange={(e) => setTelefonoCliente(e.target.value)} placeholder="Ej: 54 9 11 1234 5678" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Servicio">
            <Select value={servicioId} onChange={(e) => setServicioId(e.target.value)} required>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} · {s.duracionMin}min
                </option>
              ))}
            </Select>
          </Field>
          {staff.length > 1 ? (
            <Field label="Barbero">
              <Select value={barberoId} onChange={(e) => setBarberoId(e.target.value)}>
                {staff.filter((s) => s.activo).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </Select>
            </Field>
          ) : (
            <Field label="Precio">
              <div className="px-3 py-2.5 text-sm text-white/70">
                {settings.moneda}
                {servicio?.precio ?? 0}
              </div>
            </Field>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha">
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </Field>
          <Field label="Hora" error={slots.length === 0 ? "No hay horarios libres ese dia para este servicio" : null}>
            <Select value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required disabled={slots.length === 0}>
              <option value="">Elegi un horario</option>
              {slots.map((s) => (
                <option key={s} value={s}>
                  {formatHora12(s)}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {turno && (
          <Field label="Estado del turno">
            <div className="flex flex-wrap gap-2">
              {ESTADOS.map((e) => (
                <button
                  type="button"
                  key={e.valor}
                  onClick={() => setEstado(e.valor)}
                  className={estado === e.valor ? "" : "opacity-50 hover:opacity-100 transition-opacity"}
                >
                  <Badge estado={e.valor}>{e.label}</Badge>
                </button>
              ))}
            </div>
          </Field>
        )}

        <Field label="Notas (opcional)">
          <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Preferencias, alergias, detalles del corte..." />
        </Field>

        <div className="flex items-center justify-between gap-2 mt-6 flex-wrap">
          <div>
            {turno && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => {
                  if (confirm("Eliminar este turno definitivamente?")) {
                    deleteAppointment(turno.id);
                    onClose();
                  }
                }}
              >
                Eliminar
              </Button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {linkConfirmacion && (
              <a href={linkConfirmacion} target="_blank" rel="noreferrer">
                <Button type="button" variant="success" size="sm" icon={MessageCircle}>
                  Confirmar por WhatsApp
                </Button>
              </a>
            )}
            <Button type="submit" size="sm">
              {turno ? "Guardar cambios" : "Crear turno"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
