import { AlertTriangle, BellRing, Building2, Clock, Download, Plus, Trash2, Upload, Users } from "lucide-react";
import { useRef, useState } from "react";
import { useData } from "../../context/DataContext";
import { DIAS_SEMANA } from "../../lib/time";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { Field, Input, Select } from "../ui/Field";

export default function AjustesView() {
  const { settings, updateSettings, staff, addStaff, updateStaff, deleteStaff, exportData, importData, resetAllData } = useData();
  const fileInputRef = useRef(null);
  const [mensajeImport, setMensajeImport] = useState("");

  const toggleDiaLaboral = (dia) => {
    const activo = settings.diasLaborales.includes(dia);
    const nuevos = activo ? settings.diasLaborales.filter((d) => d !== dia) : [...settings.diasLaborales, dia];
    updateSettings({ diasLaborales: nuevos });
  };

  const habilitarNotificaciones = async () => {
    if (typeof Notification === "undefined") return;
    const permiso = await Notification.requestPermission();
    updateSettings({ notificacionesEscritorio: permiso === "granted" });
  };

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `turnos-app-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importData(reader.result);
        setMensajeImport("Datos restaurados correctamente.");
      } catch {
        setMensajeImport("El archivo no es un backup valido.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div>
      <h1 className="text-3xl font-display tracking-wide text-white mb-6">Ajustes</h1>

      <Card className="mb-5">
        <h2 className="font-bold text-white flex items-center gap-2 mb-4">
          <Building2 size={17} className="text-brass-400" /> Datos del negocio
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Nombre del negocio">
            <Input value={settings.nombreNegocio} onChange={(e) => updateSettings({ nombreNegocio: e.target.value })} />
          </Field>
          <Field label="Moneda">
            <Input value={settings.moneda} onChange={(e) => updateSettings({ moneda: e.target.value })} />
          </Field>
          <Field label="Codigo de pais (WhatsApp)" hint="Se agrega solo si el telefono del cliente no lo incluye. Ej: 54">
            <Input value={settings.codigoPais} onChange={(e) => updateSettings({ codigoPais: e.target.value })} placeholder="54" />
          </Field>
        </div>
      </Card>

      <Card className="mb-5">
        <h2 className="font-bold text-white flex items-center gap-2 mb-4">
          <Clock size={17} className="text-brass-400" /> Horario laboral
        </h2>
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <Field label="Apertura">
            <Input type="time" value={settings.horaApertura} onChange={(e) => updateSettings({ horaApertura: e.target.value })} />
          </Field>
          <Field label="Cierre">
            <Input type="time" value={settings.horaCierre} onChange={(e) => updateSettings({ horaCierre: e.target.value })} />
          </Field>
          <Field label="Intervalo entre turnos">
            <Select
              value={settings.intervaloSlotMin}
              onChange={(e) => updateSettings({ intervaloSlotMin: Number(e.target.value) })}
            >
              {[5, 10, 15, 20, 30, 60].map((m) => (
                <option key={m} value={m}>
                  {m} minutos
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Dias laborales">
          <div className="flex gap-2 flex-wrap">
            {DIAS_SEMANA.map((d) => (
              <button
                key={d.valor}
                type="button"
                onClick={() => toggleDiaLaboral(d.valor)}
                className={`w-11 h-11 rounded-full text-xs font-bold transition-colors ${
                  settings.diasLaborales.includes(d.valor) ? "bg-brass-500 text-ink-950" : "bg-white/5 text-white/40 hover:bg-white/10"
                }`}
              >
                {d.corto}
              </button>
            ))}
          </div>
        </Field>
      </Card>

      <Card className="mb-5">
        <h2 className="font-bold text-white flex items-center gap-2 mb-4">
          <BellRing size={17} className="text-brass-400" /> Recordatorios y notificaciones
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <Field label="Avisar turnos de manana con" hint="Dias de anticipacion para mostrar el turno en Recordatorios">
            <Select
              value={settings.diasAnticipacionRecordatorio}
              onChange={(e) => updateSettings({ diasAnticipacionRecordatorio: Number(e.target.value) })}
            >
              {[1, 2, 3].map((d) => (
                <option key={d} value={d}>
                  {d} dia(s) antes
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/10">
          <div>
            <p className="text-sm font-semibold text-white">Notificaciones de escritorio</p>
            <p className="text-xs text-white/40">Avisa 30 minutos antes de cada turno mientras la app este abierta.</p>
          </div>
          {settings.notificacionesEscritorio ? (
            <Button size="sm" variant="secondary" onClick={() => updateSettings({ notificacionesEscritorio: false })}>
              Desactivar
            </Button>
          ) : (
            <Button size="sm" onClick={habilitarNotificaciones}>
              Activar
            </Button>
          )}
        </div>
      </Card>

      <Card className="mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Users size={17} className="text-brass-400" /> Equipo / Barberos
          </h2>
          <Button
            size="sm"
            variant="secondary"
            icon={Plus}
            onClick={() => addStaff({ nombre: `Barbero ${staff.length + 1}`, color: "#f6820e" })}
          >
            Agregar
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {staff.map((b) => (
            <div key={b.id} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: b.color }} />
              <Input value={b.nombre} onChange={(e) => updateStaff(b.id, { nombre: e.target.value })} />
              <button
                type="button"
                onClick={() => updateStaff(b.id, { activo: !b.activo })}
                className={`text-xs font-semibold px-2.5 py-2 rounded-lg shrink-0 ${
                  b.activo ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-white/40"
                }`}
              >
                {b.activo ? "Activo" : "Inactivo"}
              </button>
              {staff.length > 1 && (
                <button
                  type="button"
                  onClick={() => confirm(`Eliminar a ${b.nombre}?`) && deleteStaff(b.id)}
                  className="p-2 rounded-lg hover:bg-red-500/15 text-red-400 shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-bold text-white mb-1">Respaldo de datos</h2>
        <p className="text-xs text-white/40 mb-4">Todo se guarda en este dispositivo. Exporta un respaldo periodicamente para no perder informacion.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button size="sm" variant="secondary" icon={Download} onClick={handleExport}>
            Exportar backup
          </Button>
          <Button size="sm" variant="secondary" icon={Upload} onClick={() => fileInputRef.current?.click()}>
            Importar backup
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </div>
        {mensajeImport && <p className="text-xs text-emerald-400 mb-4">{mensajeImport}</p>}

        <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-red-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white">Borrar todos los datos</p>
              <p className="text-xs text-white/40">Elimina clientes, turnos, servicios y configuracion de este dispositivo.</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              if (confirm("Esta accion no se puede deshacer. Confirmas que queres borrar todos los datos?")) {
                resetAllData();
              }
            }}
          >
            Borrar todo
          </Button>
        </div>
      </Card>
    </div>
  );
}
