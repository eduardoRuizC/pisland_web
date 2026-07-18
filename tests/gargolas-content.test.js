import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { validateTeam } from "../js/validation/team-validator.js";

const expectedPlayers = {
  Sastian: {
    topStats: ["VN", "CA"],
    description: "Sastian tiene una visión privilegiada de la noche y una capacidad de alcohol a prueba de cualquier after, dos cualidades que le permiten mantener el rumbo de Gárgolas cuando la party se vuelve impredecible.",
  },
  Aritz: {
    topStats: ["MS", "UE"],
    description: "Aritz convierte cada misión secundaria en una aventura de equipo, su capacidad para mantener unidas a las Gárgolas hace que cualquier plan improvisado termine siendo una victoria compartida.",
  },
  Carla: {
    topStats: ["VN", "UE"],
    description: "Carla es la brújula de Gárgolas, ve la noche antes que nadie y sabe cómo mantener al equipo unido incluso cuando la party toma el rumbo más inesperado.",
  },
  Diana: {
    topStats: ["CA", "PC"],
    description: "Diana combina una capacidad de alcohol legendaria con la picardía justa para salir airosa de cualquier situación, cuando la noche se complica siempre tiene un truco preparado.",
  },
  Pabloski: {
    topStats: ["CA", "UE"],
    description: "Pabloski es el último en abandonar la party y el primero en reunir al equipo, su capacidad de alcohol y su espíritu de unión mantienen a Gárgolas en pie hasta que sale el sol.",
  },
};

const captainDescription = "La cabeza pensante y determinante de Gárgolas, su perfecta vision del juego, su asombrosa capacidad de hacer misiones secundarias hace que sea un delantero muy completo, imposible para sus rivales predecir su próximos movimientos.";

test("Gárgolas descriptions follow each player's strongest party stats", async () => {
  const teamUrl = new URL("../teams/gargolas.json", import.meta.url);
  const team = validateTeam(JSON.parse(await readFile(teamUrl, "utf8")));

  assert.equal(team.name, "Gárgolas");
  assert.equal(team.players.length, 6);

  Object.entries(expectedPlayers).forEach(([name, expected]) => {
    const player = team.players.find((candidate) => candidate.name === name);
    assert.ok(player, `Falta ${name} en Gárgolas.`);

    const topStats = Object.entries(player.stats)
      .sort(([, left], [, right]) => right - left)
      .slice(0, 2)
      .map(([key]) => key);

    assert.deepEqual(topStats, expected.topStats);
    assert.equal(player.description, expected.description);
  });

  const captain = team.players.find((player) => player.captain);
  assert.equal(captain?.name, "Ivan");
  assert.equal(captain.description, captainDescription);
});
