import { useEffect, useRef } from "react";
import { useData } from "../context/DataContext";
import { formatHora12, hoyISO, timeToMinutes } from "../lib/time";

const MINUTOS_ANTES = 30;

/**
 * Mientras la app esta abierta, dispara notificaciones del navegador para
 * recordarle al barbero los turnos que estan por empezar (no reemplaza un
 * push real al cliente, pero evita que el negocio se olvide de un turno).
 */
export function useDesktopReminders() {
  const { settings, appointmentsForDate } = useData();
  const notificados = useRef(new Set());

  useEffect(() => {
    if (!settings.notificacionesEscritorio) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [settings.notificacionesEscritorio]);

  useEffect(() => {
    if (!settings.notificacionesEscritorio) return;
    if (typeof Notification === "undefined") return;

    const revisar = () => {
      if (Notification.permission !== "granted") return;
      const ahoraMin = new Date().getHours() * 60 + new Date().getMinutes();
      const turnosHoy = appointmentsForDate(hoyISO()).filter((t) => t.estado === "confirmado");

      turnosHoy.forEach((turno) => {
        const inicioMin = timeToMinutes(turno.horaInicio);
        const faltan = inicioMin - ahoraMin;
        if (faltan <= MINUTOS_ANTES && faltan >= 0 && !notificados.current.has(turno.id)) {
          notificados.current.add(turno.id);
          new Notification(`Turno en ${faltan} min: ${turno.cliente?.nombre ?? "Cliente"}`, {
            body: `${turno.servicio?.nombre ?? "Servicio"} a las ${formatHora12(turno.horaInicio)}`,
            tag: turno.id,
          });
        }
      });
    };

    revisar();
    const intervalo = setInterval(revisar, 60000);
    return () => clearInterval(intervalo);
  }, [settings.notificacionesEscritorio, appointmentsForDate]);
}
