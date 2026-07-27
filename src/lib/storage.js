import { useEffect, useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // almacenamiento no disponible (modo privado, cuota excedida, etc.)
    }
  }, [key, value]);

  return [value, setValue];
}

export const generarId = () =>
  (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

export const SERVICIOS_INICIALES = [
  { id: generarId(), nombre: "Corte de pelo", duracionMin: 30, precio: 8000, intervaloRecomendadoDias: 21, color: "#f6820e" },
  { id: generarId(), nombre: "Barba", duracionMin: 20, precio: 5000, intervaloRecomendadoDias: 14, color: "#22c55e" },
  { id: generarId(), nombre: "Corte + Barba", duracionMin: 45, precio: 12000, intervaloRecomendadoDias: 21, color: "#38bdf8" },
  { id: generarId(), nombre: "Coloracion", duracionMin: 60, precio: 15000, intervaloRecomendadoDias: 30, color: "#a855f7" },
];

export const STAFF_INICIAL = [{ id: generarId(), nombre: "Barbero principal", activo: true, color: "#f6820e" }];

export const SETTINGS_INICIAL = {
  nombreNegocio: "Mi Barberia",
  moneda: "$",
  horaApertura: "09:00",
  horaCierre: "20:00",
  intervaloSlotMin: 15,
  diasLaborales: [1, 2, 3, 4, 5, 6],
  codigoPais: "",
  diasAnticipacionRecordatorio: 1,
  notificacionesEscritorio: false,
};

/**
 * Migra datos de la version anterior de la app (un simple listado de "clientes"
 * que en realidad mezclaba cliente + turno) hacia el nuevo modelo de datos.
 */
export function migrarDatosLegacy() {
  try {
    const legacy = JSON.parse(window.localStorage.getItem("clientes") || "null");
    const yaMigrado = window.localStorage.getItem("bc_migrado_v2");
    if (!Array.isArray(legacy) || legacy.length === 0 || yaMigrado) return;

    const servicioDefault = SERVICIOS_INICIALES[0];
    const barberoDefault = STAFF_INICIAL[0];
    const clientesNuevos = [];
    const turnosNuevos = [];

    legacy.forEach((item) => {
      const clienteId = generarId();
      clientesNuevos.push({
        id: clienteId,
        nombre: item.nombre || "Cliente sin nombre",
        telefono: item.telefono || "",
        email: "",
        notas: "",
        fechaNacimiento: "",
        creadoEl: new Date().toISOString(),
      });
      if (item.fecha && item.hora) {
        turnosNuevos.push({
          id: generarId(),
          clienteId,
          servicioId: servicioDefault.id,
          barberoId: barberoDefault.id,
          fecha: item.fecha,
          horaInicio: item.hora,
          duracionMin: servicioDefault.duracionMin,
          estado: "confirmado",
          notas: item.descripcion || "",
          creadoEl: new Date().toISOString(),
          recordatorioEnviadoEl: null,
        });
      }
    });

    window.localStorage.setItem("bc_clients", JSON.stringify(clientesNuevos));
    window.localStorage.setItem("bc_appointments", JSON.stringify(turnosNuevos));
    window.localStorage.setItem("bc_services", JSON.stringify(SERVICIOS_INICIALES));
    window.localStorage.setItem("bc_staff", JSON.stringify(STAFF_INICIAL));
    window.localStorage.setItem("bc_migrado_v2", "true");
  } catch {
    // si algo falla en la migracion, simplemente arrancamos con datos limpios
  }
}
