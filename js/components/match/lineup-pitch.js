import { createPlayerCard } from "./player-card.js?v=3";
import { createTeamLogo } from "./team-logo.js";

export function createLineupPitch(team, options = {}) {
  const documentRef = options.documentRef ?? document;
  const pitch = documentRef.createElement("div");
  pitch.className = "match-pitch";
  pitch.setAttribute("role", "list");
  pitch.setAttribute("aria-label", `Jugadores de ${team.name} sobre el campo`);
  pitch.append(createTeamLogo(team, { documentRef, variant: "pitch", decorative: true }));

  [
    "match-pitch__halfway-line",
    "match-pitch__center-circle",
    "match-pitch__penalty-area match-pitch__penalty-area--top",
    "match-pitch__penalty-area match-pitch__penalty-area--bottom",
    "match-pitch__goal-area match-pitch__goal-area--top",
    "match-pitch__goal-area match-pitch__goal-area--bottom",
  ].forEach((className) => {
    const marking = documentRef.createElement("div");
    marking.className = className;
    marking.setAttribute("aria-hidden", "true");
    pitch.append(marking);
  });

  team.players.forEach((player) => {
    pitch.append(createPlayerCard(player, {
      ...options,
      documentRef,
      onSelect: (selectedPlayer, trigger) => options.onPlayerSelect?.(selectedPlayer, team, trigger),
    }));
  });
  return pitch;
}
