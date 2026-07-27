import {
  addDays,
  differenceInCalendarDays,
  format,
  isBefore,
  isToday,
  isTomorrow,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";

export const DIAS_SEMANA = [
  { valor: 0, corto: "Do", nombre: "Domingo" },
  { valor: 1, corto: "Lu", nombre: "Lunes" },
  { valor: 2, corto: "Ma", nombre: "Martes" },
  { valor: 3, corto: "Mi", nombre: "Miercoles" },
  { valor: 4, corto: "Ju", nombre: "Jueves" },
  { valor: 5, corto: "Vi", nombre: "Viernes" },
  { valor: 6, corto: "Sa", nombre: "Sabado" },
];

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function hoyISO() {
  return format(new Date(), "yyyy-MM-dd");
}

export function timeToMinutes(hhmm) {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins) {
  const total = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

export function addMinutesToTime(hhmm, minutos) {
  return minutesToTime(timeToMinutes(hhmm) + minutos);
}

export function rangosSeSuperponen(inicioA, finA, inicioB, finB) {
  return timeToMinutes(inicioA) < timeToMinutes(finB) && timeToMinutes(inicioB) < timeToMinutes(finA);
}

/** Genera todos los horarios posibles del dia segun apertura/cierre/intervalo */
export function generarSlotsDelDia({ horaApertura, horaCierre, intervaloSlotMin }) {
  const slots = [];
  let cursor = timeToMinutes(horaApertura);
  const fin = timeToMinutes(horaCierre);
  while (cursor < fin) {
    slots.push(minutesToTime(cursor));
    cursor += intervaloSlotMin;
  }
  return slots;
}

/**
 * Calcula los horarios disponibles para un dia/barbero/servicio dado,
 * excluyendo los que se superponen con turnos ya reservados (previene sobreturnos).
 */
export function obtenerSlotsDisponibles({
  fecha,
  barberoId,
  duracionMin,
  turnos,
  settings,
  excluirTurnoId = null,
}) {
  const slotsBase = generarSlotsDelDia(settings);
  const cierreMin = timeToMinutes(settings.horaCierre);
  const ocupados = turnos.filter(
    (t) =>
      t.fecha === fecha &&
      t.barberoId === barberoId &&
      t.estado !== "cancelado" &&
      t.id !== excluirTurnoId
  );

  const esHoy = fecha === hoyISO();
  const ahoraMin = esHoy ? new Date().getHours() * 60 + new Date().getMinutes() : -1;

  return slotsBase.filter((slot) => {
    const inicioMin = timeToMinutes(slot);
    const finMin = inicioMin + duracionMin;
    if (finMin > cierreMin) return false;
    if (esHoy && inicioMin < ahoraMin) return false;
    return !ocupados.some((t) =>
      rangosSeSuperponen(slot, addMinutesToTime(slot, duracionMin), t.horaInicio, addMinutesToTime(t.horaInicio, t.duracionMin))
    );
  });
}

export function haySuperposicion({ fecha, barberoId, horaInicio, duracionMin, turnos, excluirTurnoId = null }) {
  const finNueva = addMinutesToTime(horaInicio, duracionMin);
  return turnos.some(
    (t) =>
      t.fecha === fecha &&
      t.barberoId === barberoId &&
      t.estado !== "cancelado" &&
      t.id !== excluirTurnoId &&
      rangosSeSuperponen(horaInicio, finNueva, t.horaInicio, addMinutesToTime(t.horaInicio, t.duracionMin))
  );
}

export function formatFecha(fechaISO, patron = "EEEE d 'de' MMMM") {
  if (!fechaISO) return "";
  return format(parseISO(fechaISO), patron, { locale: es });
}

export function formatFechaCorta(fechaISO) {
  if (!fechaISO) return "";
  return format(parseISO(fechaISO), "dd/MM/yyyy");
}

export function etiquetaRelativaFecha(fechaISO) {
  const d = parseISO(fechaISO);
  if (isToday(d)) return "Hoy";
  if (isTomorrow(d)) return "Manana";
  const dias = differenceInCalendarDays(d, new Date());
  if (dias > 0 && dias < 7) return format(d, "EEEE", { locale: es });
  return formatFechaCorta(fechaISO);
}

export function esPasado(fechaISO) {
  return isBefore(parseISO(fechaISO), parseISO(hoyISO()));
}

export function sumarDias(fechaISO, dias) {
  return format(addDays(parseISO(fechaISO), dias), "yyyy-MM-dd");
}

export function diasDesde(fechaISO) {
  return differenceInCalendarDays(new Date(), parseISO(fechaISO));
}

export function formatHora12(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const periodo = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad2(m)} ${periodo}`;
}
