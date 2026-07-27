import { createContext, useCallback, useContext, useMemo } from "react";
import {
  SERVICIOS_INICIALES,
  SETTINGS_INICIAL,
  STAFF_INICIAL,
  generarId,
  migrarDatosLegacy,
  useLocalStorage,
} from "../lib/storage";
import { diasDesde, haySuperposicion, hoyISO, obtenerSlotsDisponibles, sumarDias } from "../lib/time";

migrarDatosLegacy();

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [clients, setClients] = useLocalStorage("bc_clients", []);
  const [services, setServices] = useLocalStorage("bc_services", SERVICIOS_INICIALES);
  const [staff, setStaff] = useLocalStorage("bc_staff", STAFF_INICIAL);
  const [appointments, setAppointments] = useLocalStorage("bc_appointments", []);
  const [settings, setSettings] = useLocalStorage("bc_settings", SETTINGS_INICIAL);
  const [recallSnoozes, setRecallSnoozes] = useLocalStorage("bc_recall_snoozes", {});

  // ---------- Clientes ----------
  const addClient = useCallback(
    (data) => {
      const nuevo = { id: generarId(), notas: "", email: "", fechaNacimiento: "", creadoEl: new Date().toISOString(), ...data };
      setClients((prev) => [...prev, nuevo]);
      return nuevo;
    },
    [setClients]
  );

  const updateClient = useCallback((id, data) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }, [setClients]);

  const deleteClient = useCallback((id) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setAppointments((prev) => prev.filter((a) => a.clienteId !== id));
  }, [setClients, setAppointments]);

  const findOrCreateClientByName = useCallback(
    (nombre, telefono) => {
      const nombreNorm = nombre.trim();
      const existente = clients.find((c) => c.nombre.toLowerCase() === nombreNorm.toLowerCase());
      if (existente) {
        if (telefono && telefono !== existente.telefono) {
          updateClient(existente.id, { telefono });
        }
        return existente;
      }
      return addClient({ nombre: nombreNorm, telefono: telefono || "" });
    },
    [clients, addClient, updateClient]
  );

  // ---------- Servicios ----------
  const addService = useCallback((data) => setServices((prev) => [...prev, { id: generarId(), ...data }]), [setServices]);
  const updateService = useCallback(
    (id, data) => setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s))),
    [setServices]
  );
  const deleteService = useCallback((id) => setServices((prev) => prev.filter((s) => s.id !== id)), [setServices]);

  // ---------- Staff ----------
  const addStaff = useCallback((data) => setStaff((prev) => [...prev, { id: generarId(), activo: true, ...data }]), [setStaff]);
  const updateStaff = useCallback(
    (id, data) => setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s))),
    [setStaff]
  );
  const deleteStaff = useCallback((id) => setStaff((prev) => prev.filter((s) => s.id !== id)), [setStaff]);

  // ---------- Turnos ----------
  const addAppointment = useCallback(
    (data) => {
      if (
        haySuperposicion({
          fecha: data.fecha,
          barberoId: data.barberoId,
          horaInicio: data.horaInicio,
          duracionMin: data.duracionMin,
          turnos: appointments,
        })
      ) {
        throw new Error("Ese horario ya fue reservado. Elegi otro para evitar un sobreturno.");
      }
      const nuevo = {
        id: generarId(),
        estado: "confirmado",
        notas: "",
        creadoEl: new Date().toISOString(),
        recordatorioEnviadoEl: null,
        ...data,
      };
      setAppointments((prev) => [...prev, nuevo]);
      return nuevo;
    },
    [appointments, setAppointments]
  );

  const updateAppointment = useCallback(
    (id, data) => {
      if (data.fecha || data.horaInicio || data.barberoId || data.duracionMin) {
        const actual = appointments.find((a) => a.id === id);
        const propuesto = { ...actual, ...data };
        if (
          haySuperposicion({
            fecha: propuesto.fecha,
            barberoId: propuesto.barberoId,
            horaInicio: propuesto.horaInicio,
            duracionMin: propuesto.duracionMin,
            turnos: appointments,
            excluirTurnoId: id,
          })
        ) {
          throw new Error("Ese horario ya fue reservado. Elegi otro para evitar un sobreturno.");
        }
      }
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
    },
    [appointments, setAppointments]
  );

  const deleteAppointment = useCallback((id) => setAppointments((prev) => prev.filter((a) => a.id !== id)), [setAppointments]);

  const setAppointmentStatus = useCallback(
    (id, estado) => setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, estado } : a))),
    [setAppointments]
  );

  const marcarRecordatorioEnviado = useCallback(
    (id) => setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, recordatorioEnviadoEl: new Date().toISOString() } : a))),
    [setAppointments]
  );

  const posponerRecall = useCallback(
    (clienteId, servicioId, dias = 7) => {
      const clave = `${clienteId}_${servicioId}`;
      setRecallSnoozes((prev) => ({ ...prev, [clave]: sumarDias(hoyISO(), dias) }));
    },
    [setRecallSnoozes]
  );

  // ---------- Ajustes ----------
  const updateSettings = useCallback((patch) => setSettings((prev) => ({ ...prev, ...patch })), [setSettings]);

  // ---------- Backup ----------
  const exportData = useCallback(() => {
    return JSON.stringify({ clients, services, staff, appointments, settings, recallSnoozes, exportadoEl: new Date().toISOString() }, null, 2);
  }, [clients, services, staff, appointments, settings, recallSnoozes]);

  const importData = useCallback(
    (json) => {
      const data = JSON.parse(json);
      if (data.clients) setClients(data.clients);
      if (data.services) setServices(data.services);
      if (data.staff) setStaff(data.staff);
      if (data.appointments) setAppointments(data.appointments);
      if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
      if (data.recallSnoozes) setRecallSnoozes(data.recallSnoozes);
    },
    [setClients, setServices, setStaff, setAppointments, setSettings, setRecallSnoozes]
  );

  const resetAllData = useCallback(() => {
    setClients([]);
    setServices(SERVICIOS_INICIALES);
    setStaff(STAFF_INICIAL);
    setAppointments([]);
    setSettings(SETTINGS_INICIAL);
    setRecallSnoozes({});
  }, [setClients, setServices, setStaff, setAppointments, setSettings, setRecallSnoozes]);

  // ---------- Selectores ----------
  const getClientById = useCallback((id) => clients.find((c) => c.id === id), [clients]);
  const getServiceById = useCallback((id) => services.find((s) => s.id === id), [services]);
  const getStaffById = useCallback((id) => staff.find((s) => s.id === id), [staff]);

  const appointmentsEnriquecidos = useMemo(
    () =>
      appointments.map((a) => ({
        ...a,
        cliente: getClientById(a.clienteId),
        servicio: getServiceById(a.servicioId),
        barbero: getStaffById(a.barberoId),
      })),
    [appointments, getClientById, getServiceById, getStaffById]
  );

  const appointmentsForDate = useCallback(
    (fecha) =>
      appointmentsEnriquecidos
        .filter((a) => a.fecha === fecha)
        .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)),
    [appointmentsEnriquecidos]
  );

  const clientAppointments = useCallback(
    (clienteId) =>
      appointmentsEnriquecidos
        .filter((a) => a.clienteId === clienteId)
        .sort((a, b) => (a.fecha + a.horaInicio < b.fecha + b.horaInicio ? 1 : -1)),
    [appointmentsEnriquecidos]
  );

  const slotsDisponibles = useCallback(
    ({ fecha, barberoId, duracionMin, excluirTurnoId }) =>
      obtenerSlotsDisponibles({ fecha, barberoId, duracionMin, turnos: appointments, settings, excluirTurnoId }),
    [appointments, settings]
  );

  const proximosTurnos = useMemo(() => {
    const ahora = hoyISO();
    return appointmentsEnriquecidos
      .filter((a) => a.fecha >= ahora && a.estado === "confirmado")
      .sort((a, b) => (a.fecha + a.horaInicio > b.fecha + b.horaInicio ? 1 : -1));
  }, [appointmentsEnriquecidos]);

  const turnosDeManana = useMemo(() => {
    const manana = sumarDias(hoyISO(), settings.diasAnticipacionRecordatorio || 1);
    return appointmentsEnriquecidos
      .filter((a) => a.fecha === manana && a.estado === "confirmado")
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }, [appointmentsEnriquecidos, settings.diasAnticipacionRecordatorio]);

  const recallsVencidos = useMemo(() => {
    const hoy = hoyISO();
    const resultado = [];
    clients.forEach((cliente) => {
      const historial = appointmentsEnriquecidos
        .filter((a) => a.clienteId === cliente.id && a.estado === "completado")
        .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

      const tieneFuturo = appointmentsEnriquecidos.some(
        (a) => a.clienteId === cliente.id && a.fecha >= hoy && a.estado === "confirmado"
      );
      if (tieneFuturo) return;

      const porServicio = new Map();
      historial.forEach((turno) => {
        if (!porServicio.has(turno.servicioId)) porServicio.set(turno.servicioId, turno);
      });

      porServicio.forEach((ultimoTurno, servicioId) => {
        const servicio = getServiceById(servicioId);
        if (!servicio?.intervaloRecomendadoDias) return;
        const dias = diasDesde(ultimoTurno.fecha);
        if (dias < servicio.intervaloRecomendadoDias) return;

        const clave = `${cliente.id}_${servicioId}`;
        const snoozeHasta = recallSnoozes[clave];
        if (snoozeHasta && snoozeHasta > hoy) return;

        resultado.push({ cliente, servicio, ultimaFecha: ultimoTurno.fecha, dias });
      });
    });
    return resultado.sort((a, b) => b.dias - a.dias);
  }, [clients, appointmentsEnriquecidos, getServiceById, recallSnoozes]);

  const cumpleaniosProximos = useMemo(() => {
    const hoy = new Date();
    return clients
      .filter((c) => c.fechaNacimiento)
      .map((c) => {
        const [, mes, dia] = c.fechaNacimiento.split("-").map(Number);
        let cumple = new Date(hoy.getFullYear(), mes - 1, dia);
        if (cumple < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())) {
          cumple = new Date(hoy.getFullYear() + 1, mes - 1, dia);
        }
        const diasFaltan = Math.round((cumple - new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())) / 86400000);
        return { cliente: c, diasFaltan };
      })
      .filter((c) => c.diasFaltan <= 7)
      .sort((a, b) => a.diasFaltan - b.diasFaltan);
  }, [clients]);

  const estadisticasHoy = useMemo(() => {
    const hoy = hoyISO();
    const deHoy = appointmentsEnriquecidos.filter((a) => a.fecha === hoy);
    const completados = deHoy.filter((a) => a.estado === "completado");
    const confirmados = deHoy.filter((a) => a.estado === "confirmado");
    const ingresosEstimados = deHoy
      .filter((a) => a.estado === "confirmado" || a.estado === "completado")
      .reduce((acc, a) => acc + (a.servicio?.precio || 0), 0);
    return {
      total: deHoy.length,
      completados: completados.length,
      confirmados: confirmados.length,
      ingresosEstimados,
      proximo: confirmados.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))[0],
    };
  }, [appointmentsEnriquecidos]);

  const value = {
    clients,
    services,
    staff,
    appointments,
    settings,
    addClient,
    updateClient,
    deleteClient,
    findOrCreateClientByName,
    addService,
    updateService,
    deleteService,
    addStaff,
    updateStaff,
    deleteStaff,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    setAppointmentStatus,
    marcarRecordatorioEnviado,
    posponerRecall,
    updateSettings,
    exportData,
    importData,
    resetAllData,
    getClientById,
    getServiceById,
    getStaffById,
    appointmentsForDate,
    clientAppointments,
    slotsDisponibles,
    proximosTurnos,
    turnosDeManana,
    recallsVencidos,
    cumpleaniosProximos,
    estadisticasHoy,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData debe usarse dentro de <DataProvider>");
  return ctx;
}
