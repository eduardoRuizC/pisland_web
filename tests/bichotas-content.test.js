import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { validateTeam } from "../js/validation/team-validator.js";

const expectedPlayers = {
  "Iván": {
    topStats: ["PR", "PC"],
    description: "Iván es el rey del perreo y la picardía de las Bichotas, capaz de revolucionar cualquier pista y encontrar siempre la jugada perfecta para poner a su equipo por delante.",
  },
  Andrea: {
    topStats: ["VN", "PR"],
    description: "Andrea ve la noche antes que nadie y sabe exactamente cuándo subir el perreo. Su visión y su ritmo la convierten en una pieza impredecible capaz de cambiar el rumbo de la party.",
  },
  Yanire: {
    topStats: ["CA", "UE"],
    description: "Yanire es el pegamento de las Bichotas, su capacidad de alcohol está a prueba de cualquier fiesta y su unión de equipo mantiene a todas juntas hasta el final de la noche.",
  },
  Marina: {
    topStats: ["CA", "PC"],
    description: "Marina combina una capacidad de alcohol legendaria con la picardía necesaria para salir de cualquier situación, cuando la noche se complica siempre encuentra la forma de darle la vuelta.",
  },
  Josu: {
    topStats: ["MS", "PC"],
    description: "Josu es el especialista en convertir cada misión secundaria en una aventura, su picardía hace que siempre aparezca donde menos se le espera para inclinar la noche a favor de las Bichotas.",
  },
};

const captainDescription = "Geen es la abeja reina del equipo, su vision de la noche es clave para el resultado de su equipo en la party, con mucha garra es capaz de liderar su equipo a la victoria.";

test("Bichotas descriptions follow each player's strongest party stats", async () => {
  const teamUrl = new URL("../teams/bichotas.json", import.meta.url);
  const team = validateTeam(JSON.parse(await readFile(teamUrl, "utf8")));

  assert.equal(team.name, "Bichotas");
  assert.equal(team.players.length, 6);

  Object.entries(expectedPlayers).forEach(([name, expected]) => {
    const player = team.players.find((candidate) => candidate.name === name);
    assert.ok(player, `Falta ${name} en Las Bichotas.`);

    const topStats = Object.entries(player.stats)
      .sort(([, left], [, right]) => right - left)
      .slice(0, 2)
      .map(([key]) => key);

    assert.deepEqual(topStats, expected.topStats);
    assert.equal(player.description, expected.description);
  });

  const captain = team.players.find((player) => player.captain);
  assert.equal(captain?.name, "Geen");
  assert.equal(captain.description, captainDescription);
});
