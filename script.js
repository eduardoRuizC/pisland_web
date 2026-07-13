const countdown = document.querySelector("[data-countdown]");
const modal = document.querySelector("[data-modal]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalKicker = document.querySelector("[data-modal-kicker]");
const modalCopy = document.querySelector("[data-modal-copy]");
const closeModalButton = document.querySelector("[data-close-modal]");
const trailerModal = document.querySelector("[data-trailer-modal]");
const closeTrailerModalButton = document.querySelector("[data-close-trailer-modal]");
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-links]");
const eventTimeZone = "Europe/Madrid";
const attendanceCount = document.querySelector("[data-attendance-count]");
const attendanceButton = document.querySelector("[data-attendance-button]");
const attendanceStatus = document.querySelector("[data-attendance-status]");
const siteConfig = window.PISLAND_CONFIG || {};
const SUPABASE_URL = siteConfig.supabaseUrl || "";
const SUPABASE_ANON_KEY = siteConfig.supabaseAnonKey || "";
const ATTENDANCE_EVENT_ID = "pisland-2026";
const TRAILER_SEEN_KEY = "pisland-trailer-seen";
const ATTENDANCE_BUTTON_LABEL = "+1 MMV";

const modalContent = {
  tickets: {
    kicker: "Tickets Pisland",
    title: "Segundo tramo activo",
    copy:
      "Early bird esta agotado. Escribenos para recibir el enlace de compra del siguiente cupo antes de que suba de precio.",
  },
  trailer: {
    kicker: "Trailer Pisland",
    title: "Senal entrante",
    copy:
      "El trailer completo esta en render. Mientras tanto, la isla ya esta emitiendo: lineup, galeria y acceso se activan por fases.",
  },
};

function getDateKey(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: eventTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const dateParts = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

function updateCountdown() {
  if (!countdown) return;

  const target = new Date(countdown.dataset.countdown);
  const now = new Date();
  const diff = Math.max(0, target.getTime() - now.getTime());
  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;
  const minuteMs = 60 * 1000;
  const secondMs = 1000;

  const days = Math.floor(diff / dayMs);
  const hours = Math.floor((diff % dayMs) / hourMs);
  const minutes = Math.floor((diff % hourMs) / minuteMs);
  const seconds = Math.floor((diff % minuteMs) / secondMs);
  const isEventDay = getDateKey(now) === getDateKey(target);
  const showSeconds = isEventDay || diff < dayMs;

  countdown.querySelector("[data-days]").textContent = String(showSeconds ? hours : days).padStart(2, "0");
  countdown.querySelector("[data-hours]").textContent = String(showSeconds ? minutes : hours).padStart(2, "0");
  countdown.querySelector("[data-minutes]").textContent = String(showSeconds ? seconds : minutes).padStart(2, "0");
  countdown.querySelector("[data-days-label]").textContent = showSeconds ? "Hrs" : "Dias";
  countdown.querySelector("[data-hours-label]").textContent = showSeconds ? "Min" : "Hrs";
  countdown.querySelector("[data-minutes-label]").textContent = showSeconds ? "Seg" : "Min";
}

function hasSupabaseConfig() {
  return SUPABASE_URL.startsWith("https://") && SUPABASE_ANON_KEY.length > 20;
}

function getSupabaseHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

function setAttendanceStatus(message = "", type = "") {
  if (!attendanceStatus) return;

  attendanceStatus.textContent = message;
  attendanceStatus.classList.toggle("is-error", type === "error");
  attendanceStatus.classList.toggle("is-success", type === "success");
}

function setAttendanceCount(value) {
  if (!attendanceCount) return;

  const count = Number.isFinite(value) ? value : 0;
  attendanceCount.textContent = new Intl.NumberFormat("es-ES").format(count);
}

function setAttendanceLoading(isLoading) {
  if (!attendanceButton) return;

  attendanceButton.disabled = isLoading;
  attendanceButton.textContent = isLoading ? "Sumando..." : ATTENDANCE_BUTTON_LABEL;
}

async function fetchAttendanceCount() {
  const params = new URLSearchParams({
    select: "attendees",
    event_id: `eq.${ATTENDANCE_EVENT_ID}`,
  });
  const response = await fetch(`${SUPABASE_URL}/rest/v1/event_attendance?${params}`, {
    headers: getSupabaseHeaders(),
  });

  if (!response.ok) {
    throw new Error("Could not fetch attendance count");
  }

  const rows = await response.json();
  return Number(rows?.[0]?.attendees || 0);
}

async function incrementAttendance() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_attendees`, {
    method: "POST",
    headers: getSupabaseHeaders(),
    body: JSON.stringify({ p_event_id: ATTENDANCE_EVENT_ID }),
  });

  if (!response.ok) {
    throw new Error("Could not increment attendance count");
  }

  return Number(await response.json());
}

async function loadAttendance() {
  if (!attendanceCount || !attendanceButton) return;

  setAttendanceCount(0);

  if (!hasSupabaseConfig()) {
    attendanceButton.disabled = true;
    setAttendanceStatus("Configura Supabase para activar el contador global.", "error");
    return;
  }

  try {
    setAttendanceStatus("Cargando asistentes...");
    setAttendanceCount(await fetchAttendanceCount());
    setAttendanceStatus("");
  } catch (error) {
    setAttendanceStatus("No se pudo cargar el contador.", "error");
  }
}

async function handleAttendanceClick() {
  if (!attendanceButton || !hasSupabaseConfig()) return;

  try {
    setAttendanceLoading(true);
    setAttendanceStatus("Registrando asistencia...");
    setAttendanceCount(await incrementAttendance());
    setAttendanceStatus("Asistencia sumada.", "success");
  } catch (error) {
    setAttendanceStatus("No se pudo registrar. Intentalo otra vez.", "error");
  } finally {
    setAttendanceLoading(false);
  }
}

function openModal(kind) {
  if (!modal || !modalTitle || !modalKicker || !modalCopy) return;

  const content = modalContent[kind] || modalContent.trailer;
  modalKicker.textContent = content.kicker;
  modalTitle.textContent = content.title;
  modalCopy.textContent = content.copy;

  if (typeof modal.showModal === "function") {
    modal.showModal();
    document.body.classList.add("modal-open");
  }
}

function closeModal() {
  if (!modal) return;
  modal.close();
  document.body.classList.remove("modal-open");
}

function hasSeenTrailer() {
  try {
    return localStorage.getItem(TRAILER_SEEN_KEY) === "true";
  } catch (error) {
    return false;
  }
}

function markTrailerSeen() {
  try {
    localStorage.setItem(TRAILER_SEEN_KEY, "true");
  } catch (error) {
    // Ignore storage failures; the trailer can still be closed normally.
  }
}

function openTrailerModal() {
  if (!trailerModal || typeof trailerModal.showModal !== "function" || trailerModal.open) return;

  trailerModal.showModal();
  document.body.classList.add("modal-open");
}

function closeTrailerModal() {
  if (!trailerModal) return;
  markTrailerSeen();
  trailerModal.close();
  document.body.classList.remove("modal-open");
}

function openInitialTrailerModal() {
  if (hasSeenTrailer()) return;
  openTrailerModal();
}

function syncActiveNav() {
  const current = [...document.querySelectorAll("main [id]")]
    .filter((section) => section.matches("header, section"))
    .filter((section) => section.getBoundingClientRect().top <= 140)
    .at(-1);

  if (!current) return;

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current.id}`);
  });
}

