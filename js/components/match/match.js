import { loadTeams } from "../../services/team-repository.js?v=3";
import { createLineupPitch } from "./lineup-pitch.js?v=4";
import { createPlayerDialog } from "./player-dialog.js?v=11";
import { createTeamTabs } from "./team-tabs.js?v=10";

export function getRequestedTeamId(locationRef) {
  if (!locationRef) return "";

  const params = new URLSearchParams(locationRef.search ?? "");
  return params.get("team")?.trim() ?? "";
}

export function isMatchTeamDeepLink(locationRef) {
  return locationRef?.hash === "#partido" && getRequestedTeamId(locationRef) !== "";
}

function createPanel(team, options) {
  const documentRef = options.documentRef;
  const panel = documentRef.createElement("section");
  panel.className = "team-panel";
  panel.id = `${team.id}-panel`;
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", `${team.id}-tab`);
  panel.dataset.teamPanel = team.id;

  const title = documentRef.createElement("h3");
  title.className = "sr-only";
  title.textContent = `Alineación de ${team.name}`;
  panel.append(title, createLineupPitch(team, options));
  return panel;
}

function setStatus(status, message, type = "") {
  status.textContent = message;
  status.classList.toggle("is-warning", type === "warning");
  status.classList.toggle("is-error", type === "error");
  status.hidden = message === "";
}

export async function initMatch(root, options = {}) {
  if (!root) return () => {};

  const documentRef = options.documentRef ?? root.ownerDocument;
  const manifestUrl = options.manifestUrl ?? root.dataset.manifestUrl ?? "teams/index.json?v=12";
  const imagePath = options.imagePath ?? root.dataset.playerCardImage ?? "assets/player-card-template.png";
  const loadTeamsImpl = options.loadTeamsImpl ?? loadTeams;
  const locationRef = options.locationRef ?? documentRef.defaultView?.location;
  const status = root.querySelector("[data-match-status]") ?? documentRef.createElement("p");
  const content = root.querySelector("[data-match-content]") ?? documentRef.createElement("div");
  let tabsController;
  let playerDialogController;

  if (!status.isConnected) {
    status.className = "match-status";
    status.dataset.matchStatus = "";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    root.append(status);
  }
  if (!content.isConnected) {
    content.dataset.matchContent = "";
    root.append(content);
  }

  setStatus(status, "Cargando alineaciones…");

  try {
    const { teams, errors } = await loadTeamsImpl(manifestUrl, options.fetchImpl);
    if (teams.length === 0) {
      throw new Error("Ningún equipo válido pudo cargarse.");
    }

    playerDialogController = createPlayerDialog({ documentRef });
    const panels = teams.map((team) => createPanel(team, {
      documentRef,
      imagePath,
      onPlayerSelect: (player, selectedTeam, trigger) => {
        playerDialogController.open(player, selectedTeam, trigger);
      },
    }));
    const selectPanel = (team) => {
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.teamPanel !== team.id;
      });
    };
    tabsController = createTeamTabs(teams, { documentRef, onSelect: selectPanel });
    panels.forEach((panel, index) => {
      panel.hidden = index !== 0;
    });
    content.replaceChildren(tabsController.element, ...panels, playerDialogController.element);

    const requestedTeamId = getRequestedTeamId(locationRef);
    if (teams.some((team) => team.id === requestedTeamId)) {
      tabsController.select(requestedTeamId);
    }

    if (errors.length > 0) {
      const names = errors.map(({ filename }) => filename).join(", ");
      const message = errors.length === 1
        ? `No se pudo cargar 1 equipo: ${names}.`
        : `No se pudieron cargar ${errors.length} equipos: ${names}.`;
      setStatus(status, message, "warning");
      errors.forEach(({ filename, error }) => console.error(`Error al cargar ${filename}:`, error));
    } else {
      setStatus(status, "");
    }
  } catch (error) {
    content.replaceChildren();
    setStatus(status, "No se pudieron cargar las alineaciones. Inténtalo de nuevo más tarde.", "error");
    console.error("Error al cargar Partido:", error);
  }

  return () => {
    tabsController?.destroy();
    playerDialogController?.destroy();
  };
}
