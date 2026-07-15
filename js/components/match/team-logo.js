function getInitials(name) {
  return name
    .trim()
    .split(/\s+/u)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

export function createTeamLogo(team, options = {}) {
  const documentRef = options.documentRef ?? document;
  const variant = options.variant === "dialog" ? "dialog" : "pitch";
  const decorative = options.decorative ?? false;
  const wrapper = documentRef.createElement("div");
  const image = documentRef.createElement("img");
  const fallback = documentRef.createElement("span");

  wrapper.className = `team-logo team-logo--${variant}`;
  wrapper.dataset.teamLogo = team.id;
  if (decorative) wrapper.setAttribute("aria-hidden", "true");

  image.className = "team-logo__image";
  image.alt = decorative ? "" : `Logo de ${team.name}`;
  image.decoding = "async";

  fallback.className = "team-logo__fallback";
  fallback.hidden = true;
  fallback.textContent = getInitials(team.name);
  if (!decorative) {
    fallback.setAttribute("role", "img");
    fallback.setAttribute("aria-label", `Logo no disponible de ${team.name}`);
  }

  image.addEventListener("error", () => {
    console.error(`No se pudo cargar el logo de ${team.name}: ${team.logo}`);
    image.hidden = true;
    fallback.hidden = false;
  }, { once: true });
  image.src = team.logo;

  wrapper.append(image, fallback);
  return wrapper;
}
