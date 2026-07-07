const countdown = document.querySelector("[data-countdown]");
const modal = document.querySelector("[data-modal]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalKicker = document.querySelector("[data-modal-kicker]");
const modalCopy = document.querySelector("[data-modal-copy]");
const closeModalButton = document.querySelector("[data-close-modal]");
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const eventTimeZone = "Europe/Madrid";
const attendanceCount = document.querySelector("[data-attendance-count]");
const attendanceButton = document.querySelector("[data-attendance-button]");
const attendanceStatus = document.querySelector("[data-attendance-status]");
const siteConfig = window.PISLAND_CONFIG || {};
const SUPABASE_URL = siteConfig.supabaseUrl || "";
const SUPABASE_ANON_KEY = siteConfig.supabaseAnonKey || "";
const ATTENDANCE_EVENT_ID = "pisland-2026";

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
  attendanceButton.textContent = isLoading ? "Sumando..." : "Asistir";
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

function syncActiveNav() {
  const current = [...document.querySelectorAll("main section[id]")]
    .filter((section) => section.getBoundingClientRect().top <= 140)
    .at(-1);

  if (!current) return;

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current.id}`);
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);
syncActiveNav();
loadAttendance();

document.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open-modal]");
  const closeButton = event.target.closest("[data-close-modal]");

  if (openButton) {
    openModal(openButton.dataset.openModal);
  }

  if (closeButton) {
    closeModal();
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

if (attendanceButton) {
  attendanceButton.addEventListener("click", handleAttendanceClick);
}

window.addEventListener("scroll", syncActiveNav, { passive: true });
