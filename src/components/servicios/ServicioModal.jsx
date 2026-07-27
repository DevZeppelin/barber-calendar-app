import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useData } from "../../context/DataContext";
import Button from "../ui/Button";
import { Field, Input } from "../ui/Field";
import Modal from "../ui/Modal";

const COLORES = ["#f6820e", "#22c55e", "#38bdf8", "#a855f7", "#ef4444", "#eab308", "#ec4899", "#14b8a6"];

export default function ServicioModal({ open, onClose, servicio = null }) {
  const { addService, updateService, deleteService } = useData();
  const [nombre, setNombre] = useState("");
  const [duracionMin, setDuracionMin] = useState(30);
  const [precio, setPrecio] = useState(0);
  const [intervaloRecomendadoDias, setIntervaloRecomendadoDias] = useState(21);
  const [color, setColor] = useState(COLORES[0]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setNombre(servicio?.nombre ?? "");
    setDuracionMin(servicio?.duracionMin ?? 30);
    setPrecio(servicio?.precio ?? 0);
    setIntervaloRecomendadoDias(servicio?.intervaloRecomendadoDias ?? 21);
    setColor(servicio?.color ?? COLORES[0]);
    setError("");
  }, [open, servicio]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return setError("El nombre es obligatorio.");
    if (Number(duracionMin) <= 0) return setError("La duracion debe ser mayor a 0.");
    const datos = {
      nombre: nombre.trim(),
      duracionMin: Number(duracionMin),
      precio: Number(precio),
      intervaloRecomendadoDias: intervaloRecomendadoDias ? Number(intervaloRecomendadoDias) : null,
      color,
    };
    if (servicio) updateService(servicio.id, datos);
    else addService(datos);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={servicio ? "Editar servicio" : "Nuevo servicio"}>
      <form onSubmit={handleSubmit}>
        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
        <Field label="Nombre del servicio">
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Corte clasico" required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Duracion (minutos)">
            <Input type="number" min={5} step={5} value={duracionMin} onChange={(e) => setDuracionMin(e.target.value)} required />
          </Field>
          <Field label="Precio">
            <Input type="number" min={0} value={precio} onChange={(e) => setPrecio(e.target.value)} />
          </Field>
        </div>
        <Field
          label="Recordar recompra cada (dias)"
          hint="Si un cliente no vuelve a agendar este servicio pasado este plazo, aparecera en Recordatorios."
        >
          <Input
            type="number"
            min={0}
            value={intervaloRecomendadoDias ?? ""}
            onChange={(e) => setIntervaloRecomendadoDias(e.target.value)}
            placeholder="Ej: 21"
          />
        </Field>
        <Field label="Color identificador">
          <div className="flex gap-2 flex-wrap">
            {COLORES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full border-2 transition-transform"
                style={{ background: c, borderColor: color === c ? "white" : "transparent", transform: color === c ? "scale(1.15)" : "none" }}
                aria-label={`Elegir color ${c}`}
              />
            ))}
          </div>
        </Field>

        <div className="flex items-center justify-between gap-2 mt-2">
          <div>
            {servicio && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => {
                  if (confirm(`Eliminar el servicio "${servicio.nombre}"?`)) {
                    deleteService(servicio.id);
                    onClose();
                  }
                }}
              >
                Eliminar
              </Button>
            )}
          </div>
          <Button type="submit" size="sm">
            {servicio ? "Guardar cambios" : "Crear servicio"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
