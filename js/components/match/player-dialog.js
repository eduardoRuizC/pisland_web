import { createStatsHexbin } from "./stats-hexbin.js";
import { createTeamLogo } from "./team-logo.js";

let dialogSequence = 0;

function appendText(documentRef, parent, tagName, className, text) {
  const node = documentRef.createElement(tagName);
  node.className = className;
  node.textContent = text;
  parent.append(node);
  return node;
}

export function createPlayerDialog(options = {}) {
  const documentRef = options.documentRef ?? document;
  const dialog = documentRef.createElement("dialog");
  const scroll = documentRef.createElement("div");
  const layout = documentRef.createElement("div");
  const media = documentRef.createElement("div");
  const image = documentRef.createElement("img");
  const imageFallback = documentRef.createElement("div");
  const body = documentRef.createElement("div");
  const closeButton = documentRef.createElement("button");
  const previousButton = documentRef.createElement("button");
  const nextButton = documentRef.createElement("button");
  const instanceId = ++dialogSequence;
  const titleId = `player-dialog-title-${instanceId}`;
  const descriptionId = `player-dialog-description-${instanceId}`;
  const statsTitleId = `player-dialog-stats-title-${instanceId}`;
  const contentId = `player-dialog-content-${instanceId}`;
  let currentPlayer;
  let currentTeam;
  let currentPlayers = [];
  let currentIndex = 0;
  let lastTrigger;
  let renderedTeamId;

  dialog.className = "player-dialog";
  dialog.dataset.playerDialog = "";
  dialog.setAttribute("aria-labelledby", titleId);
  dialog.setAttribute("aria-describedby", descriptionId);
  scroll.className = "player-dialog__scroll";
  scroll.id = contentId;
  layout.className = "player-dialog__layout";
  media.className = "player-dialog__media";
  image.className = "player-dialog__image";
  imageFallback.className = "player-dialog__image-fallback";
  imageFallback.hidden = true;
  imageFallback.setAttribute("role", "img");
  appendText(documentRef, imageFallback, "span", "material-symbols-outlined", "person").setAttribute("aria-hidden", "true");
  body.className = "player-dialog__body";

  closeButton.className = "modal-close player-dialog__close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Cerrar detalles del jugador");
  appendText(documentRef, closeButton, "span", "material-symbols-outlined", "close").setAttribute("aria-hidden", "true");

  previousButton.className = "player-dialog__nav player-dialog__nav--previous";
  previousButton.type = "button";
  previousButton.setAttribute("aria-controls", contentId);
  appendText(documentRef, previousButton, "span", "material-symbols-outlined", "chevron_left").setAttribute("aria-hidden", "true");
  nextButton.className = "player-dialog__nav player-dialog__nav--next";
  nextButton.type = "button";
  nextButton.setAttribute("aria-controls", contentId);
  appendText(documentRef, nextButton, "span", "material-symbols-outlined", "chevron_right").setAttribute("aria-hidden", "true");

  const teamName = appendText(documentRef, body, "p", "player-dialog__team", "");
  const identity = documentRef.createElement("div");
  const teamLogoSlot = documentRef.createElement("div");
  const heading = documentRef.createElement("h2");
  identity.className = "player-dialog__identity";
  teamLogoSlot.className = "player-dialog__team-logo-slot";
  teamLogoSlot.dataset.playerDialogTeamLogo = "";
  heading.className = "player-dialog__title";
  heading.id = titleId;
  identity.append(heading);
  body.append(identity);

  const summary = documentRef.createElement("div");
  summary.className = "player-dialog__summary";
  const rating = documentRef.createElement("div");
  rating.className = "player-dialog__rating";
  rating.setAttribute("aria-label", "Valoración");
  const ratingValue = appendText(documentRef, rating, "strong", "player-dialog__rating-value", "");
  appendText(documentRef, rating, "span", "player-dialog__rating-label", "Valoración");
  const position = documentRef.createElement("div");
  position.className = "player-dialog__position";
  position.setAttribute("aria-label", "Posición");
  const positionValue = appendText(documentRef, position, "strong", "player-dialog__position-value", "");
  appendText(documentRef, position, "span", "player-dialog__position-label", "Posición");
  summary.append(teamLogoSlot, rating, position);
  body.append(summary);

  const description = appendText(documentRef, body, "p", "player-dialog__description", "");
  description.id = descriptionId;
  const statsSection = documentRef.createElement("section");
  statsSection.className = "player-dialog__stats-section";
  statsSection.setAttribute("aria-labelledby", statsTitleId);
  const statsHeader = documentRef.createElement("div");
  statsHeader.className = "player-dialog__stats-header";
  const statsTitle = appendText(documentRef, statsSection, "h3", "player-dialog__stats-title", "Estadísticas");
  statsTitle.id = statsTitleId;
  const statsToggle = documentRef.createElement("div");
  statsToggle.className = "player-dialog__stats-toggle";
  statsToggle.setAttribute("role", "group");
  statsToggle.setAttribute("aria-label", "Formato de estadísticas");
  const barsButton = appendText(documentRef, statsToggle, "button", "player-dialog__stats-toggle-button", "Barras");
  barsButton.type = "button";
  barsButton.setAttribute("aria-pressed", "true");
  const hexbinButton = appendText(documentRef, statsToggle, "button", "player-dialog__stats-toggle-button", "Hexágono");
  hexbinButton.type = "button";
  hexbinButton.setAttribute("aria-pressed", "false");
  statsHeader.append(statsTitle, statsToggle);
  const statsGrid = documentRef.createElement("div");
  statsGrid.className = "player-dialog__stats";
  const hexbin = documentRef.createElement("div");
  hexbin.className = "player-dialog__hexbin";
  hexbin.hidden = true;
  statsSection.replaceChildren(statsHeader, statsGrid, hexbin);
  body.append(statsSection);
  const announcement = appendText(documentRef, body, "p", "sr-only", "");
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");

  media.append(image, imageFallback);
  layout.append(media, body);
  scroll.append(layout);
  dialog.append(previousButton, nextButton, closeButton, scroll);

  const showImageFallback = () => {
    image.hidden = true;
    imageFallback.hidden = false;
    imageFallback.setAttribute("aria-label", `Imagen no disponible de ${currentPlayer?.name ?? "jugador"}`);
  };
  const handleImageError = () => {
    console.error(`No se pudo cargar la foto del jugador: ${currentPlayer?.detailImage ?? currentPlayer?.image ?? "ruta desconocida"}`);
    showImageFallback();
  };
  const close = () => {
    if (dialog.open) dialog.close();
  };
  const handleBackdropClick = (event) => {
    if (event.target === dialog) close();
  };
  const handleClose = () => {
    documentRef.body.classList.remove("modal-open");
    if (lastTrigger?.isConnected) lastTrigger.focus();
  };
  const handleScroll = () => {
    dialog.classList.toggle("player-dialog--scrolled", scroll.scrollTop > 40);
  };
  const setStatsView = (view) => {
    const showBars = view === "bars";
    statsGrid.hidden = !showBars;
    hexbin.hidden = showBars;
    barsButton.setAttribute("aria-pressed", String(showBars));
    hexbinButton.setAttribute("aria-pressed", String(!showBars));
  };
  const handleBarsClick = () => setStatsView("bars");
  const handleHexbinClick = () => setStatsView("hexbin");

  const renderPlayer = (player, announce = false) => {
    currentPlayer = player;
    teamName.textContent = currentTeam.name;
    if (renderedTeamId !== currentTeam.id) {
      teamLogoSlot.replaceChildren(createTeamLogo(currentTeam, {
        documentRef,
        variant: "dialog",
      }));
      renderedTeamId = currentTeam.id;
    }
    heading.textContent = player.name;
    ratingValue.textContent = String(player.rating);
    positionValue.textContent = player.position;
    description.textContent = player.description;
    image.removeAttribute("src");
    const detailImagePath = typeof player.detailImage === "string"
      ? player.detailImage.trim()
      : typeof player.image === "string"
        ? player.image.trim()
        : "";
    if (detailImagePath !== "") {
      image.hidden = false;
      imageFallback.hidden = true;
      image.alt = `Foto de ${player.name}`;
      image.src = detailImagePath;
    } else {
      showImageFallback();
    }

    const players = currentPlayers;
    const previousPlayer = players[(currentIndex - 1 + players.length) % players.length];
    const nextPlayer = players[(currentIndex + 1) % players.length];
    const canNavigate = players.length > 1;
    previousButton.disabled = !canNavigate;
    nextButton.disabled = !canNavigate;
    previousButton.setAttribute("aria-label", canNavigate ? `Jugador anterior: ${previousPlayer.name}` : "No hay otro jugador activo");
    nextButton.setAttribute("aria-label", canNavigate ? `Jugador siguiente: ${nextPlayer.name}` : "No hay otro jugador activo");

    const stats = Object.entries(player.stats).slice(0, 6).map(([label, value]) => {
      const stat = documentRef.createElement("div");
      const header = documentRef.createElement("div");
      const chart = documentRef.createElement("div");
      const fill = documentRef.createElement("span");
      const normalizedValue = Math.min(100, Math.max(0, Number(value)));

      stat.className = "player-dialog__stat";
      header.className = "player-dialog__stat-header";
      appendText(documentRef, header, "span", "player-dialog__stat-label", label);
      appendText(documentRef, header, "strong", "player-dialog__stat-value", String(value));
      chart.className = "player-dialog__stat-chart";
      chart.setAttribute("role", "progressbar");
      chart.setAttribute("aria-label", `${label}: ${value} de 100`);
      chart.setAttribute("aria-valuemin", "0");
      chart.setAttribute("aria-valuemax", "100");
      chart.setAttribute("aria-valuenow", String(normalizedValue));
      fill.className = "player-dialog__stat-fill";
      fill.style.width = `${normalizedValue}%`;
      chart.append(fill);
      stat.append(header, chart);
      return stat;
    });
    statsGrid.replaceChildren(...stats);
    hexbin.replaceChildren(createStatsHexbin(player.stats, { documentRef }));
    if (announce) announcement.textContent = `${player.name}, ${player.position}, valoración ${player.rating}`;
  };

  const navigate = (offset) => {
    if (currentPlayers.length < 2) return;
    currentIndex = (currentIndex + offset + currentPlayers.length) % currentPlayers.length;
    renderPlayer(currentPlayers[currentIndex], true);
    scroll.scrollTop = 0;
  };

  const handleKeydown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigate(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      navigate(1);
    }
  };
  const handlePreviousClick = () => navigate(-1);
  const handleNextClick = () => navigate(1);

  image.addEventListener("error", handleImageError);
  barsButton.addEventListener("click", handleBarsClick);
  hexbinButton.addEventListener("click", handleHexbinClick);
  closeButton.addEventListener("click", close);
  previousButton.addEventListener("click", handlePreviousClick);
  nextButton.addEventListener("click", handleNextClick);
  dialog.addEventListener("click", handleBackdropClick);
  dialog.addEventListener("close", handleClose);
  dialog.addEventListener("keydown", handleKeydown);
  scroll.addEventListener("scroll", handleScroll, { passive: true });

  const open = (player, team, trigger) => {
    if (!player.active) return false;
    currentTeam = team;
    currentPlayers = team.players.filter((candidate) => candidate.active);
    const selectedIndex = currentPlayers.findIndex((candidate) => candidate === player || candidate.name === player.name);
    if (selectedIndex < 0) return false;
    currentIndex = Math.max(0, selectedIndex);
    lastTrigger = trigger ?? documentRef.activeElement;
    announcement.textContent = "";
    scroll.scrollTop = 0;
    dialog.classList.remove("player-dialog--scrolled");
    renderPlayer(currentPlayers[currentIndex]);

    if (typeof dialog.showModal === "function" && !dialog.open) {
      dialog.showModal();
      documentRef.body.classList.add("modal-open");
    }
    return true;
  };

  const destroy = () => {
    image.removeEventListener("error", handleImageError);
    barsButton.removeEventListener("click", handleBarsClick);
    hexbinButton.removeEventListener("click", handleHexbinClick);
    closeButton.removeEventListener("click", close);
    previousButton.removeEventListener("click", handlePreviousClick);
    nextButton.removeEventListener("click", handleNextClick);
    dialog.removeEventListener("click", handleBackdropClick);
    dialog.removeEventListener("close", handleClose);
    dialog.removeEventListener("keydown", handleKeydown);
    scroll.removeEventListener("scroll", handleScroll);
    if (dialog.open) dialog.close();
    dialog.remove();
  };

  return { element: dialog, open, destroy };
}
