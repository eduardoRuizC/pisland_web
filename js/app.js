import { initAttendance } from "./components/attendance-counter.js";
import { initCountdown } from "./components/countdown.js";
import { initMatch } from "./components/match/match.js";
import { initNavigation } from "./components/navigation.js";
import { initTrailerModal } from "./components/trailer-modal.js";
import { createAttendanceService } from "./services/attendance-service.js";

const cleanups = [];
const register = (cleanup) => {
  if (typeof cleanup === "function") cleanups.push(cleanup);
};
const safelyInit = (name, initializer) => {
  try {
    register(initializer());
  } catch (error) {
    console.error(`No se pudo iniciar ${name}:`, error);
  }
};

const config = window.PISLAND_CONFIG ?? {};

safelyInit("la navegación", () => initNavigation(document.querySelector(".top-nav"), {
  main: document.querySelector("main"),
}));
safelyInit("la cuenta atrás", () => initCountdown(document.querySelector("[data-countdown]"), {
  timeZone: "Europe/Madrid",
}));
safelyInit("el contador de asistencia", () => initAttendance(document.querySelector("[data-attendance]"), {
  service: createAttendanceService({
    baseUrl: config.supabaseUrl,
    anonKey: config.supabaseAnonKey,
    eventId: "pisland-2026",
  }),
}));
safelyInit("el modal del tráiler", () => initTrailerModal(document.querySelector("[data-trailer-modal]")));

initMatch(document.querySelector("[data-match-root]"))
  .then(register)
  .catch((error) => console.error("No se pudo iniciar Partido:", error));

window.addEventListener("pagehide", () => {
  cleanups.splice(0).forEach((cleanup) => cleanup());
}, { once: true });
