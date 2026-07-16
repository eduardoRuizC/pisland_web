export function createCaptainBadge(options = {}) {
  const documentRef = options.documentRef ?? document;
  const variant = options.variant === "dialog" ? "dialog" : "field";
  const badge = documentRef.createElement("span");

  badge.className = `material-symbols-outlined captain-badge captain-badge--${variant}`;
  badge.textContent = "crown";
  badge.hidden = options.hidden ?? false;
  badge.setAttribute("aria-hidden", "true");
  return badge;
}