function setNavOpen(isOpen) {
  if (!navToggle || !navMenu) return;

  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Cerrar menu" : "Abrir menu");
  navMenu.classList.toggle("is-open", isOpen);
}

function toggleNav() {
  if (!navToggle) return;
  setNavOpen(navToggle.getAttribute("aria-expanded") !== "true");
}

updateCountdown();
setInterval(updateCountdown, 1000);
syncActiveNav();
loadAttendance();
openInitialTrailerModal();

document.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open-modal]");
  const closeButton = event.target.closest("[data-close-modal]");
  const openTrailerButton = event.target.closest("[data-open-trailer-modal]");
  const closeTrailerButton = event.target.closest("[data-close-trailer-modal]");

  if (event.target.closest("[data-nav-toggle]")) {
    toggleNav();
    return;
  }

  if (event.target.closest(".nav-links a")) {
    setNavOpen(false);
  } else if (navMenu?.classList.contains("is-open") && !event.target.closest(".top-nav")) {
    setNavOpen(false);
  }

  if (openButton) {
    openModal(openButton.dataset.openModal);
  }

  if (closeButton) {
    closeModal();
  }

  if (openTrailerButton) {
    openTrailerModal();
  }

  if (closeTrailerButton) {
    closeTrailerModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navMenu?.classList.contains("is-open")) {
    setNavOpen(false);
    navToggle?.focus();
  }
});

if (modal) {
  modal.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

if (closeModalButton) {
  closeModalButton.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });
}

if (trailerModal) {
  trailerModal.addEventListener("close", () => {
    markTrailerSeen();
    document.body.classList.remove("modal-open");
  });

  trailerModal.addEventListener("click", (event) => {
    if (event.target === trailerModal) {
      closeTrailerModal();
    }
  });
}

if (closeTrailerModalButton) {
  closeTrailerModalButton.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeTrailerModal();
    }
  });
}

if (attendanceButton) {
  attendanceButton.addEventListener("click", handleAttendanceClick);
}

window.addEventListener("scroll", syncActiveNav, { passive: true });

window.addEventListener("resize", () => {
  if (window.innerWidth >= 720) {
    setNavOpen(false);
  }
});
