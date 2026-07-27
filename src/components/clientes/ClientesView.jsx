import { Phone, Plus, Search, UserRound, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useData } from "../../context/DataContext";
import { formatFechaCorta } from "../../lib/time";
import Button from "../ui/Button";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import { Input } from "../ui/Field";
import ClienteModal from "./ClienteModal";

export default function ClientesView() {
  const { clients, clientAppointments } = useData();
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteActivo, setClienteActivo] = useState(null);

  const abrirNuevo = () => {
    setClienteActivo(null);
    setModalAbierto(true);
  };

  const abrirEditar = (cliente) => {
    setClienteActivo(cliente);
    setModalAbierto(true);
  };

  const clientesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const base = !q
      ? clients
      : clients.filter((c) => c.nombre.toLowerCase().includes(q) || (c.telefono || "").includes(q));
    return [...base].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [clients, busqueda]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-display tracking-wide text-white">Clientes</h1>
          <p className="text-white/50 text-sm">{clients.length} clientes registrados</p>
        </div>
        <Button icon={Plus} onClick={abrirNuevo}>
          Nuevo cliente
        </Button>
      </div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o telefono..."
          className="pl-9"
        />
      </div>

      {clientesFiltrados.length === 0 ? (
        <EmptyState
          icon={Users}
          title={clients.length === 0 ? "Todavia no cargaste clientes" : "Sin resultados"}
          description={
            clients.length === 0
              ? "Se crean automaticamente al agendar un turno, o podes agregarlos manualmente."
              : "Proba con otro nombre o numero de telefono."
          }
          action={
            clients.length === 0 && (
              <Button size="sm" icon={Plus} onClick={abrirNuevo}>
                Agregar cliente
              </Button>
            )
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {clientesFiltrados.map((c) => {
            const historial = clientAppointments(c.id);
            const ultima = historial[0];
            return (
              <Card
                key={c.id}
                className="cursor-pointer hover:border-brass-500/40 transition-colors"
                onClick={() => abrirEditar(c)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full bg-white/5 text-brass-400 shrink-0">
                    <UserRound size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{c.nombre}</p>
                    {c.telefono && (
                      <p className="text-xs text-white/50 flex items-center gap-1">
                        <Phone size={11} /> {c.telefono}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                  <span>{historial.length} turnos</span>
                  <span>{ultima ? `Ultima visita: ${formatFechaCorta(ultima.fecha)}` : "Sin visitas"}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ClienteModal open={modalAbierto} onClose={() => setModalAbierto(false)} cliente={clienteActivo} />
    </div>
  );
}
