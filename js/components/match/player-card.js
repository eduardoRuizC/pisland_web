export function createPlayerCard(player, options = {}) {
  const documentRef = options.documentRef ?? document;
  const imagePath = options.imagePath ?? "assets/player-card-template.png";
  const card = documentRef.createElement("article");
  const stats = Object.entries(player.stats).slice(0, 6);

  card.className = "lineup-card";
  card.style.left = `${player.x}%`;
  card.style.top = `${player.y}%`;
  card.setAttribute("role", "listitem");
  card.tabIndex = 0;
  card.setAttribute(
    "aria-label",
    `${player.name}, ${player.position}, valoración ${player.rating}. ${stats.map(([label, value]) => `${label} ${value}`).join(", ")}`,
  );

  const art = documentRef.createElement("img");
  art.className = "lineup-card__art";
  art.src = imagePath;
  art.alt = "";
  art.setAttribute("aria-hidden", "true");
  art.addEventListener("error", () => {
    console.error(`No se pudo cargar la plantilla de jugador: ${imagePath}`);
    card.classList.add("lineup-card--image-error");
  }, { once: true });
  card.append(art);

  ["header", "name", "stats"].forEach((name) => {
    const mask = documentRef.createElement("span");
    mask.className = `lineup-card__mask lineup-card__mask--${name}`;
    mask.setAttribute("aria-hidden", "true");
    card.append(mask);
  });

  const appendText = (className, value) => {
    const node = documentRef.createElement("span");
    node.className = className;
    node.textContent = String(value);
    card.append(node);
  };
  appendText("lineup-card__rating", player.rating);
  appendText("lineup-card__position", player.position);
  appendText("lineup-card__name", player.name);

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
    valueNode.textContent = String(value);
    stat.append(labelNode, valueNode);
    statsNode.append(stat);
  });
  card.append(statsNode);

  return card;
}
