import { CalendarCheck2, MessageCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useData } from "../../context/DataContext";
import { formatFechaCorta, formatHora12 } from "../../lib/time";
import { construirLinkWhatsApp, mensajeCumpleanios } from "../../lib/whatsapp";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { Field, Input, Textarea } from "../ui/Field";
import Modal from "../ui/Modal";

export default function ClienteModal({ open, onClose, cliente = null }) {
  const { addClient, updateClient, deleteClient, clientAppointments, settings } = useData();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setNombre(cliente?.nombre ?? "");
    setTelefono(cliente?.telefono ?? "");
    setEmail(cliente?.email ?? "");
    setFechaNacimiento(cliente?.fechaNacimiento ?? "");
    setNotas(cliente?.notas ?? "");
    setError("");
  }, [open, cliente]);

  const historial = cliente ? clientAppointments(cliente.id) : [];
  const linkCumple = cliente?.telefono
    ? construirLinkWhatsApp(cliente.telefono, mensajeCumpleanios({ cliente, negocio: settings }), settings.codigoPais)
    : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return setError("El nombre es obligatorio.");
    const datos = { nombre: nombre.trim(), telefono, email, fechaNacimiento, notas };
    if (cliente) updateClient(cliente.id, datos);
    else addClient(datos);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={cliente ? "Editar cliente" : "Nuevo cliente"} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit}>
        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre">
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </Field>
          <Field label="Telefono">
            <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="54 9 11 1234 5678" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email (opcional)">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Cumpleanos (opcional)">
            <Input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
          </Field>
        </div>
        <Field label="Notas">
          <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Alergias, preferencias, tipo de corte habitual..." />
        </Field>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            {cliente && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => {
                  if (confirm(`Eliminar a ${cliente.nombre} y todo su historial de turnos?`)) {
                    deleteClient(cliente.id);
                    onClose();
                  }
                }}
              >
                Eliminar cliente
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {linkCumple && (
              <a href={linkCumple} target="_blank" rel="noreferrer">
                <Button type="button" variant="secondary" size="sm" icon={MessageCircle}>
                  Saludo de cumpleanos
                </Button>
              </a>
            )}
            <Button type="submit" size="sm">
              {cliente ? "Guardar cambios" : "Crear cliente"}
            </Button>
          </div>
        </div>
      </form>

      {cliente && (
        <div className="mt-6 pt-5 border-t border-white/10">
          <h4 className="text-xs font-bold uppercase tracking-wide text-white/50 mb-3 flex items-center gap-2">
            <CalendarCheck2 size={14} /> Historial de turnos ({historial.length})
          </h4>
          {historial.length === 0 ? (
            <p className="text-sm text-white/40">Todavia no tiene turnos registrados.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {historial.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 text-sm p-2.5 rounded-lg bg-white/[0.03]">
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{t.servicio?.nombre ?? "Servicio eliminado"}</p>
                    <p className="text-xs text-white/40">
                      {formatFechaCorta(t.fecha)} · {formatHora12(t.horaInicio)}
                    </p>
                  </div>
                  <Badge estado={t.estado} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
