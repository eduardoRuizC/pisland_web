import { createCaptainBadge } from "./captain-badge.js";

export function createPlayerCard(player, options = {}) {
  const documentRef = options.documentRef ?? document;
  const imagePath = options.imagePath ?? "assets/player-card-template.png";
  const placeholderImagePath = options.placeholderImagePath ?? "assets/players/player-placeholder.svg";
  const card = documentRef.createElement("div");
  const isActive = player.active;
  const trigger = documentRef.createElement(isActive ? "button" : "div");
  const stats = Object.entries(player.stats).slice(0, 6);
  const customImagePath = typeof player.fieldImage === "string"
    ? player.fieldImage.trim()
    : typeof player.image === "string"
      ? player.image.trim()
      : "";
  const hasCustomImage = isActive && customImagePath !== "" && customImagePath !== placeholderImagePath;
  const fieldImagePath = hasCustomImage ? customImagePath : imagePath;
  const showCaptainBadge = isActive && player.captain;

  card.className = "lineup-card";
  card.dataset.position = player.position;
  card.style.left = `${player.x}%`;
  card.style.top = `${player.y}%`;
  card.setAttribute("role", "listitem");
  if (isActive) {
    trigger.className = "lineup-card__trigger";
    trigger.type = "button";
    trigger.setAttribute(
      "aria-label",
      `Ver detalles de ${player.name}${player.captain ? ", capitán" : ""}, ${player.position}, valoración ${player.rating}`,
    );
    trigger.addEventListener("click", () => options.onSelect?.(player, trigger));
  } else {
    card.classList.add("lineup-card--inactive");
    trigger.className = "lineup-card__inactive";
    trigger.setAttribute("role", "img");
    trigger.setAttribute(
      "aria-label",
      `Jugador inactivo, posición ${player.position}, detalles no disponibles`,
    );
  }
  if (showCaptainBadge) {
    card.append(createCaptainBadge({ documentRef, variant: "field" }));
  }
  card.append(trigger);

  const art = documentRef.createElement("img");
  art.className = "lineup-card__art";
  art.src = fieldImagePath;
  art.alt = "";
  art.setAttribute("aria-hidden", "true");
  art.addEventListener("error", () => {
    if (art.src.endsWith(imagePath)) {
      console.error(`No se pudo cargar la plantilla de jugador: ${imagePath}`);
      card.classList.add("lineup-card--image-error");
      return;
    }

    console.error(`No se pudo cargar la foto del jugador en el campo: ${fieldImagePath}`);
    art.src = imagePath;
  });
  trigger.append(art);

  ["header", "name", "stats"].forEach((name) => {
    const mask = documentRef.createElement("span");
    mask.className = `lineup-card__mask lineup-card__mask--${name}`;
    mask.setAttribute("aria-hidden", "true");
    trigger.append(mask);
  });

  const appendText = (className, value) => {
    const node = documentRef.createElement("span");
    node.className = className;
    node.textContent = String(value);
    trigger.append(node);
  };
  appendText("lineup-card__rating", isActive ? player.rating : "?");
  appendText("lineup-card__position", player.position);
  appendText("lineup-card__name", isActive ? player.name : "?");

  const statsNode = documentRef.createElement("div");
  statsNode.className = "lineup-card__stats";
  stats.forEach(([label, value]) => {
    const stat = documentRef.createElement("div");
    stat.className = "lineup-card__stat";
    const labelNode = documentRef.createElement("span");
    labelNode.className = "lineup-card__stat-label";
    labelNode.textContent = label;
    const valueNode = documentRef.createElement("span");
    valueNode.className = "lineup-card__stat-value";
    valueNode.textContent = isActive ? String(value) : "?";
    stat.append(labelNode, valueNode);
    statsNode.append(stat);
  });
  trigger.append(statsNode);

  return card;
}
