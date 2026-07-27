import { Pencil, Plus, Scissors } from "lucide-react";
import { useState } from "react";
import { useData } from "../../context/DataContext";
import Card from "../ui/Card";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import ServicioModal from "./ServicioModal";

export default function ServiciosView() {
  const { services, settings } = useData();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioActivo, setServicioActivo] = useState(null);

  const abrirNuevo = () => {
    setServicioActivo(null);
    setModalAbierto(true);
  };
  const abrirEditar = (s) => {
    setServicioActivo(s);
    setModalAbierto(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-display tracking-wide text-white">Servicios</h1>
          <p className="text-white/50 text-sm">Duracion, precio y frecuencia recomendada de recompra.</p>
        </div>
        <Button icon={Plus} onClick={abrirNuevo}>
          Nuevo servicio
        </Button>
      </div>

      {services.length === 0 ? (
        <EmptyState icon={Scissors} title="No hay servicios cargados" description="Agrega tu primer servicio para empezar a agendar turnos." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((s) => (
            <Card key={s.id} className="cursor-pointer hover:border-brass-500/40 transition-colors" onClick={() => abrirEditar(s)}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                  <p className="font-bold text-white">{s.nombre}</p>
                </div>
                <Pencil size={14} className="text-white/30" />
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm text-white/60">
                <span>{s.duracionMin} min</span>
                <span>·</span>
                <span>
                  {settings.moneda}
                  {s.precio}
                </span>
              </div>
              {s.intervaloRecomendadoDias && (
                <p className="mt-2 text-xs text-white/40">Recordar cada {s.intervaloRecomendadoDias} dias</p>
              )}
            </Card>
          ))}
        </div>
      )}

      <ServicioModal open={modalAbierto} onClose={() => setModalAbierto(false)} servicio={servicioActivo} />
    </div>
  );
}
