function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function assertNonEmptyString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} debe ser un texto no vacío.`);
  }
}

export function validateManifest(manifest) {
  if (!isPlainObject(manifest) || !Array.isArray(manifest.teams) || manifest.teams.length === 0) {
    throw new TypeError('El manifest debe incluir un array "teams" no vacío.');
  }

  const filenames = new Set();
  manifest.teams.forEach((filename, index) => {
    if (typeof filename !== "string" || !/^[a-z0-9][a-z0-9-]*\.json$/u.test(filename)) {
      throw new TypeError(`La entrada ${index + 1} del manifest no es un nombre JSON válido.`);
    }
    if (filenames.has(filename)) {
      throw new Error(`El manifest repite el archivo "${filename}".`);
    }
    filenames.add(filename);
  });

  return manifest;
}

export function validatePlayer(player, index = 0, teamName = "equipo") {
  if (!isPlainObject(player)) {
    throw new TypeError(`El jugador ${index + 1} de ${teamName} no es válido.`);
  }

  assertNonEmptyString(player.name, `El nombre del jugador ${index + 1}`);
  assertNonEmptyString(player.position, `La posición del jugador ${index + 1}`);

  if (!Number.isFinite(player.rating)) {
    throw new TypeError(`La valoración del jugador ${index + 1} de ${teamName} debe ser numérica.`);
  }

  for (const coordinate of ["x", "y"]) {
    if (!Number.isFinite(player[coordinate]) || player[coordinate] < 0 || player[coordinate] > 100) {
      throw new RangeError(`La coordenada ${coordinate} del jugador ${index + 1} debe estar entre 0 y 100.`);
    }
  }

  if (!isPlainObject(player.stats) || Object.keys(player.stats).length === 0) {
    throw new TypeError(`Las estadísticas del jugador ${index + 1} de ${teamName} no son válidas.`);
  }

  Object.entries(player.stats).forEach(([label, value]) => {
    assertNonEmptyString(label, `La etiqueta estadística del jugador ${index + 1}`);
    if (!Number.isFinite(value)) {
      throw new TypeError(`La estadística ${label} del jugador ${index + 1} debe ser numérica.`);
    }
  });

  return player;
}

export function validateTeam(team) {
  if (!isPlainObject(team)) {
    throw new TypeError("El equipo debe ser un objeto.");
  }

  assertNonEmptyString(team.id, "El id del equipo");
  if (!/^[a-z0-9][a-z0-9-]*$/u.test(team.id)) {
    throw new TypeError(`El id "${team.id}" solo puede usar minúsculas, números y guiones.`);
  }
  assertNonEmptyString(team.name, "El nombre del equipo");

  if (!Array.isArray(team.players) || team.players.length === 0) {
    throw new TypeError(`El equipo ${team.name} debe incluir jugadores.`);
  }

  team.players.forEach((player, index) => validatePlayer(player, index, team.name));
  return team;
}
