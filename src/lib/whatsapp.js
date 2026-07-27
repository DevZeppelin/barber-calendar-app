import { formatFecha, formatHora12 } from "./time";

/** Deja solo digitos; el usuario debe cargar el telefono con codigo de pais (ej: 54 9 11 xxxx) */
export function normalizarTelefono(telefono, codigoPaisDefault = "") {
  const digitos = String(telefono || "").replace(/\D/g, "");
  if (!digitos) return "";
  if (codigoPaisDefault && digitos.length <= 10) {
    return `${codigoPaisDefault}${digitos}`;
  }
  return digitos;
}

export function construirLinkWhatsApp(telefono, mensaje, codigoPaisDefault = "") {
  const numero = normalizarTelefono(telefono, codigoPaisDefault);
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export function mensajeConfirmacionTurno({ cliente, turno, servicio, negocio }) {
  return `Hola ${cliente.nombre}! Te escribimos de ${negocio.nombreNegocio} para confirmar tu turno de ${servicio?.nombre ?? "servicio"} el ${formatFecha(
    turno.fecha,
    "EEEE d/MM"
  )} a las ${formatHora12(turno.horaInicio)}. Te esperamos! Si no podes venir, avisanos para reprogramarlo.`;
}

export function mensajeRecordatorioRecall({ cliente, servicio, dias, negocio }) {
  return `Hola ${cliente.nombre}! Soy de ${negocio.nombreNegocio}. Ya pasaron ${dias} dias desde tu ultimo turno de ${servicio?.nombre ?? "servicio"}. Que tal si reservamos tu proximo turno? Respondenos este mensaje o llamanos para coordinar el horario.`;
}

export function mensajeCumpleanios({ cliente, negocio }) {
  return `Feliz cumpleanos, ${cliente.nombre}! Todo el equipo de ${negocio.nombreNegocio} te desea un gran dia. Como regalo tenes un 10% de descuento en tu proximo turno esta semana.`;
}
