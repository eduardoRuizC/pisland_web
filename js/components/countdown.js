export function getDateKey(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function getCountdownState(target, now = new Date(), timeZone = "Europe/Madrid") {
  const diff = Math.max(0, target.getTime() - now.getTime());
  const dayMs = 86400000;
  const hourMs = 3600000;
  const minuteMs = 60000;
  const showSeconds = getDateKey(now, timeZone) === getDateKey(target, timeZone) || diff < dayMs;
  return {
    first: showSeconds ? Math.floor(diff / hourMs) : Math.floor(diff / dayMs),
    second: showSeconds ? Math.floor((diff % hourMs) / minuteMs) : Math.floor((diff % dayMs) / hourMs),
    third: showSeconds ? Math.floor((diff % minuteMs) / 1000) : Math.floor((diff % hourMs) / minuteMs),
    labels: showSeconds ? ["Hrs", "Min", "Seg"] : ["Dias", "Hrs", "Min"],
  };
}

export function initCountdown(root, options = {}) {
  if (!root) return () => {};
  const target = new Date(options.target ?? root.dataset.countdown);
  if (Number.isNaN(target.getTime())) {
    console.error("La fecha de la cuenta atrás no es válida.");
    return () => {};
  }
  const valueNodes = [root.querySelector("[data-days]"), root.querySelector("[data-hours]"), root.querySelector("[data-minutes]")];
  const labelNodes = [root.querySelector("[data-days-label]"), root.querySelector("[data-hours-label]"), root.querySelector("[data-minutes-label]")];
  const update = () => {
    const state = getCountdownState(target, new Date(), options.timeZone);
    [state.first, state.second, state.third].forEach((value, index) => {
      if (valueNodes[index]) valueNodes[index].textContent = String(value).padStart(2, "0");
      if (labelNodes[index]) labelNodes[index].textContent = state.labels[index];
    });
  };
  update();
  const timer = setInterval(update, options.interval ?? 1000);
  return () => clearInterval(timer);
}
