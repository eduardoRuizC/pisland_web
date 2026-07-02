const countdown = document.querySelector("[data-countdown]");
const modal = document.querySelector("[data-modal]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalKicker = document.querySelector("[data-modal-kicker]");
const modalCopy = document.querySelector("[data-modal-copy]");
const closeModalButton = document.querySelector("[data-close-modal]");
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const eventTimeZone = "Europe/Madrid";

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

window.addEventListener("scroll", syncActiveNav, { passive: true });
