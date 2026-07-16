export const PLAYER_STAT_DEFINITIONS = Object.freeze([
  Object.freeze({ key: "VN", label: "Visión de la noche" }),
  Object.freeze({ key: "PR", label: "Perreocidad" }),
  Object.freeze({ key: "CA", label: "Capacidad de alcohol" }),
  Object.freeze({ key: "MS", label: "Misiones secundarias" }),
  Object.freeze({ key: "UE", label: "Unión de equipo" }),
  Object.freeze({ key: "PC", label: "Picardía" }),
]);

export const PLAYER_STAT_KEYS = Object.freeze(
  PLAYER_STAT_DEFINITIONS.map(({ key }) => key),
);

export function getPlayerStatEntries(stats) {
  return PLAYER_STAT_DEFINITIONS.map(({ key, label }) => ({
    key,
    label,
    value: stats[key],
  }));
}
